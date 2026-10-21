import React, { useRef } from 'react';
import {
  Code2,
  FileCode,
  Upload,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  BarChart,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AnalysisResult, HistoryItem } from '../types/analyzer';
import { SAMPLE_PROGRAMS } from '../analyzer/samples';
import { PipelineView } from '../components/PipelineView';
import { MetricCard } from '../components/MetricCard';

interface Props {
  analysisResult: AnalysisResult | null;
  history: HistoryItem[];
  onAnalyze: () => void;
  onNavigateToAnalyzer: () => void;
  onLoadSample: (sampleId: string) => void;
  onUploadFile: (file: File) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const Overview: React.FC<Props> = ({
  analysisResult,
  history,
  onNavigateToAnalyzer,
  onLoadSample,
  onUploadFile,
  onSelectHistoryItem
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-navy-700/60 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Compiler Design Academic Project</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Source Code Metrics Analyzer
          </h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
            Understand your code. Measure complexity. Improve quality. Perform client-side lexical scanning, recursive-descent grammar parsing, scoped symbol-table bindings, and McCabe / Halstead complexity metrics.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToAnalyzer}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <span>Analyze Source Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLoadSample('sample-complex-student')}
              className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-slate-200 font-medium text-xs px-4 py-2.5 rounded-xl border border-navy-700 transition-colors"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Load Sample Code</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Drag & Drop Upload and Sample Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-2 bg-navy-900/60 border-2 border-dashed border-navy-700/80 hover:border-blue-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-md"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])}
            accept=".c,.cpp,.h,.hpp,.cc"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            Drag &amp; drop source files here, or <span className="text-blue-400 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Supports C and C++ source code files (.c, .cpp, .h, .hpp, .cc). File analysis is executed entirely inside your browser.
          </p>
        </div>

        {/* Built-in Samples Quick Launcher */}
        <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Built-in Test Programs
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Load ready-to-test programs demonstrating different compiler features.
            </p>

            <div className="space-y-2">
              {SAMPLE_PROGRAMS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample.id)}
                  className="w-full text-left p-2.5 rounded-lg bg-navy-950/70 hover:bg-navy-800 border border-navy-800 hover:border-navy-700 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                    <span>{sample.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sample.fileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compiler Pipeline Architecture View */}
      {analysisResult ? (
        <PipelineView stages={analysisResult.pipeline} />
      ) : (
        <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Compiler Front-End Pipeline Stages
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
            The analyzer follows classical compiler design principles. When code is analyzed, it advances through five formal phases:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="font-mono text-[10px] text-cyan-400">Phase 01</span>
              <h4 className="font-semibold text-slate-200 mt-1">Lexical Analysis</h4>
              <p className="text-slate-400 text-[11px] mt-1">DFA Tokenizer converts characters to stream of tokens.</p>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="font-mono text-[10px] text-indigo-400">Phase 02</span>
              <h4 className="font-semibold text-slate-200 mt-1">Syntax Analysis</h4>
              <p className="text-slate-400 text-[11px] mt-1">Recursive descent parser constructs AST &amp; validates grammar.</p>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="font-mono text-[10px] text-purple-400">Phase 03</span>
              <h4 className="font-semibold text-slate-200 mt-1">Semantic Analysis</h4>
              <p className="text-slate-400 text-[11px] mt-1">Scoped Symbol Table tracks scopes, undeclared/duplicate vars.</p>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="font-mono text-[10px] text-emerald-400">Phase 04</span>
              <h4 className="font-semibold text-slate-200 mt-1">Metrics Engine</h4>
              <p className="text-slate-400 text-[11px] mt-1">Calculates McCabe Complexity, Halstead &amp; Maintainability Index.</p>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="font-mono text-[10px] text-amber-400">Phase 05</span>
              <h4 className="font-semibold text-slate-200 mt-1">Analytics Report</h4>
              <p className="text-slate-400 text-[11px] mt-1">Generates charts, diagnostics, and exportable reports.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Metric Cards or Empty State */}
      {analysisResult ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Current Analysis Snapshot: {analysisResult.fileName}
            </h3>
            <button
              onClick={onNavigateToAnalyzer}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Open Full Metrics Dashboard <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Physical LOC"
              value={analysisResult.metrics.size.codeLines}
              subtitle={`${analysisResult.metrics.size.totalLines} total lines (${analysisResult.metrics.size.commentRatio}% comments)`}
              icon={Code2}
              colorTheme="blue"
            />
            <MetricCard
              title="Cyclomatic Complexity"
              value={analysisResult.metrics.complexity.totalCyclomaticComplexity}
              subtitle={`Avg ${analysisResult.metrics.complexity.averageCyclomaticComplexity} across ${analysisResult.metrics.structural.functionCount} functions`}
              icon={BarChart}
              colorTheme={
                analysisResult.metrics.complexity.totalCyclomaticComplexity > 15 ? 'rose' : 'cyan'
              }
            />
            <MetricCard
              title="Maintainability Index"
              value={`${analysisResult.metrics.quality.maintainabilityIndex}/100`}
              subtitle={`Rating: ${analysisResult.metrics.quality.maintainabilityRating}`}
              icon={ShieldCheck}
              badge={{
                text: analysisResult.metrics.quality.maintainabilityRating,
                variant:
                  analysisResult.metrics.quality.maintainabilityIndex >= 65
                    ? 'success'
                    : 'warning'
              }}
              colorTheme="emerald"
            />
            <MetricCard
              title="Compiler Issues"
              value={analysisResult.issues.length}
              subtitle={`${
                analysisResult.issues.filter((i) => i.severity === 'error').length
              } errors, ${
                analysisResult.issues.filter((i) => i.severity === 'warning').length
              } warnings`}
              icon={CheckCircle2}
              colorTheme={analysisResult.issues.length > 0 ? 'amber' : 'emerald'}
            />
          </div>
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-8 text-center shadow-md">
          <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-200">No Code Analyzed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Upload a .cpp or .c file above, choose a built-in sample, or navigate to the Code Analyzer to input source code.
          </p>
          <button
            onClick={() => onLoadSample('sample-arithmetic')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Load First Sample (Basic Arithmetic)
          </button>
        </div>
      )}

      {/* Recently Analyzed Files */}
      {history.length > 0 && (
        <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-5 shadow-md">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Recently Analyzed Files</h3>
          <div className="divide-y divide-navy-800">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-navy-850/60 px-3 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-blue-400">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>{item.metricsSummary.loc} LOC</span>
                  <span>CC: {item.metricsSummary.cyclomaticComplexity}</span>
                  <span>MI: {item.metricsSummary.maintainabilityIndex}/100</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
