import {
  Account,
  Budget,
  Category,
  DebtReceivable,
  OfficeFund,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';

export const INITIAL_USER_SETTINGS: UserSettings = {
  appName: 'Planet Finance',
  userName: 'Sabbir Ahmed',
  userEmail: 'sabbir@myfinance.bd',
  currency: 'BDT',
  currencySymbol: 'BDT',
  dateFormat: 'DD MMM YYYY',
  timezone: 'Asia/Dhaka',
  theme: 'light',
  monthlySalary: 0,
  salaryPayDay: 1,
  salaryEmployer: '',
  salaryAccountId: '',
  enableDemoData: false,
  approvalPassword: 'Sabbir@95AR',
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash_1',
    name: 'Cash in Hand',
    type: 'cash',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'BDT',
    status: 'active',
    isOfficeAccount: false,
    notes: 'Wallet cash reserve',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_bank_1',
    name: 'Bank Account',
    type: 'bank',
    accountNumber: '',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'BDT',
    status: 'active',
    isOfficeAccount: false,
    notes: 'Primary bank account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_bkash_1',
    name: 'bKash Personal',
    type: 'bkash',
    accountNumber: '',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'BDT',
    status: 'active',
    isOfficeAccount: false,
    notes: 'Mobile wallet',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_office_cash',
    name: 'Office Petty Cash',
    type: 'cash',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'BDT',
    status: 'active',
    isOfficeAccount: true,
    notes: 'Dedicated wallet for official advance funds',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // 1. Family Expense
  {
    id: 'cat_family_expense',
    name: 'Family Expense',
    type: 'expense',
    purpose: 'family',
    icon: 'Home',
    color: '#EF4444',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_fam_bazar', categoryId: 'cat_family_expense', name: 'Family Bazar' },
      { id: 'sub_fam_rent', categoryId: 'cat_family_expense', name: 'House Rent' },
      { id: 'sub_fam_elec', categoryId: 'cat_family_expense', name: 'Electricity Bill' },
      { id: 'sub_fam_gas', categoryId: 'cat_family_expense', name: 'Gas Bill' },
      { id: 'sub_fam_water', categoryId: 'cat_family_expense', name: 'Water Bill' },
      { id: 'sub_fam_food', categoryId: 'cat_family_expense', name: 'Family Food' },
      { id: 'sub_fam_clothing', categoryId: 'cat_family_expense', name: 'Family Clothing' },
      { id: 'sub_fam_household', categoryId: 'cat_family_expense', name: 'Household Items' },
      { id: 'sub_fam_transport', categoryId: 'cat_family_expense', name: 'Family Transport' },
      { id: 'sub_fam_internet', categoryId: 'cat_family_expense', name: 'Internet Bill' },
      { id: 'sub_fam_guest', categoryId: 'cat_family_expense', name: 'Guest Expense' },
      { id: 'sub_fam_other', categoryId: 'cat_family_expense', name: 'Family Other' },
    ],
  },

  // 2. Baby Expense
  {
    id: 'cat_baby_expense',
    name: 'Baby Expense',
    type: 'expense',
    purpose: 'family',
    icon: 'Heart',
    color: '#F43F5E',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_baby_food', categoryId: 'cat_baby_expense', name: 'Baby Food' },
      { id: 'sub_baby_milk', categoryId: 'cat_baby_expense', name: 'Milk Powder' },
      { id: 'sub_baby_diapers', categoryId: 'cat_baby_expense', name: 'Diapers' },
      { id: 'sub_baby_clothing', categoryId: 'cat_baby_expense', name: 'Baby Clothing' },
      { id: 'sub_baby_medicine', categoryId: 'cat_baby_expense', name: 'Baby Medicine' },
      { id: 'sub_baby_doctor', categoryId: 'cat_baby_expense', name: 'Doctor Visit' },
      { id: 'sub_baby_care', categoryId: 'cat_baby_expense', name: 'Baby Care Products' },
      { id: 'sub_baby_toys', categoryId: 'cat_baby_expense', name: 'Baby Toys' },
      { id: 'sub_baby_hygiene', categoryId: 'cat_baby_expense', name: 'Baby Hygiene' },
      { id: 'sub_baby_transport', categoryId: 'cat_baby_expense', name: 'Baby Transport' },
      { id: 'sub_baby_other', categoryId: 'cat_baby_expense', name: 'Baby Other' },
    ],
  },

  // 3. Mobile Expense
  {
    id: 'cat_mobile_expense',
    name: 'Mobile Expense',
    type: 'expense',
    purpose: 'personal',
    icon: 'Smartphone',
    color: '#06B6D4',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_mob_recharge', categoryId: 'cat_mobile_expense', name: 'Mobile Recharge' },
      { id: 'sub_mob_internet', categoryId: 'cat_mobile_expense', name: 'Internet Pack' },
      { id: 'sub_mob_sim', categoryId: 'cat_mobile_expense', name: 'SIM Expense' },
      { id: 'sub_mob_bill', categoryId: 'cat_mobile_expense', name: 'Mobile Bill' },
      { id: 'sub_mob_repair', categoryId: 'cat_mobile_expense', name: 'Mobile Repair' },
      { id: 'sub_mob_accessories', categoryId: 'cat_mobile_expense', name: 'Mobile Accessories' },
      { id: 'sub_mob_apps', categoryId: 'cat_mobile_expense', name: 'Apps and Subscription' },
      { id: 'sub_mob_purchase', categoryId: 'cat_mobile_expense', name: 'Mobile Purchase' },
      { id: 'sub_mob_other', categoryId: 'cat_mobile_expense', name: 'Mobile Other' },
    ],
  },

  // 4. Personal Expense
  {
    id: 'cat_personal_expense',
    name: 'Personal Expense',
    type: 'expense',
    purpose: 'personal',
    icon: 'User',
    color: '#8B5CF6',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_per_food', categoryId: 'cat_personal_expense', name: 'Personal Food' },
      { id: 'sub_per_tea', categoryId: 'cat_personal_expense', name: 'Tea and Snacks' },
      { id: 'sub_per_clothing', categoryId: 'cat_personal_expense', name: 'Personal Clothing' },
      { id: 'sub_per_shopping', categoryId: 'cat_personal_expense', name: 'Personal Shopping' },
      { id: 'sub_per_transport', categoryId: 'cat_personal_expense', name: 'Personal Transport' },
      { id: 'sub_per_haircut', categoryId: 'cat_personal_expense', name: 'Haircut' },
      { id: 'sub_per_care', categoryId: 'cat_personal_expense', name: 'Personal Care' },
      { id: 'sub_per_entertainment', categoryId: 'cat_personal_expense', name: 'Entertainment' },
      { id: 'sub_per_friends', categoryId: 'cat_personal_expense', name: 'Friends Expense' },
      { id: 'sub_per_other', categoryId: 'cat_personal_expense', name: 'Personal Other' },
    ],
  },

  // 5. Office Expense
  {
    id: 'cat_office_official_exp',
    name: 'Office Expense',
    type: 'expense',
    purpose: 'office',
    icon: 'Briefcase',
    color: '#6366F1',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_off_exp_transport', categoryId: 'cat_office_official_exp', name: 'Office Transport' },
      { id: 'sub_off_exp_document', categoryId: 'cat_office_official_exp', name: 'Document Expense' },
      { id: 'sub_off_exp_courier', categoryId: 'cat_office_official_exp', name: 'Courier Expense' },
      { id: 'sub_off_exp_printing', categoryId: 'cat_office_official_exp', name: 'Printing and Photocopy' },
      { id: 'sub_off_exp_stationery', categoryId: 'cat_office_official_exp', name: 'Office Stationery' },
      { id: 'sub_off_exp_client', categoryId: 'cat_office_official_exp', name: 'Client Visit' },
      { id: 'sub_off_exp_food', categoryId: 'cat_office_official_exp', name: 'Food During Duty' },
      { id: 'sub_off_exp_purchase', categoryId: 'cat_office_official_exp', name: 'Office Purchase' },
      { id: 'sub_off_exp_bill', categoryId: 'cat_office_official_exp', name: 'Office Bill' },
      { id: 'sub_off_exp_other', categoryId: 'cat_office_official_exp', name: 'Office Other' },
    ],
  },

  // 6. Business Expense
  {
    id: 'cat_business_expense',
    name: 'Business Expense',
    type: 'expense',
    purpose: 'office',
    icon: 'Building',
    color: '#10B981',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_bus_purchase', categoryId: 'cat_business_expense', name: 'Product Purchase' },
      { id: 'sub_bus_packaging', categoryId: 'cat_business_expense', name: 'Packaging' },
      { id: 'sub_bus_delivery', categoryId: 'cat_business_expense', name: 'Delivery Charge' },
      { id: 'sub_bus_transport', categoryId: 'cat_business_expense', name: 'Transport' },
      { id: 'sub_bus_rent', categoryId: 'cat_business_expense', name: 'Shop Rent' },
      { id: 'sub_bus_employee', categoryId: 'cat_business_expense', name: 'Employee Payment' },
      { id: 'sub_bus_marketing', categoryId: 'cat_business_expense', name: 'Marketing' },
      { id: 'sub_bus_repair', categoryId: 'cat_business_expense', name: 'Repair and Maintenance' },
      { id: 'sub_bus_bill', categoryId: 'cat_business_expense', name: 'Business Bill' },
      { id: 'sub_bus_other', categoryId: 'cat_business_expense', name: 'Business Other' },
    ],
  },

  // 7. Medical Expense
  {
    id: 'cat_medical',
    name: 'Medical Expense',
    type: 'expense',
    purpose: 'personal',
    icon: 'Activity',
    color: '#14B8A6',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_med_doctor', categoryId: 'cat_medical', name: 'Doctor Fee' },
      { id: 'sub_med_medicine', categoryId: 'cat_medical', name: 'Medicine' },
      { id: 'sub_med_test', categoryId: 'cat_medical', name: 'Medical Test' },
      { id: 'sub_med_hospital', categoryId: 'cat_medical', name: 'Hospital Expense' },
      { id: 'sub_med_emergency', categoryId: 'cat_medical', name: 'Emergency Treatment' },
      { id: 'sub_med_dental', categoryId: 'cat_medical', name: 'Dental Care' },
      { id: 'sub_med_eye', categoryId: 'cat_medical', name: 'Eye Care' },
      { id: 'sub_med_other', categoryId: 'cat_medical', name: 'Medical Other' },
    ],
  },

  // 8. Loan and Due
  {
    id: 'cat_loan_due',
    name: 'Loan and Due',
    type: 'expense',
    purpose: 'personal',
    icon: 'CreditCard',
    color: '#F59E0B',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_loan_lent', categoryId: 'cat_loan_due', name: 'Money Lent' },
      { id: 'sub_loan_borrowed', categoryId: 'cat_loan_due', name: 'Money Borrowed' },
      { id: 'sub_loan_repayment', categoryId: 'cat_loan_due', name: 'Loan Repayment' },
      { id: 'sub_loan_installment', categoryId: 'cat_loan_due', name: 'Installment' },
      { id: 'sub_loan_interest', categoryId: 'cat_loan_due', name: 'Interest Payment' },
      { id: 'sub_loan_due_payment', categoryId: 'cat_loan_due', name: 'Due Payment' },
      { id: 'sub_loan_received_back', categoryId: 'cat_loan_due', name: 'Money Received Back' },
      { id: 'sub_loan_other', categoryId: 'cat_loan_due', name: 'Loan and Due Other' },
    ],
  },

  // 9. Savings and Investment
  {
    id: 'cat_savings_investment',
    name: 'Savings and Investment',
    type: 'expense',
    purpose: 'personal',
    icon: 'PiggyBank',
    color: '#3B82F6',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_sav_bank', categoryId: 'cat_savings_investment', name: 'Bank Savings' },
      { id: 'sub_sav_dps', categoryId: 'cat_savings_investment', name: 'DPS' },
      { id: 'sub_sav_fd', categoryId: 'cat_savings_investment', name: 'Fixed Deposit' },
      { id: 'sub_sav_business', categoryId: 'cat_savings_investment', name: 'Business Investment' },
      { id: 'sub_sav_crypto', categoryId: 'cat_savings_investment', name: 'Crypto Investment' },
      { id: 'sub_sav_emergency', categoryId: 'cat_savings_investment', name: 'Emergency Fund' },
      { id: 'sub_sav_other', categoryId: 'cat_savings_investment', name: 'Other Investment' },
    ],
  },

  // 10. Other Expense
  {
    id: 'cat_other_expense',
    name: 'Other Expense',
    type: 'expense',
    purpose: 'personal',
    icon: 'MoreHorizontal',
    color: '#64748B',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_oth_exp_donation', categoryId: 'cat_other_expense', name: 'Donation' },
      { id: 'sub_oth_exp_gift', categoryId: 'cat_other_expense', name: 'Gift' },
      { id: 'sub_oth_exp_penalty', categoryId: 'cat_other_expense', name: 'Fine and Penalty' },
      { id: 'sub_oth_exp_emergency', categoryId: 'cat_other_expense', name: 'Emergency Expense' },
      { id: 'sub_oth_exp_other', categoryId: 'cat_other_expense', name: 'Other Expense' },
    ],
  },

  // --- Income Categories ---
  // 11. Salary Income
  {
    id: 'cat_salary',
    name: 'Salary Income',
    type: 'income',
    purpose: 'personal',
    icon: 'Briefcase',
    color: '#0284C7',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_sal_monthly', categoryId: 'cat_salary', name: 'Monthly Salary' },
      { id: 'sub_sal_bonus', categoryId: 'cat_salary', name: 'Bonus' },
      { id: 'sub_sal_overtime', categoryId: 'cat_salary', name: 'Overtime' },
      { id: 'sub_sal_other', categoryId: 'cat_salary', name: 'Other Salary Income' },
    ],
  },

  // 12. Business Income
  {
    id: 'cat_business_income',
    name: 'Business Income',
    type: 'income',
    purpose: 'personal',
    icon: 'Laptop',
    color: '#059669',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_bus_sales', categoryId: 'cat_business_income', name: 'Product Sales' },
      { id: 'sub_bus_service', categoryId: 'cat_business_income', name: 'Service Income' },
      { id: 'sub_bus_profit', categoryId: 'cat_business_income', name: 'Business Profit' },
      { id: 'sub_bus_inc_other', categoryId: 'cat_business_income', name: 'Other Business Income' },
    ],
  },

  // 13. Other Income
  {
    id: 'cat_other_income',
    name: 'Other Income',
    type: 'income',
    purpose: 'personal',
    icon: 'Laptop',
    color: '#8257E5',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_inc_commission', categoryId: 'cat_other_income', name: 'Commission' },
      { id: 'sub_inc_freelance', categoryId: 'cat_other_income', name: 'Freelance Income' },
      { id: 'sub_inc_gift', categoryId: 'cat_other_income', name: 'Gift Received' },
      { id: 'sub_inc_refund', categoryId: 'cat_other_income', name: 'Refund Received' },
      { id: 'sub_inc_other', categoryId: 'cat_other_income', name: 'Other Income' },
    ],
  },

  // --- Office Money Categories ---
  // 14. Office Money Received
  {
    id: 'cat_office_advance',
    name: 'Office Money Received',
    type: 'income',
    purpose: 'office',
    icon: 'Building',
    color: '#8B5CF6',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_off_rcvd_advance', categoryId: 'cat_office_advance', name: 'Office Advance' },
      { id: 'sub_off_rcvd_cash', categoryId: 'cat_office_advance', name: 'Office Cash Received' },
      { id: 'sub_off_rcvd_fund', categoryId: 'cat_office_advance', name: 'Office Expense Fund' },
    ],
  },

  // 15. Office Money Returned
  {
    id: 'cat_office_money_returned',
    name: 'Office Money Returned',
    type: 'expense',
    purpose: 'office',
    icon: 'Building',
    color: '#D97706',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_off_ret_cash', categoryId: 'cat_office_money_returned', name: 'Cash Returned to Office' },
      { id: 'sub_off_ret_unused', categoryId: 'cat_office_money_returned', name: 'Unused Office Advance Returned' },
      { id: 'sub_off_ret_adjustment', categoryId: 'cat_office_money_returned', name: 'Expense Adjustment' },
    ],
  },

  // 16. Money Received
  {
    id: 'cat_money_received',
    name: 'Money Received',
    type: 'income',
    purpose: 'personal',
    icon: 'Building',
    color: '#16A34A',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_mrcvd_personal', categoryId: 'cat_money_received', name: 'Personal Borrowed' },
      { id: 'sub_mrcvd_family', categoryId: 'cat_money_received', name: 'Family Borrowed' },
      { id: 'sub_mrcvd_bank', categoryId: 'cat_money_received', name: 'Bank Loan' },
      { id: 'sub_mrcvd_micro', categoryId: 'cat_money_received', name: 'Microcredit Loan' },
      { id: 'sub_mrcvd_repay', categoryId: 'cat_money_received', name: 'Repayment Received' },
      { id: 'sub_mrcvd_adv', categoryId: 'cat_money_received', name: 'Advance Received' },
      { id: 'sub_mrcvd_emerg', categoryId: 'cat_money_received', name: 'Emergency Loan' },
      { id: 'sub_mrcvd_other', categoryId: 'cat_money_received', name: 'Other Received' },
    ],
  },

  // 17. Money Given
  {
    id: 'cat_money_given',
    name: 'Money Given',
    type: 'expense',
    purpose: 'personal',
    icon: 'Building',
    color: '#DC2626',
    isCustom: false,
    isArchived: false,
    subcategories: [
      { id: 'sub_mgiv_personal', categoryId: 'cat_money_given', name: 'Personal Loan' },
      { id: 'sub_mgiv_family', categoryId: 'cat_money_given', name: 'Family Loan' },
      { id: 'sub_mgiv_friend', categoryId: 'cat_money_given', name: 'Friend Loan' },
      { id: 'sub_mgiv_adv', categoryId: 'cat_money_given', name: 'Advance Payment' },
      { id: 'sub_mgiv_business', categoryId: 'cat_money_given', name: 'Business Loan' },
      { id: 'sub_mgiv_emerg', categoryId: 'cat_money_given', name: 'Emergency Help' },
      { id: 'sub_mgiv_other', categoryId: 'cat_money_given', name: 'Other Given' },
    ],
  },
];

export const INITIAL_OFFICE_FUNDS: OfficeFund[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export const INITIAL_DEBTS: DebtReceivable[] = [];

export const INITIAL_RECURRING: RecurringTransaction[] = [];

