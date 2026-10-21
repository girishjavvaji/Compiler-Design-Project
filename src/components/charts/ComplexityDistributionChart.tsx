import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ComplexityMetrics } from '../../types/analyzer';

interface Props {
  complexity: ComplexityMetrics;
}

const DIST_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E'];

export const ComplexityDistributionChart: React.FC<Props> = ({ complexity }) => {
  const dist = complexity.complexityDistribution;
  const data = [
    { category: 'Simple (1-5)', count: dist.simple, desc: 'Low risk, easily testable' },
    { category: 'Moderate (6-10)', count: dist.moderate, desc: 'Acceptable risk, moderate paths' },
    { category: 'Complex (11-20)', count: dist.complex, desc: 'High risk, refactor candidate' },
    { category: 'Untestable (>20)', count: dist.untestable, desc: 'Severe risk, high bug potential' }
  ];

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">Complexity Distribution</h3>
        <span className="text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700 font-mono">
          Avg CC: {complexity.averageCyclomaticComplexity}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Grouping of functions into standard McCabe risk categories.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="category"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-slate-200">{item.category}</p>
                      <p className="text-cyan-400 font-mono mt-1">Functions: {item.count}</p>
                      <p className="text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DIST_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-3 border-t border-navy-800">
        <div>Total CC: <strong className="text-slate-200">{complexity.totalCyclomaticComplexity}</strong></div>
        <div>Max Single Function: <strong className="text-slate-200">{complexity.maxCyclomaticComplexity}</strong></div>
      </div>
    </div>
  );
};
