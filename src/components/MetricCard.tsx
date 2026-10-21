import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  trend?: {
    delta: number | string;
    isPositiveGood?: boolean;
  };
  colorTheme?: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  tooltip?: string;
}

const THEME_STYLES = {
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'hover:border-blue-500/40',
    highlight: 'text-blue-400'
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    border: 'hover:border-cyan-500/40',
    highlight: 'text-cyan-400'
  },
  violet: {
    iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    border: 'hover:border-violet-500/40',
    highlight: 'text-violet-400'
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    border: 'hover:border-emerald-500/40',
    highlight: 'text-emerald-400'
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'hover:border-amber-500/40',
    highlight: 'text-amber-400'
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    border: 'hover:border-rose-500/40',
    highlight: 'text-rose-400'
  }
};

const BADGE_STYLES = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  colorTheme = 'blue',
  tooltip
}) => {
  const theme = THEME_STYLES[colorTheme];

  return (
    <div
      title={tooltip}
      className={`bg-navy-900 border border-navy-700/60 rounded-xl p-5 transition-all duration-200 shadow-md ${theme.border} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {value}
            </h4>
            {badge && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${BADGE_STYLES[badge.variant]}`}
              >
                {badge.text}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className="font-mono text-[11px] font-semibold text-slate-300">
              Delta: {trend.delta}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
