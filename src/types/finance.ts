export type Currency = 'BDT' | 'USD' | 'EUR';

export type AccountType = 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'other' | 'unpass_bill';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  openingBalance: number;
  currentBalance: number;
  currency: Currency;
  status: 'active' | 'archived';
  isOfficeAccount: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryPurpose = 'personal' | 'family' | 'office' | 'both';

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  purpose: CategoryPurpose;
  icon: string;
  color: string;
  isCustom: boolean;
  isArchived: boolean;
  subcategories?: Subcategory[];
}

export type TransactionType =
  | 'income'
  | 'personal_income'
  | 'salary_income'
  | 'additional_income'
  | 'personal_expense'
  | 'family_expense'
  | 'baby_expense'
  | 'mobile_expense'
  | 'office_fund_received'
  | 'office_money_received'
  | 'office_expense'
  | 'office_fund_returned'
  | 'office_money_returned'
  | 'money_received'
  | 'money_given'
  | 'account_transfer'
  | 'money_transfer'
  | 'savings_contribution'
  | 'savings'
  | 'investment'
  | 'loan_received'
  | 'loan_issued'
  | 'loan_given'
  | 'debt_repayment'
  | 'loan_repayment'
  | 'other_expense'
  | 'personal_expense_via_office'
  | 'savings_withdrawal'
  | 'receivable_collection'
  | 'refund'
  | 'opening_balance_adjustment'
  | 'reimbursement';

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  income: 'Income',
  personal_income: 'Income',
  salary_income: 'Income',
  additional_income: 'Income',
  personal_expense: 'Personal Expense',
  family_expense: 'Family Expense',
  baby_expense: 'Baby Expense',
  mobile_expense: 'Mobile Expense',
  office_fund_received: 'Office Money Received',
  office_money_received: 'Office Money Received',
  office_expense: 'Office Expense',
  office_fund_returned: 'Office Money Return',
  office_money_returned: 'Office Money Return',
  money_received: 'Money Received',
  receivable_collection: 'Money Received',
  money_given: 'Money Given',
  loan_issued: 'Money Given',
  account_transfer: 'Money Transfer',
  money_transfer: 'Money Transfer',
  savings_contribution: 'Savings',
  savings: 'Savings',
  investment: 'Investment',
  loan_received: 'Loan Received',
  loan_given: 'Loan Given',
  debt_repayment: 'Loan Repayment',
  loan_repayment: 'Loan Repayment',
  other_expense: 'Other Expense',
  personal_expense_via_office: 'Personal Expense (via Office)',
  savings_withdrawal: 'Savings Withdrawal',
  refund: 'Refund Received',
  reimbursement: 'Reimbursement',
  opening_balance_adjustment: 'Opening Balance Adjustment',
};

export const formatTransactionType = (type: string): string => {
  return TRANSACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ');
};

export type FinancialOwnership = 'personal' | 'office' | 'family';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: TransactionType;
  ownership: FinancialOwnership;
  amount: number;
  fee?: number; // e.g. bKash cashout charge
  sourceAccountId: string;
  destinationAccountId?: string; // for transfers
  categoryId: string;
  subcategoryId?: string;
  payeePayer: string; // Vendor, Employer, Lender, etc.
  description: string;
  referenceNumber?: string;
  receiptUrl?: string;
  tags: string[];
  notes?: string;
  relatedOfficeFundId?: string;
  relatedDebtId?: string;
  familyMember?: string;
  status: 'completed' | 'pending' | 'reversed';
  isApproved?: boolean; // When approved, entry CANNOT be edited or deleted
  isUnpassBill?: boolean; // UNPASS BIL hits live balance immediately without approval
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OfficeFundStatus =
  | 'open'
  | 'partially_settled'
  | 'fully_settled'
  | 'returned'
  | 'overdue'
  | 'requires_review';

export interface OfficeFund {
  id: string;
  title: string;
  dateReceived: string;
  amountReceived: number;
  employerSource: string;
  receivingAccountId: string;
  purpose: string;
  referenceNumber?: string;
  status: OfficeFundStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeFundSettlementSummary {
  fundId: string;
  fundTitle: string;
  dateReceived: string;
  totalReceived: number;
  officialExpenses: number;
  personalUse: number;
  returnedAmount: number;
  reimbursementDueToUser: number; // if user spent personal money on office
  unspentOfficeFundRemaining: number;
  settlementStatus: OfficeFundStatus;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  subcategoryId?: string;
  ownership: 'personal' | 'family' | 'overall';
  budgetAmount: number;
  alertThreshold: number; // percentage, e.g. 80
  rollover: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  accountId?: string;
  category: string;
  notes?: string;
  status: 'active' | 'achieved' | 'paused';
}

export type DebtType = 'loan_taken' | 'loan_given' | 'debt_owed' | 'receivable_owed';

export interface DebtReceivable {
  id: string;
  type: DebtType;
  title: string;
  counterparty: string;
  originalAmount: number;
  currentBalance: number;
  categoryId?: string;
  subcategoryId?: string;
  interestRate?: number;
  dueDate: string;
  accountId: string;
  status: 'active' | 'partially_paid' | 'settled' | 'overdue';
  notes?: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId: string;
  payeePayer: string;
  description: string;
  autoProcess: boolean;
  status: 'active' | 'paused' | 'cancelled';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'reverse' | 'delete' | 'settle' | 'restore';
  entity: 'transaction' | 'account' | 'office_fund' | 'budget' | 'debt' | 'settings';
  entityId: string;
  details: string;
  previousState?: any;
  newState?: any;
}

export interface UserSettings {
  appName: string;
  userName: string;
  userEmail: string;
  currency: Currency;
  currencySymbol: string;
  dateFormat: string;
  timezone: string;
  theme: 'light' | 'dark';
  monthlySalary: number;
  salaryPayDay: number;
  salaryEmployer: string;
  salaryAccountId: string;
  enableDemoData: boolean;
  approvalPassword?: string; // Required for final approval locking
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  year?: string; // YYYY
  transactionType?: TransactionType | 'all';
  ownership?: FinancialOwnership | 'all';
  categoryId?: string | 'all';
  subcategoryId?: string | 'all';
  accountId?: string | 'all';
  relatedOfficeFundId?: string | 'all';
  familyMember?: string | 'all';
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  includeUnapproved?: boolean;
  accounts?: Account[];
}

export interface FinancialSummary {
  openingBalance: number;
  totalPersonalIncome: number;
  totalSalaryIncome: number;
  totalAdditionalIncome: number;
  totalOfficeFundsReceived: number;
  totalOfficeExpenses: number;
  totalPersonalExpenses: number;
  totalFamilyExpenses: number;
  totalOtherExpenses: number;
  totalPersonalExpensesViaOffice: number;
  totalSavingsContributions: number;
  totalDebtRepayments: number;
  totalReceivablesCollected: number;
  totalLiabilitiesOutstanding: number;
  totalReceivablesOutstanding: number;
  totalCashAndBankBalances: number;
  netPersonalCashFlow: number;
  totalOfficeFundsUnspent: number;
  reimbursementsDueFromEmployer: number;
}
