import React from 'react';
import { PipelineStage } from '../types/analyzer';
import {
  Code2,
  FileSearch,
  Binary,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';

interface Props {
  stages: PipelineStage[];
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  lexical: <FileSearch className="w-4 h-4" />,
  syntax: <Layers className="w-4 h-4" />,
  semantic: <Binary className="w-4 h-4" />,
  metrics: <BarChart3 className="w-4 h-4" />,
  report: <CheckCircle2 className="w-4 h-4" />
};

export const PipelineView: React.FC<Props> = ({ stages }) => {
  return (
    <div className="bg-navy-900 border border-navy-700/60 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Compiler Design Pipeline</h3>
            <p className="text-xs text-slate-400">
              Interactive multi-pass front-end compiler phases
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-navy-800 border border-navy-700 px-2.5 py-1 rounded-md">
          {stages.filter((s) => s.status === 'completed' || s.status === 'warning').length} / {stages.length} Stages Passed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'completed';
          const isWarning = stage.status === 'warning';
          const isFailed = stage.status === 'failed';
          const isRunning = stage.status === 'running';

          let statusBorder = 'border-navy-700/50 bg-navy-950/60';
          let statusText = 'text-slate-500';
          let statusIcon = <Clock className="w-3.5 h-3.5 text-slate-500" />;

          if (isCompleted) {
            statusBorder = 'border-emerald-500/30 bg-emerald-950/20';
            statusText = 'text-emerald-400';
            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (isWarning) {
            statusBorder = 'border-amber-500/30 bg-amber-950/20';
            statusText = 'text-amber-400';
            statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
          } else if (isFailed) {
            statusBorder = 'border-rose-500/30 bg-rose-950/20';
            statusText = 'text-rose-400';
            statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
          } else if (isRunning) {
            statusBorder = 'border-blue-500/40 bg-blue-950/20';
            statusText = 'text-blue-400 animate-pulse';
            statusIcon = <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
          }

          return (
            <div
              key={stage.id}
              className={`rounded-lg p-3.5 border transition-all duration-200 relative ${statusBorder} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="p-1 rounded bg-navy-800 border border-navy-700">
                      {STAGE_ICONS[stage.id] || <Code2 className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">0{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    {statusIcon}
                    <span className={statusText}>
                      {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-200">{stage.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-navy-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono">
                  {stage.durationMs > 0 ? `${stage.durationMs}ms` : '0ms'}
                </span>
                <span className="text-slate-400 truncate max-w-[100px] text-right" title={stage.summary}>
                  {stage.summary ? 'Ready' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
