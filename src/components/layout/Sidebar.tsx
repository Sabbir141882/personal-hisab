import React from 'react';
import {
  BarChart3,
  Building,
  ChevronRight,
  CreditCard,
  Database,
  FileText,
  FolderTree,
  Globe,
  LayoutDashboard,
  PieChart,
  Plus,
  Receipt,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export type ModuleId =
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'expense'
  | 'office_fund'
  | 'accounts'
  | 'categories'
  | 'budgets'
  | 'savings'
  | 'loans'
  | 'reports'
  | 'pdf_reports'
  | 'backup'
  | 'settings';

interface SidebarProps {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  onQuickAddTx: (type?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  onQuickAddTx,
}) => {
  const navGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { id: 'dashboard' as ModuleId, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'transactions' as ModuleId, label: 'Transactions Ledger', icon: Receipt },
        { id: 'accounts' as ModuleId, label: 'Accounts & Wallets', icon: Wallet },
      ],
    },
    {
      groupTitle: 'INCOMES & EXPENSES',
      items: [
        { id: 'income' as ModuleId, label: 'Income Management', icon: TrendingUp },
        { id: 'expense' as ModuleId, label: 'Expense Management', icon: TrendingDown },
        { id: 'office_fund' as ModuleId, label: 'Office Fund Advancement', icon: Building },
      ],
    },
    {
      groupTitle: 'PLANNING & GOALS',
      items: [
        { id: 'categories' as ModuleId, label: 'Categories & Subs', icon: FolderTree },
        { id: 'budgets' as ModuleId, label: 'Monthly Budgets', icon: PieChart },
        { id: 'loans' as ModuleId, label: 'Loans & Receivables', icon: CreditCard },
      ],
    },
    {
      groupTitle: 'REPORTS & EXPORTS',
      items: [
        { id: 'reports' as ModuleId, label: 'Financial Reports', icon: BarChart3 },
        { id: 'pdf_reports' as ModuleId, label: 'PDF & Print Reports', icon: FileText },
        { id: 'backup' as ModuleId, label: 'Backup & Restore', icon: Database },
      ],
    },
    {
      groupTitle: 'SYSTEM & SETTINGS',
      items: [
        { id: 'settings' as ModuleId, label: 'Settings & Config', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-68 bg-slate-900 text-slate-200 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none z-30 shadow-xl relative overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              Planet Finance
            </h1>
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase block mt-0.5">
              Personal & Office Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3.5">
        <button
          onClick={() => onQuickAddTx()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-md active:scale-98 cursor-pointer border border-indigo-500/30"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-4 text-xs scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="px-2 py-1">
              <h2 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {group.groupTitle}
              </h2>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/90 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate text-xs">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
              ৳
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Sabbir Ahmed</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">BDT ৳ · Asia/Dhaka</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('settings')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};


