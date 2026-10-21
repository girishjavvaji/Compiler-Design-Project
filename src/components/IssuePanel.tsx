import React, { useState } from 'react';
import { Issue, Severity, AnalysisStage } from '../types/analyzer';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Search, Filter, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  issues: Issue[];
  onSelectIssue?: (line: number, column: number) => void;
}

export const IssuePanel: React.FC<Props> = ({ issues, onSelectIssue }) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | AnalysisStage>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  const filteredIssues = issues.filter((i) => {
    const matchesSev = severityFilter === 'ALL' || i.severity === severityFilter;
    const matchesStage = stageFilter === 'ALL' || i.stage === stageFilter;
    const matchesSearch =
      i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.suggestedFix && i.suggestedFix.toLowerCase().includes(searchTerm.toLowerCase())) ||
      i.line.toString().includes(searchTerm);

    return matchesSev && matchesStage && matchesSearch;
  });

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Banner and Filter Tabs */}
      <div className="p-4 border-b border-navy-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Diagnostics &amp; Issues</h3>
            <p className="text-xs text-slate-400">
              Compilation findings across Lexical, Syntactic, and Semantic passes
            </p>
          </div>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded-lg border border-navy-800 text-xs">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              severityFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setSeverityFilter('error')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              severityFilter === 'error'
                ? 'bg-rose-600 text-white shadow'
                : 'text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Errors ({errorCount})
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              severityFilter === 'warning'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Warnings ({warningCount})
          </button>
          <button
            onClick={() => setSeverityFilter('info')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              severityFilter === 'info'
                ? 'bg-sky-600 text-white shadow'
                : 'text-sky-400 hover:bg-sky-500/10'
            }`}
          >
            <Info className="w-3 h-3" />
            Info ({infoCount})
          </button>
        </div>
      </div>

      {/* Secondary Controls: Search & Stage Filter */}
      <div className="p-3 bg-navy-950/60 border-b border-navy-800 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search diagnostic messages or line numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Compiler Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="lexical">Lexical Analysis</option>
            <option value="syntax">Syntax Parser</option>
            <option value="semantic">Semantic Analyzer</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const isErr = issue.severity === 'error';
            const isWarn = issue.severity === 'warning';

            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue && onSelectIssue(issue.line, issue.column)}
                className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isErr
                    ? 'border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20'
                    : isWarn
                    ? 'border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20'
                    : 'border-sky-500/30 bg-sky-950/10 hover:bg-sky-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {isErr ? (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Info className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            isErr
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                          {issue.stage}
                        </span>
                        {issue.rule && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {issue.rule}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1.5 leading-relaxed">
                        {issue.message}
                      </p>
                      {issue.suggestedFix && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-emerald-400/90 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-emerald-400 flex-shrink-0" />
                          <span>
                            <strong>Suggested Correction:</strong> {issue.suggestedFix}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                      Line {issue.line}:{issue.column}
                    </span>
                    <span className="text-[10px] text-blue-400 flex items-center gap-0.5 mt-1 opacity-80 hover:opacity-100">
                      Jump to line <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-200">No Issues Detected</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Your source code passed lexical scanning, grammar parsing, and semantic validation with zero errors!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
