import {
  Account,
  AuditEvent,
  Budget,
  Category,
  DebtReceivable,
  OfficeFund,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_DEBTS,
  INITIAL_OFFICE_FUNDS,
  INITIAL_RECURRING,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_SETTINGS,
} from './sampleData';

const STORAGE_KEYS = {
  SETTINGS: 'myfinance_settings_v3',
  ACCOUNTS: 'myfinance_accounts_v3',
  CATEGORIES: 'myfinance_categories_v3',
  TRANSACTIONS: 'myfinance_transactions_v3',
  OFFICE_FUNDS: 'myfinance_office_funds_v3',
  BUDGETS: 'myfinance_budgets_v3',
  SAVINGS_GOALS: 'myfinance_savings_goals_v3',
  DEBTS: 'myfinance_debts_v3',
  RECURRING: 'myfinance_recurring_v3',
  AUDIT_LOGS: 'myfinance_audit_logs_v3',
};

// Helper function to read from LocalStorage
const getStorageItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading storage key "${key}":`, error);
    return fallback;
  }
};

// Helper function to write to LocalStorage
const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting storage key "${key}":`, error);
  }
};

export const loadSettings = (): UserSettings =>
  getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, INITIAL_USER_SETTINGS);

export const saveSettings = (settings: UserSettings): void =>
  setStorageItem(STORAGE_KEYS.SETTINGS, settings);

export const loadAccounts = (): Account[] =>
  getStorageItem<Account[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);

export const saveAccounts = (accounts: Account[]): void =>
  setStorageItem(STORAGE_KEYS.ACCOUNTS, accounts);

export const loadCategories = (): Category[] =>
  getStorageItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);

export const saveCategories = (categories: Category[]): void =>
  setStorageItem(STORAGE_KEYS.CATEGORIES, categories);

export const loadTransactions = (): Transaction[] =>
  getStorageItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

export const saveTransactions = (transactions: Transaction[]): void =>
  setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions);

export const loadOfficeFunds = (): OfficeFund[] =>
  getStorageItem<OfficeFund[]>(STORAGE_KEYS.OFFICE_FUNDS, INITIAL_OFFICE_FUNDS);

export const saveOfficeFunds = (funds: OfficeFund[]): void =>
  setStorageItem(STORAGE_KEYS.OFFICE_FUNDS, funds);

export const loadBudgets = (): Budget[] =>
  getStorageItem<Budget[]>(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);

export const saveBudgets = (budgets: Budget[]): void =>
  setStorageItem(STORAGE_KEYS.BUDGETS, budgets);

export const loadSavingsGoals = (): SavingsGoal[] =>
  getStorageItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, INITIAL_SAVINGS_GOALS);

export const saveSavingsGoals = (goals: SavingsGoal[]): void =>
  setStorageItem(STORAGE_KEYS.SAVINGS_GOALS, goals);

export const loadDebts = (): DebtReceivable[] =>
  getStorageItem<DebtReceivable[]>(STORAGE_KEYS.DEBTS, INITIAL_DEBTS);

export const saveDebts = (debts: DebtReceivable[]): void =>
  setStorageItem(STORAGE_KEYS.DEBTS, debts);

export const loadRecurring = (): RecurringTransaction[] =>
  getStorageItem<RecurringTransaction[]>(STORAGE_KEYS.RECURRING, INITIAL_RECURRING);

export const saveRecurring = (recurring: RecurringTransaction[]): void =>
  setStorageItem(STORAGE_KEYS.RECURRING, recurring);

export const loadAuditLogs = (): AuditEvent[] =>
  getStorageItem<AuditEvent[]>(STORAGE_KEYS.AUDIT_LOGS, []);

export const addAuditLog = (
  action: AuditEvent['action'],
  entity: AuditEvent['entity'],
  entityId: string,
  details: string,
  previousState?: any,
  newState?: any
): void => {
  const logs = loadAuditLogs();
  const event: AuditEvent = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    action,
    entity,
    entityId,
    details,
    previousState,
    newState,
  };
  setStorageItem(STORAGE_KEYS.AUDIT_LOGS, [event, ...logs].slice(0, 500));
};

export const resetToInitialDemoData = (): void => {
  saveSettings(INITIAL_USER_SETTINGS);
  saveAccounts(INITIAL_ACCOUNTS);
  saveCategories(INITIAL_CATEGORIES);
  saveTransactions(INITIAL_TRANSACTIONS);
  saveOfficeFunds(INITIAL_OFFICE_FUNDS);
  saveBudgets(INITIAL_BUDGETS);
  saveSavingsGoals(INITIAL_SAVINGS_GOALS);
  saveDebts(INITIAL_DEBTS);
  saveRecurring(INITIAL_RECURRING);
  addAuditLog('restore', 'settings', 'system', 'Reset database to initial sample data state');
};

export const clearAllData = (): void => {
  saveAccounts([]);
  saveCategories(INITIAL_CATEGORIES); // Keep base categories
  saveTransactions([]);
  saveOfficeFunds([]);
  saveBudgets([]);
  saveSavingsGoals([]);
  saveDebts([]);
  saveRecurring([]);
  addAuditLog('delete', 'settings', 'system', 'Cleared all user ledger data');
};

export const createExportBackupPayload = () => {
  return {
    version: '3.0.0',
    exportDate: new Date().toISOString(),
    appName: 'My Finance',
    settings: loadSettings(),
    accounts: loadAccounts(),
    categories: loadCategories(),
    transactions: loadTransactions(),
    officeFunds: loadOfficeFunds(),
    budgets: loadBudgets(),
    savingsGoals: loadSavingsGoals(),
    debts: loadDebts(),
    recurring: loadRecurring(),
    auditLogs: loadAuditLogs(),
  };
};

export const restoreFromBackupPayload = (data: any): { success: boolean; message: string } => {
  if (!data || typeof data !== 'object') {
    return { success: false, message: 'Invalid backup JSON file structure.' };
  }
  if (!data.transactions || !Array.isArray(data.transactions)) {
    return { success: false, message: 'Backup file missing valid transactions list.' };
  }
  if (!data.accounts || !Array.isArray(data.accounts)) {
    return { success: false, message: 'Backup file missing valid accounts list.' };
  }

  try {
    if (data.settings) saveSettings(data.settings);
    saveAccounts(data.accounts);
    if (data.categories) saveCategories(data.categories);
    saveTransactions(data.transactions);
    if (data.officeFunds) saveOfficeFunds(data.officeFunds);
    if (data.budgets) saveBudgets(data.budgets);
    if (data.savingsGoals) saveSavingsGoals(data.savingsGoals);
    if (data.debts) saveDebts(data.debts);
    if (data.recurring) saveRecurring(data.recurring);
    if (data.auditLogs) setStorageItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

    addAuditLog('restore', 'settings', 'backup', 'Successfully restored database from backup file');
    return { success: true, message: 'Backup successfully restored!' };
  } catch (error: any) {
    return { success: false, message: `Failed to restore data: ${error.message}` };
  }
};
