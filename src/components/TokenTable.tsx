import React, { useState, useMemo } from 'react';
import { Token, TokenType } from '../types/analyzer';
import { Search, Filter, Hash, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  tokens: Token[];
}

const TYPE_COLORS: Record<TokenType, string> = {
  KEYWORD: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  IDENTIFIER: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  NUMBER_LITERAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  STRING_LITERAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CHAR_LITERAL: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  OPERATOR: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  PUNCTUATION: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  PREPROCESSOR: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  COMMENT_SINGLE: 'bg-slate-700/30 text-slate-400 border-slate-700/50',
  COMMENT_MULTI: 'bg-slate-700/30 text-slate-400 border-slate-700/50',
  UNKNOWN: 'bg-red-500/20 text-red-400 border-red-500/40'
};

const ITEMS_PER_PAGE = 15;

export const TokenTable: React.FC<Props> = ({ tokens }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchesSearch =
        t.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.line.toString().includes(searchTerm);

      const matchesType = selectedType === 'ALL' || t.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [tokens, searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredTokens.length / ITEMS_PER_PAGE) || 1;
  const paginatedTokens = filteredTokens.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header and Controls */}
      <div className="p-4 border-b border-navy-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Lexical Token Stream</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredTokens.length} of {tokens.length} total tokens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search value, type, line..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-6 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 cursor-pointer appearance-none"
            >
              <option value="ALL">All Types</option>
              <option value="KEYWORD">Keywords</option>
              <option value="IDENTIFIER">Identifiers</option>
              <option value="OPERATOR">Operators</option>
              <option value="NUMBER_LITERAL">Numbers</option>
              <option value="STRING_LITERAL">Strings</option>
              <option value="PUNCTUATION">Punctuation</option>
              <option value="PREPROCESSOR">Preprocessor</option>
              <option value="COMMENT_SINGLE">Comments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950/80 text-slate-400 border-b border-navy-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold w-16">#</th>
              <th className="py-2.5 px-4 font-semibold w-36">Type</th>
              <th className="py-2.5 px-4 font-semibold">Value</th>
              <th className="py-2.5 px-4 font-semibold text-center w-24">Location</th>
              <th className="py-2.5 px-4 font-semibold text-center w-20">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/50">
            {paginatedTokens.length > 0 ? (
              paginatedTokens.map((t) => (
                <tr key={t.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-2 px-4 font-mono text-slate-400">{t.id}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        TYPE_COLORS[t.type] || TYPE_COLORS.UNKNOWN
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-mono text-slate-200 break-all max-w-xs">
                    {t.type.includes('COMMENT') ? (
                      <span className="text-slate-400 italic">{t.value}</span>
                    ) : (
                      t.value
                    )}
                  </td>
                  <td className="py-2 px-4 font-mono text-center text-slate-400">
                    L{t.line}:C{t.column}
                  </td>
                  <td className="py-2 px-4 font-mono text-center text-slate-400">{t.length}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No tokens matching the current search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/40 flex items-center justify-between text-xs text-slate-400">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
