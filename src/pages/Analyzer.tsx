import React from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { AnalysisResult } from '../types/analyzer';
import {
  Play,
  Loader2,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';

interface Props {
  code: string;
  onCodeChange: (code: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  language: string;
  theme: 'dark' | 'light';
  isAnalyzing: boolean;
  onAnalyze: () => void;
  analysisResult: AnalysisResult | null;
  onNavigateToDashboard: () => void;
}

export const Analyzer: React.FC<Props> = ({
  code,
  onCodeChange,
  fileName,
  onFileNameChange,
  language,
  theme,
  isAnalyzing,
  onAnalyze,
  analysisResult,
  onNavigateToDashboard
}) => {
  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900 border border-navy-700/60 p-4 rounded-xl shadow-md">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            Code Analyzer Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Write, edit, upload source code and execute Compiler-grade metrics inspection in real time.
          </p>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{isAnalyzing ? 'Compiling & Analyzing...' : 'Analyze Code'}</span>
        </button>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Monaco Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px]">
          <CodeEditor
            code={code}
            onChange={onCodeChange}
            fileName={fileName}
            onFileNameChange={onFileNameChange}
            language={language}
            theme={theme}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right Panel: Analysis Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] overflow-y-auto space-y-4 pr-1">
          {analysisResult ? (
            <>
              {/* Executive Health Badge */}
              <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Analysis Health Summary
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      analysisResult.metrics.quality.maintainabilityIndex >= 65
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : analysisResult.metrics.quality.maintainabilityIndex >= 40
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Maintainability: {analysisResult.metrics.quality.maintainabilityIndex}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Complexity</span>
                    <p className="text-lg font-mono font-bold text-cyan-400">
                      {analysisResult.metrics.complexity.totalCyclomaticComplexity}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Avg CC: {analysisResult.metrics.complexity.averageCyclomaticComplexity}
                    </span>
                  </div>
                  <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Quality Rating</span>
                    <p className="text-lg font-mono font-bold text-emerald-400">
                      {analysisResult.metrics.quality.maintainabilityRating}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Smells: {analysisResult.metrics.quality.codeSmellsCount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToDashboard}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 bg-navy-800 hover:bg-navy-750 text-blue-400 text-xs font-medium py-2 rounded-lg border border-navy-700 transition-colors"
                >
                  <span>Explore Interactive Analytics Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Size & Structure Metrics Table */}
              <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-4 shadow-md">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Source Code Metrics Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Physical Lines of Code (PLOC)</span>
                    <span className="font-mono font-semibold text-slate-100">
                      {analysisResult.metrics.size.codeLines}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Total File Lines</span>
                    <span className="font-mono text-slate-300">
                      {analysisResult.metrics.size.totalLines}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Comment Lines</span>
                    <span className="font-mono text-emerald-400">
                      {analysisResult.metrics.size.commentLines} ({analysisResult.metrics.size.commentRatio}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Blank Lines</span>
                    <span className="font-mono text-slate-400">
                      {analysisResult.metrics.size.blankLines}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Logical Statements (LLOC)</span>
                    <span className="font-mono text-slate-200">
                      {analysisResult.metrics.size.logicalStatements}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Functions Detected</span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {analysisResult.metrics.structural.functionCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Variable Declarations</span>
                    <span className="font-mono text-slate-300">
                      {analysisResult.metrics.structural.variableDeclarations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Conditionals (if/switch)</span>
                    <span className="font-mono text-slate-300">
                      {analysisResult.metrics.structural.conditionalCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Loops (for/while/do)</span>
                    <span className="font-mono text-slate-300">
                      {analysisResult.metrics.structural.loopCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-navy-800">
                    <span className="text-slate-400">Max Nesting Depth</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {analysisResult.metrics.structural.maxNestingDepth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Average Function Length</span>
                    <span className="font-mono text-slate-300">
                      {analysisResult.metrics.structural.averageFunctionLength} lines
                    </span>
                  </div>
                </div>
              </div>

              {/* Lexical Tokens Breakdown */}
              <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-4 shadow-md">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Lexical Token Summary
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-navy-950 p-2 rounded border border-navy-800">
                    <span className="text-slate-400 text-[11px]">Total Tokens</span>
                    <p className="font-mono font-bold text-slate-100 mt-0.5">
                      {analysisResult.metrics.lexical.totalTokens}
                    </p>
                  </div>
                  <div className="bg-navy-950 p-2 rounded border border-navy-800">
                    <span className="text-slate-400 text-[11px]">Unique Keywords</span>
                    <p className="font-mono font-bold text-cyan-400 mt-0.5">
                      {analysisResult.metrics.lexical.uniqueKeywords} ({analysisResult.metrics.lexical.keywordOccurrences} total)
                    </p>
                  </div>
                  <div className="bg-navy-950 p-2 rounded border border-navy-800">
                    <span className="text-slate-400 text-[11px]">Unique Identifiers</span>
                    <p className="font-mono font-bold text-indigo-400 mt-0.5">
                      {analysisResult.metrics.lexical.uniqueIdentifiers} ({analysisResult.metrics.lexical.identifierOccurrences} total)
                    </p>
                  </div>
                  <div className="bg-navy-950 p-2 rounded border border-navy-800">
                    <span className="text-slate-400 text-[11px]">Unique Operators</span>
                    <p className="font-mono font-bold text-amber-400 mt-0.5">
                      {analysisResult.metrics.lexical.uniqueOperators} ({analysisResult.metrics.lexical.operatorOccurrences} total)
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnostics Preview */}
              <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Diagnostics ({analysisResult.issues.length})
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {analysisResult.issues.filter((i) => i.severity === 'error').length} Errors
                  </span>
                </div>

                {analysisResult.issues.length > 0 ? (
                  <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto">
                    {analysisResult.issues.slice(0, 3).map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-2 rounded text-[11px] border ${
                          issue.severity === 'error'
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span>{issue.severity.toUpperCase()} (Line {issue.line})</span>
                          <span className="font-mono text-[10px]">{issue.stage}</span>
                        </div>
                        <p className="mt-0.5 text-slate-300 line-clamp-1">{issue.message}</p>
                      </div>
                    ))}
                    {analysisResult.issues.length > 3 && (
                      <p className="text-[11px] text-center text-slate-400 pt-1">
                        + {analysisResult.issues.length - 3} more issues in Issues tab.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No syntax or semantic errors found!</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full shadow-md">
              <Sparkles className="w-10 h-10 text-slate-500 mb-3 opacity-60" />
              <h4 className="text-sm font-semibold text-slate-200">No Analysis Results Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                Click &quot;Analyze Code&quot; above to execute the tokenizer, AST parser, and metrics calculation engine.
              </p>
              <button
                onClick={onAnalyze}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Run Analysis Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
