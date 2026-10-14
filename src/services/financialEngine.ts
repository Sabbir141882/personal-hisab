import {
  Account,
  Budget,
  Category,
  DebtReceivable,
  FilterOptions,
  FinancialSummary,
  OfficeFund,
  OfficeFundSettlementSummary,
  Transaction,
  TransactionType,
} from '../types/finance';

// Currency formatting utility for Bangladeshi Taka (BDT)
export const formatCurrency = (amount: number, symbol = 'BDT'): string => {
  const cleanSymbol = (!symbol || symbol === '৳' || symbol.includes('৳') || symbol.toLowerCase().includes('taka')) ? 'BDT' : symbol;
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${cleanSymbol} 0.00`;
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${cleanSymbol} ${formatted}`;
};

// Pure number formatting utility for tables without currency symbol prefix
export const formatNumberOnly = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${formatted}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Filter transactions based on date, account, category, ownership, search query, etc.
 */
export const filterTransactions = (
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] => {
  return transactions.filter((tx) => {
    // Exclude reversed transactions if needed or filter by status
    if (tx.status === 'reversed') return false;

    // Date filtering
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;
    if (filters.month && !tx.date.startsWith(filters.month)) return false;
    if (filters.year && !tx.date.startsWith(filters.year)) return false;

    // Transaction Type
    if (filters.transactionType && filters.transactionType !== 'all') {
      if (tx.type !== filters.transactionType) return false;
    }

    // Ownership
    if (filters.ownership && filters.ownership !== 'all') {
      if (tx.ownership !== filters.ownership) return false;
    }

    // Category
    if (filters.categoryId && filters.categoryId !== 'all') {
      if (tx.categoryId !== filters.categoryId) return false;
    }

    // Subcategory
    if (filters.subcategoryId && filters.subcategoryId !== 'all') {
      if (tx.subcategoryId !== filters.subcategoryId) return false;
    }

    // Account
    if (filters.accountId && filters.accountId !== 'all') {
      if (tx.sourceAccountId !== filters.accountId && tx.destinationAccountId !== filters.accountId) {
        return false;
      }
    }

    // Related Office Fund
    if (filters.relatedOfficeFundId && filters.relatedOfficeFundId !== 'all') {
      if (tx.relatedOfficeFundId !== filters.relatedOfficeFundId) return false;
    }

    // Family Member
    if (filters.familyMember && filters.familyMember !== 'all') {
      if (tx.familyMember !== filters.familyMember) return false;
    }

    // Amount Range
    if (filters.minAmount !== undefined && tx.amount < filters.minAmount) return false;
    if (filters.maxAmount !== undefined && tx.amount > filters.maxAmount) return false;

    // Search Query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchPayee = tx.payeePayer.toLowerCase().includes(q);
      const matchRef = (tx.referenceNumber || '').toLowerCase().includes(q);
      const matchTag = tx.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchDesc && !matchPayee && !matchRef && !matchTag) return false;
    }

    return true;
  });
};

/**
 * Calculates current real balance for each account based on opening balances + active transaction ledger
 */
export const calculateAccountBalances = (
  accounts: Account[],
  transactions: Transaction[]
): Account[] => {
  const balanceMap = new Map<string, number>();

  // Set opening balances
  accounts.forEach((acc) => {
    balanceMap.set(acc.id, acc.openingBalance || 0);
  });

  const activeTxs = transactions.filter((t) => t.status === 'completed');

  // Process in chronological order
  activeTxs.sort((a, b) => a.date.localeCompare(b.date));

  activeTxs.forEach((tx) => {
    const amount = tx.amount;
    const fee = tx.fee || 0;

    switch (tx.type) {
      case 'personal_income':
      case 'salary_income':
      case 'additional_income':
      case 'office_fund_received':
      case 'loan_received':
      case 'receivable_collection':
      case 'refund':
      case 'reimbursement': {
        const current = balanceMap.get(tx.sourceAccountId) || 0;
        balanceMap.set(tx.sourceAccountId, current + amount - fee);
        break;
      }

      case 'office_expense':
      case 'personal_expense':
      case 'family_expense':
      case 'personal_expense_via_office':
      case 'loan_issued':
      case 'debt_repayment':
      case 'office_fund_returned': {
        const current = balanceMap.get(tx.sourceAccountId) || 0;
        balanceMap.set(tx.sourceAccountId, current - amount - fee);
        break;
      }

      case 'account_transfer':
      case 'savings_contribution':
      case 'savings_withdrawal': {
        // Decrease source
        const srcCurrent = balanceMap.get(tx.sourceAccountId) || 0;
        balanceMap.set(tx.sourceAccountId, srcCurrent - amount - fee);

        // Increase destination if specified
        if (tx.destinationAccountId) {
          const destCurrent = balanceMap.get(tx.destinationAccountId) || 0;
          balanceMap.set(tx.destinationAccountId, destCurrent + amount);
        }
        break;
      }

      case 'opening_balance_adjustment': {
        // Direct setting or adjustment
        balanceMap.set(tx.sourceAccountId, amount);
        break;
      }
    }
  });

  return accounts.map((acc) => ({
    ...acc,
    currentBalance: balanceMap.get(acc.id) ?? acc.openingBalance,
  }));
};

/**
 * Calculates the complete financial overview summary
 */
export const calculateFinancialSummary = (
  transactions: Transaction[],
  accounts: Account[],
  officeFunds: OfficeFund[],
  debts: DebtReceivable[],
  filters: FilterOptions = {}
): FinancialSummary => {
  const filteredTxs = filterTransactions(transactions, filters);

  let totalSalaryIncome = 0;
  let totalAdditionalIncome = 0;
  let totalOtherPersonalIncome = 0;
  let totalOfficeFundsReceived = 0;

  let totalOfficeExpenses = 0;
  let totalPersonalExpenses = 0;
  let totalFamilyExpenses = 0;
  let totalOtherExpenses = 0;
  let totalPersonalExpensesViaOffice = 0;

  let totalSavingsContributions = 0;
  let totalDebtRepayments = 0;
  let totalReceivablesCollected = 0;

  filteredTxs.forEach((tx) => {
    switch (tx.type) {
      case 'salary_income':
        totalSalaryIncome += tx.amount;
        break;
      case 'additional_income':
        totalAdditionalIncome += tx.amount;
        break;
      case 'personal_income':
        totalOtherPersonalIncome += tx.amount;
        break;
      case 'office_fund_received':
        totalOfficeFundsReceived += tx.amount;
        break;

      case 'office_expense':
        totalOfficeExpenses += tx.amount;
        break;
      case 'personal_expense':
        totalPersonalExpenses += tx.amount;
        break;
      case 'family_expense':
        totalFamilyExpenses += tx.amount;
        break;
      case 'personal_expense_via_office':
        totalPersonalExpensesViaOffice += tx.amount;
        // Personal spending using office funds is personal expense!
        totalPersonalExpenses += tx.amount;
        break;

      case 'savings_contribution':
        totalSavingsContributions += tx.amount;
        break;
      case 'debt_repayment':
        totalDebtRepayments += tx.amount;
        break;
      case 'receivable_collection':
        totalReceivablesCollected += tx.amount;
        break;
      default:
        break;
    }
  });

  const totalPersonalIncome = totalSalaryIncome + totalAdditionalIncome + totalOtherPersonalIncome;

  // Net personal cash flow = Personal Income - Personal Expenses - Family Expenses
  const netPersonalCashFlow = totalPersonalIncome - totalPersonalExpenses - totalFamilyExpenses;

  // Total cash & bank balances
  const calculatedAccounts = calculateAccountBalances(accounts, transactions);
  const totalCashAndBankBalances = calculatedAccounts
    .filter((a) => a.status === 'active')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  // Outstanding liabilities and receivables
  const totalLiabilitiesOutstanding = debts
    .filter((d) => (d.type === 'loan_taken' || d.type === 'debt_owed') && d.status !== 'settled')
    .reduce((sum, d) => sum + d.currentBalance, 0);

  const totalReceivablesOutstanding = debts
    .filter((d) => (d.type === 'loan_given' || d.type === 'receivable_owed') && d.status !== 'settled')
    .reduce((sum, d) => sum + d.currentBalance, 0);

  // Office funds unspent calculation
  const officeSettlements = officeFunds.map((fund) =>
    calculateOfficeFundSettlement(fund.id, officeFunds, transactions)
  );

  const totalOfficeFundsUnspent = officeSettlements.reduce(
    (sum, s) => sum + Math.max(0, s.unspentOfficeFundRemaining),
    0
  );

  const reimbursementsDueFromEmployer = officeSettlements.reduce(
    (sum, s) => sum + s.reimbursementDueToUser,
    0
  );

  return {
    openingBalance: accounts.reduce((sum, a) => sum + a.openingBalance, 0),
    totalPersonalIncome,
    totalSalaryIncome,
    totalAdditionalIncome,
    totalOfficeFundsReceived,
    totalOfficeExpenses,
    totalPersonalExpenses,
    totalFamilyExpenses,
    totalOtherExpenses,
    totalPersonalExpensesViaOffice,
    totalSavingsContributions,
    totalDebtRepayments,
    totalReceivablesCollected,
    totalLiabilitiesOutstanding,
    totalReceivablesOutstanding,
    totalCashAndBankBalances,
    netPersonalCashFlow,
    totalOfficeFundsUnspent,
    reimbursementsDueFromEmployer,
  };
};

/**
 * Calculates accurate settlement position for an Office Fund / Advance
 */
export const calculateOfficeFundSettlement = (
  fundId: string,
  officeFunds: OfficeFund[],
  transactions: Transaction[]
): OfficeFundSettlementSummary => {
  const fund = officeFunds.find((f) => f.id === fundId);
  if (!fund) {
    return {
      fundId,
      fundTitle: 'Unknown Fund',
      dateReceived: '',
      totalReceived: 0,
      officialExpenses: 0,
      personalUse: 0,
      returnedAmount: 0,
      reimbursementDueToUser: 0,
      unspentOfficeFundRemaining: 0,
      settlementStatus: 'open',
    };
  }

  // Find all active transactions linked to this office fund ID
  const fundTxs = transactions.filter(
    (t) => t.relatedOfficeFundId === fundId && t.status === 'completed'
  );

  let officialExpenses = 0;
  let personalUse = 0;
  let returnedAmount = 0;

  fundTxs.forEach((tx) => {
    if (tx.type === 'office_expense') {
      officialExpenses += tx.amount;
    } else if (tx.type === 'personal_expense_via_office') {
      personalUse += tx.amount;
    } else if (tx.type === 'office_fund_returned') {
      returnedAmount += tx.amount;
    }
  });

  const totalReceived = fund.amountReceived;
  const totalAccountedFor = officialExpenses + personalUse + returnedAmount;

  let unspentOfficeFundRemaining = totalReceived - totalAccountedFor;
  let reimbursementDueToUser = 0;

  if (unspentOfficeFundRemaining < 0) {
    // User spent more than the advance using personal money! Employer owes reimbursement.
    reimbursementDueToUser = Math.abs(unspentOfficeFundRemaining);
    unspentOfficeFundRemaining = 0;
  }

  let settlementStatus: OfficeFund['status'] = fund.status;
  if (unspentOfficeFundRemaining === 0 && totalAccountedFor > 0) {
    settlementStatus = 'fully_settled';
  } else if (totalAccountedFor > 0) {
    settlementStatus = 'partially_settled';
  }

  return {
    fundId: fund.id,
    fundTitle: fund.title,
    dateReceived: fund.dateReceived,
    totalReceived,
    officialExpenses,
    personalUse,
    returnedAmount,
    reimbursementDueToUser,
    unspentOfficeFundRemaining,
    settlementStatus,
  };
};

/**
 * Calculates budget utilization for a specific month
 */
export const calculateBudgetUtilization = (
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month: string
) => {
  const monthTxs = transactions.filter(
    (t) =>
      t.status === 'completed' &&
      t.date.startsWith(month) &&
      (t.type === 'personal_expense' ||
        t.type === 'family_expense' ||
        t.type === 'personal_expense_via_office')
  );

  return budgets
    .filter((b) => b.month === month)
    .map((b) => {
      const category = categories.find((c) => c.id === b.categoryId);
      const categoryTxs = monthTxs.filter((t) => {
        if (t.categoryId !== b.categoryId) return false;
        if (b.subcategoryId && t.subcategoryId !== b.subcategoryId) return false;
        if (b.ownership !== 'overall' && t.ownership !== b.ownership) return false;
        return true;
      });

      const actualSpent = categoryTxs.reduce((sum, t) => sum + t.amount, 0);
      const remaining = b.budgetAmount - actualSpent;
      const percentageUsed = b.budgetAmount > 0 ? (actualSpent / b.budgetAmount) * 100 : 0;
      const isOverBudget = actualSpent > b.budgetAmount;

      return {
        budget: b,
        categoryName: category?.name || 'Uncategorized',
        actualSpent,
        remaining,
        percentageUsed,
        isOverBudget,
      };
    });
};
