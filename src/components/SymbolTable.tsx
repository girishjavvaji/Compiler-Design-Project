import React, { useState, useMemo } from 'react';
import { SymbolEntry, SymbolKind } from '../types/analyzer';
import { Database, Search, Filter, ArrowUpDown } from 'lucide-react';

interface Props {
  symbols: SymbolEntry[];
}

const KIND_COLORS: Record<SymbolKind, string> = {
  variable: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  function: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  parameter: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  struct: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  class: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  typedef: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  constant: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
};

export const SymbolTable: React.FC<Props> = ({ symbols }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'line' | 'usage' | 'scope'>('line');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredSymbols = useMemo(() => {
    let list = symbols.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.scope.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKind = kindFilter === 'ALL' || s.kind === kindFilter;
      return matchesSearch && matchesKind;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'line') cmp = a.line - b.line;
      else if (sortBy === 'usage') cmp = a.usageCount - b.usageCount;
      else if (sortBy === 'scope') cmp = a.scope.localeCompare(b.scope);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [symbols, searchTerm, kindFilter, sortBy, sortAsc]);

  const toggleSort = (field: 'name' | 'line' | 'usage' | 'scope') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header & Controls */}
      <div className="p-4 border-b border-navy-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Scoped Symbol Table</h3>
            <p className="text-xs text-slate-400">
              Resolved identifiers, types, bindings, and active scope hierarchies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol, type, scope..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Kind Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-6 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none"
            >
              <option value="ALL">All Kinds</option>
              <option value="variable">Variables</option>
              <option value="function">Functions</option>
              <option value="parameter">Parameters</option>
              <option value="struct">Structs</option>
              <option value="class">Classes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Symbol Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950/80 text-slate-400 border-b border-navy-800">
            <tr>
              <th
                onClick={() => toggleSort('name')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Symbol Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold">Category</th>
              <th className="py-2.5 px-4 font-semibold">Data Type</th>
              <th
                onClick={() => toggleSort('scope')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Scope
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('line')}
                className="py-2.5 px-4 font-semibold text-center cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  Decl Location
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('usage')}
                className="py-2.5 px-4 font-semibold text-center cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  Usage Count
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold">Parameters / Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/50">
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map((sym, idx) => (
                <tr key={`${sym.name}-${sym.line}-${idx}`} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-cyan-400">
                    {sym.name}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        KIND_COLORS[sym.kind] || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {sym.kind}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-amber-300/90">
                    {sym.dataType || 'void'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-300">
                    <span className="text-[11px] bg-navy-950 px-2 py-0.5 rounded border border-navy-800 text-slate-300">
                      {sym.scope} (lvl {sym.scopeLevel})
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-center text-slate-400">
                    L{sym.line}:C{sym.column}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sym.usageCount === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {sym.usageCount} refs
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                    {sym.parameters && sym.parameters.length > 0
                      ? sym.parameters.map((p) => `${p.type} ${p.name}`).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No symbols found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-navy-800 bg-navy-950/40 text-xs text-slate-400 flex items-center justify-between">
        <span>Total Symbols in Table: {symbols.length}</span>
        <span>Filtered: {filteredSymbols.length}</span>
      </div>
    </div>
  );
};
