import React from 'react';
import {
  Code2,
  Play,
  Moon,
  Sun,
  Loader2,
  Download,
  FileText,
  FileJson,
  Printer,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Language, AnalysisResult } from '../types/analyzer';
import { exportJSON, exportCSV, exportHTMLReport } from '../analyzer/reportGenerator';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  analysisResult: AnalysisResult | null;
}

export const Header: React.FC<Props> = ({
  language,
  onLanguageChange,
  onAnalyze,
  isAnalyzing,
  theme,
  onToggleTheme,
  analysisResult
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const errorCount = analysisResult ? analysisResult.issues.filter((i) => i.severity === 'error').length : 0;
  const warningCount = analysisResult ? analysisResult.issues.filter((i) => i.severity === 'warning').length : 0;

  return (
    <header className="h-16 bg-navy-900 border-b border-navy-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-base tracking-tight font-sans">
              Source<span className="text-cyan-400">Metrics</span>
            </span>
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
              v1.0 Compiler
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Compiler-Grade Software Metrics Analyzer
          </span>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-950 border border-navy-800 text-xs">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span className="text-blue-400 font-medium">Running Compiler Passes...</span>
            </>
          ) : analysisResult ? (
            errorCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-medium">{errorCount} Syntax/Semantic Errors</span>
              </>
            ) : warningCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-medium">{warningCount} Warnings</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Analysis Complete &amp; Clean</span>
              </>
            )
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Ready for Input</span>
            </>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-navy-950 border border-navy-800 rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">Lang:</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="cpp" className="bg-navy-900 text-slate-200">
              C++ (.cpp, .hpp)
            </option>
            <option value="c" className="bg-navy-900 text-slate-200">
              C (.c, .h)
            </option>
            <option value="java" disabled className="bg-navy-900 text-slate-500">
              Java (Coming Soon)
            </option>
            <option value="python" disabled className="bg-navy-900 text-slate-500">
              Python (Coming Soon)
            </option>
          </select>
        </div>

        {/* Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
        </button>

        {/* Export Dropdown */}
        {analysisResult && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 rounded-lg bg-navy-950 border border-navy-800 hover:border-navy-700 text-slate-300 transition-colors"
              title="Export Report"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => exportJSON(analysisResult)}
                  className="w-full px-3 py-2 text-left hover:bg-navy-800 flex items-center gap-2"
                >
                  <FileJson className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => exportCSV(analysisResult)}
                  className="w-full px-3 py-2 text-left hover:bg-navy-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => exportHTMLReport(analysisResult)}
                  className="w-full px-3 py-2 text-left hover:bg-navy-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download HTML Report</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full px-3 py-2 text-left hover:bg-navy-800 flex items-center gap-2 border-t border-navy-800 mt-1"
                >
                  <Printer className="w-3.5 h-3.5 text-violet-400" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-navy-950 border border-navy-800 hover:border-navy-700 text-slate-300 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};
