import React from 'react';
import { ArrowLeftRight, Building, PlusCircle, RefreshCw, Settings, TrendingDown, TrendingUp } from 'lucide-react';
import { ModuleId } from './Sidebar';

interface HeaderProps {
  activeModule: ModuleId;
  onOpenTxModal: (defaultType?: string) => void;
  onOpenOfficeModal: () => void;
  onOpenTransferModal: () => void;
  onResetDemoData: () => void;
  setActiveModule: (m: ModuleId) => void;
}

const moduleTitles: Record<ModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Financial Dashboard', subtitle: 'Overview of accounts, cash balance, personal expenses, and incomes' },
  transactions: { title: 'Transaction Ledger', subtitle: 'Centralized financial ledger with final approval and edit locks' },
  income: { title: 'Income Management', subtitle: 'Track salary, overtime, freelance, and custom personal earnings' },
  expense: { title: 'Expense Management', subtitle: 'Personal and family consumption expense management' },
  office_fund: { title: 'Office Fund Management', subtitle: 'Employer advance funds and official office expenses' },
  accounts: { title: 'Accounts & Wallets', subtitle: 'Cash in hand, bank accounts, bKash, Nagad, and mobile wallets' },
  transfers: { title: 'Account Transfers', subtitle: 'Inter-account liquidity movement with cashout fee accounting' },
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
  onResetDemoData,
  setActiveModule,
}) => {
  const currentInfo = moduleTitles[activeModule] || { title: 'My Finance', subtitle: '' };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>My Finance</span>
          <span>/</span>
          <span className="font-medium text-slate-700 capitalize">{activeModule.replace(/_/g, ' ')}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentInfo.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center flex-wrap gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
          Currency: BDT
        </span>

        <button
          onClick={() => onOpenTxModal('personal_income')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs rounded-lg border border-emerald-200 transition-colors cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+ Income</span>
        </button>

        <button
          onClick={() => onOpenTxModal('personal_expense')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 transition-colors cursor-pointer"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>+ Expense</span>
        </button>

        <button
          onClick={onOpenOfficeModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-xs rounded-lg border border-purple-200 transition-colors cursor-pointer"
        >
          <Building className="w-3.5 h-3.5" />
          <span>+ Office Fund</span>
        </button>

        <button
          onClick={onOpenTransferModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Transfer</span>
        </button>

        <button
          onClick={onResetDemoData}
          title="Reload Demo Data"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModule('settings')}
          title="Settings"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
