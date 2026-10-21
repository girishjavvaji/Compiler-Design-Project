import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { FunctionMetric } from '../../types/analyzer';

interface Props {
  functions: FunctionMetric[];
  threshold?: number;
}

export const FunctionComplexityChart: React.FC<Props> = ({ functions, threshold = 10 }) => {
  if (!functions || functions.length === 0) {
    return (
      <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col justify-center items-center h-full min-h-[300px] shadow-lg text-center">
        <p className="text-slate-400 text-sm">No discrete function definitions detected in this file.</p>
        <span className="text-xs text-slate-500 mt-1">Procedural scripts or global expressions only.</span>
      </div>
    );
  }

  const data = functions.map((f) => ({
    name: f.name,
    complexity: f.cyclomaticComplexity,
    loc: f.loc,
    risk: f.riskLevel,
    startLine: f.startLine
  }));

  const getBarColor = (cc: number) => {
    if (cc > 15) return '#F43F5E'; // High risk (red)
    if (cc > 10) return '#F59E0B'; // Moderate high (amber)
    if (cc > 5) return '#3B82F6';  // Moderate (blue)
    return '#10B981';             // Simple (green)
  };

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">Per-Function Cyclomatic Complexity</h3>
        <span className="text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700 font-mono">
          Threshold: CC &gt; {threshold}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        McCabe Complexity per function. Values &gt; 10 indicate complex testing and refactoring priority.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-slate-200 font-mono">{item.name}()</p>
                      <p className="text-cyan-400 font-mono mt-1">Cyclomatic Complexity: {item.complexity}</p>
                      <p className="text-slate-400">Function Length: {item.loc} lines (Line {item.startLine})</p>
                      <p className="text-indigo-400 uppercase font-semibold text-[10px] mt-1">
                        Risk Level: {item.risk}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={threshold} stroke="#F43F5E" strokeDasharray="3 3" label={{ value: 'Risk Limit', fill: '#F43F5E', fontSize: 10 }} />
            <Bar dataKey="complexity" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.complexity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-navy-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>1-5 Simple</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>6-10 Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>11-15 Complex</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>&gt;15 Untestable</span>
        </div>
      </div>
    </div>
  );
};
