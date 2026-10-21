import {
  Token,
  FunctionMetric,
  AnalysisMetrics,
  SizeMetrics,
  LexicalMetrics,
  StructuralMetrics,
  ComplexityMetrics,
  HalsteadMetrics,
  QualityIndicators,
  TokenType
} from '../types/analyzer';

export class MetricsEngine {
  private source: string;
  private tokens: Token[];
  private functions: FunctionMetric[];
  private maxNestingDepth: number;
  private varDeclCount: number;
  private conditionalCount: number;
  private loopCount: number;
  private structCount: number;

  constructor(
    source: string,
    tokens: Token[],
    functions: FunctionMetric[],
    maxNestingDepth: number,
    varDeclCount: number,
    conditionalCount: number,
    loopCount: number,
    structCount: number
  ) {
    this.source = source;
    this.tokens = tokens;
    this.functions = functions;
    this.maxNestingDepth = maxNestingDepth;
    this.varDeclCount = varDeclCount;
    this.conditionalCount = conditionalCount;
    this.loopCount = loopCount;
    this.structCount = structCount;
  }

  public calculateMetrics(): AnalysisMetrics {
    const size = this.calculateSizeMetrics();
    const lexical = this.calculateLexicalMetrics();
    const halstead = this.calculateHalsteadMetrics();
    const structural = this.calculateStructuralMetrics(size.codeLines);
    const complexity = this.calculateComplexityMetrics();
    const quality = this.calculateQualityIndicators(size, complexity, halstead);

    return {
      size,
      lexical,
      structural,
      complexity,
      halstead,
      quality
    };
  }

  private calculateSizeMetrics(): SizeMetrics {
    const lines = this.source.split(/\r?\n/);
    const totalLines = Math.max(1, lines.length);
    let blankLines = 0;
    let commentLines = 0;
    let codeLines = 0;

    // Track block comment state across lines
    let inBlockComment = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (line.length === 0) {
        blankLines++;
        continue;
      }

      if (inBlockComment) {
        commentLines++;
        const closeIdx = line.indexOf('*/');
        if (closeIdx !== -1) {
          inBlockComment = false;
          // check if there is code after */
          const remainder = line.slice(closeIdx + 2).trim();
          if (remainder.length > 0) {
            codeLines++;
          }
        }
        continue;
      }

      if (line.startsWith('//')) {
        commentLines++;
        continue;
      }

      if (line.startsWith('/*')) {
        commentLines++;
        if (!line.includes('*/')) {
          inBlockComment = true;
        } else {
          // Both /* and */ on the same line
          const closeIdx = line.indexOf('*/');
          const remainder = line.slice(closeIdx + 2).trim();
          if (remainder.length > 0) {
            codeLines++;
          }
        }
        continue;
      }

      // Code line (might contain trailing comment)
      codeLines++;
      if (line.includes('//') || line.includes('/*')) {
        commentLines++;
      }
    }

    // Logical lines of code (LLOC): count of semicolons in code tokens + control headers
    const semicolons = this.tokens.filter((t) => t.value === ';').length;
    const logicalStatements = Math.max(semicolons, this.conditionalCount + this.loopCount);

    const commentRatio = totalLines > 0 ? Number(((commentLines / totalLines) * 100).toFixed(1)) : 0;

    return {
      totalLines,
      codeLines: Math.max(1, codeLines),
      commentLines,
      blankLines,
      commentRatio,
      characterCount: this.source.length,
      logicalStatements
    };
  }

  private calculateLexicalMetrics(): LexicalMetrics {
    const counts: Record<TokenType, number> = {
      KEYWORD: 0,
      IDENTIFIER: 0,
      NUMBER_LITERAL: 0,
      STRING_LITERAL: 0,
      CHAR_LITERAL: 0,
      OPERATOR: 0,
      PUNCTUATION: 0,
      PREPROCESSOR: 0,
      COMMENT_SINGLE: 0,
      COMMENT_MULTI: 0,
      UNKNOWN: 0
    };

    const uniqueKeywords = new Set<string>();
    const uniqueIdentifiers = new Set<string>();
    const uniqueOperators = new Set<string>();
    const uniqueOperands = new Set<string>();

    let operandOccurrences = 0;

    for (const token of this.tokens) {
      if (counts[token.type] !== undefined) {
        counts[token.type]++;
      }

      if (token.type === 'KEYWORD') {
        uniqueKeywords.add(token.value);
      } else if (token.type === 'IDENTIFIER') {
        uniqueIdentifiers.add(token.value);
        uniqueOperands.add(token.value);
        operandOccurrences++;
      } else if (token.type === 'OPERATOR') {
        uniqueOperators.add(token.value);
      } else if (
        token.type === 'NUMBER_LITERAL' ||
        token.type === 'STRING_LITERAL' ||
        token.type === 'CHAR_LITERAL'
      ) {
        uniqueOperands.add(token.value);
        operandOccurrences++;
      }
    }

    return {
      totalTokens: this.tokens.length,
      tokenTypeCounts: counts,
      keywordOccurrences: counts.KEYWORD,
      uniqueKeywords: uniqueKeywords.size,
      identifierOccurrences: counts.IDENTIFIER,
      uniqueIdentifiers: uniqueIdentifiers.size,
      operatorOccurrences: counts.OPERATOR,
      uniqueOperators: uniqueOperators.size,
      operandOccurrences,
      uniqueOperands: uniqueOperands.size
    };
  }

  private calculateHalsteadMetrics(): HalsteadMetrics {
    const operatorTokens: string[] = [];
    const operandTokens: string[] = [];

    for (const token of this.tokens) {
      if (token.type === 'OPERATOR' || token.type === 'PUNCTUATION') {
        operatorTokens.push(token.value);
      } else if (
        token.type === 'IDENTIFIER' ||
        token.type === 'NUMBER_LITERAL' ||
        token.type === 'STRING_LITERAL' ||
        token.type === 'CHAR_LITERAL'
      ) {
        operandTokens.push(token.value);
      }
    }

    const distinctOperators = Math.max(1, new Set(operatorTokens).size);
    const distinctOperands = Math.max(1, new Set(operandTokens).size);
    const totalOperators = Math.max(1, operatorTokens.length);
    const totalOperands = Math.max(1, operandTokens.length);

    const vocabulary = distinctOperators + distinctOperands; // n = n1 + n2
    const length = totalOperators + totalOperands;           // N = N1 + N2

    // Calculated length: n1 * log2(n1) + n2 * log2(n2)
    const calculatedLength = Math.round(
      distinctOperators * Math.log2(distinctOperators) +
      distinctOperands * Math.log2(distinctOperands)
    );

    // Volume: V = N * log2(n)
    const volume = Math.max(1, Math.round(length * Math.log2(vocabulary)));

    // Difficulty: D = (n1 / 2) * (N2 / n2)
    const difficulty = Number(((distinctOperators / 2) * (totalOperands / distinctOperands)).toFixed(2));

    // Effort: E = D * V
    const effort = Math.round(difficulty * volume);

    // Time to implement: T = E / 18 seconds
    const timeToImplement = Number((effort / 18).toFixed(1));

    // Estimated delivered bugs: B = V / 3000
    const estimatedBugs = Number((volume / 3000).toFixed(3));

    return {
      distinctOperators,
      distinctOperands,
      totalOperators,
      totalOperands,
      vocabulary,
      length,
      calculatedLength,
      volume,
      difficulty,
      effort,
      timeToImplement,
      estimatedBugs
    };
  }

  private calculateStructuralMetrics(codeLines: number): StructuralMetrics {
    const fnCount = this.functions.length;
    const averageLength = fnCount > 0 ? Number((codeLines / fnCount).toFixed(1)) : codeLines;

    return {
      functionCount: fnCount,
      variableDeclarations: this.varDeclCount,
      structCount: this.structCount,
      conditionalCount: this.conditionalCount,
      loopCount: this.loopCount,
      maxNestingDepth: this.maxNestingDepth,
      averageFunctionLength: averageLength
    };
  }

  private calculateComplexityMetrics(): ComplexityMetrics {
    const totalCyclomaticComplexity = this.functions.reduce(
      (sum, fn) => sum + fn.cyclomaticComplexity,
      0
    ) || (1 + this.conditionalCount + this.loopCount);

    const fnCount = this.functions.length;
    const averageCyclomaticComplexity = fnCount > 0
      ? Number((totalCyclomaticComplexity / fnCount).toFixed(2))
      : totalCyclomaticComplexity;

    const maxCyclomaticComplexity = this.functions.length > 0
      ? Math.max(...this.functions.map((f) => f.cyclomaticComplexity))
      : totalCyclomaticComplexity;

    const distribution = {
      simple: 0,
      moderate: 0,
      complex: 0,
      untestable: 0
    };

    if (this.functions.length > 0) {
      for (const fn of this.functions) {
        if (fn.cyclomaticComplexity <= 5) distribution.simple++;
        else if (fn.cyclomaticComplexity <= 10) distribution.moderate++;
        else if (fn.cyclomaticComplexity <= 20) distribution.complex++;
        else distribution.untestable++;
      }
    } else {
      // Single global file without functions
      if (totalCyclomaticComplexity <= 5) distribution.simple = 1;
      else if (totalCyclomaticComplexity <= 10) distribution.moderate = 1;
      else if (totalCyclomaticComplexity <= 20) distribution.complex = 1;
      else distribution.untestable = 1;
    }

    return {
      functionMetrics: this.functions,
      totalCyclomaticComplexity,
      averageCyclomaticComplexity,
      maxCyclomaticComplexity,
      complexityDistribution: distribution
    };
  }

  private calculateQualityIndicators(
    size: SizeMetrics,
    complexity: ComplexityMetrics,
    halstead: HalsteadMetrics
  ): QualityIndicators {
    // Standard SEI / Microsoft Maintainability Index calculation:
    // MI = 171 - 5.2 * ln(V) - 0.23 * CC - 16.2 * ln(LOC)
    // Normalized to 0 - 100: MI_norm = max(0, MI * 100 / 171)
    const logV = Math.log(Math.max(1, halstead.volume));
    const cc = complexity.totalCyclomaticComplexity;
    const logLoc = Math.log(Math.max(1, size.codeLines));

    const rawMI = 171 - 5.2 * logV - 0.23 * cc - 16.2 * logLoc;
    const normalizedMI = Math.min(100, Math.max(0, Math.round((rawMI * 100) / 171)));

    let rating: 'Excellent' | 'Good' | 'Moderate' | 'Poor' = 'Good';
    if (normalizedMI >= 85) rating = 'Excellent';
    else if (normalizedMI >= 65) rating = 'Good';
    else if (normalizedMI >= 40) rating = 'Moderate';
    else rating = 'Poor';

    const highComplexityFunctionsCount = this.functions.filter(
      (f) => f.cyclomaticComplexity > 10
    ).length;

    const longFunctionsCount = this.functions.filter((f) => f.loc > 40).length;

    let commentAdequacy: 'Sufficient' | 'Low' | 'Needs Improvement' = 'Sufficient';
    if (size.commentRatio < 5) commentAdequacy = 'Needs Improvement';
    else if (size.commentRatio < 15) commentAdequacy = 'Low';

    let codeSmellsCount = 0;
    if (highComplexityFunctionsCount > 0) codeSmellsCount += highComplexityFunctionsCount;
    if (this.maxNestingDepth > 3) codeSmellsCount += (this.maxNestingDepth - 3);
    if (commentAdequacy !== 'Sufficient') codeSmellsCount++;
    if (longFunctionsCount > 0) codeSmellsCount += longFunctionsCount;

    return {
      maintainabilityIndex: normalizedMI,
      maintainabilityRating: rating,
      highComplexityFunctionsCount,
      deepNestingLocations: this.maxNestingDepth > 3 ? [{ line: 1, depth: this.maxNestingDepth }] : [],
      longFunctionsCount,
      commentAdequacy,
      codeSmellsCount
    };
  }
}
