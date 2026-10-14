import React, { useState } from 'react';
import {
  Account,
  Budget,
  Category,
  DebtReceivable,
  OfficeFund,
  SavingsGoal,
  Transaction,
  UserSettings,
} from './types/finance';
import {
  clearAllData,
  loadAccounts,
  loadBudgets,
  loadCategories,
  loadDebts,
  loadOfficeFunds,
  loadSavingsGoals,
  loadSettings,
  loadTransactions,
  resetToInitialDemoData,
  saveAccounts,
  saveBudgets,
  saveCategories,
  saveDebts,
  saveOfficeFunds,
  saveSavingsGoals,
  saveSettings,
  saveTransactions,
} from './services/storage';
import {
  calculateAccountBalances,
  calculateFinancialSummary,
} from './services/financialEngine';

import { ModuleId, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TransactionFormModal } from './components/common/TransactionFormModal';
import { OfficeFundModal } from './components/common/OfficeFundModal';
import { TransferModal } from './components/common/TransferModal';
import { ApproveLockModal } from './components/common/ApproveLockModal';

import { DashboardModule } from './components/modules/DashboardModule';
import { TransactionsModule } from './components/modules/TransactionsModule';
import { IncomeModule } from './components/modules/IncomeModule';
import { ExpenseModule } from './components/modules/ExpenseModule';
import { OfficeFundModule } from './components/modules/OfficeFundModule';
import { AccountsModule } from './components/modules/AccountsModule';
import { CategoriesModule } from './components/modules/CategoriesModule';
import { BudgetsModule } from './components/modules/BudgetsModule';
import { SavingsModule } from './components/modules/SavingsModule';
import { LoansModule } from './components/modules/LoansModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { PdfReportsModule } from './components/modules/PdfReportsModule';
import { BackupRestoreModule } from './components/modules/BackupRestoreModule';
import { SettingsModule } from './components/modules/SettingsModule';

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');

  // Application Data States
  const [userSettings, setUserSettings] = useState<UserSettings>(loadSettings());
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts());
  const [categories, setCategories] = useState<Category[]>(loadCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions());
  const [officeFunds, setOfficeFunds] = useState<OfficeFund[]>(loadOfficeFunds());
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(loadSavingsGoals());
  const [debts, setDebts] = useState<DebtReceivable[]>(loadDebts());

  // Modal Control States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<string>('personal_expense');

  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Recalculate account balances based on active transaction ledger
  const calculatedAccounts = calculateAccountBalances(accounts, transactions);

  // Authoritative financial summary
  const summary = calculateFinancialSummary(
    transactions,
    calculatedAccounts,
    officeFunds,
    debts
  );

  // Synchronization helpers
  const refreshAllStateFromStorage = () => {
    setUserSettings(loadSettings());
    setAccounts(loadAccounts());
    setCategories(loadCategories());
    setTransactions(loadTransactions());
    setOfficeFunds(loadOfficeFunds());
    setBudgets(loadBudgets());
    setSavingsGoals(loadSavingsGoals());
    setDebts(loadDebts());
  };

  // Handlers for Transactions
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    // If editing an approved entry, reject!
    if (txData.id) {
      const existing = transactions.find((t) => t.id === txData.id);
      if (existing && existing.isApproved) {
        alert('This entry has been approved and locked. It cannot be modified or edited!');
        return;
      }
    }

    let updatedTxs: Transaction[];
    if (txData.id) {
      // Edit existing unapproved record
      updatedTxs = transactions.map((t) => (t.id === txData.id ? ({ ...t, ...txData } as Transaction) : t));
    } else {
      // Create new record (starts as unapproved / editable)
      const newTx: Transaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        date: txData.date || new Date().toISOString().split('T')[0],
        time: txData.time || '12:00',
        type: txData.type || 'personal_expense',
        ownership: txData.ownership || 'personal',
        amount: txData.amount || 0,
        fee: txData.fee || 0,
        sourceAccountId: txData.sourceAccountId || accounts[0]?.id || '',
        destinationAccountId: txData.destinationAccountId,
        categoryId: txData.categoryId || categories[0]?.id || '',
        subcategoryId: txData.subcategoryId,
        payeePayer: txData.payeePayer || 'Vendor',
        description: txData.description || 'Transaction',
        referenceNumber: txData.referenceNumber,
        relatedOfficeFundId: txData.relatedOfficeFundId,
        familyMember: txData.familyMember,
        tags: txData.tags || [],
        notes: txData.notes,
        status: 'completed',
        isApproved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedTxs = [newTx, ...transactions];
    }

    saveTransactions(updatedTxs);
    setTransactions(updatedTxs);
  };

  const handleReverseTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    if (tx.isApproved) {
      alert('This entry has been approved and locked with password. It cannot be deleted or reversed!');
      return;
    }

    const updated = transactions.map((t) =>
      t.id === txId ? { ...t, status: 'reversed' as const, updatedAt: new Date().toISOString() } : t
    );

    saveTransactions(updated);
    setTransactions(updated);
  };

  const [approveTargetTxIds, setApproveTargetTxIds] = useState<string[] | null>(null);

  const handleOpenApproveModal = (targetTxIds?: string[]) => {
    setApproveTargetTxIds(targetTxIds || null);
    setIsApproveModalOpen(true);
  };

  // Final Approval Locking with Password Authorization
  const handleConfirmApprove = (passwordInput: string): boolean => {
    const pInput = passwordInput.trim();
    const storedPass = (userSettings.approvalPassword || 'Sabbir@95AR').trim();

    // Support exact match or matching without trailing dot
    const matchStored = pInput === storedPass || pInput + '.' === storedPass || pInput === storedPass.replace(/\.$/, '');
    const matchHardcoded = pInput === 'Sabbir@95AR' || pInput === 'Sabbir@95AR.';

    if (!matchStored && !matchHardcoded) {
      return false; // password mismatch
    }

    let updated: Transaction[];
    if (approveTargetTxIds && approveTargetTxIds.length > 0) {
      const targetSet = new Set(approveTargetTxIds);
      updated = transactions.map((t) =>
        targetSet.has(t.id) && !t.isApproved
          ? { ...t, isApproved: true, approvedAt: new Date().toISOString() }
          : t
      );
    } else {
      // Mark all unapproved completed transactions as approved & locked!
      updated = transactions.map((t) =>
        t.status === 'completed' && !t.isApproved
          ? { ...t, isApproved: true, approvedAt: new Date().toISOString() }
          : t
      );
    }

    saveTransactions(updated);
    setTransactions(updated);
    setApproveTargetTxIds(null);
    return true; // success
  };

  // Handlers for Office Funds
  const handleSaveOfficeFund = (fundData: Partial<OfficeFund>) => {
    const newFund: OfficeFund = {
      id: 'fund_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: fundData.title || 'Office Advance',
      dateReceived: fundData.dateReceived || new Date().toISOString().split('T')[0],
      amountReceived: fundData.amountReceived || 0,
      employerSource: fundData.employerSource || 'Employer',
      receivingAccountId: fundData.receivingAccountId || accounts[0]?.id || '',
      purpose: fundData.purpose || 'Official Expenses',
      referenceNumber: fundData.referenceNumber,
      status: 'open',
      notes: fundData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newFund, ...officeFunds];
    saveOfficeFunds(updated);
    setOfficeFunds(updated);

    // Also record the receipt in transaction ledger as office_fund_received
    const fundTx: Transaction = {
      id: 'tx_fund_rcvd_' + Date.now(),
      date: newFund.dateReceived,
      time: '12:00',
      type: 'office_fund_received',
      ownership: 'office',
      amount: newFund.amountReceived,
      sourceAccountId: newFund.receivingAccountId,
      categoryId: 'cat_office_advance',
      payeePayer: newFund.employerSource,
      description: `Office Fund Advance: ${newFund.title}`,
      referenceNumber: newFund.referenceNumber,
      relatedOfficeFundId: newFund.id,
      tags: ['Office Advance'],
      status: 'completed',
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTxs = [fundTx, ...transactions];
    saveTransactions(updatedTxs);
    setTransactions(updatedTxs);
  };

  // Accounts Handlers
  const handleSaveAccount = (accData: Partial<Account>) => {
    const newAcc: Account = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: accData.name || 'New Account',
      type: accData.type || 'bank',
      accountNumber: accData.accountNumber,
      openingBalance: accData.openingBalance || 0,
      currentBalance: accData.currentBalance || accData.openingBalance || 0,
      currency: 'BDT',
      status: 'active',
      isOfficeAccount: accData.isOfficeAccount || false,
      notes: accData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...accounts, newAcc];
    saveAccounts(updated);
    setAccounts(updated);
  };

  const handleAdjustAccountBalance = (accId: string, newBalance: number, notes: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return;

    const adjTx: Transaction = {
      id: 'tx_adj_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      type: 'opening_balance_adjustment',
      ownership: 'personal',
      amount: newBalance,
      sourceAccountId: accId,
      categoryId: 'cat_salary',
      payeePayer: 'Reconciliation',
      description: `Balance Adjustment: ${notes}`,
      tags: ['Reconciliation'],
      status: 'completed',
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTxs = [adjTx, ...transactions];
    saveTransactions(updatedTxs);
    setTransactions(updatedTxs);
  };

  // Reset & Clear handlers
  const handleResetDemoData = () => {
    resetToInitialDemoData();
    refreshAllStateFromStorage();
  };

  const handleClearAllData = () => {
    clearAllData();
    refreshAllStateFromStorage();
  };

  // Render view module based on active tab
  const renderModuleView = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardModule
            summary={summary}
            transactions={transactions}
            accounts={calculatedAccounts}
            officeFunds={officeFunds}
            budgets={budgets}
            categories={categories}
            debts={debts}
            userSettings={userSettings}
            onOpenTxModal={(type) => {
              setDefaultTxType(type || 'personal_expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onOpenOfficeModal={() => setIsOfficeModalOpen(true)}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onOpenApproveModal={(ids) => handleOpenApproveModal(ids)}
            onSelectModule={setActiveModule}
          />
        );

      case 'transactions':
        return (
          <TransactionsModule
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            officeFunds={officeFunds}
            userSettings={userSettings}
            onOpenAddModal={() => {
              setDefaultTxType('personal_expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onReverseTransaction={handleReverseTransaction}
            onOpenApproveModal={(ids) => handleOpenApproveModal(ids)}
          />
        );

      case 'income':
        return (
          <IncomeModule
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            userSettings={userSettings}
            onOpenAddModal={(type) => {
              setDefaultTxType(type || 'salary_income');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
          />
        );

      case 'expense':
        return (
          <ExpenseModule
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            userSettings={userSettings}
            onOpenAddModal={(type) => {
              setDefaultTxType(type || 'personal_expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
          />
        );

      case 'office_fund':
        return (
          <OfficeFundModule
            officeFunds={officeFunds}
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            userSettings={userSettings}
            onOpenAddFundModal={() => setIsOfficeModalOpen(true)}
            onOpenAddTxModal={(type) => {
              setDefaultTxType(type || 'office_expense');
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
          />
        );

      case 'accounts':
        return (
          <AccountsModule
            accounts={calculatedAccounts}
            transactions={transactions}
            userSettings={userSettings}
            onSaveAccount={handleSaveAccount}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
          />
        );

      case 'categories':
        return (
          <CategoriesModule
            categories={categories}
            onSaveCategory={(catData) => {
              const newCat: Category = {
                id: 'cat_' + Date.now(),
                name: catData.name || 'Category',
                type: catData.type || 'expense',
                purpose: catData.purpose || 'personal',
                icon: catData.icon || 'Tag',
                color: catData.color || '#0284C7',
                isCustom: true,
                isArchived: false,
                subcategories: [],
              };
              const updated = [...categories, newCat];
              saveCategories(updated);
              setCategories(updated);
            }}
          />
        );

      case 'budgets':
        return (
          <BudgetsModule
            budgets={budgets}
            transactions={transactions}
            categories={categories}
            userSettings={userSettings}
            onSaveBudget={(bData) => {
              const newB: Budget = {
                id: 'bud_' + Date.now(),
                month: bData.month || new Date().toISOString().substring(0, 7),
                categoryId: bData.categoryId || categories[0]?.id || '',
                ownership: bData.ownership || 'personal',
                budgetAmount: bData.budgetAmount || 0,
                alertThreshold: 80,
                rollover: false,
              };
              const updated = [...budgets, newB];
              saveBudgets(updated);
              setBudgets(updated);
            }}
          />
        );

      case 'savings':
        return (
          <SavingsModule
            savingsGoals={savingsGoals}
            userSettings={userSettings}
            onSaveGoal={(gData) => {
              const newG: SavingsGoal = {
                id: 'goal_' + Date.now(),
                title: gData.title || 'Savings Goal',
                targetAmount: gData.targetAmount || 0,
                currentAmount: gData.currentAmount || 0,
                targetDate: gData.targetDate || '2027-12-31',
                category: 'General',
                status: 'active',
              };
              const updated = [...savingsGoals, newG];
              saveSavingsGoals(updated);
              setSavingsGoals(updated);
            }}
          />
        );

      case 'loans':
        return (
          <LoansModule
            debts={debts}
            userSettings={userSettings}
            onSaveDebt={(dData) => {
              const newD: DebtReceivable = {
                id: 'debt_' + Date.now(),
                type: dData.type || 'loan_taken',
                title: dData.title || 'Loan',
                counterparty: dData.counterparty || 'Lender',
                originalAmount: dData.originalAmount || 0,
                currentBalance: dData.currentBalance || dData.originalAmount || 0,
                dueDate: dData.dueDate || '2026-12-31',
                accountId: accounts[0]?.id || '',
                status: 'active',
                createdAt: new Date().toISOString(),
              };
              const updated = [...debts, newD];
              saveDebts(updated);
              setDebts(updated);
            }}
            onRecordRepayment={(debtId, repayAmt) => {
              const updated = debts.map((d) =>
                d.id === debtId
                  ? {
                      ...d,
                      currentBalance: Math.max(0, d.currentBalance - repayAmt),
                      status: d.currentBalance - repayAmt <= 0 ? ('settled' as const) : ('partially_paid' as const),
                    }
                  : d
              );
              saveDebts(updated);
              setDebts(updated);
            }}
          />
        );

      case 'reports':
        return (
          <ReportsModule
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            officeFunds={officeFunds}
            userSettings={userSettings}
          />
        );

      case 'pdf_reports':
        return (
          <PdfReportsModule
            transactions={transactions}
            accounts={calculatedAccounts}
            categories={categories}
            officeFunds={officeFunds}
            userSettings={userSettings}
          />
        );

      case 'backup':
        return (
          <BackupRestoreModule
            onDataRestored={refreshAllStateFromStorage}
            onResetDemoData={handleResetDemoData}
            onClearAllData={handleClearAllData}
          />
        );

      case 'settings':
        return (
          <SettingsModule
            userSettings={userSettings}
            onSaveSettings={(newSettings) => {
              saveSettings(newSettings);
              setUserSettings(newSettings);
            }}
          />
        );

      default:
        return null;
    }
  };

  const unapprovedCount = transactions.filter((t) => t.status === 'completed' && !t.isApproved).length;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onQuickAddTx={(type) => {
          setDefaultTxType(type || 'personal_expense');
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          activeModule={activeModule}
          onOpenTxModal={(type) => {
            setDefaultTxType(type || 'personal_expense');
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          }}
          onOpenOfficeModal={() => setIsOfficeModalOpen(true)}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
          onResetDemoData={handleResetDemoData}
          setActiveModule={setActiveModule}
        />

        <main className="p-6 flex-1">{renderModuleView()}</main>
      </div>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        accounts={calculatedAccounts}
        categories={categories}
        officeFunds={officeFunds}
        defaultType={defaultTxType}
      />

      <OfficeFundModal
        isOpen={isOfficeModalOpen}
        onClose={() => setIsOfficeModalOpen(false)}
        onSave={handleSaveOfficeFund}
        accounts={calculatedAccounts}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={calculatedAccounts}
      />

      <ApproveLockModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setApproveTargetTxIds(null);
        }}
        onConfirmApprove={handleConfirmApprove}
        unapprovedCount={approveTargetTxIds ? approveTargetTxIds.length : unapprovedCount}
        isSingleTx={approveTargetTxIds?.length === 1}
      />
    </div>
  );
}

export default App;
