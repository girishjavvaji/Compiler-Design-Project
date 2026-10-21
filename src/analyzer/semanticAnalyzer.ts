import { Issue, SymbolEntry, FunctionMetric } from '../types/analyzer';
import { ASTNode } from './parser';

// Standard C / C++ identifiers, methods, and library symbols that shouldn't be flagged as undeclared
const BUILT_IN_SYMBOLS = new Set([
  'cout', 'cin', 'cerr', 'clog', 'endl', 'string', 'vector', 'map', 'set',
  'unordered_map', 'unordered_set', 'pair', 'tuple', 'list', 'deque', 'stack', 'queue',
  'printf', 'scanf', 'malloc', 'free', 'NULL', 'nullptr', 'size_t', 'std',
  'max', 'min', 'abs', 'sqrt', 'pow', 'strlen', 'strcmp', 'strcpy', 'memcpy', 'memset',
  'push_back', 'pop_back', 'emplace_back', 'emplace', 'size', 'length', 'begin', 'end',
  'rbegin', 'rend', 'cbegin', 'cend', 'clear', 'insert', 'find', 'erase', 'empty',
  'front', 'back', 'at', 'reserve', 'resize', 'capacity', 'shrink_to_fit',
  'sort', 'reverse', 'accumulate', 'count', 'find_if', 'getline', 'to_string',
  'stoi', 'stol', 'stoll', 'stod', 'stof', 'fixed', 'setprecision', 'make_pair',
  'make_shared', 'make_unique', 'move', 'forward', 'main', 'argc', 'argv',
  'true', 'false', 'this', 'auto', 'int', 'double', 'float', 'char', 'bool', 'void'
]);

export interface SemanticResult {
  issues: Issue[];
  updatedSymbols: SymbolEntry[];
}

export class SemanticAnalyzer {
  private ast: ASTNode[];
  private symbols: SymbolEntry[];
  private functions: FunctionMetric[];
  private issues: Issue[] = [];

  constructor(ast: ASTNode[], symbols: SymbolEntry[], functions: FunctionMetric[]) {
    this.ast = ast;
    this.symbols = symbols;
    this.functions = functions;
  }

  public analyze(): SemanticResult {
    this.issues = [];

    // 1. Detect duplicate declarations in the same scope
    this.checkDuplicateDeclarations();

    // 2. Check for unused variables (declared but never used)
    this.checkUnusedVariables();

    // 3. Inspect AST nodes for undeclared identifiers and function call arity
    this.traverseAST(this.ast);

    return {
      issues: this.issues,
      updatedSymbols: this.symbols
    };
  }

  private checkDuplicateDeclarations(): void {
    const scopeMap = new Map<string, Set<string>>();

    for (const sym of this.symbols) {
      const scopeKey = `${sym.scopeLevel}:${sym.scope}`;
      if (!scopeMap.has(scopeKey)) {
        scopeMap.set(scopeKey, new Set());
      }
      const existing = scopeMap.get(scopeKey)!;
      if (existing.has(sym.name)) {
        this.issues.push({
          id: `sem-dup-${sym.name}-${sym.line}-${sym.column}`,
          stage: 'semantic',
          severity: 'error',
          line: sym.line,
          column: sym.column,
          rule: 'SEM-002: Duplicate Symbol Declaration',
          message: `Redeclaration of identifier '${sym.name}' in scope '${sym.scope}'`,
          suggestedFix: `Rename this identifier or remove duplicate declaration.`
        });
      } else {
        existing.add(sym.name);
      }
    }
  }

  private checkUnusedVariables(): void {
    for (const sym of this.symbols) {
      if (sym.kind === 'variable' && sym.usageCount === 0 && sym.name !== 'argc' && sym.name !== 'argv') {
        this.issues.push({
          id: `sem-unused-${sym.name}-${sym.line}-${sym.column}`,
          stage: 'semantic',
          severity: 'warning',
          line: sym.line,
          column: sym.column,
          rule: 'SEM-004: Unused Variable',
          message: `Variable '${sym.name}' of type '${sym.dataType}' is declared but never referenced`,
          suggestedFix: `Use '${sym.name}' in code or remove the unused declaration to save memory.`
        });
      }
    }
  }

  private traverseAST(nodes: ASTNode[]): void {
    for (const node of nodes) {
      if (!node) continue;

      if (node.type === 'CallExpression') {
        this.checkFunctionCall(node);
      } else if (node.type === 'Identifier') {
        this.checkIdentifierDeclared(node.name, node.line, node.column);
      } else if (node.type === 'MemberExpression') {
        if (node.object) this.traverseAST([node.object]);
        // Property is a member on an object, do not check as global undeclared identifier
      } else if (node.type === 'AssignmentExpression') {
        if (node.left) {
          if (typeof node.left === 'string') {
            this.checkIdentifierDeclared(node.left, node.line, node.column);
          } else {
            this.traverseAST([node.left]);
          }
        }
        if (node.right) this.traverseAST([node.right]);
      } else if (node.type === 'BinaryExpression') {
        if (node.left) this.traverseAST([node.left]);
        if (node.right) this.traverseAST([node.right]);
      } else if (node.type === 'UnaryExpression' && node.operand) {
        this.traverseAST([node.operand]);
      } else if (node.type === 'ConditionalExpression') {
        if (node.condition) this.traverseAST([node.condition]);
        if (node.trueBranch) this.traverseAST([node.trueBranch]);
        if (node.falseBranch) this.traverseAST([node.falseBranch]);
      } else if (node.type === 'IfStatement') {
        if (node.condition) this.traverseAST([node.condition]);
        if (node.thenBranch) this.traverseAST([node.thenBranch]);
        if (node.elseBranch) this.traverseAST([node.elseBranch]);
      } else if (node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
        if (node.condition) this.traverseAST([node.condition]);
        if (node.body) this.traverseAST([node.body]);
      } else if (node.type === 'ForStatement') {
        if (node.init) this.traverseAST([node.init]);
        if (node.condition) this.traverseAST([node.condition]);
        if (node.update) this.traverseAST([node.update]);
        if (node.body) this.traverseAST([node.body]);
      } else if (node.type === 'RangeForStatement') {
        if (node.range) this.traverseAST([node.range]);
        if (node.body) this.traverseAST([node.body]);
      } else if (node.type === 'BlockStatement' && Array.isArray(node.body)) {
        this.traverseAST(node.body);
      } else if (node.type === 'ReturnStatement' && node.argument) {
        this.traverseAST([node.argument]);
      } else if (node.type === 'ExpressionStatement' && node.expression) {
        this.traverseAST([node.expression]);
      } else if (node.type === 'StreamExpression') {
        if (node.left) this.traverseAST([node.left]);
        if (node.right) this.traverseAST([node.right]);
      } else if (node.type === 'VariableDeclaration') {
        if (node.initializer) {
          this.traverseAST([node.initializer]);
        }
      } else if (node.type === 'StructOrClassDeclaration') {
        if (Array.isArray(node.members)) {
          this.traverseAST(node.members);
        }
      }
    }
  }

  private checkFunctionCall(node: ASTNode): void {
    let fnName = '';
    let isMemberCall = false;

    if (typeof node.callee === 'string') {
      fnName = node.callee;
    } else if (node.callee && typeof node.callee === 'object') {
      if (node.callee.type === 'Identifier') {
        fnName = node.callee.name;
      } else if (node.callee.type === 'MemberExpression') {
        fnName = node.callee.property;
        isMemberCall = true;
        if (node.callee.object) {
          this.traverseAST([node.callee.object]);
        }
      }
    }

    const argsCount = Array.isArray(node.arguments) ? node.arguments.length : 0;

    if (fnName && !isMemberCall) {
      // Search in our known declared functions
      const fnDef = this.functions.find(
        (f) => f.name === fnName || f.name.endsWith('::' + fnName)
      );
      if (fnDef) {
        if (fnDef.parameterCount !== argsCount) {
          this.issues.push({
            id: `sem-arity-${fnName}-${node.line}-${node.column}`,
            stage: 'semantic',
            severity: 'error',
            line: node.line,
            column: node.column,
            rule: 'SEM-003: Function Call Arity Mismatch',
            message: `Function '${fnName}' expects ${fnDef.parameterCount} argument(s), but ${argsCount} was provided`,
            suggestedFix: `Pass ${fnDef.parameterCount} argument(s) matching signature: '${fnDef.returnType} ${fnDef.name}(${fnDef.parameters.join(', ')})'.`
          });
        }
      } else {
        // Check if function is declared at all
        this.checkIdentifierDeclared(fnName, node.line, node.column);
      }
    }

    // Recursively check arguments
    if (Array.isArray(node.arguments)) {
      this.traverseAST(node.arguments);
    }
  }

  private checkIdentifierDeclared(name: string, line: number, column: number): void {
    if (!name || BUILT_IN_SYMBOLS.has(name)) return;

    // Check if name is scoped like std::vector or Class::method
    const baseName = name.split('::').pop() || name;
    if (BUILT_IN_SYMBOLS.has(baseName)) return;

    const exists = this.symbols.some((s) => s.name === name || s.name === baseName);
    if (!exists) {
      this.issues.push({
        id: `sem-undeclared-${name}-${line}-${column}`,
        stage: 'semantic',
        severity: 'error',
        line,
        column,
        rule: 'SEM-001: Undeclared Identifier',
        message: `Use of undeclared identifier '${name}'`,
        suggestedFix: `Declare '${name}' before using it or verify spelling.`
      });
    }
  }
}
