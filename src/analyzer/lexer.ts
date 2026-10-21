import { Token, TokenType, Issue } from '../types/analyzer';

// Recognized C / C++ keywords
export const C_CPP_KEYWORDS = new Set([
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
  'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t',
  'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
  'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype',
  'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum',
  'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto',
  'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
  'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected',
  'public', 'register', 'reinterpret_cast', 'requires', 'return', 'short',
  'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct',
  'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try',
  'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual',
  'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq',
  // Standard library types frequently treated as types in C/C++
  'string', 'size_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
  'int8_t', 'int16_t', 'int32_t', 'int64_t'
]);

// Multi-character operators sorted by length descending for greedy match
export const OPERATOR_LIST = [
  '<<=', '>>=', '...', '->*',
  '++', '--', '==', '!=', '<=', '>=', '&&', '||',
  '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=',
  '|=', '^=', '->', '::', '.*',
  '+', '-', '*', '/', '%', '=', '<', '>', '!',
  '&', '|', '^', '~', '?'
];

export const PUNCTUATION_CHARS = new Set(['(', ')', '{', '}', '[', ']', ';', ',', ':', '.']);

export interface LexerResult {
  tokens: Token[];
  codeTokens: Token[]; // tokens excluding comments and preprocessor
  issues: Issue[];
}

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private issues: Issue[] = [];
  private tokenId: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): LexerResult {
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.issues = [];
    this.tokenId = 1;

    while (this.pos < this.source.length) {
      const char = this.source[this.pos];

      // Whitespace handling
      if (char === '\n') {
        this.pos++;
        this.line++;
        this.column = 1;
        continue;
      }

      if (char === '\r') {
        this.pos++;
        if (this.pos < this.source.length && this.source[this.pos] === '\n') {
          this.pos++;
        }
        this.line++;
        this.column = 1;
        continue;
      }

      if (/\s/.test(char)) {
        this.pos++;
        this.column++;
        continue;
      }

      // Preprocessor directive: #
      if (char === '#' && (this.column === 1 || this.isAtLineStart())) {
        this.readPreprocessor();
        continue;
      }

      // Single-line or Multi-line comments
      if (char === '/' && this.peek() === '/') {
        this.readSingleLineComment();
        continue;
      }

      if (char === '/' && this.peek() === '*') {
        this.readMultiLineComment();
        continue;
      }

      // String literals
      if (char === '"') {
        this.readStringLiteral();
        continue;
      }

      // Character literals
      if (char === "'") {
        this.readCharLiteral();
        continue;
      }

      // Number literals
      if (/\d/.test(char) || (char === '.' && /\d/.test(this.peek()))) {
        this.readNumberLiteral();
        continue;
      }

      // Identifiers and Keywords
      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifierOrKeyword();
        continue;
      }

      // Operators
      const op = this.matchOperator();
      if (op) {
        this.addToken('OPERATOR', op, op.length);
        continue;
      }

      // Punctuation
      if (PUNCTUATION_CHARS.has(char)) {
        this.addToken('PUNCTUATION', char, 1);
        this.pos++;
        this.column++;
        continue;
      }

      // Unknown character
      this.issues.push({
        id: `lex-err-${this.line}-${this.column}`,
        stage: 'lexical',
        severity: 'error',
        line: this.line,
        column: this.column,
        message: `Unrecognized character '${char}' (ASCII: ${char.charCodeAt(0)})`,
        codeSnippet: this.getLineSnippet(this.line),
        suggestedFix: `Remove or replace invalid character '${char}'.`
      });

      this.addToken('UNKNOWN', char, 1);
      this.pos++;
      this.column++;
    }

    const codeTokens = this.tokens.filter(
      (t) => t.type !== 'COMMENT_SINGLE' && t.type !== 'COMMENT_MULTI' && t.type !== 'PREPROCESSOR'
    );

    return {
      tokens: this.tokens,
      codeTokens,
      issues: this.issues
    };
  }

  private peek(offset: number = 1): string {
    const target = this.pos + offset;
    return target < this.source.length ? this.source[target] : '';
  }

  private isAtLineStart(): boolean {
    let p = this.pos - 1;
    while (p >= 0 && this.source[p] !== '\n') {
      if (!/\s/.test(this.source[p])) return false;
      p--;
    }
    return true;
  }

  private addToken(type: TokenType, value: string, length: number): Token {
    const token: Token = {
      id: this.tokenId++,
      type,
      value,
      line: this.line,
      column: this.column,
      length
    };
    this.tokens.push(token);
    return token;
  }

  private readPreprocessor(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '';

    while (this.pos < this.source.length) {
      const c = this.source[this.pos];
      if (c === '\n' || c === '\r') {
        // Line continuation check
        if (value.trimEnd().endsWith('\\')) {
          value += c;
          this.pos++;
          this.line++;
          this.column = 1;
          continue;
        }
        break;
      }
      value += c;
      this.pos++;
      this.column++;
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'PREPROCESSOR',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readSingleLineComment(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '';

    while (this.pos < this.source.length && this.source[this.pos] !== '\n' && this.source[this.pos] !== '\r') {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'COMMENT_SINGLE',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readMultiLineComment(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '/*';
    this.pos += 2;
    this.column += 2;

    let closed = false;
    while (this.pos < this.source.length) {
      if (this.source[this.pos] === '*' && this.peek() === '/') {
        value += '*/';
        this.pos += 2;
        this.column += 2;
        closed = true;
        break;
      }

      const c = this.source[this.pos];
      value += c;
      this.pos++;

      if (c === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }

    if (!closed) {
      this.issues.push({
        id: `lex-err-unclosed-comment-${startLine}`,
        stage: 'lexical',
        severity: 'error',
        line: startLine,
        column: startCol,
        message: 'Unterminated multiline comment block (missing closing "*/")',
        suggestedFix: 'Close comment block with "*/".'
      });
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'COMMENT_MULTI',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readStringLiteral(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '"';
    this.pos++;
    this.column++;

    let closed = false;
    while (this.pos < this.source.length) {
      const c = this.source[this.pos];

      if (c === '"') {
        value += '"';
        this.pos++;
        this.column++;
        closed = true;
        break;
      }

      if (c === '\\') {
        value += c;
        this.pos++;
        this.column++;
        if (this.pos < this.source.length) {
          const next = this.source[this.pos];
          value += next;
          this.pos++;
          if (next === '\n') {
            this.line++;
            this.column = 1;
          } else {
            this.column++;
          }
        }
        continue;
      }

      if (c === '\n' || c === '\r') {
        break; // String literals without line continuation cannot cross newlines
      }

      value += c;
      this.pos++;
      this.column++;
    }

    if (!closed) {
      this.issues.push({
        id: `lex-err-unclosed-str-${startLine}`,
        stage: 'lexical',
        severity: 'error',
        line: startLine,
        column: startCol,
        message: 'Unterminated string literal (missing closing quote \'"\')',
        codeSnippet: this.getLineSnippet(startLine),
        suggestedFix: 'Add closing double quotation mark \'"\'.'
      });
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'STRING_LITERAL',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readCharLiteral(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = "'";
    this.pos++;
    this.column++;

    let closed = false;
    while (this.pos < this.source.length) {
      const c = this.source[this.pos];

      if (c === "'") {
        value += "'";
        this.pos++;
        this.column++;
        closed = true;
        break;
      }

      if (c === '\\') {
        value += c;
        this.pos++;
        this.column++;
        if (this.pos < this.source.length) {
          value += this.source[this.pos];
          this.pos++;
          this.column++;
        }
        continue;
      }

      if (c === '\n' || c === '\r') {
        break;
      }

      value += c;
      this.pos++;
      this.column++;
    }

    if (!closed) {
      this.issues.push({
        id: `lex-err-unclosed-char-${startLine}`,
        stage: 'lexical',
        severity: 'error',
        line: startLine,
        column: startCol,
        message: 'Unterminated character literal (missing closing single quote "\'")',
        codeSnippet: this.getLineSnippet(startLine),
        suggestedFix: 'Add closing single quotation mark "\'".'
      });
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'CHAR_LITERAL',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readNumberLiteral(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '';

    // Handle Hex (0x/0X) or Binary (0b/0B)
    if (this.source[this.pos] === '0' && (this.peek().toLowerCase() === 'x' || this.peek().toLowerCase() === 'b')) {
      value += this.source[this.pos];
      value += this.peek();
      this.pos += 2;
      this.column += 2;

      while (this.pos < this.source.length && /[0-9a-fA-F_]/.test(this.source[this.pos])) {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
    } else {
      let hasDot = false;
      let hasExp = false;

      while (this.pos < this.source.length) {
        const c = this.source[this.pos];

        if (c === '.') {
          if (hasDot || hasExp) break;
          // Check if followed by digit or identifier
          hasDot = true;
          value += c;
          this.pos++;
          this.column++;
        } else if ((c === 'e' || c === 'E') && !hasExp) {
          hasExp = true;
          value += c;
          this.pos++;
          this.column++;
          if (this.pos < this.source.length && (this.source[this.pos] === '+' || this.source[this.pos] === '-')) {
            value += this.source[this.pos];
            this.pos++;
            this.column++;
          }
        } else if (/\d/.test(c)) {
          value += c;
          this.pos++;
          this.column++;
        } else {
          break;
        }
      }
    }

    // Number suffixes (u, l, ul, f, ll, ull)
    while (this.pos < this.source.length && /[uUlLfF]/.test(this.source[this.pos])) {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    this.tokens.push({
      id: this.tokenId++,
      type: 'NUMBER_LITERAL',
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private readIdentifierOrKeyword(): void {
    const startLine = this.line;
    const startCol = this.column;
    let value = '';

    while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    const type: TokenType = C_CPP_KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER';

    this.tokens.push({
      id: this.tokenId++,
      type,
      value,
      line: startLine,
      column: startCol,
      length: value.length
    });
  }

  private matchOperator(): string | null {
    for (const op of OPERATOR_LIST) {
      if (this.source.startsWith(op, this.pos)) {
        this.pos += op.length;
        this.column += op.length;
        return op;
      }
    }
    return null;
  }

  private getLineSnippet(lineNumber: number): string {
    const lines = this.source.split('\n');
    return (lines[lineNumber - 1] || '').trim();
  }
}
