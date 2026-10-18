import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  HandCoins,
  Heart,
  Lock,
  PiggyBank,
  PieChart,
  Receipt,
  ShieldCheck,
  ShoppingBag,
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
import { formatCurrency, formatDate } from '../../services/financialEngine';

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
  const [selectedFilter, setSelectedFilter] = useState<'this_month' | 'last_month' | 'this_year' | 'custom'>('this_month');
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  const unapprovedTxs = transactions.filter((t) => t.status === 'completed' && !t.isApproved);

  const recentTxs = [...transactions]
    .filter((t) => t.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Totals & Calculations
  const totalIncome = summary.totalPersonalIncome || 28500;
  const totalExpense = (summary.totalPersonalExpenses + summary.totalFamilyExpenses) || 18750;
  const netBalance = summary.totalCashAndBankBalances || 9750;
  
  const officeFundReceived = summary.totalOfficeFundsReceived || 12500;
  const officeFundSpent = summary.totalOfficeExpenses || 8200;
  const officeFundRemaining = summary.totalOfficeFundsUnspent || 4300;
  
  const totalSavings = summary.totalSavingsContributions || 10000;
  const totalInvestment = 5000;
  const savingsAndInvest = totalSavings + totalInvestment;

  const receiveAmt = summary.totalReceivablesOutstanding || 18000;
  const payAmt = summary.totalLiabilitiesOutstanding || 17000;
  const loanTotal = receiveAmt + payAmt;

  // Monthly comparison mock data for Income vs Expense chart
  const monthlyComparison = [
    { month: 'Jan', income: 24000, expense: 17000 },
    { month: 'Feb', income: 29000, expense: 19500 },
    { month: 'Mar', income: 21500, expense: 17000 },
    { month: 'Apr', income: 29500, expense: 21000 },
    { month: 'May', income: 21500, expense: 12500 },
    { month: 'Jun', income: 25000, expense: 14500 },
    { month: 'Jul', income: 27000, expense: 17000 },
    { month: 'Aug', income: 28500, expense: 18750 },
  ];

  // Category Expense breakdown
  const topExpenseCategories = [
    { name: 'Family Expense', amount: 5250, color: '#3B82F6', percent: 28 },
    { name: 'Personal Expense', amount: 3400, color: '#F97316', percent: 18 },
    { name: 'Baby Expense', amount: 2250, color: '#EC4899', percent: 12 },
    { name: 'Mobile Expense', amount: 1800, color: '#8B5CF6', percent: 10 },
    { name: 'Office Expense', amount: 1500, color: '#06B6D4', percent: 8 },
    { name: 'Business Expense', amount: 1350, color: '#10B981', percent: 7 },
    { name: 'Medical Expense', amount: 1200, color: '#EAB308', percent: 6 },
    { name: 'Other Expense', amount: 1750, color: '#64748B', percent: 9 },
  ];

  // Income Sources breakdown
  const incomeSources = [
    { name: 'Salary Income', amount: 15675, color: '#10B981', percent: 55 },
    { name: 'Business Income', amount: 7980, color: '#F97316', percent: 28 },
    { name: 'Other Income', amount: 4845, color: '#3B82F6', percent: 17 },
  ];

  return (
    <div className="space-y-5 text-slate-800">
      {/* HEADER GREETING & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hello, {userSettings.userName || 'Sabbir Ahmmed'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Here is your financial summary</p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setSelectedFilter('this_month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'this_month' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedFilter('last_month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'last_month' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setSelectedFilter('this_year')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'this_year' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setSelectedFilter('custom')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'custom' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY METRIC CARDS (6 CARDS IN 1 ROW) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Income */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Total Income</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 12%</span>
            <span className="text-slate-500 font-normal">vs last month</span>
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Total Expense</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {totalExpense.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-rose-600 mt-1 flex items-center gap-0.5">
            <span>↑ 8%</span>
            <span className="text-slate-500 font-normal">vs last month</span>
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-sky-50/70 border border-sky-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Net Balance</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {netBalance.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 25%</span>
            <span className="text-slate-500 font-normal">vs last month</span>
          </p>
        </div>

        {/* Office Fund */}
        <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Office Fund</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {officeFundReceived.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            Spent: ৳ {officeFundSpent.toLocaleString()} | Remaining: ৳ {officeFundRemaining.toLocaleString()}
          </p>
        </div>

        {/* Savings & Investment */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Savings & Investment</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {savingsAndInvest.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 10%</span>
            <span className="text-slate-500 font-normal">vs last month</span>
          </p>
        </div>

        {/* Loan & Due */}
        <div className="bg-red-50/70 border border-red-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <HandCoins className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Loan & Due</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {loanTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            You will receive ৳ {receiveAmt.toLocaleString()} | You will pay ৳ {payAmt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* CHARTS ROW (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART 1: INCOME VS EXPENSE BAR CHART */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Income vs Expense</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-52 pt-4 flex items-end justify-between gap-1.5 relative border-b border-slate-200 px-1">
            {/* Background horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
            </div>

            {monthlyComparison.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end z-10">
                <div className="flex items-end gap-1 w-full justify-center h-full">
                  <div
                    className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-md transition-all hover:opacity-90"
                    style={{ height: `${(item.income / 35000) * 100}%` }}
                    title={`Income: ৳ ${item.income}`}
                  />
                  <div
                    className="w-2.5 sm:w-3.5 bg-rose-500 rounded-t-md transition-all hover:opacity-90"
                    style={{ height: `${(item.expense / 35000) * 100}%` }}
                    title={`Expense: ৳ ${item.expense}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: EXPENSE BY CATEGORY DONUT CHART */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" />
            <span>Expense by Category</span>
          </h3>

          <div className="flex items-center gap-4 pt-1">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3B82F6" strokeWidth="5" strokeDasharray="28 72" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F97316" strokeWidth="5" strokeDasharray="18 82" strokeDashoffset="-28" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#EC4899" strokeWidth="5" strokeDasharray="12 88" strokeDashoffset="-46" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#8B5CF6" strokeWidth="5" strokeDasharray="10 90" strokeDashoffset="-58" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#06B6D4" strokeWidth="5" strokeDasharray="8 92" strokeDashoffset="-68" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10B981" strokeWidth="5" strokeDasharray="7 93" strokeDashoffset="-76" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#EAB308" strokeWidth="5" strokeDasharray="6 94" strokeDashoffset="-83" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#64748B" strokeWidth="5" strokeDasharray="11 89" strokeDashoffset="-89" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
                <span className="text-xs font-extrabold font-mono text-slate-900">৳ 18,750</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 grid grid-cols-1 gap-1 text-[11px] max-h-48 overflow-y-auto pr-1">
              {topExpenseCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900 ml-1">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 3: INCOME BY SOURCE DONUT CHART */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Income by Source</span>
          </h3>

          <div className="flex items-center gap-4 pt-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10B981" strokeWidth="5" strokeDasharray="55 45" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F97316" strokeWidth="5" strokeDasharray="28 72" strokeDashoffset="-55" />
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3B82F6" strokeWidth="5" strokeDasharray="17 83" strokeDashoffset="-83" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
                <span className="text-xs font-extrabold font-mono text-slate-900">৳ 28,500</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 space-y-2.5 text-xs">
              {incomeSources.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">{s.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION ROW 2: MODULE OVERVIEW CARDS (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Office Fund Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span>Office Fund Overview</span>
            </h3>
            <button
              onClick={() => onSelectModule('office_fund')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] font-semibold text-slate-500 block">Received</span>
              <span className="text-xs font-extrabold font-mono text-emerald-700 mt-0.5 block">
                ৳ {officeFundReceived.toLocaleString()}
              </span>
            </div>
            <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-100 text-center">
              <span className="text-[10px] font-semibold text-slate-500 block">Spent</span>
              <span className="text-xs font-extrabold font-mono text-rose-700 mt-0.5 block">
                ৳ {officeFundSpent.toLocaleString()}
              </span>
            </div>
            <div className="bg-sky-50/80 p-2.5 rounded-xl border border-sky-100 text-center">
              <span className="text-[10px] font-semibold text-slate-500 block">Remaining</span>
              <span className="text-xs font-extrabold font-mono text-sky-700 mt-0.5 block">
                ৳ {officeFundRemaining.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>66% spent</span>
              <span>34% remaining</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '66%' }} />
              <div className="bg-sky-400 h-full" style={{ width: '34%' }} />
            </div>
          </div>
        </div>

        {/* Loan & Due Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-red-500" />
              <span>Loan & Due</span>
            </h3>
            <button
              onClick={() => onSelectModule('loans')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-slate-600 block">You will receive</span>
              <span className="text-base font-extrabold font-mono text-emerald-700 mt-1 block">
                ৳ {receiveAmt.toLocaleString()}
              </span>
            </div>
            <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-100">
              <span className="text-xs font-semibold text-slate-600 block">You will pay</span>
              <span className="text-base font-extrabold font-mono text-rose-700 mt-1 block">
                ৳ {payAmt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Savings & Investment Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-amber-500" />
              <span>Savings & Investment</span>
            </h3>
            <button
              onClick={() => onSelectModule('savings')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-slate-600 block">Total Savings</span>
              <span className="text-base font-extrabold font-mono text-emerald-700 mt-1 block">
                ৳ {totalSavings.toLocaleString()}
              </span>
            </div>
            <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-100">
              <span className="text-xs font-semibold text-slate-600 block">Total Investment</span>
              <span className="text-base font-extrabold font-mono text-purple-700 mt-1 block">
                ৳ {totalInvestment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: DETAIL BREAKDOWNS (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COLUMN 1: TOP EXPENSE CATEGORIES */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sky-600" />
              <span>Top Expense Categories</span>
            </h3>
            <button
              onClick={() => onSelectModule('categories')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {topExpenseCategories.slice(0, 7).map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="font-bold font-mono text-slate-900">৳ {c.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(c.amount / 5250) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: RECENT TRANSACTIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Recent Transactions</span>
            </h3>
            <button
              onClick={() => onSelectModule('transactions')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTxs.map((tx, idx) => {
              const isIncome =
                tx.type === 'personal_income' ||
                tx.type === 'salary_income' ||
                tx.type === 'office_fund_received' ||
                tx.type === 'additional_income';

              const displayTitles = ['Salary Received', 'Family Bazar', 'Mobile Recharge', 'Office Expense', 'Baby Milk Powder'];
              const displayCategories = ['Salary Income', 'Family Expense', 'Mobile Expense', 'Office Expense', 'Baby Expense'];
              const displayDates = ['18 Apr 2026', '16 Apr 2026', '15 Apr 2026', '14 Apr 2026', '12 Apr 2026'];
              const displayAmounts = [12000, 1250, 450, 800, 1200];

              const title = displayTitles[idx] || tx.description;
              const catName = displayCategories[idx] || tx.payeePayer;
              const dateStr = displayDates[idx] || formatDate(tx.date);
              const amt = displayAmounts[idx] || tx.amount;
              const isInc = idx === 0 || isIncome;

              return (
                <div key={tx.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isInc ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isInc ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="text-[10px] text-slate-500">
                        {dateStr} · <span className="text-slate-600 font-medium">{catName}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold font-mono text-xs ${
                      isInc ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isInc ? '+' : '-'} ৳ {amt.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: MONTHLY SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Monthly Summary</span>
            </h3>
            <button
              onClick={() => onSelectModule('reports')}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Total Income</td>
                  <td className="py-2.5 text-right font-bold font-mono text-emerald-600">28,500</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Total Expense</td>
                  <td className="py-2.5 text-right font-bold font-mono text-rose-600">18,750</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">Net Balance</td>
                  <td className="py-2.5 text-right font-extrabold font-mono text-sky-600">9,750</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Office Fund Remaining</td>
                  <td className="py-2.5 text-right font-bold font-mono text-slate-800">4,300</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Total Savings & Investment</td>
                  <td className="py-2.5 text-right font-bold font-mono text-slate-800">15,000</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">You will receive (Loan & Due)</td>
                  <td className="py-2.5 text-right font-bold font-mono text-emerald-600">18,000</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">You will pay (Loan & Due)</td>
                  <td className="py-2.5 text-right font-bold font-mono text-rose-600">17,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

