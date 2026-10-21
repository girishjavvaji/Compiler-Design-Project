import { Token, Issue, FunctionMetric, SymbolEntry } from '../types/analyzer';
import { SymbolTableManager } from './symbolTable';

export interface ASTNode {
  type: string;
  line: number;
  column: number;
  [key: string]: any;
}

export interface ParseResult {
  ast: ASTNode[];
  functions: FunctionMetric[];
  symbols: SymbolEntry[];
  issues: Issue[];
  maxNestingDepth: number;
  variableDeclarationsCount: number;
  conditionalCount: number;
  loopCount: number;
  structCount: number;
}

export const KNOWN_TYPES = new Set([
  // C / C++ primitive types
  'int', 'float', 'double', 'char', 'void', 'bool',
  'long', 'short', 'unsigned', 'signed', 'auto',
  'size_t', 'ptrdiff_t', 'intptr_t', 'uintptr_t',
  'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
  'int8_t', 'int16_t', 'int32_t', 'int64_t',
  'wchar_t', 'char8_t', 'char16_t', 'char32_t',
  // Standard library strings & streams
  'string', 'wstring', 'string_view', 'ostream', 'istream',
  'iostream', 'ifstream', 'ofstream', 'fstream', 'stringstream',
  // Standard library containers & utilities
  'vector', 'map', 'set', 'unordered_map', 'unordered_set',
  'multimap', 'multiset', 'unordered_multimap', 'unordered_multiset',
  'pair', 'tuple', 'list', 'deque', 'stack', 'queue', 'array',
  'unique_ptr', 'shared_ptr', 'weak_ptr', 'optional', 'variant', 'any'
]);

export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  private issues: Issue[] = [];
  private functions: FunctionMetric[] = [];
  private symbolTable: SymbolTableManager;
  private currentFunction: FunctionMetric | null = null;
  private currentNesting: number = 0;
  private maxNesting: number = 0;
  private varDeclCount: number = 0;
  private conditionalCount: number = 0;
  private loopCount: number = 0;
  private structCount: number = 0;
  private knownCustomTypes: Set<string> = new Set();
  private reportedSemicolonLines: Set<number> = new Set();

  constructor(tokens: Token[]) {
    // Filter out comments from syntax analysis
    this.tokens = tokens.filter(
      (t) => t.type !== 'COMMENT_SINGLE' && t.type !== 'COMMENT_MULTI'
    );
    this.symbolTable = new SymbolTableManager();
  }

  public parse(): ParseResult {
    this.pos = 0;
    this.issues = [];
    this.functions = [];
    this.currentFunction = null;
    this.currentNesting = 0;
    this.maxNesting = 0;
    this.varDeclCount = 0;
    this.conditionalCount = 0;
    this.loopCount = 0;
    this.structCount = 0;
    this.knownCustomTypes.clear();
    this.reportedSemicolonLines.clear();
    this.symbolTable.reset();

    // 1. First pass: check for unmatched delimiters (braces, brackets, parentheses)
    this.checkDelimiterMatching();

    // 2. Pre-scan for custom type names (structs, classes, typedefs, using)
    this.preScanCustomTypes();

    // 3. Main parsing loop
    const ast: ASTNode[] = [];

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseTopLevel();
        if (stmt) {
          ast.push(stmt);
        }
      } catch (e: any) {
        // Panic mode recovery: synchronize to next semicolon or closing brace
        this.synchronize();
      }
    }

    // Post-process function metrics
    for (const fn of this.functions) {
      if (fn.cyclomaticComplexity < 1) fn.cyclomaticComplexity = 1;
      if (fn.cyclomaticComplexity <= 5) fn.riskLevel = 'low';
      else if (fn.cyclomaticComplexity <= 10) fn.riskLevel = 'moderate';
      else if (fn.cyclomaticComplexity <= 20) fn.riskLevel = 'high';
      else fn.riskLevel = 'very_high';
    }

    return {
      ast,
      functions: this.functions,
      symbols: this.symbolTable.getAllSymbols(),
      issues: this.issues,
      maxNestingDepth: this.maxNesting,
      variableDeclarationsCount: this.varDeclCount,
      conditionalCount: this.conditionalCount,
      loopCount: this.loopCount,
      structCount: this.structCount
    };
  }

  private preScanCustomTypes(): void {
    for (let i = 0; i < this.tokens.length - 1; i++) {
      const t = this.tokens[i];
      const next = this.tokens[i + 1];
      if ((t.value === 'struct' || t.value === 'class' || t.value === 'enum' || t.value === 'typename') && next && next.type === 'IDENTIFIER') {
        this.knownCustomTypes.add(next.value);
      }
    }
  }

  private checkDelimiterMatching(): void {
    const stack: { char: string; token: Token }[] = [];
    const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

    for (const token of this.tokens) {
      if (token.type === 'PUNCTUATION') {
        if (token.value === '(' || token.value === '{' || token.value === '[') {
          stack.push({ char: token.value, token });
        } else if (token.value === ')' || token.value === '}' || token.value === ']') {
          const expected = pairs[token.value];
          if (stack.length === 0) {
            this.issues.push({
              id: `syntax-unmatched-close-${token.line}-${token.column}`,
              stage: 'syntax',
              severity: 'error',
              line: token.line,
              column: token.column,
              message: `Unmatched closing delimiter '${token.value}' without opening '${expected}'`,
              suggestedFix: `Remove extra '${token.value}' or add matching '${expected}'.`
            });
          } else {
            const top = stack.pop()!;
            if (top.char !== expected) {
              this.issues.push({
                id: `syntax-mismatched-delim-${token.line}-${token.column}`,
                stage: 'syntax',
                severity: 'error',
                line: token.line,
                column: token.column,
                message: `Mismatched delimiter: expected closing for '${top.char}', found '${token.value}'`,
                suggestedFix: `Replace '${token.value}' with closing '${pairs[token.value] ? (top.char === '(' ? ')' : top.char === '{' ? '}' : ']') : ''}'.`
              });
            }
          }
        }
      }
    }

    // Any unclosed delimiters
    while (stack.length > 0) {
      const unclosed = stack.pop()!;
      const closing = unclosed.char === '(' ? ')' : unclosed.char === '{' ? '}' : ']';
      this.issues.push({
        id: `syntax-unclosed-open-${unclosed.token.line}-${unclosed.token.column}`,
        stage: 'syntax',
        severity: 'error',
        line: unclosed.token.line,
        column: unclosed.token.column,
        message: `Unclosed delimiter '${unclosed.char}', missing matching '${closing}'`,
        suggestedFix: `Add closing '${closing}' before end of file or scope.`
      });
    }
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  private peek(offset: number = 0): Token | null {
    const target = this.pos + offset;
    return target < this.tokens.length ? this.tokens[target] : null;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.tokens[this.pos - 1];
  }

  private check(value: string, type?: string): boolean {
    const token = this.peek();
    if (!token) return false;
    if (type && token.type !== type) return false;
    return token.value === value;
  }

  private match(...values: string[]): boolean {
    const token = this.peek();
    if (!token) return false;
    for (const val of values) {
      if (token.value === val) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      const prev = this.tokens[this.pos - 1];
      if (prev && prev.value === ';') return;
      const curr = this.peek();
      if (curr && (KNOWN_TYPES.has(curr.value) || curr.value === 'if' || curr.value === 'while' ||
                   curr.value === 'for' || curr.value === 'return' || curr.value === 'class' ||
                   curr.value === 'struct' || curr.value === 'namespace' || curr.value === 'template')) {
        return;
      }
      this.advance();
    }
  }

  // Check if current token begins a valid type specification
  public isTypeSpecifier(token: Token | null = this.peek()): boolean {
    if (!token) return false;

    // Standard known types
    if (KNOWN_TYPES.has(token.value)) return true;

    // Type modifiers & storage class specifiers
    if (token.value === 'const' || token.value === 'static' || token.value === 'constexpr' ||
        token.value === 'volatile' || token.value === 'unsigned' || token.value === 'signed' ||
        token.value === 'inline' || token.value === 'virtual' || token.value === 'mutable') {
      return true;
    }

    // struct / class / typename keyword before type name
    if (token.value === 'struct' || token.value === 'class' || token.value === 'typename' || token.value === 'enum') {
      const next = this.peek(1);
      if (next && next.type === 'IDENTIFIER') return true;
    }

    // Scoped type: ::std or std::
    if (token.value === '::') return true;

    // Identifiers: check if followed by template '<', scope '::', pointer '*', reference '&', or another identifier
    if (token.type === 'IDENTIFIER') {
      if (this.knownCustomTypes.has(token.value)) return true;

      const next = this.peek(1);
      if (next) {
        // Template type: vector<...>, MyClass<...>
        if (next.value === '<') return true;
        // Scoped type: std::vector, MyNamespace::Type
        if (next.value === '::') return true;
        // Pointer or reference to type: Student*, Student&
        if (next.value === '*' || next.value === '&') return true;
        // Type followed by variable name: Student student, MyType x
        if (next.type === 'IDENTIFIER') return true;
      }

      // Check symbol table
      const sym = this.symbolTable.lookup(token.value);
      if (sym && (sym.kind === 'struct' || sym.kind === 'class' || sym.kind === 'typedef')) {
        return true;
      }
    }

    return false;
  }

  // Parse a complete type string (e.g. "const vector<Student>&", "unsigned int*", "double")
  public parseType(): string | null {
    if (this.isAtEnd()) return null;

    let typeStr = '';

    const PREFIX_MODIFIERS = new Set([
      'const', 'static', 'volatile', 'constexpr', 'inline', 'virtual',
      'unsigned', 'signed', 'struct', 'class', 'typename', 'register', 'mutable'
    ]);

    // 1. Consume leading modifiers
    while (!this.isAtEnd() && PREFIX_MODIFIERS.has(this.peek()!.value)) {
      typeStr += (typeStr ? ' ' : '') + this.advance().value;
    }

    if (this.isAtEnd()) return typeStr || null;

    // Optional leading scope ::
    if (this.check('::')) {
      typeStr += (typeStr ? ' ' : '') + this.advance().value;
    }

    // 2. Base type name (identifier or known type or keyword)
    const baseToken = this.peek();
    if (baseToken && (KNOWN_TYPES.has(baseToken.value) || baseToken.type === 'IDENTIFIER' || baseToken.value === 'auto')) {
      typeStr += (typeStr ? ' ' : '') + this.advance().value;

      // Handle scoped resolution e.g. std::vector
      while (this.match('::')) {
        typeStr += '::';
        if (!this.isAtEnd() && (KNOWN_TYPES.has(this.peek()!.value) || this.peek()!.type === 'IDENTIFIER')) {
          typeStr += this.advance().value;
        }
      }

      // Handle template arguments e.g. <Student>, <string, int>, <vector<int>>
      if (this.check('<')) {
        typeStr += this.parseTemplateArgsString();
      }

      // Handle nested type after template e.g. std::vector<int>::iterator
      while (this.match('::')) {
        typeStr += '::';
        if (!this.isAtEnd() && (KNOWN_TYPES.has(this.peek()!.value) || this.peek()!.type === 'IDENTIFIER')) {
          typeStr += this.advance().value;
        }
        if (this.check('<')) {
          typeStr += this.parseTemplateArgsString();
        }
      }
    } else if (!typeStr) {
      return null;
    }

    // 3. Postfix pointer & reference modifiers: *, &, &&, const
    while (!this.isAtEnd()) {
      if (this.check('*') || this.check('&') || this.check('&&')) {
        typeStr += this.advance().value;
      } else if (this.check('const') || this.check('volatile')) {
        typeStr += ' ' + this.advance().value;
      } else {
        break;
      }
    }

    return typeStr.trim();
  }

  // Parse template argument brackets < ... > safely without confusing with relational operators
  private parseTemplateArgsString(): string {
    if (!this.match('<')) return '';
    let result = '<';
    let depth = 1;

    while (!this.isAtEnd() && depth > 0) {
      const tok = this.peek()!;

      if (tok.value === '<') {
        depth++;
        result += this.advance().value;
      } else if (tok.value === '>') {
        depth--;
        result += this.advance().value;
      } else if (tok.value === '>>') {
        // C++11 nested template closing >>
        if (depth >= 2) {
          depth -= 2;
          this.advance();
          result += '>>';
        } else {
          depth -= 1;
          this.advance();
          result += '>';
        }
      } else if (tok.value === ';' || tok.value === '{' || tok.value === '}') {
        // Emergency recovery: templates cannot cross semicolons or braces
        break;
      } else {
        const val = this.advance().value;
        result += (result.endsWith('<') || result.endsWith(',') || result.endsWith('::') ? '' : ' ') + val;
      }
    }

    return result;
  }

  private parseTopLevel(): ASTNode | null {
    const token = this.peek();
    if (!token) return null;

    // Preprocessor directive
    if (token.type === 'PREPROCESSOR') {
      this.advance();
      return { type: 'PreprocessorDirective', value: token.value, line: token.line, column: token.column };
    }

    // Using directive / declaration
    if (token.value === 'using') {
      return this.parseUsingDirective();
    }

    // Namespace definition
    if (token.value === 'namespace') {
      return this.parseNamespace();
    }

    // Template prefix: template < ... >
    if (token.value === 'template') {
      return this.parseTemplateDeclaration();
    }

    // Struct / Class
    if (token.value === 'struct' || token.value === 'class') {
      return this.parseStructOrClass();
    }

    // Function or Global Variable Declaration
    if (this.isTypeSpecifier(token)) {
      return this.parseDeclarationOrFunction();
    }

    // Statements at top level
    return this.parseStatement();
  }

  private parseNamespace(): ASTNode {
    const startToken = this.advance(); // consume 'namespace'
    let name = 'anonymous';
    if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
      name = this.advance().value;
    }

    if (this.match('{')) {
      this.symbolTable.enterScope(`namespace:${name}`);
      const body: ASTNode[] = [];
      while (!this.isAtEnd() && !this.check('}')) {
        const node = this.parseTopLevel();
        if (node) body.push(node);
      }
      this.match('}');
      this.symbolTable.exitScope();
      return { type: 'NamespaceDeclaration', name, body, line: startToken.line, column: startToken.column };
    }

    return { type: 'NamespaceDeclaration', name, line: startToken.line, column: startToken.column };
  }

  private parseTemplateDeclaration(): ASTNode {
    const startToken = this.advance(); // consume 'template'
    if (this.check('<')) {
      this.parseTemplateArgsString();
    }
    // Following declaration
    const decl = this.parseTopLevel();
    return { type: 'TemplateDeclaration', declaration: decl, line: startToken.line, column: startToken.column };
  }

  private parseUsingDirective(): ASTNode {
    const startToken = this.advance(); // consume 'using'
    let content = 'using';
    while (!this.isAtEnd() && !this.check(';')) {
      content += ' ' + this.advance().value;
    }
    this.consumeSemicolon('using directive');
    return { type: 'UsingDirective', value: content, line: startToken.line, column: startToken.column };
  }

  private parseStructOrClass(): ASTNode {
    const kindToken = this.advance(); // 'struct' or 'class'
    this.structCount++;
    let name = 'anonymous';
    if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
      name = this.advance().value;
      this.knownCustomTypes.add(name);
    }

    this.symbolTable.define({
      name,
      kind: kindToken.value === 'class' ? 'class' : 'struct',
      dataType: kindToken.value,
      line: kindToken.line,
      column: kindToken.column
    });

    // Check optional inheritance: class Derived : public Base
    if (this.match(':')) {
      while (!this.isAtEnd() && !this.check('{') && !this.check(';')) {
        this.advance();
      }
    }

    // Forward declaration check: struct Foo;
    if (this.match(';')) {
      return { type: 'StructOrClassForwardDeclaration', name, kind: kindToken.value, line: kindToken.line, column: kindToken.column };
    }

    if (this.match('{')) {
      this.currentNesting++;
      this.updateMaxNesting();
      this.symbolTable.enterScope(`${kindToken.value}:${name}`);

      const members: ASTNode[] = [];

      while (!this.isAtEnd() && !this.check('}')) {
        // Access specifiers: public:, private:, protected:
        if (this.check('public') || this.check('private') || this.check('protected')) {
          this.advance();
          this.match(':');
          continue;
        }

        // Friend declarations
        if (this.check('friend')) {
          while (!this.isAtEnd() && !this.check(';') && !this.check('}')) {
            this.advance();
          }
          this.match(';');
          continue;
        }

        // Destructor: ~ClassName()
        if (this.check('~')) {
          this.advance();
          if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
            const dtorName = '~' + this.advance().value;
            if (this.match('(')) {
              this.consumeCloseParen('destructor');
              if (this.match(';')) {
                // declaration only
              } else if (this.check('{')) {
                this.parseBlockStatement();
              }
            }
          }
          continue;
        }

        // Constructor: ClassName(...)
        if (this.peek()?.value === name && this.peek(1)?.value === '(') {
          const ctorToken = this.advance();
          this.consumeOpenParen('constructor');
          const params: { name: string; type: string }[] = [];
          this.parseParameterList(params, ctorToken);
          this.consumeCloseParen('constructor parameters');

          // Constructor member initializer list: : member(val), ...
          if (this.match(':')) {
            while (!this.isAtEnd() && !this.check('{') && !this.check(';')) {
              this.advance();
            }
          }

          if (this.match('=')) {
            // = default; or = delete;
            while (!this.isAtEnd() && !this.check(';')) this.advance();
            this.consumeSemicolon('constructor definition');
          } else if (this.match(';')) {
            // declaration
          } else if (this.check('{')) {
            const fnMetric: FunctionMetric = {
              name: `${name} (constructor)`,
              returnType: 'void',
              parameters: params.map((p) => `${p.type} ${p.name}`.trim()),
              startLine: ctorToken.line,
              endLine: ctorToken.line,
              loc: 1,
              cyclomaticComplexity: 1,
              nestingDepth: 0,
              parameterCount: params.length,
              decisionPoints: [],
              riskLevel: 'low'
            };
            const prevFn = this.currentFunction;
            this.currentFunction = fnMetric;
            this.parseBlockStatement();
            fnMetric.endLine = this.tokens[this.pos - 1]?.line || ctorToken.line;
            fnMetric.loc = Math.max(1, fnMetric.endLine - fnMetric.startLine + 1);
            this.functions.push(fnMetric);
            this.currentFunction = prevFn;
          }
          continue;
        }

        // Nested struct / class
        if (this.check('struct') || this.check('class')) {
          members.push(this.parseStructOrClass());
          continue;
        }

        // Member function or Member variable
        if (this.isTypeSpecifier(this.peek())) {
          const memberNode = this.parseDeclarationOrFunction();
          if (memberNode) members.push(memberNode);
          continue;
        }

        // Fallback: advance until next semicolon
        if (this.check(';')) {
          this.advance();
        } else {
          this.advance();
        }
      }

      this.match('}');
      this.currentNesting--;
      this.symbolTable.exitScope();
      this.consumeSemicolon(`${kindToken.value} declaration`);
      return { type: 'StructOrClassDeclaration', name, kind: kindToken.value, members, line: kindToken.line, column: kindToken.column };
    }

    return { type: 'StructOrClassDeclaration', name, kind: kindToken.value, line: kindToken.line, column: kindToken.column };
  }

  private parseDeclarationOrFunction(): ASTNode {
    const startToken = this.peek()!;
    const baseType = this.parseType();

    if (!baseType) {
      return this.parseStatement();
    }

    const nameToken = this.peek();
    if (!nameToken) {
      return this.parseStatement();
    }

    // Check operator overloading: operator+ or operator<<
    let identifierName = '';
    if (nameToken.value === 'operator') {
      this.advance();
      let opSymbol = '';
      while (!this.isAtEnd() && !this.check('(') && !this.check(';')) {
        opSymbol += this.advance().value;
      }
      identifierName = `operator${opSymbol}`;
    } else if (nameToken.type === 'IDENTIFIER') {
      identifierName = this.advance().value;
      // Handle qualified name: ClassName::methodName
      while (this.match('::')) {
        identifierName += '::';
        if (!this.isAtEnd() && (this.peek()!.type === 'IDENTIFIER' || this.peek()!.value === 'operator')) {
          if (this.peek()!.value === 'operator') {
            this.advance();
            let opSymbol = '';
            while (!this.isAtEnd() && !this.check('(') && !this.check(';')) {
              opSymbol += this.advance().value;
            }
            identifierName += `operator${opSymbol}`;
          } else {
            identifierName += this.advance().value;
          }
        }
      }
    } else {
      // Possible expression or unsupported construct
      return this.parseStatement();
    }

    // Check if function: next token is '('
    if (this.match('(')) {
      return this.parseFunctionDefinition(baseType, identifierName, startToken);
    }

    // Otherwise it's a variable declaration
    return this.parseVariableDeclaration(baseType, identifierName, startToken);
  }

  private parseParameterList(params: { name: string; type: string }[], startToken: Token): void {
    while (!this.isAtEnd() && !this.check(')')) {
      const paramType = this.parseType();

      if (paramType) {
        let paramName = '';
        if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
          paramName = this.advance().value;
        }

        // Array brackets in param: int arr[]
        if (this.match('[')) {
          if (!this.check(']')) this.parseExpression();
          this.match(']');
        }

        // Default argument value: = expr
        if (this.match('=')) {
          this.parseAssignmentOrConditional();
        }

        const effectiveName = paramName || `param_${params.length + 1}`;
        params.push({ name: effectiveName, type: paramType.trim() });
        this.symbolTable.define({
          name: effectiveName,
          kind: 'parameter',
          dataType: paramType.trim(),
          line: startToken.line,
          column: startToken.column
        });
      } else {
        if (this.match('...')) {
          params.push({ name: '...', type: '...' });
        } else if (this.match('void')) {
          break; // (void) parameter list
        } else {
          // Unrecognized token in parameter list: skip gracefully to avoid false errors
          this.advance();
        }
      }

      if (!this.match(',')) break;
    }
  }

  private parseFunctionDefinition(returnType: string, name: string, startToken: Token): ASTNode {
    const params: { name: string; type: string }[] = [];
    this.symbolTable.enterScope(`function:${name}`);

    // Parse parameters
    this.parseParameterList(params, startToken);

    if (!this.match(')')) {
      this.issues.push({
        id: `syntax-fn-param-close-${startToken.line}-${startToken.column}`,
        stage: 'syntax',
        severity: 'error',
        line: startToken.line,
        column: startToken.column,
        message: `Missing ')' after parameters in function '${name}'`,
        suggestedFix: `Add closing ')' to function parameter list.`
      });
    }

    // Qualifiers after parameter list: const, noexcept, override, final, = 0, = default, = delete
    while (this.match('const', 'noexcept', 'override', 'final', 'volatile')) {
      // Consume qualifiers
    }

    // Pure virtual or default/delete
    if (this.match('=')) {
      while (!this.isAtEnd() && !this.check(';')) this.advance();
    }

    // Constructor initializer list if any
    if (this.match(':')) {
      while (!this.isAtEnd() && !this.check('{') && !this.check(';')) {
        this.advance();
      }
    }

    // Define function in symbol table
    this.symbolTable.define({
      name,
      kind: 'function',
      dataType: returnType,
      line: startToken.line,
      column: startToken.column,
      parameters: params
    });

    // Check if declaration only (ends with semicolon)
    if (this.match(';')) {
      this.symbolTable.exitScope();
      return {
        type: 'FunctionDeclaration',
        name,
        returnType,
        parameters: params,
        line: startToken.line,
        column: startToken.column
      };
    }

    // Function definition with body
    if (!this.check('{')) {
      // If we see another declaration or EOF, emit missing brace
      this.issues.push({
        id: `syntax-fn-body-brace-${startToken.line}-${startToken.column}`,
        stage: 'syntax',
        severity: 'error',
        line: startToken.line,
        column: startToken.column,
        message: `Expected '{' for body of function '${name}'`,
        suggestedFix: `Add '{' to start the function definition body or ';' for a prototype declaration.`
      });
      this.symbolTable.exitScope();
      return { type: 'FunctionError', name, line: startToken.line, column: startToken.column };
    }

    const fnMetric: FunctionMetric = {
      name,
      returnType,
      parameters: params.map((p) => `${p.type} ${p.name}`.trim()),
      startLine: startToken.line,
      endLine: startToken.line,
      loc: 1,
      cyclomaticComplexity: 1, // Standard McCabe Cyclomatic Complexity starts at 1
      nestingDepth: 0,
      parameterCount: params.length,
      decisionPoints: [],
      riskLevel: 'low'
    };

    const prevFunction = this.currentFunction;
    this.currentFunction = fnMetric;

    // Parse block body
    this.parseBlockStatement();

    fnMetric.endLine = this.tokens[this.pos - 1]?.line || startToken.line;
    fnMetric.loc = Math.max(1, fnMetric.endLine - fnMetric.startLine + 1);

    this.functions.push(fnMetric);
    this.currentFunction = prevFunction;
    this.symbolTable.exitScope();

    return {
      type: 'FunctionDefinition',
      name,
      returnType,
      parameters: params,
      startLine: fnMetric.startLine,
      endLine: fnMetric.endLine,
      loc: fnMetric.loc,
      cyclomaticComplexity: fnMetric.cyclomaticComplexity,
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseVariableDeclaration(baseType: string, firstVarName: string, startToken: Token): ASTNode {
    this.varDeclCount++;
    const vars: string[] = [firstVarName];

    this.symbolTable.define({
      name: firstVarName,
      kind: 'variable',
      dataType: baseType,
      line: startToken.line,
      column: startToken.column
    });

    let initializer: ASTNode | null = null;
    // Direct initializer: = expr or constructor call (args) or uniform init {args}
    if (this.match('=')) {
      initializer = this.parseExpression();
    } else if (this.match('(')) {
      const args: ASTNode[] = [];
      while (!this.isAtEnd() && !this.check(')')) {
        args.push(this.parseExpression());
        if (!this.match(',')) break;
      }
      this.consumeCloseParen('constructor argument list');
    } else if (this.match('{')) {
      // Uniform initializer
      while (!this.isAtEnd() && !this.check('}')) {
        this.advance();
      }
      this.match('}');
    }

    // Array brackets: int arr[10];
    if (this.match('[')) {
      if (!this.check(']')) this.parseExpression();
      this.match(']');
    }

    // Additional comma-separated declarations: int a = 1, b = 2;
    while (this.match(',')) {
      const nextId = this.peek();
      if (nextId && nextId.type === 'IDENTIFIER') {
        const idName = this.advance().value;
        vars.push(idName);
        this.varDeclCount++;
        this.symbolTable.define({
          name: idName,
          kind: 'variable',
          dataType: baseType,
          line: nextId.line,
          column: nextId.column
        });
        if (this.match('=')) {
          this.parseExpression();
        } else if (this.match('(')) {
          while (!this.isAtEnd() && !this.check(')')) this.advance();
          this.match(')');
        }
        if (this.match('[')) {
          if (!this.check(']')) this.parseExpression();
          this.match(']');
        }
      } else {
        break;
      }
    }

    this.consumeSemicolon(`variable declaration of '${firstVarName}'`);

    return {
      type: 'VariableDeclaration',
      dataType: baseType,
      variables: vars,
      initializer,
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();
    if (!token) return { type: 'Empty', line: 0, column: 0 };

    // Empty statement: lone ';'
    if (token.value === ';') {
      this.advance();
      return { type: 'EmptyStatement', line: token.line, column: token.column };
    }

    // Compound block
    if (token.value === '{') {
      return this.parseBlockStatement();
    }

    // Control flow statements
    if (token.value === 'if') {
      return this.parseIfStatement();
    }

    if (token.value === 'while') {
      return this.parseWhileStatement();
    }

    if (token.value === 'for') {
      return this.parseForStatement();
    }

    if (token.value === 'do') {
      return this.parseDoWhileStatement();
    }

    if (token.value === 'switch') {
      return this.parseSwitchStatement();
    }

    if (token.value === 'case' || token.value === 'default') {
      return this.parseCaseStatement();
    }

    if (token.value === 'return') {
      return this.parseReturnStatement();
    }

    if (token.value === 'break' || token.value === 'continue') {
      const kw = this.advance();
      this.consumeSemicolon(`'${kw.value}' statement`);
      return { type: kw.value === 'break' ? 'BreakStatement' : 'ContinueStatement', line: kw.line, column: kw.column };
    }

    // Local variable or function declaration
    if (this.isTypeSpecifier(token)) {
      return this.parseDeclarationOrFunction();
    }

    // Check if token could begin a valid expression
    if (this.isExpressionStarter(token)) {
      return this.parseExpressionStatement();
    }

    // Unsupported or unknown statement construct: gracefully skip to ';' without spamming fake errors
    const unsupportedTok = this.advance();
    this.issues.push({
      id: `syntax-unsupported-${unsupportedTok.line}-${unsupportedTok.column}`,
      stage: 'syntax',
      severity: 'info',
      line: unsupportedTok.line,
      column: unsupportedTok.column,
      message: `Unsupported construct '${unsupportedTok.value}' (skipped without syntax error)`,
      suggestedFix: 'Standard C/C++ statements are analyzed; complex macros/constructs are skipped.'
    });

    while (!this.isAtEnd() && !this.check(';') && !this.check('}')) {
      this.advance();
    }
    this.match(';');

    return { type: 'UnsupportedStatement', value: unsupportedTok.value, line: unsupportedTok.line, column: unsupportedTok.column };
  }

  private isExpressionStarter(token: Token): boolean {
    if (!token) return false;
    if (token.type === 'IDENTIFIER' || token.type === 'NUMBER_LITERAL' ||
        token.type === 'STRING_LITERAL' || token.type === 'CHAR_LITERAL') {
      return true;
    }
    if (token.value === '(' || token.value === '[' || token.value === '::' ||
        token.value === 'true' || token.value === 'false' || token.value === 'nullptr' ||
        token.value === 'this' || token.value === 'sizeof' || token.value === '!' ||
        token.value === '-' || token.value === '+' || token.value === '++' ||
        token.value === '--' || token.value === '~' || token.value === '*' || token.value === '&') {
      return true;
    }
    return false;
  }

  private parseBlockStatement(): ASTNode {
    const startToken = this.advance(); // consume '{'
    this.currentNesting++;
    this.updateMaxNesting();

    if (this.currentFunction) {
      this.currentFunction.nestingDepth = Math.max(
        this.currentFunction.nestingDepth,
        this.currentNesting
      );
    }

    const statements: ASTNode[] = [];
    while (!this.isAtEnd() && !this.check('}')) {
      statements.push(this.parseStatement());
    }

    if (!this.match('}')) {
      this.issues.push({
        id: `syntax-unclosed-block-${startToken.line}-${startToken.column}`,
        stage: 'syntax',
        severity: 'error',
        line: startToken.line,
        column: startToken.column,
        message: 'Unclosed compound block: expected closing "}"',
        suggestedFix: 'Add closing "}" to terminate block.'
      });
    }

    this.currentNesting--;
    return {
      type: 'BlockStatement',
      body: statements,
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseIfStatement(): ASTNode {
    const token = this.advance(); // consume 'if'
    this.conditionalCount++;
    if (this.currentFunction) {
      this.currentFunction.cyclomaticComplexity++;
      this.currentFunction.decisionPoints.push(`if (line ${token.line})`);
    }

    this.consumeOpenParen('if condition');
    const condition = this.parseExpression();
    this.consumeCloseParen('if condition');

    const thenBranch = this.parseStatement();
    let elseBranch: ASTNode | null = null;

    if (this.match('else')) {
      elseBranch = this.parseStatement();
    }

    return {
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch,
      line: token.line,
      column: token.column
    };
  }

  private parseWhileStatement(): ASTNode {
    const token = this.advance(); // consume 'while'
    this.loopCount++;
    if (this.currentFunction) {
      this.currentFunction.cyclomaticComplexity++;
      this.currentFunction.decisionPoints.push(`while (line ${token.line})`);
    }

    this.consumeOpenParen('while condition');
    const condition = this.parseExpression();
    this.consumeCloseParen('while condition');

    const body = this.parseStatement();
    return { type: 'WhileStatement', condition, body, line: token.line, column: token.column };
  }

  // Detects whether 'for (...)' is a range-based for loop (contains ':' before ';')
  private isRangeBasedForHeader(): boolean {
    let p = this.pos;
    let parenDepth = 0;
    while (p < this.tokens.length) {
      const tok = this.tokens[p];
      if (tok.value === '(') parenDepth++;
      else if (tok.value === ')') {
        if (parenDepth === 0) break;
        parenDepth--;
      } else if (parenDepth === 0) {
        if (tok.value === ';') return false; // Standard 3-clause for loop
        if (tok.value === ':') return true;  // Range-based for loop
      }
      p++;
    }
    return false;
  }

  private parseForStatement(): ASTNode {
    const token = this.advance(); // consume 'for'
    this.loopCount++;
    if (this.currentFunction) {
      this.currentFunction.cyclomaticComplexity++;
      this.currentFunction.decisionPoints.push(`for (line ${token.line})`);
    }

    this.consumeOpenParen('for loop header');

    // Check for range-based for loop: for (const auto& student : students)
    if (this.isRangeBasedForHeader()) {
      const varType = this.parseType() || 'auto';
      let varName = '';

      if (this.match('[')) {
        // Structured binding: auto& [k, v]
        while (!this.isAtEnd() && !this.check(']')) {
          if (this.peek()!.type === 'IDENTIFIER') varName += this.advance().value + ' ';
          else this.advance();
        }
        this.match(']');
      } else if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
        varName = this.advance().value;
        this.symbolTable.define({
          name: varName,
          kind: 'variable',
          dataType: varType,
          line: token.line,
          column: token.column
        });
      }

      this.match(':'); // consume colon
      const rangeExpr = this.parseExpression();
      this.consumeCloseParen('range-based for loop header');
      const body = this.parseStatement();

      return {
        type: 'RangeForStatement',
        varType,
        varName: varName.trim(),
        range: rangeExpr,
        body,
        line: token.line,
        column: token.column
      };
    }

    // Classic 3-clause for loop: for (init; cond; update)
    let init: ASTNode | null = null;
    if (!this.check(';')) {
      if (this.isTypeSpecifier(this.peek()!)) {
        init = this.parseDeclarationOrFunction();
      } else {
        init = this.parseExpression();
        this.consumeSemicolon('for init');
      }
    } else {
      this.advance();
    }

    let condition: ASTNode | null = null;
    if (!this.check(';')) {
      condition = this.parseExpression();
    }
    this.consumeSemicolon('for condition');

    let update: ASTNode | null = null;
    if (!this.check(')')) {
      update = this.parseExpression();
    }
    this.consumeCloseParen('for loop header');

    const body = this.parseStatement();

    return {
      type: 'ForStatement',
      init,
      condition,
      update,
      body,
      line: token.line,
      column: token.column
    };
  }

  private parseDoWhileStatement(): ASTNode {
    const token = this.advance(); // consume 'do'
    this.loopCount++;
    if (this.currentFunction) {
      this.currentFunction.cyclomaticComplexity++;
      this.currentFunction.decisionPoints.push(`do-while (line ${token.line})`);
    }

    const body = this.parseStatement();
    if (!this.match('while')) {
      this.issues.push({
        id: `syntax-do-while-${token.line}-${token.column}`,
        stage: 'syntax',
        severity: 'error',
        line: token.line,
        column: token.column,
        message: 'Expected "while" after "do" block',
        suggestedFix: 'Add "while (condition);" after "do" block.'
      });
    }

    this.consumeOpenParen('do-while condition');
    const condition = this.parseExpression();
    this.consumeCloseParen('do-while condition');
    this.consumeSemicolon('do-while statement');

    return { type: 'DoWhileStatement', body, condition, line: token.line, column: token.column };
  }

  private parseSwitchStatement(): ASTNode {
    const token = this.advance(); // consume 'switch'
    this.consumeOpenParen('switch expression');
    const discriminant = this.parseExpression();
    this.consumeCloseParen('switch expression');
    const body = this.parseStatement();
    return { type: 'SwitchStatement', discriminant, body, line: token.line, column: token.column };
  }

  private parseCaseStatement(): ASTNode {
    const token = this.advance(); // consume 'case' or 'default'
    if (token.value === 'case') {
      if (this.currentFunction) {
        this.currentFunction.cyclomaticComplexity++;
        this.currentFunction.decisionPoints.push(`case (line ${token.line})`);
      }
      this.parseExpression();
    }
    if (!this.match(':')) {
      this.issues.push({
        id: `syntax-case-colon-${token.line}-${token.column}`,
        stage: 'syntax',
        severity: 'error',
        line: token.line,
        column: token.column,
        message: `Expected ':' after '${token.value}' label`,
        suggestedFix: `Add ':' after label.`
      });
    }
    return { type: 'CaseClause', label: token.value, line: token.line, column: token.column };
  }

  private parseReturnStatement(): ASTNode {
    const token = this.advance(); // consume 'return'
    let argument: ASTNode | null = null;
    if (!this.check(';') && !this.check('}')) {
      argument = this.parseExpression();
    }
    this.consumeSemicolon('return statement');
    return { type: 'ReturnStatement', argument, line: token.line, column: token.column };
  }

  private parseExpressionStatement(): ASTNode {
    const expr = this.parseExpression();
    this.consumeSemicolon('expression statement');
    return { type: 'ExpressionStatement', expression: expr, line: expr.line, column: expr.column };
  }

  // Expression hierarchy: Assignment -> Ternary -> Logical OR -> Logical AND -> Equality -> Relational -> Additive -> Multiplicative -> Unary -> Postfix -> Primary
  public parseExpression(): ASTNode {
    return this.parseAssignmentOrConditional();
  }

  private parseAssignmentOrConditional(): ASTNode {
    const expr = this.parseTernary();

    const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '|=', '^=']);
    if (!this.isAtEnd() && ASSIGN_OPS.has(this.peek()!.value)) {
      const op = this.advance().value;
      const right = this.parseAssignmentOrConditional();
      return {
        type: 'AssignmentExpression',
        operator: op,
        left: expr,
        right,
        line: expr.line,
        column: expr.column
      };
    }

    // Stream operators: <<, >>
    if (!this.isAtEnd() && (this.peek()!.value === '<<' || this.peek()!.value === '>>')) {
      let streamExpr = expr;
      while (!this.isAtEnd() && (this.peek()!.value === '<<' || this.peek()!.value === '>>')) {
        const op = this.advance().value;
        const right = this.parseTernary();
        streamExpr = {
          type: 'StreamExpression',
          operator: op,
          left: streamExpr,
          right,
          line: streamExpr.line,
          column: streamExpr.column
        };
      }
      return streamExpr;
    }

    return expr;
  }

  private parseTernary(): ASTNode {
    const expr = this.parseLogicalOr();

    if (this.match('?')) {
      const qToken = this.tokens[this.pos - 1];
      this.conditionalCount++;
      if (this.currentFunction) {
        this.currentFunction.cyclomaticComplexity++;
        this.currentFunction.decisionPoints.push(`? : (line ${qToken.line})`);
      }

      const trueBranch = this.parseExpression();
      if (!this.match(':')) {
        this.issues.push({
          id: `syntax-ternary-colon-${qToken.line}-${qToken.column}`,
          stage: 'syntax',
          severity: 'error',
          line: qToken.line,
          column: qToken.column,
          message: "Expected ':' in ternary conditional expression '? :'",
          suggestedFix: "Add ':' separating true and false branches."
        });
      }
      const falseBranch = this.parseTernary();

      return {
        type: 'ConditionalExpression',
        condition: expr,
        trueBranch,
        falseBranch,
        line: expr.line,
        column: expr.column
      };
    }

    return expr;
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd();
    while (this.match('||')) {
      if (this.currentFunction) {
        this.currentFunction.cyclomaticComplexity++;
        this.currentFunction.decisionPoints.push(`|| (line ${this.tokens[this.pos - 1].line})`);
      }
      const right = this.parseLogicalAnd();
      expr = { type: 'BinaryExpression', operator: '||', left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseEquality();
    while (this.match('&&')) {
      if (this.currentFunction) {
        this.currentFunction.cyclomaticComplexity++;
        this.currentFunction.decisionPoints.push(`&& (line ${this.tokens[this.pos - 1].line})`);
      }
      const right = this.parseEquality();
      expr = { type: 'BinaryExpression', operator: '&&', left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseRelational();
    while (this.match('==', '!=')) {
      const op = this.tokens[this.pos - 1].value;
      const right = this.parseRelational();
      expr = { type: 'BinaryExpression', operator: op, left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseRelational(): ASTNode {
    let expr = this.parseAdditive();
    while (this.match('<', '>', '<=', '>=')) {
      const op = this.tokens[this.pos - 1].value;
      const right = this.parseAdditive();
      expr = { type: 'BinaryExpression', operator: op, left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseAdditive(): ASTNode {
    let expr = this.parseMultiplicative();
    while (this.match('+', '-')) {
      const op = this.tokens[this.pos - 1].value;
      const right = this.parseMultiplicative();
      expr = { type: 'BinaryExpression', operator: op, left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseMultiplicative(): ASTNode {
    let expr = this.parseUnary();
    while (this.match('*', '/', '%')) {
      const op = this.tokens[this.pos - 1].value;
      const right = this.parseUnary();
      expr = { type: 'BinaryExpression', operator: op, left: expr, right, line: expr.line, column: expr.column };
    }
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match('!', '-', '+', '++', '--', '~', '*')) {
      const op = this.tokens[this.pos - 1].value;
      const operand = this.parseUnary();
      return { type: 'UnaryExpression', operator: op, operand, line: operand.line, column: operand.column };
    }
    return this.parsePostfix();
  }

  // Postfix operators: (), [], ., ->, ++, -- chained
  private parsePostfix(): ASTNode {
    let expr = this.parsePrimaryAtom();

    while (!this.isAtEnd()) {
      if (this.match('(')) {
        // Function / Method invocation
        const args: ASTNode[] = [];
        while (!this.isAtEnd() && !this.check(')')) {
          args.push(this.parseExpression());
          if (!this.match(',')) break;
        }
        this.consumeCloseParen('function call arguments');
        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args,
          line: expr.line,
          column: expr.column
        };
      } else if (this.match('[')) {
        // Array index
        const indexExpr = this.parseExpression();
        this.match(']');
        expr = {
          type: 'IndexExpression',
          array: expr,
          index: indexExpr,
          line: expr.line,
          column: expr.column
        };
      } else if (this.match('.', '->')) {
        // Member access
        const op = this.tokens[this.pos - 1].value;
        let propName = '';
        if (!this.isAtEnd() && (this.peek()!.type === 'IDENTIFIER' || this.peek()!.type === 'KEYWORD')) {
          propName = this.advance().value;
        }
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: propName,
          operator: op,
          line: expr.line,
          column: expr.column
        };
      } else if (this.match('++', '--')) {
        const postOp = this.tokens[this.pos - 1].value;
        expr = {
          type: 'UpdateExpression',
          operator: postOp,
          argument: expr,
          isPrefix: false,
          line: expr.line,
          column: expr.column
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimaryAtom(): ASTNode {
    const token = this.peek();
    if (!token) return { type: 'Empty', line: 0, column: 0 };

    if (token.type === 'NUMBER_LITERAL') {
      this.advance();
      return { type: 'NumericLiteral', value: token.value, line: token.line, column: token.column };
    }

    if (token.type === 'STRING_LITERAL') {
      this.advance();
      return { type: 'StringLiteral', value: token.value, line: token.line, column: token.column };
    }

    if (token.type === 'CHAR_LITERAL') {
      this.advance();
      return { type: 'CharLiteral', value: token.value, line: token.line, column: token.column };
    }

    if (token.value === 'true' || token.value === 'false') {
      this.advance();
      return { type: 'BooleanLiteral', value: token.value === 'true', line: token.line, column: token.column };
    }

    if (token.value === 'nullptr' || token.value === 'NULL') {
      this.advance();
      return { type: 'NullLiteral', value: token.value, line: token.line, column: token.column };
    }

    if (token.value === 'this') {
      this.advance();
      return { type: 'ThisExpression', line: token.line, column: token.column };
    }

    // Parenthesized expression: (expr)
    if (token.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.consumeCloseParen('expression grouping');
      return expr;
    }

    // Lambda expression: [...] (params) { body }
    if (token.value === '[') {
      return this.parseLambdaExpression();
    }

    // Identifier / Qualified identifier
    if (token.type === 'IDENTIFIER') {
      const idToken = this.advance();
      this.symbolTable.recordUsage(idToken.value);

      let fullName = idToken.value;
      while (this.match('::')) {
        fullName += '::';
        if (!this.isAtEnd() && this.peek()!.type === 'IDENTIFIER') {
          fullName += this.advance().value;
        }
      }

      return { type: 'Identifier', name: fullName, line: idToken.line, column: idToken.column };
    }

    // Fallback: unhandled atom
    const unhandled = this.advance();
    return { type: 'UnhandledToken', value: unhandled.value, line: unhandled.line, column: unhandled.column };
  }

  // Parse C++11 Lambda: [capture](params) { body }
  private parseLambdaExpression(): ASTNode {
    const startToken = this.advance(); // consume '['
    // Read capture list until ']'
    while (!this.isAtEnd() && !this.check(']')) {
      this.advance();
    }
    this.match(']');

    const params: { name: string; type: string }[] = [];
    if (this.match('(')) {
      this.parseParameterList(params, startToken);
      this.consumeCloseParen('lambda parameter list');
    }

    // Optional mutable, noexcept, trailing return type -> type
    while (this.match('mutable', 'noexcept')) {}
    if (this.match('->')) {
      this.parseType();
    }

    if (this.check('{')) {
      const fnMetric: FunctionMetric = {
        name: `lambda@L${startToken.line}`,
        returnType: 'auto',
        parameters: params.map((p) => `${p.type} ${p.name}`.trim()),
        startLine: startToken.line,
        endLine: startToken.line,
        loc: 1,
        cyclomaticComplexity: 1,
        nestingDepth: this.currentNesting,
        parameterCount: params.length,
        decisionPoints: [],
        riskLevel: 'low'
      };

      const prevFn = this.currentFunction;
      this.currentFunction = fnMetric;
      this.parseBlockStatement();
      fnMetric.endLine = this.tokens[this.pos - 1]?.line || startToken.line;
      fnMetric.loc = Math.max(1, fnMetric.endLine - fnMetric.startLine + 1);
      this.functions.push(fnMetric);
      this.currentFunction = prevFn;

      return { type: 'LambdaExpression', name: fnMetric.name, line: startToken.line, column: startToken.column };
    }

    return { type: 'LambdaExpression', line: startToken.line, column: startToken.column };
  }

  private consumeOpenParen(context: string): void {
    if (!this.match('(')) {
      const prev = this.tokens[this.pos - 1] || { line: 1, column: 1 };
      this.issues.push({
        id: `syntax-open-paren-${prev.line}-${prev.column}`,
        stage: 'syntax',
        severity: 'error',
        line: prev.line,
        column: prev.column,
        message: `Expected '(' in ${context}`,
        suggestedFix: `Add '(' after ${context}.`
      });
    }
  }

  private consumeCloseParen(context: string): void {
    if (!this.match(')')) {
      const prev = this.tokens[this.pos - 1] || { line: 1, column: 1 };
      this.issues.push({
        id: `syntax-close-paren-${prev.line}-${prev.column}`,
        stage: 'syntax',
        severity: 'error',
        line: prev.line,
        column: prev.column,
        message: `Expected ')' after ${context}`,
        suggestedFix: `Add ')' to close ${context}.`
      });
    }
  }

  private consumeSemicolon(context: string): void {
    if (this.match(';')) {
      return;
    }

    const prev = this.tokens[this.pos - 1] || { line: 1, column: 1 };

    // Don't report missing semicolon if we already reported one on this exact line
    if (this.reportedSemicolonLines.has(prev.line)) {
      return;
    }

    // Do not report missing semicolon if previous token is an opening brace or semicolon
    if (prev.value === '{' || prev.value === ';') {
      return;
    }

    // Genuine missing semicolon: statement ends before a new statement, closing brace, or EOF
    this.reportedSemicolonLines.add(prev.line);
    this.issues.push({
      id: `syntax-missing-semicolon-${prev.line}-${prev.column}`,
      stage: 'syntax',
      severity: 'error',
      line: prev.line,
      column: prev.column,
      message: `Missing ';' after ${context}`,
      suggestedFix: `Add semicolon ';' at the end of the statement.`
    });
  }

  private updateMaxNesting(): void {
    if (this.currentNesting > this.maxNesting) {
      this.maxNesting = this.currentNesting;
    }
  }
}
