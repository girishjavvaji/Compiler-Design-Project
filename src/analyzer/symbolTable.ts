import { SymbolEntry, SymbolKind } from '../types/analyzer';

export interface Scope {
  id: string;
  name: string;
  level: number;
  parent?: Scope;
  symbols: Map<string, SymbolEntry>;
}

export class SymbolTableManager {
  private currentScope: Scope;
  private globalScope: Scope;
  private allSymbols: SymbolEntry[] = [];
  private scopeCounter = 0;

  constructor() {
    this.globalScope = {
      id: 'scope-0',
      name: 'global',
      level: 0,
      symbols: new Map()
    };
    this.currentScope = this.globalScope;
  }

  public reset(): void {
    this.scopeCounter = 0;
    this.allSymbols = [];
    this.globalScope = {
      id: 'scope-0',
      name: 'global',
      level: 0,
      symbols: new Map()
    };
    this.currentScope = this.globalScope;
  }

  public enterScope(name: string): Scope {
    this.scopeCounter++;
    const newScope: Scope = {
      id: `scope-${this.scopeCounter}`,
      name,
      level: this.currentScope.level + 1,
      parent: this.currentScope,
      symbols: new Map()
    };
    this.currentScope = newScope;
    return newScope;
  }

  public exitScope(): void {
    if (this.currentScope.parent) {
      this.currentScope = this.currentScope.parent;
    }
  }

  public getCurrentScope(): Scope {
    return this.currentScope;
  }

  public define(entry: Omit<SymbolEntry, 'scope' | 'scopeLevel' | 'usageCount'>): { entry: SymbolEntry; isDuplicate: boolean } {
    const existing = this.currentScope.symbols.get(entry.name);
    const isDuplicate = !!existing;

    const fullEntry: SymbolEntry = {
      ...entry,
      scope: this.currentScope.name,
      scopeLevel: this.currentScope.level,
      usageCount: 0
    };

    if (!isDuplicate) {
      this.currentScope.symbols.set(entry.name, fullEntry);
    }
    this.allSymbols.push(fullEntry);

    return { entry: fullEntry, isDuplicate };
  }

  public lookup(name: string): SymbolEntry | null {
    let curr: Scope | undefined = this.currentScope;
    while (curr) {
      if (curr.symbols.has(name)) {
        return curr.symbols.get(name)!;
      }
      curr = curr.parent;
    }
    return null;
  }

  public recordUsage(name: string): SymbolEntry | null {
    const entry = this.lookup(name);
    if (entry) {
      entry.usageCount++;
      return entry;
    }
    return null;
  }

  public getAllSymbols(): SymbolEntry[] {
    return this.allSymbols;
  }
}
