import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
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
  onViewVoucher?: (tx: Transaction) => void;
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
  onViewVoucher,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'this_month' | 'last_month' | 'this_year' | 'custom'>('this_month');
  
  // Format current month string
  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel);

  const unapprovedTxs = transactions.filter((t) => t.status === 'completed' && !t.isApproved);

  // Live Cash in Hand Account
  const cashAccount = accounts.find((a) => a.type === 'cash' || a.name.toLowerCase().includes('cash')) || accounts[0];

  // Completed transactions list sorted latest first
  const completedTxs = transactions.filter((t) => t.status === 'completed');
  const recentTxs = [...completedTxs]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // 100% PURE LIVE TOTALS FROM SUMMARY & TRANSACTIONS (NO FAKE FALLBACKS)
  const totalIncome = summary.totalPersonalIncome || 0;
  const totalExpense = (summary.totalPersonalExpenses || 0) + (summary.totalFamilyExpenses || 0);
  const netBalance = summary.totalCashAndBankBalances || 0;
  
  const officeFundReceived = summary.totalOfficeFundsReceived || 0;
  const officeFundSpent = summary.totalOfficeExpenses || 0;
  const officeFundRemaining = summary.totalOfficeFundsUnspent || 0;
  
  const totalSavings = summary.totalSavingsContributions || 0;
  
  // Calculate total investments strictly from transactions of type 'investment'
  const totalInvestment = completedTxs
    .filter((t) => t.type === 'investment')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const savingsAndInvest = totalSavings + totalInvestment;

  const receiveAmt = summary.totalReceivablesOutstanding || 0;
  const payAmt = summary.totalLiabilitiesOutstanding || 0;
  const loanTotal = receiveAmt + payAmt;

  // COMPUTE LIVE CATEGORY EXPENSE BREAKDOWN
  const categoryExpensesMap: Record<string, { name: string; amount: number; color: string }> = {};
  const defaultColors = ['#3B82F6', '#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981', '#EAB308', '#64748B'];

  completedTxs.forEach((tx) => {
    const isExpense = tx.type.includes('expense') || tx.type === 'office_expense' || tx.type === 'other_expense';
    if (isExpense) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const catName = cat ? cat.name : 'Other Expense';
      if (!categoryExpensesMap[catName]) {
        const colorIdx = Object.keys(categoryExpensesMap).length % defaultColors.length;
        categoryExpensesMap[catName] = { name: catName, amount: 0, color: cat?.color || defaultColors[colorIdx] };
      }
      categoryExpensesMap[catName].amount += tx.amount;
    }
  });

  const categoryList = Object.values(categoryExpensesMap);
  const liveExpenseTotal = categoryList.reduce((acc, c) => acc + c.amount, 0);

  const topExpenseCategories = categoryList
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({
      name: c.name,
      amount: c.amount,
      color: c.color,
      percent: liveExpenseTotal > 0 ? Math.round((c.amount / liveExpenseTotal) * 100) : 0,
    }));

  // COMPUTE LIVE INCOME SOURCES
  let salarySum = 0;
  let businessSum = 0;
  let otherIncomeSum = 0;

  completedTxs.forEach((tx) => {
    const isIncome = tx.type.includes('income') || tx.type === 'office_fund_received' || tx.type === 'money_received';
    if (isIncome) {
      if (tx.type === 'salary_income' || (tx.description && tx.description.toLowerCase().includes('salary'))) {
        salarySum += tx.amount;
      } else if (tx.type === 'additional_income' || (tx.description && tx.description.toLowerCase().includes('business'))) {
        businessSum += tx.amount;
      } else {
        otherIncomeSum += tx.amount;
      }
    }
  });

  const liveIncomeTotal = salarySum + businessSum + otherIncomeSum;
  const incomeSources = liveIncomeTotal > 0
    ? [
        { name: 'Salary Income', amount: salarySum, color: '#10B981', percent: Math.round((salarySum / liveIncomeTotal) * 100) },
        { name: 'Business Income', amount: businessSum, color: '#F97316', percent: Math.round((businessSum / liveIncomeTotal) * 100) },
        { name: 'Other Income', amount: otherIncomeSum, color: '#3B82F6', percent: Math.round((otherIncomeSum / liveIncomeTotal) * 100) },
      ].filter((s) => s.amount > 0)
    : [];

  // PURE REAL DYNAMIC MONTHLY COMPARISON FROM TRANSACTIONS (LAST 6 MONTHS)
  const getDynamicMonthlyComparison = () => {
    const monthList: { label: string; key: string }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      monthList.push({
        label: monthNames[d.getMonth()],
        key: `${y}-${m}`,
      });
    }

    return monthList.map((m) => {
      let monthIncome = 0;
      let monthExpense = 0;

      completedTxs.forEach((tx) => {
        if (tx.date && tx.date.startsWith(m.key)) {
          const isInc = tx.type.includes('income') || tx.type === 'office_fund_received' || tx.type === 'money_received';
          const isExp = tx.type.includes('expense') || tx.type === 'office_expense' || tx.type === 'other_expense';
          if (isInc) monthIncome += tx.amount;
          if (isExp) monthExpense += tx.amount;
        }
      });

      return { month: m.label, income: monthIncome, expense: monthExpense };
    });
  };

  const monthlyComparison = getDynamicMonthlyComparison();
  const maxMonthlyValue = Math.max(1, ...monthlyComparison.map((m) => Math.max(m.income, m.expense)));

  // Office Fund Percentages
  const officeFundSpentPercent = officeFundReceived > 0
    ? Math.min(100, Math.round((officeFundSpent / officeFundReceived) * 100))
    : 0;
  const officeFundRemainingPercent = officeFundReceived > 0 ? 100 - officeFundSpentPercent : 0;

  // SVG Circumference for radius 14 circle = 2 * PI * 14 = ~87.964
  const SVG_CIRCUMFERENCE = 87.964;

  return (
    <div className="space-y-5 text-slate-800">
      {/* HEADER GREETING & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hello, {userSettings.userName || 'User'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Here is your live financial summary based on actual entries</p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const str = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={str} value={str}>
                    {str}
                  </option>
                );
              })}
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

      {/* PROMINENT CASH IN HAND BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-md border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-amber-100 uppercase font-mono tracking-wider">
                PHYSICAL CASH
              </span>
              <span className="text-xs text-amber-100 font-medium">Live Balance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-0.5">
              Cash in Hand: ৳ {cashAccount ? cashAccount.currentBalance.toLocaleString() : '0'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-amber-100 block">Opening Cash</span>
            <span className="text-sm font-bold font-mono">
              ৳ {cashAccount ? cashAccount.openingBalance.toLocaleString() : '0'}
            </span>
          </div>
          <button
            onClick={onOpenTransferModal}
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
          >
            Transfer Cash →
          </button>
        </div>
      </div>

      {/* TOP SUMMARY METRIC CARDS (6 CARDS IN 1 ROW) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Income */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('income')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Total Income</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">
            Salary, business & other
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('expense')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Total Expense</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {totalExpense.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">
            Personal & family spend
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-sky-50/70 border border-sky-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('accounts')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Net Balance</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {netBalance.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">
            Active cash & bank total
          </p>
        </div>

        {/* Office Fund */}
        <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('office_fund')}>
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
            Spent: ৳ {officeFundSpent.toLocaleString()} | Left: ৳ {officeFundRemaining.toLocaleString()}
          </p>
        </div>

        {/* Savings & Investment */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('savings')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 truncate">Savings & Investment</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 tracking-tight">
            ৳ {savingsAndInvest.toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">
            Saved ৳ {totalSavings.toLocaleString()} | Invest ৳ {totalInvestment.toLocaleString()}
          </p>
        </div>

        {/* Loan & Due */}
        <div className="bg-red-50/70 border border-red-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer" onClick={() => onSelectModule('loans')}>
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
            Recv ৳ {receiveAmt.toLocaleString()} | Pay ৳ {payAmt.toLocaleString()}
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

            {monthlyComparison.map((item) => {
              const incPct = maxMonthlyValue > 0 ? (item.income / maxMonthlyValue) * 100 : 0;
              const expPct = maxMonthlyValue > 0 ? (item.expense / maxMonthlyValue) * 100 : 0;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end z-10">
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    <div
                      className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-md transition-all hover:opacity-90"
                      style={{ height: `${Math.max(incPct > 0 ? 4 : 0, incPct)}%` }}
                      title={`Income: ৳ ${item.income.toLocaleString()}`}
                    />
                    <div
                      className="w-2.5 sm:w-3.5 bg-rose-500 rounded-t-md transition-all hover:opacity-90"
                      style={{ height: `${Math.max(expPct > 0 ? 4 : 0, expPct)}%` }}
                      title={`Expense: ৳ ${item.expense.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-1">{item.month}</span>
                </div>
              );
            })}
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
                {liveExpenseTotal === 0 ? (
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#E2E8F0" strokeWidth="5" />
                ) : (
                  (() => {
                    let cumulativeDash = 0;
                    return topExpenseCategories.map((c) => {
                      const strokeDash = (c.amount / liveExpenseTotal) * SVG_CIRCUMFERENCE;
                      const strokeGap = SVG_CIRCUMFERENCE - strokeDash;
                      const dashOffset = -cumulativeDash;
                      cumulativeDash += strokeDash;

                      return (
                        <circle
                          key={c.name}
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke={c.color}
                          strokeWidth="5"
                          strokeDasharray={`${strokeDash.toFixed(2)} ${strokeGap.toFixed(2)}`}
                          strokeDashoffset={dashOffset.toFixed(2)}
                        />
                      );
                    });
                  })()
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
                <span className="text-xs font-extrabold font-mono text-slate-900">৳ {liveExpenseTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 grid grid-cols-1 gap-1 text-[11px] max-h-48 overflow-y-auto pr-1">
              {topExpenseCategories.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4">No expense entries found</div>
              ) : (
                topExpenseCategories.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900 ml-1">{c.percent}%</span>
                  </div>
                ))
              )}
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
                {liveIncomeTotal === 0 ? (
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#E2E8F0" strokeWidth="5" />
                ) : (
                  (() => {
                    let cumulativeDash = 0;
                    return incomeSources.map((s) => {
                      const strokeDash = (s.amount / liveIncomeTotal) * SVG_CIRCUMFERENCE;
                      const strokeGap = SVG_CIRCUMFERENCE - strokeDash;
                      const dashOffset = -cumulativeDash;
                      cumulativeDash += strokeDash;

                      return (
                        <circle
                          key={s.name}
                          cx="18"
                          cy="18"
                          r="14"
                          fill="transparent"
                          stroke={s.color}
                          strokeWidth="5"
                          strokeDasharray={`${strokeDash.toFixed(2)} ${strokeGap.toFixed(2)}`}
                          strokeDashoffset={dashOffset.toFixed(2)}
                        />
                      );
                    });
                  })()
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
                <span className="text-xs font-extrabold font-mono text-slate-900">৳ {liveIncomeTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 space-y-2.5 text-xs">
              {incomeSources.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4">No income entries found</div>
              ) : (
                incomeSources.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="font-bold font-mono text-slate-900">{s.percent}%</span>
                  </div>
                ))
              )}
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
              <span>{officeFundSpentPercent}% spent</span>
              <span>{officeFundRemainingPercent}% remaining</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${officeFundSpentPercent}%` }} />
              <div className="bg-sky-400 h-full" style={{ width: `${officeFundRemainingPercent}%` }} />
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
            {topExpenseCategories.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-6 text-center">
                No expense category entries recorded
              </div>
            ) : (
              topExpenseCategories.slice(0, 7).map((c) => {
                const maxCatAmt = topExpenseCategories[0]?.amount || 1;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="font-bold font-mono text-slate-900">৳ {c.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (c.amount / maxCatAmt) * 100)}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
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

          {recentTxs.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              No recent transactions recorded
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTxs.map((tx) => {
                const isIncome =
                  tx.type === 'personal_income' ||
                  tx.type === 'salary_income' ||
                  tx.type === 'office_fund_received' ||
                  tx.type === 'additional_income' ||
                  tx.type === 'income' ||
                  tx.type === 'money_received';

                const cat = categories.find((c) => c.id === tx.categoryId);
                const catName = cat ? cat.name : tx.payeePayer || 'General';

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.description || 'Transaction'}</p>
                        <p className="text-[10px] text-slate-500">
                          {formatDate(tx.date)} · <span className="text-slate-600 font-medium">{catName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold font-mono text-xs ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                      </span>
                      {onViewVoucher && (
                        <button
                          onClick={() => onViewVoucher(tx)}
                          className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded cursor-pointer transition-colors"
                          title="View & Print Voucher (ভাউচার দেখুন ও প্রিন্ট করুন)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  <td className="py-2.5 text-right font-bold font-mono text-emerald-600">৳ {totalIncome.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Total Expense</td>
                  <td className="py-2.5 text-right font-bold font-mono text-rose-600">৳ {totalExpense.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">Net Balance</td>
                  <td className="py-2.5 text-right font-extrabold font-mono text-sky-600">৳ {netBalance.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Cash in Hand</td>
                  <td className="py-2.5 text-right font-bold font-mono text-amber-600">৳ {cashAccount ? cashAccount.currentBalance.toLocaleString() : '0'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Office Fund Remaining</td>
                  <td className="py-2.5 text-right font-bold font-mono text-slate-800">৳ {officeFundRemaining.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">Total Savings & Investment</td>
                  <td className="py-2.5 text-right font-bold font-mono text-slate-800">৳ {savingsAndInvest.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">You will receive (Loan & Due)</td>
                  <td className="py-2.5 text-right font-bold font-mono text-emerald-600">৳ {receiveAmt.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-800">You will pay (Loan & Due)</td>
                  <td className="py-2.5 text-right font-bold font-mono text-rose-600">৳ {payAmt.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

