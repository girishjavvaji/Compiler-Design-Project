import React, { useState } from 'react';
import { AnalysisResult, HistoryItem } from '../types/analyzer';
import { MetricCard } from '../components/MetricCard';
import { CodeCompositionChart } from '../components/charts/CodeCompositionChart';
import { TokenDistributionChart } from '../components/charts/TokenDistributionChart';
import { FunctionComplexityChart } from '../components/charts/FunctionComplexityChart';
import { ComplexityDistributionChart } from '../components/charts/ComplexityDistributionChart';
import { MetricComparisonChart } from '../components/charts/MetricComparisonChart';
import { TokenTable } from '../components/TokenTable';
import {
  Code2,
  Hash,
  Layers,
  BarChart,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Bug,
  Clock,
  Zap,
  Info
} from 'lucide-react';

interface Props {
  analysisResult: AnalysisResult | null;
  history: HistoryItem[];
  onNavigateToAnalyzer: () => void;
}

export const Dashboard: React.FC<Props> = ({
  analysisResult,
  history,
  onNavigateToAnalyzer
}) => {
  const [threshold, setThreshold] = useState<number>(10);
  const [showTokensView, setShowTokensView] = useState<boolean>(false);

  if (!analysisResult) {
    return (
      <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-12 text-center shadow-md">
        <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-semibold text-slate-200">No Analysis Available</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Please run the code analyzer on a C or C++ source file to generate metrics and charts.
        </p>
        <button
          onClick={onNavigateToAnalyzer}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Open Code Analyzer
        </button>
      </div>
    );
  }

  const { metrics, fileName, issues } = analysisResult;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const previousItem = history.length > 1 ? history[1] : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900 border border-navy-700/60 p-4 rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100">
              Interactive Metrics &amp; Complexity Analytics
            </h2>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              {fileName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time computed software science, McCabe control flow graphs, and quality indicators.
          </p>
        </div>

        {/* Complexity Threshold Slider */}
        <div className="flex items-center gap-3 bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-800 text-xs">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Risk Threshold (CC):</span>
          <input
            type="range"
            min="5"
            max="20"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-24 accent-blue-500 cursor-pointer"
          />
          <span className="font-mono font-bold text-cyan-400 w-5">{threshold}</span>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Physical LOC */}
        <MetricCard
          title="Lines of Code"
          value={metrics.size.codeLines}
          subtitle={`${metrics.size.totalLines} total lines`}
          icon={Code2}
          colorTheme="blue"
          trend={
            previousItem
              ? {
                  delta: `${metrics.size.codeLines - previousItem.metricsSummary.loc >= 0 ? '+' : ''}${
                    metrics.size.codeLines - previousItem.metricsSummary.loc
                  }`,
                  isPositiveGood: true
                }
              : undefined
          }
        />

        {/* Card 2: Total Tokens */}
        <MetricCard
          title="Total Tokens"
          value={metrics.lexical.totalTokens}
          subtitle={`${metrics.lexical.uniqueKeywords} kw / ${metrics.lexical.uniqueIdentifiers} id`}
          icon={Hash}
          colorTheme="cyan"
          trend={
            previousItem
              ? {
                  delta: `${metrics.lexical.totalTokens - previousItem.metricsSummary.tokens >= 0 ? '+' : ''}${
                    metrics.lexical.totalTokens - previousItem.metricsSummary.tokens
                  }`
                }
              : undefined
          }
        />

        {/* Card 3: Functions */}
        <MetricCard
          title="Functions"
          value={metrics.structural.functionCount}
          subtitle={`Avg length: ${metrics.structural.averageFunctionLength} lines`}
          icon={Layers}
          colorTheme="violet"
        />

        {/* Card 4: Cyclomatic Complexity */}
        <MetricCard
          title="Cyclomatic Complexity"
          value={metrics.complexity.totalCyclomaticComplexity}
          subtitle={`Avg CC: ${metrics.complexity.averageCyclomaticComplexity}`}
          icon={BarChart}
          badge={{
            text:
              metrics.complexity.totalCyclomaticComplexity <= 10
                ? 'Low Risk'
                : metrics.complexity.totalCyclomaticComplexity <= 20
                ? 'Moderate'
                : 'High Risk',
            variant:
              metrics.complexity.totalCyclomaticComplexity <= 10
                ? 'success'
                : metrics.complexity.totalCyclomaticComplexity <= 20
                ? 'warning'
                : 'danger'
          }}
          colorTheme={metrics.complexity.totalCyclomaticComplexity > 15 ? 'rose' : 'emerald'}
        />

        {/* Card 5: Syntax & Semantic Issues */}
        <MetricCard
          title="Compiler Issues"
          value={issues.length}
          subtitle={`${errorCount} errors, ${issues.filter((i) => i.severity === 'warning').length} warnings`}
          icon={AlertTriangle}
          badge={{
            text: errorCount === 0 ? 'Clean' : `${errorCount} Errors`,
            variant: errorCount === 0 ? 'success' : 'danger'
          }}
          colorTheme={errorCount > 0 ? 'rose' : 'emerald'}
        />

        {/* Card 6: Maintainability Index */}
        <MetricCard
          title="Maintainability Index"
          value={`${metrics.quality.maintainabilityIndex}/100`}
          subtitle={`Rating: ${metrics.quality.maintainabilityRating}`}
          icon={ShieldCheck}
          badge={{
            text: metrics.quality.maintainabilityRating,
            variant:
              metrics.quality.maintainabilityIndex >= 65
                ? 'success'
                : metrics.quality.maintainabilityIndex >= 40
                ? 'warning'
                : 'danger'
          }}
          colorTheme="emerald"
        />
      </div>

      {/* Main Charts Row 1: Code Composition & Token Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeCompositionChart size={metrics.size} />
        <TokenDistributionChart lexical={metrics.lexical} />
      </div>

      {/* Main Charts Row 2: Per-Function Complexity & Complexity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunctionComplexityChart functions={metrics.complexity.functionMetrics} threshold={threshold} />
        <ComplexityDistributionChart complexity={metrics.complexity} />
      </div>

      {/* Halstead Software Science Section */}
      <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Halstead Software Science Metrics
              </h3>
              <p className="text-xs text-slate-400">
                Quantitative software metrics introduced by Maurice Howard Halstead (1977)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-navy-800 border border-navy-700 px-2.5 py-1 rounded">
            Formula Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Vocabulary (n)
            </span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              {metrics.halstead.vocabulary}
            </p>
            <span className="text-[10px] text-slate-400">n1: {metrics.halstead.distinctOperators} | n2: {metrics.halstead.distinctOperands}</span>
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Length (N)
            </span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              {metrics.halstead.length}
            </p>
            <span className="text-[10px] text-slate-400">N1: {metrics.halstead.totalOperators} | N2: {metrics.halstead.totalOperands}</span>
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Volume (V)
            </span>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {metrics.halstead.volume}
            </p>
            <span className="text-[10px] text-slate-400">Information bits</span>
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Difficulty (D)
            </span>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">
              {metrics.halstead.difficulty}
            </p>
            <span className="text-[10px] text-slate-400">Mental friction</span>
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Effort (E)
            </span>
            <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
              {metrics.halstead.effort.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Discriminations</span>
          </div>

          <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Estimated Bugs (B)
            </span>
            <p className="text-xl font-bold font-mono text-rose-400 mt-1">
              {metrics.halstead.estimatedBugs}
            </p>
            <span className="text-[10px] text-slate-400">B = V / 3000</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-navy-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Programming Time: <strong className="text-slate-200">{metrics.halstead.timeToImplement} seconds</strong> ({Math.round(metrics.halstead.timeToImplement / 60)} min)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Calculated Length: <strong className="text-slate-200">{metrics.halstead.calculatedLength} tokens</strong></span>
          </div>
        </div>
      </div>

      {/* Row 4: Quality Indicators Heuristics & Metric Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Overview Scorecard */}
        <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-200">Code Quality &amp; Heuristics</h3>
              <span className="text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700 font-mono">
                {metrics.quality.codeSmellsCount} Detected Smells
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Structural health indicators measured against academic compiler thresholds.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                <span className="text-slate-300">Maintainability Rating</span>
                <span className="font-semibold text-emerald-400">
                  {metrics.quality.maintainabilityRating} ({metrics.quality.maintainabilityIndex}/100)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                <span className="text-slate-300">High Complexity Functions (CC &gt; 10)</span>
                <span className={`font-mono font-bold ${metrics.quality.highComplexityFunctionsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.quality.highComplexityFunctionsCount} functions
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                <span className="text-slate-300">Deep Nesting Depth (&gt; 3 levels)</span>
                <span className={`font-mono font-bold ${metrics.structural.maxNestingDepth > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Depth: {metrics.structural.maxNestingDepth} levels
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                <span className="text-slate-300">Comment Adequacy Ratio</span>
                <span className={`font-mono font-bold ${metrics.quality.commentAdequacy === 'Sufficient' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {metrics.quality.commentAdequacy} ({metrics.size.commentRatio}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-navy-800">
                <span className="text-slate-300">Long Functions (&gt; 40 lines)</span>
                <span className={`font-mono font-bold ${metrics.quality.longFunctionsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.quality.longFunctionsCount} functions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Comparison Chart */}
        <MetricComparisonChart currentMetrics={metrics} history={history} />
      </div>

      {/* Optional Token Stream Drawer / Table Toggle */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Lexical Token Stream Inspection
          </h3>
          <button
            onClick={() => setShowTokensView(!showTokensView)}
            className="text-xs bg-navy-800 hover:bg-navy-700 text-cyan-400 px-3 py-1.5 rounded-lg border border-navy-700 transition-colors"
          >
            {showTokensView ? 'Collapse Token Table' : `Expand Token Table (${analysisResult.tokens.length} tokens)`}
          </button>
        </div>

        {showTokensView && <TokenTable tokens={analysisResult.tokens} />}
      </div>
    </div>
  );
};
