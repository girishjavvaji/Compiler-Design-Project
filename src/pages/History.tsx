import React, { useState } from 'react';
import { HistoryItem, AnalysisResult } from '../types/analyzer';
import {
  History,
  Trash2,
  ExternalLink,
  GitCompare,
  X,
  FileCode,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onReopenInEditor: (code: string, fileName: string) => void;
}

export const HistoryPage: React.FC<Props> = ({
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
  onReopenInEditor
}) => {
  const [compareItems, setCompareItems] = useState<[HistoryItem | null, HistoryItem | null]>([null, null]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleToggleCompare = (item: HistoryItem) => {
    if (compareItems[0]?.id === item.id) {
      setCompareItems([compareItems[1], null]);
    } else if (compareItems[1]?.id === item.id) {
      setCompareItems([compareItems[0], null]);
    } else if (!compareItems[0]) {
      setCompareItems([item, compareItems[1]]);
    } else if (!compareItems[1]) {
      setCompareItems([compareItems[0], item]);
      setShowCompareModal(true);
    } else {
      // Replace second
      setCompareItems([compareItems[0], item]);
      setShowCompareModal(true);
    }
  };

  const isSelectedForCompare = (id: string) => {
    return compareItems[0]?.id === id || compareItems[1]?.id === id;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Analysis Run History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted browser history of analyzed source code files, metrics deltas, and compiler findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareItems[0] && compareItems[1] && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow transition-colors font-medium"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected (2)</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs bg-navy-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-navy-800 hover:border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const isComparing = isSelectedForCompare(item.id);
            const m = item.metricsSummary;

            return (
              <div
                key={item.id}
                className={`bg-navy-900 border rounded-xl p-4 shadow-md transition-all ${
                  isComparing ? 'border-indigo-500/60 bg-indigo-950/10' : 'border-navy-700/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200 text-sm">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-navy-800 text-slate-400 px-2 py-0.5 rounded border border-navy-700">
                          {item.language}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {/* Summary Metrics Pills */}
                      <div className="flex items-center gap-4 mt-2.5 text-xs font-mono text-slate-300 flex-wrap">
                        <span>
                          LOC: <strong className="text-blue-400">{m.loc}</strong>
                        </span>
                        <span>
                          Tokens: <strong className="text-cyan-400">{m.tokens}</strong>
                        </span>
                        <span>
                          Functions: <strong className="text-indigo-400">{m.functions}</strong>
                        </span>
                        <span>
                          Complexity:{' '}
                          <strong
                            className={m.cyclomaticComplexity > 10 ? 'text-amber-400' : 'text-emerald-400'}
                          >
                            {m.cyclomaticComplexity}
                          </strong>
                        </span>
                        <span>
                          MI:{' '}
                          <strong
                            className={m.maintainabilityIndex >= 65 ? 'text-emerald-400' : 'text-amber-400'}
                          >
                            {m.maintainabilityIndex}/100
                          </strong>
                        </span>
                        {m.errorCount > 0 ? (
                          <span className="text-rose-400 font-bold">
                            {m.errorCount} Errors
                          </span>
                        ) : (
                          <span className="text-emerald-400">Clean</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleToggleCompare(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                        isComparing
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-navy-950 text-slate-400 hover:text-slate-200 border-navy-800'
                      }`}
                    >
                      <GitCompare className="w-3 h-3" />
                      <span>{isComparing ? 'Selected' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-blue-400 border border-navy-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </button>

                    {item.fullResult?.sourceCode && (
                      <button
                        onClick={() => onReopenInEditor(item.fullResult!.sourceCode, item.fileName)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-cyan-400 border border-navy-700 transition-colors"
                        title="Reopen source code in editor"
                      >
                        Reopen
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-navy-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-navy-800 hover:border-rose-500/30 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-700/60 rounded-2xl p-12 text-center shadow-md">
          <History className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-200">No History Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Every analysis run is securely archived in your local browser storage for historical comparison.
          </p>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && compareItems[0] && compareItems[1] && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Side-by-Side Analysis Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded bg-navy-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <h4 className="font-semibold text-blue-400">{compareItems[0].fileName}</h4>
                <p className="text-slate-400 text-[10px]">
                  {new Date(compareItems[0].timestamp).toLocaleString()}
                </p>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <h4 className="font-semibold text-cyan-400">{compareItems[1].fileName}</h4>
                <p className="text-slate-400 text-[10px]">
                  {new Date(compareItems[1].timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto border border-navy-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                  <tr>
                    <th className="py-2 px-3">Metric</th>
                    <th className="py-2 px-3 text-right">File A</th>
                    <th className="py-2 px-3 text-right">File B</th>
                    <th className="py-2 px-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono">
                  {[
                    { label: 'Lines of Code (PLOC)', a: compareItems[0].metricsSummary.loc, b: compareItems[1].metricsSummary.loc },
                    { label: 'Total Tokens', a: compareItems[0].metricsSummary.tokens, b: compareItems[1].metricsSummary.tokens },
                    { label: 'Functions', a: compareItems[0].metricsSummary.functions, b: compareItems[1].metricsSummary.functions },
                    { label: 'Cyclomatic Complexity', a: compareItems[0].metricsSummary.cyclomaticComplexity, b: compareItems[1].metricsSummary.cyclomaticComplexity },
                    { label: 'Maintainability Index', a: compareItems[0].metricsSummary.maintainabilityIndex, b: compareItems[1].metricsSummary.maintainabilityIndex },
                    { label: 'Compiler Errors', a: compareItems[0].metricsSummary.errorCount, b: compareItems[1].metricsSummary.errorCount }
                  ].map((row, idx) => {
                    const diff = row.b - row.a;
                    return (
                      <tr key={idx} className="hover:bg-navy-850/40">
                        <td className="py-2 px-3 font-sans text-slate-300">{row.label}</td>
                        <td className="py-2 px-3 text-right text-blue-400">{row.a}</td>
                        <td className="py-2 px-3 text-right text-cyan-400">{row.b}</td>
                        <td className={`py-2 px-3 text-right font-bold ${diff > 0 ? 'text-amber-400' : diff < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-navy-800 hover:bg-navy-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
