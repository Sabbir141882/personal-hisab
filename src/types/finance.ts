export type Currency = 'BDT' | 'USD' | 'EUR';

export type AccountType = 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket' | 'other';

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
  | 'personal_income'
  | 'salary_income'
  | 'additional_income'
  | 'office_fund_received'
  | 'office_expense'
  | 'personal_expense'
  | 'family_expense'
  | 'personal_expense_via_office'
  | 'account_transfer'
  | 'savings_contribution'
  | 'savings_withdrawal'
  | 'loan_received'
  | 'loan_issued'
  | 'debt_repayment'
  | 'receivable_collection'
  | 'refund'
  | 'office_fund_returned'
  | 'opening_balance_adjustment'
  | 'reimbursement';

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
