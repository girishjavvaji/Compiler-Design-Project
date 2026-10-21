import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SizeMetrics } from '../../types/analyzer';

interface Props {
  size: SizeMetrics;
}

const COLORS = ['#3B82F6', '#10B981', '#64748B'];

export const CodeCompositionChart: React.FC<Props> = ({ size }) => {
  const data = [
    { name: 'Physical Code Lines (PLOC)', value: size.codeLines },
    { name: 'Comment Lines', value: size.commentLines },
    { name: 'Blank Lines', value: size.blankLines }
  ];

  const total = size.totalLines || 1;

  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">Code Composition</h3>
        <span className="text-xs text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
          Total: {size.totalLines} lines
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Breakdown of functional code, commentary, and white space.
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const val = Number(item.value || 0);
                  const pct = ((val / total) * 100).toFixed(1);
                  return (
                    <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <p className="font-semibold text-slate-200">{item.name}</p>
                      <p className="text-blue-400 font-mono mt-1">
                        {val} lines ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-navy-800 text-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Code Ratio</span>
          <p className="text-xs font-mono font-bold text-blue-400">
            {((size.codeLines / total) * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Comment Ratio</span>
          <p className="text-xs font-mono font-bold text-emerald-400">
            {size.commentRatio}%
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Blank Ratio</span>
          <p className="text-xs font-mono font-bold text-slate-400">
            {((size.blankLines / total) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};
