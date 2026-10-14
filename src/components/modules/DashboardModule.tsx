import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Building,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Heart,
  Lock,
  Plus,
  Receipt,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Unlock,
  Wallet,
} from 'lucide-react';
import {
  Account,
  Budget,
  Category,
  DebtReceivable,
  FinancialSummary,
  OfficeFund,
  Transaction,
  UserSettings,
} from '../../types/finance';
import { calculateBudgetUtilization, formatCurrency, formatDate } from '../../services/financialEngine';
import { MetricCard } from '../common/MetricCard';

interface DashboardModuleProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  accounts: Account[];
  officeFunds: OfficeFund[];
  budgets: Budget[];
  categories: Category[];
  debts: DebtReceivable[];
  userSettings: UserSettings;
  onOpenTxModal: (defaultType?: string) => void;
  onOpenOfficeModal: () => void;
  onOpenTransferModal: () => void;
  onOpenApproveModal: (targetTxIds?: string[]) => void;
  onSelectModule: (module: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  summary,
  transactions,
  accounts,
  officeFunds,
  budgets,
  categories,
  debts,
  userSettings,
  onOpenTxModal,
  onOpenOfficeModal,
  onOpenTransferModal,
  onOpenApproveModal,
  onSelectModule,
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const budgetUtilization = calculateBudgetUtilization(budgets, transactions, categories, currentMonthStr);

  const unapprovedTxs = transactions.filter((t) => t.status === 'completed' && !t.isApproved);
  const approvedTxs = transactions.filter((t) => t.status === 'completed' && t.isApproved);

  const recentTxs = [...transactions]
    .filter((t) => t.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // Find Cash in Hand account specifically
  const cashAccount = accounts.find((a) => a.type === 'cash' || a.name.toLowerCase().includes('cash'));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 font-bold text-[10px] rounded border border-sky-500/30">
              BDT
            </span>
            <span className="text-xs text-slate-400">Welcome, {userSettings.userName}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Total Net Balance: {formatCurrency(summary.totalCashAndBankBalances, userSettings.currencySymbol)}
          </h2>
          <p className="text-xs text-slate-400">
            Total Income: {formatCurrency(summary.totalPersonalIncome, userSettings.currencySymbol)} ·
            Total Expenses: {formatCurrency(summary.totalPersonalExpenses + summary.totalFamilyExpenses, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenTxModal('personal_income')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => onOpenTxModal('personal_expense')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenTransferModal}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Entry Final Approval Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${unapprovedTxs.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {unapprovedTxs.length > 0 ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Ledger Final Approval Status</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${unapprovedTxs.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                {unapprovedTxs.length > 0 ? `${unapprovedTxs.length} UNAPPROVED` : 'ALL LOCKED'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {unapprovedTxs.length > 0
                ? 'Unapproved entries can be edited or deleted freely. Once final approval is given with password, entries are locked forever.'
                : 'All current transactions are permanently locked and protected from modification.'}
            </p>
          </div>
        </div>

        {unapprovedTxs.length > 0 && (
          <button
            onClick={() => onOpenApproveModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Final Approve & Lock ({unapprovedTxs.length})</span>
          </button>
        )}
      </div>

      {/* PROMINENT WALLETS & ACCOUNTS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-4.5 h-4.5 text-sky-600" />
            <span>All Wallets & Accounts Overview</span>
          </h3>
          <button
            onClick={() => onSelectModule('accounts')}
            className="text-xs font-semibold text-sky-600 hover:underline"
          >
            Manage Accounts →
          </button>
        </div>

        {/* Large Account Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Highlight Cash in Hand Card */}
          {cashAccount && (
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base tracking-tight">{cashAccount.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white uppercase">
                  PHYSICAL CASH
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-xs text-amber-100 block">Available Cash in Hand</span>
                <p className="text-3xl font-bold font-sans tracking-tight tabular-nums mt-0.5">
                  {formatCurrency(cashAccount.currentBalance, userSettings.currencySymbol)}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-amber-100 pt-2 border-t border-amber-400/40 relative z-10">
                <span>Wallet Reserve</span>
                <button
                  onClick={onOpenTransferModal}
                  className="font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Transfer →</span>
                </button>
              </div>
            </div>
          )}

          {/* Other Accounts */}
          {accounts
            .filter((a) => !cashAccount || a.id !== cashAccount.id)
            .map((acc) => {
              const isBank = acc.type === 'bank' || acc.name.toLowerCase().includes('bank');
              const isBkash = acc.type === 'bkash' || acc.name.toLowerCase().includes('bkash');
              const isNagad = acc.type === 'nagad' || acc.name.toLowerCase().includes('nagad');

              let cardStyle = 'bg-white border-slate-200 hover:border-slate-300';
              let iconBg = 'bg-slate-100 text-slate-700';
              let titleColor = 'text-slate-900';
              let balanceColor = 'text-slate-900';
              let badgeStyle = 'bg-slate-100 text-slate-700';

              if (isBank) {
                cardStyle = 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-300';
                iconBg = 'bg-emerald-100 text-emerald-800';
                titleColor = 'text-emerald-950';
                balanceColor = 'text-emerald-900';
                badgeStyle = 'bg-emerald-600 text-white font-bold';
              } else if (isBkash) {
                cardStyle = 'bg-pink-50/80 border-pink-200 hover:border-pink-300';
                iconBg = 'bg-[#E2136E]/10 text-[#E2136E]';
                titleColor = 'text-[#9E0B46]';
                balanceColor = 'text-[#D12053]';
                badgeStyle = 'bg-[#E2136E] text-white font-bold';
              } else if (isNagad) {
                cardStyle = 'bg-orange-50/80 border-orange-200 hover:border-orange-300';
                iconBg = 'bg-orange-100 text-orange-800';
                titleColor = 'text-orange-950';
                balanceColor = 'text-orange-900';
                badgeStyle = 'bg-orange-600 text-white font-bold';
              }

              return (
                <div
                  key={acc.id}
                  className={`rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${cardStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${iconBg}`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-sm ${titleColor}`}>{acc.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${badgeStyle}`}>
                      {acc.type}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Current Balance</span>
                    <p className={`text-2xl font-bold font-sans tracking-tight tabular-nums mt-0.5 ${balanceColor}`}>
                      {formatCurrency(acc.currentBalance, userSettings.currencySymbol)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Opening: BDT {acc.openingBalance.toLocaleString()}</span>
                    <button
                      onClick={() => onSelectModule('accounts')}
                      className="font-semibold text-sky-600 hover:underline"
                    >
                      View History
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Personal Income"
          amount={summary.totalPersonalIncome}
          currencySymbol={userSettings.currencySymbol}
          subtitle={`Salary: ${formatCurrency(summary.totalSalaryIncome, userSettings.currencySymbol)}`}
          variant="emerald"
          icon={TrendingUp}
          onClick={() => onSelectModule('income')}
        />

        <MetricCard
          title="Total Personal Expenses"
          amount={summary.totalPersonalExpenses}
          currencySymbol={userSettings.currencySymbol}
          subtitle="Consumption & personal needs"
          variant="rose"
          icon={TrendingDown}
          onClick={() => onSelectModule('expense')}
        />

        <MetricCard
          title="Total Family Expenses"
          amount={summary.totalFamilyExpenses}
          currencySymbol={userSettings.currencySymbol}
          subtitle="Rent, utilities, support"
          variant="amber"
          icon={Heart}
          onClick={() => onSelectModule('expense')}
        />
      </div>

      {/* Budget Utilization & Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Budget Utilization ({currentMonthStr})</h3>
            <button
              onClick={() => onSelectModule('budgets')}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Budget Settings →
            </button>
          </div>

          {budgetUtilization.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">No budgets set for this month.</p>
          ) : (
            <div className="space-y-3.5">
              {budgetUtilization.map((b) => (
                <div key={b.budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{b.categoryName}</span>
                    <span className="font-sans font-medium text-slate-600">
                      {formatCurrency(b.actualSpent, userSettings.currencySymbol)} /{' '}
                      {formatCurrency(b.budget.budgetAmount, userSettings.currencySymbol)} ({b.percentageUsed.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.isOverBudget ? 'bg-rose-500' : b.percentageUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-600" />
              <span>Recent Transactions</span>
            </h3>
            <button
              onClick={() => onSelectModule('transactions')}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Full Ledger →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTxs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No transactions recorded yet.</p>
            ) : (
              recentTxs.map((tx) => {
                const isIncome =
                  tx.type === 'personal_income' ||
                  tx.type === 'salary_income' ||
                  tx.type === 'office_fund_received' ||
                  tx.type === 'additional_income';

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">{tx.description}</p>
                          {tx.isApproved ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>LOCKED</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                              EDITABLE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {formatDate(tx.date)} · {tx.payeePayer}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-bold font-sans ${
                        isIncome ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, userSettings.currencySymbol)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
