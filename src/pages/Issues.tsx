import React from 'react';
import { AnalysisResult } from '../types/analyzer';
import { IssuePanel } from '../components/IssuePanel';
import { AlertCircle, Code2 } from 'lucide-react';

interface Props {
  analysisResult: AnalysisResult | null;
  onNavigateToAnalyzer: (line?: number) => void;
}

export const IssuesPage: React.FC<Props> = ({
  analysisResult,
  onNavigateToAnalyzer
}) => {
  if (!analysisResult) {
    return (
      <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-12 text-center shadow-md">
        <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-semibold text-slate-200">No Code Analyzed</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Please run analysis on a source file to inspect syntax and semantic diagnostics.
        </p>
        <button
          onClick={() => onNavigateToAnalyzer()}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Open Code Analyzer
        </button>
      </div>
    );
  }

  const handleSelectIssue = (line: number) => {
    onNavigateToAnalyzer(line);
  };

  const { issues, fileName } = analysisResult;
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100">
              Compiler Diagnostics &amp; Issues
            </h2>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              {fileName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lexical errors, AST syntax violations, and semantic scope inconsistencies detected by the compiler.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold font-mono">
            {errors.length} Errors
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold font-mono">
            {warnings.length} Warnings
          </span>
        </div>
      </div>

      <IssuePanel issues={issues} onSelectIssue={handleSelectIssue} />
    </div>
  );
};
