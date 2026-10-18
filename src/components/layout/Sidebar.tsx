import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Briefcase,
  Building,
  CreditCard,
  Database,
  FileText,
  FolderTree,
  Heart,
  LayoutDashboard,
  PieChart,
  PlusCircle,
  Receipt,
  Settings,
  Target,
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
        { id: 'office_fund' as ModuleId, label: 'Office Fund Advances', icon: Building },
      ],
    },
    {
      groupTitle: 'PLANNING & GOALS',
      items: [
        { id: 'categories' as ModuleId, label: 'Categories & Subs', icon: FolderTree },
        { id: 'budgets' as ModuleId, label: 'Monthly Budgets', icon: PieChart },
        { id: 'savings' as ModuleId, label: 'Savings & Goals', icon: Target },
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
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/80 shrink-0 select-none z-30 shadow-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-xs shadow-sky-500/20 flex items-center justify-center font-bold text-sm tracking-tight font-mono">
            ৳
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              My Finance
            </h1>
            <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase block mt-0.5">
              Personal & Office
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => onQuickAddTx()}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <h2 className="px-2.5 text-[10px] font-bold text-slate-500 tracking-wider">
              {group.groupTitle}
            </h2>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-xs shadow-sky-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
            SA
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">Sabbir Ahmed</p>
            <p className="text-[10px] text-slate-400 truncate">BDT ৳ · Asia/Dhaka</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
