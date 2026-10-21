import React from 'react';
import {
  LayoutDashboard,
  Code2,
  BarChart3,
  AlertTriangle,
  Database,
  History,
  BookOpen
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'analyzer'
  | 'dashboard'
  | 'issues'
  | 'symbols'
  | 'history'
  | 'about';

interface Props {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  issueCount?: number;
  symbolCount?: number;
  historyCount?: number;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  issueCount = 0,
  symbolCount = 0,
  historyCount = 0
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'analyzer' as NavTab,
      label: 'Code Analyzer',
      icon: Code2,
      badge: null
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Metrics Dashboard',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'issues' as NavTab,
      label: 'Syntax & Issues',
      icon: AlertTriangle,
      badge: issueCount > 0 ? issueCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'symbols' as NavTab,
      label: 'Symbol Table',
      icon: Database,
      badge: symbolCount > 0 ? symbolCount : null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    },
    {
      id: 'history' as NavTab,
      label: 'Analysis History',
      icon: History,
      badge: historyCount > 0 ? historyCount : null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    {
      id: 'about' as NavTab,
      label: 'About Project',
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col justify-between p-3 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full ${
                    item.badgeColor || 'bg-navy-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compiler Information Footer */}
      <div className="p-3 bg-navy-900/80 rounded-xl border border-navy-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span>Engine Status</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
          Recursive-Descent AST parser &amp; DFA Tokenizer running client-side.
        </p>
      </div>
    </aside>
  );
};
