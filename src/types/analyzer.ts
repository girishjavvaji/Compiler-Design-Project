export type Language = 'c' | 'cpp' | 'java' | 'python';

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER_LITERAL'
  | 'STRING_LITERAL'
  | 'CHAR_LITERAL'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'PREPROCESSOR'
  | 'COMMENT_SINGLE'
  | 'COMMENT_MULTI'
  | 'UNKNOWN';

export interface Token {
  id: number;
  type: TokenType;
  value: string;
  line: number;
  column: number;
  length: number;
}

export type Severity = 'error' | 'warning' | 'info';
export type AnalysisStage = 'lexical' | 'syntax' | 'semantic' | 'metrics';

export interface Issue {
  id: string;
  stage: AnalysisStage;
  severity: Severity;
  line: number;
  column: number;
  message: string;
  codeSnippet?: string;
  suggestedFix?: string;
  rule?: string;
}

export type SymbolKind = 'variable' | 'function' | 'parameter' | 'struct' | 'class' | 'typedef' | 'constant';

export interface SymbolEntry {
  name: string;
  kind: SymbolKind;
  dataType: string;
  scope: string; // 'global' | 'function:name' | 'block:depth'
  scopeLevel: number;
  line: number;
  column: number;
  usageCount: number;
  parameters?: { name: string; type: string }[];
  isConst?: boolean;
  isPointer?: boolean;
  isArray?: boolean;
}

export interface FunctionMetric {
  name: string;
  returnType: string;
  parameters: string[];
  startLine: number;
  endLine: number;
  loc: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  parameterCount: number;
  decisionPoints: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface HalsteadMetrics {
  distinctOperators: number;    // n1
  distinctOperands: number;     // n2
  totalOperators: number;       // N1
  totalOperands: number;        // N2
  vocabulary: number;           // n = n1 + n2
  length: number;               // N = N1 + N2
  calculatedLength: number;     // n1*log2(n1) + n2*log2(n2)
  volume: number;               // V = N * log2(n)
  difficulty: number;           // D = (n1 / 2) * (N2 / n2)
  effort: number;               // E = D * V
  timeToImplement: number;      // T = E / 18 (seconds)
  estimatedBugs: number;        // B = V / 3000
}

export interface SizeMetrics {
  totalLines: number;
  codeLines: number;           // Physical Lines of Code (PLOC)
  commentLines: number;
  blankLines: number;
  commentRatio: number;        // (commentLines / totalLines) * 100
  characterCount: number;
  logicalStatements: number;   // LLOC (semicolons + control statements)
}

export interface LexicalMetrics {
  totalTokens: number;
  tokenTypeCounts: Record<TokenType, number>;
  keywordOccurrences: number;
  uniqueKeywords: number;
  identifierOccurrences: number;
  uniqueIdentifiers: number;
  operatorOccurrences: number;
  uniqueOperators: number;
  operandOccurrences: number;
  uniqueOperands: number;
}

export interface StructuralMetrics {
  functionCount: number;
  variableDeclarations: number;
  structCount: number;
  conditionalCount: number;
  loopCount: number;
  maxNestingDepth: number;
  averageFunctionLength: number;
}

export interface ComplexityMetrics {
  functionMetrics: FunctionMetric[];
  totalCyclomaticComplexity: number;
  averageCyclomaticComplexity: number;
  maxCyclomaticComplexity: number;
  complexityDistribution: {
    simple: number;    // 1 - 5
    moderate: number;  // 6 - 10
    complex: number;   // 11 - 20
    untestable: number;// > 20
  };
}

export interface QualityIndicators {
  maintainabilityIndex: number; // 0 - 100
  maintainabilityRating: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  highComplexityFunctionsCount: number;
  deepNestingLocations: { line: number; depth: number }[];
  longFunctionsCount: number;
  commentAdequacy: 'Sufficient' | 'Low' | 'Needs Improvement';
  codeSmellsCount: number;
}

export interface AnalysisMetrics {
  size: SizeMetrics;
  lexical: LexicalMetrics;
  structural: StructuralMetrics;
  complexity: ComplexityMetrics;
  halstead: HalsteadMetrics;
  quality: QualityIndicators;
}

export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'warning' | 'failed';

export interface PipelineStage {
  id: AnalysisStage | 'report';
  name: string;
  description: string;
  status: PipelineStageStatus;
  durationMs: number;
  summary: string;
  details?: Record<string, any>;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
  language: Language;
  sourceCode: string;
  tokens: Token[];
  symbols: SymbolEntry[];
  issues: Issue[];
  metrics: AnalysisMetrics;
  pipeline: PipelineStage[];
  astSummary?: {
    nodesCount: number;
    functionsFound: string[];
    errors: string[];
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  language: Language;
  metricsSummary: {
    loc: number;
    tokens: number;
    functions: number;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    errorCount: number;
    warningCount: number;
  };
  fullResult?: AnalysisResult;
}
