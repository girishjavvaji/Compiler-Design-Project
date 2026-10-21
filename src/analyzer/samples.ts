export interface SampleProgram {
  id: string;
  name: string;
  fileName: string;
  description: string;
  category: 'simple' | 'loops' | 'functions' | 'malformed';
  code: string;
}

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    id: 'sample-arithmetic',
    name: '1. Basic Arithmetic & Expressions',
    fileName: 'arithmetic.cpp',
    description: 'Calculates factorial, square roots, and basic polynomial evaluations.',
    category: 'simple',
    code: `#include <iostream>
using namespace std;

// Function to compute factorial recursively
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Computes sum of numbers from 1 to N
int computeSum(int limit) {
    int total = 0;
    for (int i = 1; i <= limit; i++) {
        total += i;
    }
    return total;
}

int main() {
    int num = 5;
    int factResult = factorial(num);
    int sumResult = computeSum(10);

    cout << "Factorial of " << num << " is: " << factResult << endl;
    cout << "Sum up to 10 is: " << sumResult << endl;

    return 0;
}
`
  },
  {
    id: 'sample-loops-primes',
    name: '2. Conditionals & Loops (Prime & Fibonacci)',
    fileName: 'prime_fibonacci.cpp',
    description: 'Demonstrates for-loops, while-loops, break statements, and multiple decision nodes.',
    category: 'loops',
    code: `#include <iostream>
using namespace std;

// Checks whether an integer is prime
bool isPrime(int n) {
    if (n <= 1) {
        return false;
    }
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

// Generates first N Fibonacci numbers
void generateFibonacci(int count) {
    int first = 0;
    int second = 1;
    int next = 0;

    cout << "Fibonacci sequence: ";
    int counter = 0;
    while (counter < count) {
        if (counter <= 1) {
            next = counter;
        } else {
            next = first + second;
            first = second;
            second = next;
        }
        cout << next << " ";
        counter++;
    }
    cout << endl;
}

int main() {
    int testNum = 29;
    if (isPrime(testNum)) {
        cout << testNum << " is a prime number." << endl;
    } else {
        cout << testNum << " is not prime." << endl;
    }

    generateFibonacci(8);
    return 0;
}
`
  },
  {
    id: 'sample-complex-student',
    name: '3. Multi-Function Student Grading System',
    fileName: 'student_grades.cpp',
    description: 'Multiple functions with nested decision structures, switch-case, and higher complexity.',
    category: 'functions',
    code: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Structure representing student performance
struct StudentRecord {
    int id;
    int marks;
    char grade;
};

// Computes letter grade based on marks
char determineGrade(int marks) {
    if (marks >= 90) {
        return 'A';
    } else if (marks >= 80) {
        return 'B';
    } else if (marks >= 70) {
        return 'C';
    } else if (marks >= 60) {
        return 'D';
    } else {
        return 'F';
    }
}

// Determines academic standing based on grade and attendance
int assessStanding(char grade, int attendancePct) {
    int status = 0;
    if (attendancePct < 75) {
        if (grade == 'A' || grade == 'B') {
            status = 1; // Warning for attendance
        } else {
            status = 2; // Critical warning
        }
    } else {
        switch (grade) {
            case 'A':
                status = 4; // Honor roll
                break;
            case 'B':
            case 'C':
                status = 3; // Good standing
                break;
            default:
                status = 2; // Academic probation
                break;
        }
    }
    return status;
}

// Computes class average using vector of records and range-based for loop
double calculateClassAverage(
    const vector<StudentRecord>& students) {
    if (students.empty()) {
        return 0.0;
    }
    double total = 0.0;
    for (const auto& student : students) {
        total += student.marks;
    }
    return total / students.size();
}

// Evaluates class aggregate statistics
void evaluateClass() {
    int scores[5];
    scores[0] = 95;
    scores[1] = 82;
    scores[2] = 67;
    scores[3] = 73;
    scores[4] = 58;

    int total = 0;
    int highest = scores[0];

    for (int i = 0; i < 5; i++) {
        total += scores[i];
        if (scores[i] > highest) {
            highest = scores[i];
        }
    }

    float avg = total / 5.0;
    cout << "Class average: " << avg << endl;
    cout << "Top score: " << highest << endl;
}

int main() {
    StudentRecord s1;
    s1.id = 101;
    s1.marks = 88;
    s1.grade = determineGrade(s1.marks);

    int standing = assessStanding(s1.grade, 85);
    cout << "Student Grade: " << s1.grade << ", Standing: " << standing << endl;

    evaluateClass();

    vector<StudentRecord> classList;
    classList.push_back(s1);
    double classAvg = calculateClassAverage(classList);
    cout << "Class average from vector: " << classAvg << endl;

    return 0;
}
`
  },
  {
    id: 'sample-malformed',
    name: '4. Malformed Code (Syntax & Semantic Errors)',
    fileName: 'errors_demo.cpp',
    description: 'Demonstrates missing semicolon, unclosed brace, undeclared identifier, and arity mismatch.',
    category: 'malformed',
    code: `#include <iostream>
using namespace std;

int calculateTax(int income, int dependents) {
    if (income > 50000) {
        return income * 0.2;
    }
    return 0;
}

int main() {
    int salary = 60000;
    int salary = 70000; // Semantic error: duplicate declaration!

    // Syntax error: missing semicolon below
    int rate = 15

    // Semantic error: undeclared identifier 'taxBonus'
    int total = rate + taxBonus;

    // Semantic error: function call arity mismatch (expects 2, passed 1)
    int finalTax = calculateTax(salary);

    cout << finalTax << endl;

    return 0;
// Syntax error: unclosed brace for main function omitted!
`
  }
];
