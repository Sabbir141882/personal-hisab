import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Building,
  CreditCard,
  DollarSign,
  Heart,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
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
  onSelectModule,
}) => {
  const [dateRangeFilter, setDateRangeFilter] = useState<'this_month' | 'all' | 'today'>('this_month');

  // Budget utilization calculation for current month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const budgetUtilization = calculateBudgetUtilization(budgets, transactions, categories, currentMonthStr);

  const recentTxs = [...transactions]
    .filter((t) => t.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 font-bold text-[10px] rounded border border-sky-500/30">
              {userSettings.currency} ({userSettings.currencySymbol})
            </span>
            <span className="text-xs text-slate-400">Welcome back, {userSettings.userName}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Net Cash Balance: {formatCurrency(summary.totalCashAndBankBalances, userSettings.currencySymbol)}
          </h2>
          <p className="text-xs text-slate-400">
            Personal Cash Flow: {formatCurrency(summary.netPersonalCashFlow, userSettings.currencySymbol)} ·
            Unspent Office Advance: {formatCurrency(summary.totalOfficeFundsUnspent, userSettings.currencySymbol)}
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
            onClick={onOpenOfficeModal}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Building className="w-3.5 h-3.5" />
            <span>Record Office Advance</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Financial Summary Overview</h3>
          <div className="flex items-center gap-1 text-xs bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDateRangeFilter('this_month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                dateRangeFilter === 'this_month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRangeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                dateRangeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            onClick={() => onSelectModule('family_expense')}
          />

          <MetricCard
            title="Net Personal Cashflow"
            amount={summary.netPersonalCashFlow}
            currencySymbol={userSettings.currencySymbol}
            subtitle="Personal Income - Consumption"
            variant="sky"
            icon={Wallet}
          />

          <MetricCard
            title="Office Funds Received"
            amount={summary.totalOfficeFundsReceived}
            currencySymbol={userSettings.currencySymbol}
            subtitle="Employer advances (NOT salary)"
            variant="purple"
            icon={Building}
            onClick={() => onSelectModule('office_fund')}
          />

          <MetricCard
            title="Official Office Expenses"
            amount={summary.totalOfficeExpenses}
            currencySymbol={userSettings.currencySymbol}
            subtitle="Travel, hotel, client meals"
            variant="slate"
            icon={Briefcase}
            onClick={() => onSelectModule('office_fund')}
          />

          <MetricCard
            title="Personal Use of Office Funds"
            amount={summary.totalPersonalExpensesViaOffice}
            currencySymbol={userSettings.currencySymbol}
            subtitle="Personal spending via office advance"
            variant="amber"
            badgeText="Settlement Alert"
            icon={AlertTriangle}
            onClick={() => onSelectModule('office_fund')}
          />

          <MetricCard
            title="Unspent Office Funds"
            amount={summary.totalOfficeFundsUnspent}
            currencySymbol={userSettings.currencySymbol}
            subtitle="Awaiting office settlement"
            variant="purple"
            icon={Building}
            onClick={() => onSelectModule('office_fund')}
          />
        </div>
      </div>

      {/* Critical Office Fund Alert & Accounts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Office Fund Spotlight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Office Fund Settlement Tracker (Critical Module)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Separates personal money from employer advances with strict settlement ledger rules
              </p>
            </div>
            <button
              onClick={() => onSelectModule('office_fund')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-800"
            >
              Manage Settlements →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {officeFunds.slice(0, 2).map((fund) => (
              <div key={fund.id} className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{fund.title}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                    {fund.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatCurrency(fund.amountReceived, userSettings.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Source:</span>
                    <span>{fund.employerSource}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Date:</span>
                    <span>{formatDate(fund.dateReceived)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Balances Quick View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-sky-600" />
              <span>Wallets & Accounts</span>
            </h3>
            <button
              onClick={() => onSelectModule('accounts')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-800">{acc.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900">
                  {formatCurrency(acc.currentBalance, userSettings.currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Utilization & Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Budget Utilization ({currentMonthStr})</h3>
            <button
              onClick={() => onSelectModule('budgets')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Budget Settings →
            </button>
          </div>

          {budgetUtilization.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No budgets set for this month.</p>
          ) : (
            <div className="space-y-3.5">
              {budgetUtilization.map((b) => (
                <div key={b.budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{b.categoryName}</span>
                    <span className="font-mono text-slate-600">
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
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Full Ledger →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTxs.map((tx) => {
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
                      <p className="font-semibold text-slate-900 truncate max-w-[200px]">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">
                        {formatDate(tx.date)} · {tx.payeePayer} · {tx.ownership.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold font-mono ${
                      isIncome ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, userSettings.currencySymbol)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
