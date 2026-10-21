import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  Building,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  HandCoins,
  Heart,
  Lock,
  PiggyBank,
  PieChart,
  PlusCircle,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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
import { formatCurrency, formatDate, isUnpassBillTx } from '../../services/financialEngine';

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
  onOpenUserGuide?: () => void;
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
  onOpenUserGuide,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'this_month' | 'last_month' | 'this_year' | 'month_select' | 'custom'>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Format current month string
  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel);

  // Real-time Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveDateFormatted = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const liveTimeFormatted = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Filter completed transactions strictly based on selected filter / month / custom range
  const getFilteredTransactions = () => {
    const currentYearStr = now.getFullYear().toString();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${(lastMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;

    return transactions.filter((t) => {
      if (t.status !== 'completed') return false;
      if (!t.isApproved && !isUnpassBillTx(t, accounts)) return false;

      if (selectedFilter === 'this_month') {
        return t.date.startsWith(currentMonthStr);
      } else if (selectedFilter === 'last_month') {
        return t.date.startsWith(lastMonthStr);
      } else if (selectedFilter === 'this_year') {
        return t.date.startsWith(currentYearStr);
      } else if (selectedFilter === 'month_select') {
        const d = new Date(selectedMonth);
        if (!isNaN(d.getTime())) {
          const ym = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          return t.date.startsWith(ym);
        }
        return true;
      } else if (selectedFilter === 'custom') {
        if (customStartDate && t.date < customStartDate) return false;
        if (customEndDate && t.date > customEndDate) return false;
        return true;
      }
      return true;
    });
  };

  const completedTxs = getFilteredTransactions();

  const unapprovedTxs = transactions.filter((t) => t.status === 'completed' && !t.isApproved);

  // Live Cash in Hand Account
  const cashAccount = accounts.find((a) => a.type === 'cash' || a.name.toLowerCase().includes('cash')) || accounts[0];

  // Completed transactions list sorted latest first
  const recentTxs = [...completedTxs]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // REACTIVE DYNAMIC FILTERED TOTALS
  let totalIncome = 0;
  let totalExpense = 0;

  completedTxs.forEach((t) => {
    const typeStr = (t.type || '').toLowerCase();
    const isIncome =
      typeStr.includes('income') ||
      typeStr.includes('received') ||
      typeStr.includes('collection') ||
      typeStr.includes('refund');

    const isExpense =
      typeStr.includes('expense') ||
      typeStr === 'unpass_bill' ||
      typeStr.includes('loan_issued') ||
      typeStr.includes('loan_given') ||
      typeStr.includes('money_given') ||
      typeStr.includes('repayment') ||
      typeStr.includes('returned');

    if (isIncome) totalIncome += t.amount;
    if (isExpense) totalExpense += t.amount;
  });

  const netBalance = totalIncome - totalExpense;
  
  const officeFundReceived = summary.totalOfficeFundsReceived || 0;
  const officeFundSpent = summary.totalOfficeExpenses || 0;
  const officeFundRemaining = summary.totalOfficeFundsUnspent || 0;
  
  const totalSavings = summary.totalSavingsContributions || 0;
  
  const totalInvestment = completedTxs
    .filter((t) => t.type === 'investment')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const savingsAndInvest = totalSavings + totalInvestment;

  const receiveAmt = summary.totalReceivablesOutstanding || 0;
  const payAmt = summary.totalLiabilitiesOutstanding || 0;
  const loanTotal = receiveAmt + payAmt;

  // COMPUTE LIVE CATEGORY EXPENSE BREAKDOWN FOR FILTERED PERIOD
  const categoryExpensesMap: Record<string, { name: string; amount: number; color: string }> = {};
  const defaultColors = ['#3B82F6', '#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981', '#EAB308', '#64748B'];

  completedTxs.forEach((tx) => {
    const typeStr = (tx.type || '').toLowerCase();
    const isExpense =
      typeStr.includes('expense') ||
      typeStr === 'unpass_bill' ||
      typeStr.includes('loan_issued') ||
      typeStr.includes('loan_given') ||
      typeStr.includes('money_given') ||
      typeStr.includes('repayment') ||
      typeStr.includes('returned');
    if (isExpense) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const catName = cat ? cat.name : 'UNPASS / Other Expense';
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

  // COMPUTE LIVE INCOME SOURCES FOR FILTERED PERIOD
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
          const typeStr = (tx.type || '').toLowerCase();
          const isInc =
            typeStr.includes('income') ||
            typeStr.includes('received') ||
            typeStr.includes('collection') ||
            typeStr.includes('refund');
          const isExp =
            typeStr.includes('expense') ||
            typeStr === 'unpass_bill' ||
            typeStr.includes('loan_issued') ||
            typeStr.includes('loan_given') ||
            typeStr.includes('money_given') ||
            typeStr.includes('repayment') ||
            typeStr.includes('returned');
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
    <div className="space-y-5 text-slate-100">
      {/* HEADER GREETING & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Hello, {userSettings.userName || 'User'}</span>
            <span className="text-lg">👋</span>
          </h1>

          {/* Real-time Live Clock Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{liveDateFormatted} · {liveTimeFormatted}</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Month Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedFilter('month_select');
              }}
              className="bg-transparent border-none focus:outline-none text-xs font-semibold text-white cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const str = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={str} value={str} className="bg-slate-900 text-white">
                    {str}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedFilter('this_month')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'this_month'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedFilter('last_month')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'last_month'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setSelectedFilter('this_year')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'this_year'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setSelectedFilter('custom')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedFilter === 'custom'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Bar (Shown when Custom is selected) */}
      {selectedFilter === 'custom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-300">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-none"
            />
          </div>
          {(customStartDate || customEndDate) && (
            <button
              onClick={() => {
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-rose-400 hover:underline text-xs cursor-pointer ml-auto"
            >
              Reset Dates
            </button>
          )}
        </div>
      )}

      {/* 1-CLICK QUICK ACTIONS SHORTCUT BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-white">Quick Shortcuts (দ্রুত শর্টকাট):</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenOfficeModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 text-amber-200 hover:bg-amber-900/80 font-medium text-xs rounded-lg border border-amber-700/50 transition-colors cursor-pointer active:scale-98"
          >
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>+ অফিস অগ্রিম</span>
          </button>

          <button
            onClick={() => onOpenTxModal('office_expense')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 text-rose-200 hover:bg-rose-900/80 font-medium text-xs rounded-lg border border-rose-700/50 transition-colors cursor-pointer active:scale-98"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>+ অফিস খরচ</span>
          </button>

          <button
            onClick={onOpenTransferModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/80 font-medium text-xs rounded-lg border border-indigo-700/50 transition-colors cursor-pointer active:scale-98"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>⇄ টাকা ট্রান্সফার</span>
          </button>

          <button
            onClick={() => onSelectModule('loans')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/80 font-medium text-xs rounded-lg border border-emerald-700/50 transition-colors cursor-pointer active:scale-98"
          >
            <HandCoins className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ লোন ও দেনা-পাওনা</span>
          </button>
        </div>
      </div>

      {/* PROMINENT CASH IN HAND BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 text-white rounded-xl p-4 border border-emerald-600/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 uppercase font-mono border border-emerald-500/30">
                PHYSICAL CASH
              </span>
              <span className="text-xs text-slate-300">Live Balance</span>
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-tight mt-0.5 text-white">
              Cash in Hand: ৳ {cashAccount ? cashAccount.currentBalance.toLocaleString() : '0'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-slate-400 block">Opening Cash</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              ৳ {cashAccount ? cashAccount.openingBalance.toLocaleString() : '0'}
            </span>
          </div>
          <button
            onClick={onOpenTransferModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer active:scale-98 shadow-sm"
          >
            Transfer Cash →
          </button>
        </div>
      </div>

      {/* TOP SUMMARY METRIC CARDS (5 CARDS IN 1 ROW) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Income */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors cursor-pointer shadow-sm" onClick={() => onSelectModule('income')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300 truncate">Total Income</span>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-400 tracking-tight">
            ৳ {totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Salary, business & other
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors cursor-pointer shadow-sm" onClick={() => onSelectModule('expense')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-700/50 text-rose-400 flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300 truncate">Total Expense</span>
          </div>
          <p className="text-lg font-bold font-mono text-rose-400 tracking-tight">
            ৳ {totalExpense.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Personal & family spend
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors cursor-pointer shadow-sm" onClick={() => onSelectModule('accounts')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300 truncate">Net Balance</span>
          </div>
          <p className="text-lg font-bold font-mono text-indigo-400 tracking-tight">
            ৳ {netBalance.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Active cash & bank total
          </p>
        </div>

        {/* Office Fund */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors cursor-pointer shadow-sm" onClick={() => onSelectModule('office_fund')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-700/50 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Building className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300 truncate">Office Fund</span>
          </div>
          <p className="text-lg font-bold font-mono text-amber-300 tracking-tight">
            ৳ {officeFundReceived.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Spent: ৳ {officeFundSpent.toLocaleString()} | Left: ৳ {officeFundRemaining.toLocaleString()}
          </p>
        </div>

        {/* Loan & Due */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors cursor-pointer shadow-sm" onClick={() => onSelectModule('loans')}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-700/50 text-red-400 flex items-center justify-center font-bold shrink-0">
              <HandCoins className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-300 truncate">Loan & Due</span>
          </div>
          <p className="text-lg font-bold font-mono text-red-400 tracking-tight">
            ৳ {loanTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            Recv ৳ {receiveAmt.toLocaleString()} | Pay ৳ {payAmt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* CHARTS ROW (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART 1: INCOME VS EXPENSE BAR CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Income vs Expense</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-48 pt-4 flex items-end justify-between gap-1.5 relative border-b border-slate-800 px-1">
            {/* Background horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
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
                      className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-400"
                      style={{ height: `${Math.max(incPct > 0 ? 4 : 0, incPct)}%` }}
                      title={`Income: ৳ ${item.income.toLocaleString()}`}
                    />
                    <div
                      className="w-2.5 sm:w-3.5 bg-rose-500 rounded-t-sm transition-all hover:bg-rose-400"
                      style={{ height: `${Math.max(expPct > 0 ? 4 : 0, expPct)}%` }}
                      title={`Expense: ৳ ${item.expense.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: EXPENSE BY CATEGORY DONUT CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Expense by Category</span>
          </h3>

          <div className="flex items-center gap-4 pt-1">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {liveExpenseTotal === 0 ? (
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#334155" strokeWidth="5" />
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
                <span className="text-[10px] font-medium text-slate-400 uppercase">Total</span>
                <span className="text-xs font-bold font-mono text-white">৳ {liveExpenseTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 grid grid-cols-1 gap-1 text-[11px] max-h-44 overflow-y-auto pr-1">
              {topExpenseCategories.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4">No expense entries found</div>
              ) : (
                topExpenseCategories.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate text-xs">{c.name}</span>
                    </div>
                    <span className="font-semibold font-mono text-slate-300 ml-1">{c.percent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CHART 3: INCOME BY SOURCE DONUT CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Income by Source</span>
          </h3>

          <div className="flex items-center gap-4 pt-2">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {liveIncomeTotal === 0 ? (
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#334155" strokeWidth="5" />
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
                <span className="text-[10px] font-medium text-slate-400 uppercase">Total</span>
                <span className="text-xs font-bold font-mono text-emerald-400">৳ {liveIncomeTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend percentages */}
            <div className="flex-1 space-y-2 text-xs">
              {incomeSources.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-4">No income entries found</div>
              ) : (
                incomeSources.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-xs">{s.name}</span>
                    </div>
                    <span className="font-semibold font-mono text-emerald-400 text-xs">{s.percent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION ROW 2: MODULE OVERVIEW CARDS (2 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Office Fund Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <span>Office Fund Overview</span>
            </h3>
            <button
              onClick={() => onSelectModule('office_fund')}
              className="text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[10px] font-medium text-slate-400 block">Received</span>
              <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
                ৳ {officeFundReceived.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[10px] font-medium text-slate-400 block">Spent</span>
              <span className="text-xs font-bold font-mono text-rose-400 mt-0.5 block">
                ৳ {officeFundSpent.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-center">
              <span className="text-[10px] font-medium text-slate-400 block">Remaining</span>
              <span className="text-xs font-bold font-mono text-indigo-300 mt-0.5 block">
                ৳ {officeFundRemaining.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>{officeFundSpentPercent}% spent</span>
              <span>{officeFundRemainingPercent}% remaining</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex border border-slate-700">
              <div className="bg-rose-500 h-full" style={{ width: `${officeFundSpentPercent}%` }} />
              <div className="bg-indigo-500 h-full" style={{ width: `${officeFundRemainingPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Loan & Due Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-red-400" />
              <span>Loan & Due</span>
            </h3>
            <button
              onClick={() => onSelectModule('loans')}
              className="text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-xs font-medium text-slate-300 block">You will receive</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                ৳ {receiveAmt.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <span className="text-xs font-medium text-slate-300 block">You will pay</span>
              <span className="text-base font-bold font-mono text-rose-400 mt-1 block">
                ৳ {payAmt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: DETAIL BREAKDOWNS (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* COLUMN 1: TOP EXPENSE CATEGORIES */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Top Expense Categories</span>
            </h3>
            <button
              onClick={() => onSelectModule('categories')}
              className="text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
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
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="font-semibold font-mono text-slate-200">৳ {c.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60">
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Recent Transactions</span>
            </h3>
            <button
              onClick={() => onSelectModule('transactions')}
              className="text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {recentTxs.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              No recent transactions recorded
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          isIncome ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{tx.description || 'Transaction'}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {formatDate(tx.date)} · <span className="text-slate-300">{catName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={`font-semibold font-mono text-xs ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                      </span>
                      {onViewVoucher && (
                        <button
                          onClick={() => onViewVoucher(tx)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Monthly Summary</span>
            </h3>
            <button
              onClick={() => onSelectModule('reports')}
              className="text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-2 text-slate-300 font-medium">Total Income</td>
                  <td className="py-2 text-right font-semibold font-mono text-emerald-400">৳ {totalIncome.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 font-medium">Total Expense</td>
                  <td className="py-2 text-right font-semibold font-mono text-rose-400">৳ {totalExpense.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-white">Net Balance</td>
                  <td className="py-2 text-right font-bold font-mono text-indigo-400">৳ {netBalance.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 font-medium">Cash in Hand</td>
                  <td className="py-2 text-right font-semibold font-mono text-emerald-300">৳ {cashAccount ? cashAccount.currentBalance.toLocaleString() : '0'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 font-medium">Office Fund Remaining</td>
                  <td className="py-2 text-right font-semibold font-mono text-amber-300">৳ {officeFundRemaining.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 font-medium">You will receive (Loan & Due)</td>
                  <td className="py-2 text-right font-semibold font-mono text-emerald-400">৳ {receiveAmt.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300 font-medium">You will pay (Loan & Due)</td>
                  <td className="py-2 text-right font-semibold font-mono text-rose-400">৳ {payAmt.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
