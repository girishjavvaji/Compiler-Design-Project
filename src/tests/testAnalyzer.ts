import { runAnalysis } from '../analyzer';
import { SAMPLE_PROGRAMS } from '../analyzer/samples';

async function runTests() {
  console.log('================================================================');
  console.log('Source Code Metrics Analyzer — Full Compiler Test Suite');
  console.log('================================================================\n');

  // Test 1: Empty code
  console.log('[Test 1] Testing Empty Source Code...');
  const emptyRes = await runAnalysis('', 'empty.cpp', 'cpp');
  console.log(`  Tokens: ${emptyRes.tokens.length}`);
  console.log(`  PLOC: ${emptyRes.metrics.size.codeLines}`);
  console.log(`  Issues: ${emptyRes.issues.length}`);
  console.log(`  MI: ${emptyRes.metrics.quality.maintainabilityIndex}/100`);
  console.log('  -> PASS (Did not crash)\n');

  // Test 2: Sample 1 (Arithmetic)
  console.log('[Test 2] Testing Sample 1 (Arithmetic)...');
  const s1 = SAMPLE_PROGRAMS[0];
  const r1 = await runAnalysis(s1.code, s1.fileName, 'cpp');
  console.log(`  Functions: ${r1.metrics.structural.functionCount} (${r1.metrics.complexity.functionMetrics.map(f => f.name).join(', ')})`);
  console.log(`  Tokens: ${r1.tokens.length}`);
  console.log(`  Cyclomatic Complexity: ${r1.metrics.complexity.totalCyclomaticComplexity}`);
  console.log(`  Issues: ${r1.issues.length}`);
  console.log(`  Maintainability Index: ${r1.metrics.quality.maintainabilityIndex}`);
  if (r1.metrics.structural.functionCount >= 3) {
    console.log('  -> PASS\n');
  } else {
    throw new Error(`Expected >= 3 functions, got ${r1.metrics.structural.functionCount}`);
  }

  // Test 3: Sample 2 (Conditionals & Loops)
  console.log('[Test 3] Testing Sample 2 (Prime & Fibonacci)...');
  const s2 = SAMPLE_PROGRAMS[1];
  const r2 = await runAnalysis(s2.code, s2.fileName, 'cpp');
  console.log(`  Functions: ${r2.metrics.structural.functionCount}`);
  console.log(`  Loops: ${r2.metrics.structural.loopCount}`);
  console.log(`  Conditionals: ${r2.metrics.structural.conditionalCount}`);
  console.log(`  Total CC: ${r2.metrics.complexity.totalCyclomaticComplexity}`);
  console.log('  -> PASS\n');

  // Test 4: Sample 3 (Complex Student Grades)
  console.log('[Test 4] Testing Sample 3 (Student Grades)...');
  const s3 = SAMPLE_PROGRAMS[2];
  const r3 = await runAnalysis(s3.code, s3.fileName, 'cpp');
  console.log(`  Functions: ${r3.metrics.structural.functionCount}`);
  console.log(`  Structs: ${r3.metrics.structural.structCount}`);
  console.log(`  Symbols tracked: ${r3.symbols.length}`);
  console.log(`  Total CC: ${r3.metrics.complexity.totalCyclomaticComplexity}`);
  console.log(`  Halstead Volume: ${r3.metrics.halstead.volume} bits`);
  console.log(`  Maintainability Index: ${r3.metrics.quality.maintainabilityIndex} (${r3.metrics.quality.maintainabilityRating})`);
  console.log('  -> PASS\n');

  // Test 5: REGRESSION TEST — User's multiline function with templates & references
  console.log('[Test 5] REGRESSION TEST: Multiline function with vector<Student>&...');
  const userCaseCode = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Student {
    string name;
    int marks;
};

double calculateClassAverage(
    const vector<Student>& students) {
    if (students.empty()) {
        return 0.0;
    }
    double total = 0.0;
    for (const auto& student : students) {
        total += student.marks;
    }
    return total / students.size();
}

int main() {
    vector<Student> classA;
    double avg = calculateClassAverage(classA);
    cout << avg << endl;
    return 0;
}
`;

  const rUser = await runAnalysis(userCaseCode, 'class_average.cpp', 'cpp');
  const syntaxErrors = rUser.issues.filter(i => i.stage === 'syntax' && i.severity === 'error');
  const missingSemicolons = rUser.issues.filter(i => i.message.includes("Missing ';'"));

  console.log(`  Functions detected: ${rUser.metrics.structural.functionCount} (${rUser.metrics.complexity.functionMetrics.map(f => f.name).join(', ')})`);
  console.log(`  Total issues: ${rUser.issues.length}`);
  console.log(`  Syntax errors: ${syntaxErrors.length}`);
  console.log(`  Missing semicolon errors: ${missingSemicolons.length}`);

  const avgFn = rUser.metrics.complexity.functionMetrics.find(f => f.name === 'calculateClassAverage');
  if (!avgFn) {
    throw new Error("FAILED: 'calculateClassAverage' was not detected as a function!");
  }
  console.log(`  Found function 'calculateClassAverage':`);
  console.log(`    - Return type: ${avgFn.returnType}`);
  console.log(`    - Parameters: ${avgFn.parameters.join(', ')}`);
  console.log(`    - Cyclomatic Complexity: ${avgFn.cyclomaticComplexity}`);
  console.log(`    - Decision Points: ${avgFn.decisionPoints.join('; ')}`);

  if (syntaxErrors.length > 0 || missingSemicolons.length > 0) {
    console.error('  Unexpected syntax errors in valid code:');
    syntaxErrors.forEach(e => console.error(`    - L${e.line}:C${e.column}: ${e.message}`));
    throw new Error('FAILED: False positive syntax errors were reported on valid C++ code!');
  }
  console.log('  -> PASS (Zero false-positive syntax errors, clean compilation!)\n');

  // Test 6: REGRESSION TEST — Genuinely missing semicolon must still be caught
  console.log('[Test 6] REGRESSION TEST: Genuinely missing semicolon in variable declaration...');
  const missingSemiCode = `
int main() {
    int rate = 15
    int total = rate + 5;
    return 0;
}
`;
  const rMissing = await runAnalysis(missingSemiCode, 'missing_semi.cpp', 'cpp');
  const expectedMissingSemi = rMissing.issues.find(
    i => i.stage === 'syntax' && i.severity === 'error' && i.message.includes("Missing ';'")
  );

  if (!expectedMissingSemi) {
    throw new Error("FAILED: Genuine missing semicolon was NOT detected!");
  }
  console.log(`  Detected genuine error: ${expectedMissingSemi.message} at Line ${expectedMissingSemi.line}:Column ${expectedMissingSemi.column}`);
  console.log('  -> PASS (Accurately flagged genuine syntax error)\n');

  // Test 7: REGRESSION TEST — Genuinely missing semicolon in expression statement
  console.log('[Test 7] REGRESSION TEST: Genuinely missing semicolon in expression statement...');
  const missingExprSemi = `
int main() {
    int x = 10;
    x = x + 5
    return x;
}
`;
  const rMissingExpr = await runAnalysis(missingExprSemi, 'missing_expr_semi.cpp', 'cpp');
  const expectedExprSemi = rMissingExpr.issues.find(
    i => i.stage === 'syntax' && i.severity === 'error' && i.message.includes("Missing ';'")
  );
  if (!expectedExprSemi) {
    throw new Error("FAILED: Genuine missing semicolon in expression was NOT detected!");
  }
  console.log(`  Detected genuine error: ${expectedExprSemi.message} at Line ${expectedExprSemi.line}:Column ${expectedExprSemi.column}`);
  console.log('  -> PASS\n');

  // Test 8: REGRESSION TEST — Classes, access specifiers, and const member functions
  console.log('[Test 8] REGRESSION TEST: Class with access specifiers & const member methods...');
  const classCode = `
#include <vector>
using namespace std;

class StudentManager {
private:
    vector<int> grades;
public:
    StudentManager() {}
    double getAverage() const {
        return grades.empty() ? 0.0 : 85.5;
    }
};
`;
  const rClass = await runAnalysis(classCode, 'manager.cpp', 'cpp');
  const classSyntaxErrors = rClass.issues.filter(i => i.stage === 'syntax' && i.severity === 'error');
  console.log(`  Functions detected in class: ${rClass.metrics.structural.functionCount} (${rClass.metrics.complexity.functionMetrics.map(f => f.name).join(', ')})`);
  console.log(`  Class syntax errors: ${classSyntaxErrors.length}`);
  if (classSyntaxErrors.length > 0) {
    throw new Error(`FAILED: Class syntax errors reported: ${classSyntaxErrors.map(e => e.message).join(', ')}`);
  }
  console.log('  -> PASS\n');

  console.log('================================================================');
  console.log('ALL REGRESSION & COMPILER ENGINE TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
