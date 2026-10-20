import React from 'react';
import { ArrowLeftRight, BookOpen, Building, Eye, EyeOff, Moon, PlusCircle, Settings, Sun, TrendingDown, TrendingUp } from 'lucide-react';
import { ModuleId } from './Sidebar';

interface HeaderProps {
  activeModule: ModuleId;
  onOpenTxModal: (defaultType?: string) => void;
  onOpenOfficeModal: () => void;
  onOpenTransferModal: () => void;
  setActiveModule: (m: ModuleId) => void;
  onOpenUserGuide?: () => void;
  isUserGuideHidden?: boolean;
  onToggleUserGuideHidden?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

const moduleTitles: Record<ModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Financial Dashboard', subtitle: '' },
  transactions: { title: 'Transaction Ledger', subtitle: 'Centralized financial ledger with final approval and edit locks' },
  income: { title: 'Income Management', subtitle: 'Track salary, overtime, freelance, and custom personal earnings' },
  expense: { title: 'Expense Management', subtitle: 'Personal and family consumption expense management' },
  office_fund: { title: 'Office Fund Advancement', subtitle: 'Employer advance funds and official office expenses' },
  accounts: { title: 'Accounts & Wallets', subtitle: 'Cash in hand, bank accounts, bKash, Nagad, and mobile wallets' },
  categories: { title: 'Categories & Subcategories', subtitle: 'Customizable hierarchy of income and expense categories' },
  budgets: { title: 'Monthly Budgets', subtitle: 'Category-wise spending limits and budget utilization alerts' },
  savings: { title: 'Savings & Financial Goals', subtitle: 'Target savings reserves, DPS, and purchase goal tracking' },
  loans: { title: 'Loans, Debts & Receivables', subtitle: 'Borrowed loans, lent funds, counterparties, and repayment history' },
  reports: { title: 'Financial Reporting Engine', subtitle: 'Custom date-wise, monthly, category, and cash flow reports' },
  pdf_reports: { title: 'PDF & Printable Reports', subtitle: 'Dedicated multi-page downloadable PDF reports formatted for BDT' },
  backup: { title: 'Data Backup & Restore', subtitle: 'Export full JSON backup payload and restore validated records' },
  settings: { title: 'Settings & Preferences', subtitle: 'Application defaults, password security, currency, and profile config' },
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onOpenTxModal,
  onOpenOfficeModal,
  onOpenTransferModal,
  setActiveModule,
  onOpenUserGuide,
  isUserGuideHidden = true,
  onToggleUserGuideHidden,
  theme = 'dark',
  onToggleTheme,
}) => {
  const currentInfo = moduleTitles[activeModule] || { title: 'Planet Finance', subtitle: '' };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs mb-0.5">
          <span className="font-semibold text-emerald-400">Planet Finance</span>
          <span className="text-slate-600">/</span>
          <span className="font-medium text-slate-300 capitalize">{activeModule.replace(/_/g, ' ')}</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">{currentInfo.title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center flex-wrap gap-2 shrink-0">
        {/* SINGLE USER GUIDE WITH HIDE / UNHIDE TOGGLE */}
        {onOpenUserGuide && (
          <div className="inline-flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80">
            {!isUserGuideHidden ? (
              <>
                <button
                  onClick={onOpenUserGuide}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-100 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                  title="সহজ ব্যবহার নির্দেশিকা ও নিয়মাবলী খুলুন"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>📖 ব্যবহার নির্দেশিকা</span>
                </button>
                <button
                  onClick={onToggleUserGuideHidden}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
                  title="নির্দেশিকা হাইড করুন (Hide Guide)"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={onToggleUserGuideHidden}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-sky-300 font-medium text-xs transition-colors cursor-pointer"
                title="ব্যবহার নির্দেশিকা আনহাইড করুন (Unhide Guide)"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">📖 নির্দেশিকা (আনহাইড)</span>
              </button>
            )}
          </div>
        )}

        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 font-mono">
          BDT ৳
        </span>

        <button
          onClick={() => onOpenTxModal('personal_income')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer active:scale-98"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+ Income</span>
        </button>

        <button
          onClick={() => onOpenTxModal('personal_expense')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer active:scale-98"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>+ Expense</span>
        </button>

        <button
          onClick={onOpenOfficeModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer active:scale-98"
        >
          <Building className="w-3.5 h-3.5" />
          <span>+ Office Fund</span>
        </button>

        <button
          onClick={onOpenTransferModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer active:scale-98"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Transfer</span>
        </button>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode (লাইট মোড)' : 'Switch to Dark Mode (ডার্ক মোড)'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer text-xs font-semibold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveModule('settings')}
          title="Settings"
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};


