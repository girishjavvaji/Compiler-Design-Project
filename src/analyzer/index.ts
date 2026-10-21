import { AnalysisResult, Language, PipelineStage } from '../types/analyzer';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { SemanticAnalyzer } from './semanticAnalyzer';
import { MetricsEngine } from './metrics';

export async function runAnalysis(
  sourceCode: string,
  fileName: string = 'main.cpp',
  language: Language = 'cpp'
): Promise<AnalysisResult> {
  const startTime = performance.now();
  const pipeline: PipelineStage[] = [
    {
      id: 'lexical',
      name: 'Lexical Analysis',
      description: 'DFA Tokenizer converts characters into lexical tokens & removes trivia',
      status: 'pending',
      durationMs: 0,
      summary: ''
    },
    {
      id: 'syntax',
      name: 'Syntax Analysis',
      description: 'Grammar Parser builds AST & validates structure and delimiter balance',
      status: 'pending',
      durationMs: 0,
      summary: ''
    },
    {
      id: 'semantic',
      name: 'Semantic Analysis',
      description: 'Scope & Symbol Table validation, undeclared/duplicate checks, call arity',
      status: 'pending',
      durationMs: 0,
      summary: ''
    },
    {
      id: 'metrics',
      name: 'Metrics Calculation',
      description: 'Halstead Software Science, McCabe Cyclomatic Complexity & Maintainability Index',
      status: 'pending',
      durationMs: 0,
      summary: ''
    },
    {
      id: 'report',
      name: 'Report Generation',
      description: 'Aggregates findings, quality rating & prepares exportable analytics',
      status: 'pending',
      durationMs: 0,
      summary: ''
    }
  ];

  // 1. Lexical Analysis
  pipeline[0].status = 'running';
  const tLexStart = performance.now();
  const lexer = new Lexer(sourceCode);
  const lexResult = lexer.tokenize();
  const tLexEnd = performance.now();
  pipeline[0].durationMs = Number((tLexEnd - tLexStart).toFixed(2));
  pipeline[0].summary = `Generated ${lexResult.tokens.length} tokens (${lexResult.codeTokens.length} code tokens).`;
  pipeline[0].status = lexResult.issues.length > 0 ? 'warning' : 'completed';

  // 2. Syntax Analysis
  pipeline[1].status = 'running';
  const tSynStart = performance.now();
  const parser = new Parser(lexResult.tokens);
  const parseResult = parser.parse();
  const tSynEnd = performance.now();
  pipeline[1].durationMs = Number((tSynEnd - tSynStart).toFixed(2));
  pipeline[1].summary = `Constructed ${parseResult.ast.length} AST nodes, identified ${parseResult.functions.length} functions.`;
  const syntaxErrors = parseResult.issues.filter((i) => i.severity === 'error');
  pipeline[1].status = syntaxErrors.length > 0 ? 'warning' : 'completed';

  // 3. Semantic Analysis
  pipeline[2].status = 'running';
  const tSemStart = performance.now();
  const semanticAnalyzer = new SemanticAnalyzer(
    parseResult.ast,
    parseResult.symbols,
    parseResult.functions
  );
  const semResult = semanticAnalyzer.analyze();
  const tSemEnd = performance.now();
  pipeline[2].durationMs = Number((tSemEnd - tSemStart).toFixed(2));
  pipeline[2].summary = `Resolved ${semResult.updatedSymbols.length} symbols across scopes with ${semResult.issues.length} semantic findings.`;
  pipeline[2].status = semResult.issues.length > 0 ? 'warning' : 'completed';

  // Combine issues
  const allIssues = [
    ...lexResult.issues,
    ...parseResult.issues,
    ...semResult.issues
  ];

  // 4. Metrics Calculation
  pipeline[3].status = 'running';
  const tMetStart = performance.now();
  const metricsEngine = new MetricsEngine(
    sourceCode,
    lexResult.tokens,
    parseResult.functions,
    parseResult.maxNestingDepth,
    parseResult.variableDeclarationsCount,
    parseResult.conditionalCount,
    parseResult.loopCount,
    parseResult.structCount
  );
  const metrics = metricsEngine.calculateMetrics();
  const tMetEnd = performance.now();
  pipeline[3].durationMs = Number((tMetEnd - tMetStart).toFixed(2));
  pipeline[3].summary = `Cyclomatic Complexity: ${metrics.complexity.totalCyclomaticComplexity}, Maintainability: ${metrics.quality.maintainabilityIndex}/100 (${metrics.quality.maintainabilityRating}).`;
  pipeline[3].status = 'completed';

  // 5. Report Generation
  pipeline[4].status = 'running';
  const tRepStart = performance.now();
  const totalElapsed = Number((performance.now() - startTime).toFixed(2));
  pipeline[4].durationMs = Number((performance.now() - tRepStart).toFixed(2));
  pipeline[4].summary = `Finalized full report across 5 compiler stages in ${totalElapsed}ms.`;
  pipeline[4].status = 'completed';

  return {
    id: `analysis-${Date.now()}`,
    timestamp: Date.now(),
    fileName,
    language,
    sourceCode,
    tokens: lexResult.tokens,
    symbols: semResult.updatedSymbols,
    issues: allIssues,
    metrics,
    pipeline,
    astSummary: {
      nodesCount: parseResult.ast.length,
      functionsFound: parseResult.functions.map((f) => f.name),
      errors: allIssues.filter((i) => i.severity === 'error').map((i) => i.message)
    }
  };
}
