import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnalysisMetrics, HistoryItem } from '../../types/analyzer';

interface Props {
  currentMetrics: AnalysisMetrics;
  history: HistoryItem[];
}

export const MetricComparisonChart: React.FC<Props> = ({ currentMetrics, history }) => {
  if (!history || history.length < 2) {
    return (
      <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col justify-center items-center h-full min-h-[300px] shadow-lg text-center">
        <p className="text-slate-400 text-sm">No previous analysis history available for comparison.</p>
        <span className="text-xs text-slate-500 mt-1">Run another analysis to view side-by-side metric drift.</span>
      </div>
    );
  }

  // Previous analysis is history[1] because history[0] is the current one
  const previous = history[1];
  const prevSummary = previous.metricsSummary;

  const data = [
    {
      metric: 'LOC',
      Current: currentMetrics.size.codeLines,
      Previous: prevSummary.loc
    },
    {
      metric: 'Tokens',
      Current: currentMetrics.lexical.totalTokens,
      Previous: prevSummary.tokens
    },
    {
      metric: 'Functions',
      Current: currentMetrics.structural.functionCount,
      Previous: prevSummary.functions
    },
    {
      metric: 'Complexity',
      Current: currentMetrics.complexity.totalCyclomaticComplexity,
      Previous: prevSummary.cyclomaticComplexity
    },
    {
      metric: 'Maintainability',
      Current: currentMetrics.quality.maintainabilityIndex,
      Previous: prevSummary.maintainabilityIndex
    }
  ];

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">Comparison with Previous Run</h3>
        <span className="text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700 font-mono">
          vs {new Date(previous.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Side-by-side metric delta comparing the current source file with the previously analyzed revision.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const diff = item.Current - item.Previous;
                  const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
                  return (
                    <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-slate-200">{item.metric}</p>
                      <p className="text-blue-400 font-mono mt-1">Current: {item.Current}</p>
                      <p className="text-slate-400 font-mono">Previous: {item.Previous}</p>
                      <p className={`font-mono font-bold mt-1 ${diff > 0 ? 'text-amber-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        Delta: {diffSign}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={30}
              formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
            />
            <Bar dataKey="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Previous" fill="#64748B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
