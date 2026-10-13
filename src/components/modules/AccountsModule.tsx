import React, { useState } from 'react';
import { ArrowLeftRight, CreditCard, PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import { Account, AccountType, Transaction, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface AccountsModuleProps {
  accounts: Account[];
  transactions: Transaction[];
  userSettings: UserSettings;
  onSaveAccount: (accountData: Partial<Account>) => void;
  onAdjustBalance: (accountId: string, newBalance: number, notes: string) => void;
  onOpenTransferModal: () => void;
}

export const AccountsModule: React.FC<AccountsModuleProps> = ({
  accounts,
  transactions,
  userSettings,
  onSaveAccount,
  onAdjustBalance,
  onOpenTransferModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustAccountId, setAdjustAccountId] = useState('');
  const [adjustBalanceVal, setAdjustBalanceVal] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Form states for New Account
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [isOfficeAccount, setIsOfficeAccount] = useState(false);
  const [notes, setNotes] = useState('');

  const totalBalance = accounts
    .filter((a) => a.status === 'active')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveAccount({
      name,
      type,
      accountNumber: accountNumber || undefined,
      openingBalance: parseFloat(openingBalance) || 0,
      currentBalance: parseFloat(openingBalance) || 0,
      currency: 'BDT',
      status: 'active',
      isOfficeAccount,
      notes: notes || undefined,
    });

    setName('');
    setAccountNumber('');
    setOpeningBalance('0');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(adjustBalanceVal);
    if (isNaN(parsed) || !adjustAccountId) return;

    onAdjustBalance(adjustAccountId, parsed, adjustNotes || 'Manual Reconciliation Balance Adjustment');
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-600" />
            <span>Accounts, Banks & Mobile Wallets</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage cash in hand, bank accounts, bKash, Nagad, and mobile wallets with audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Account</span>
          </button>
        </div>
      </div>

      {/* Total Liquidity Card */}
      <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-sky-800">Total Active Cash & Bank Balances</span>
          <p className="text-2xl font-bold font-mono text-sky-950 mt-0.5">
            {formatCurrency(totalBalance, userSettings.currencySymbol)}
          </p>
        </div>
        <span className="text-xs font-semibold text-sky-700 bg-white px-3 py-1 rounded-lg border border-sky-200">
          {accounts.length} Wallets Active
        </span>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{acc.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                  {acc.type} {acc.accountNumber && `· ${acc.accountNumber}`}
                </p>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  acc.isOfficeAccount
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {acc.isOfficeAccount ? 'OFFICE WALLET' : 'PERSONAL'}
              </span>
            </div>

            <div className="py-2 border-y border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Balance</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {formatCurrency(acc.currentBalance, userSettings.currencySymbol)}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Opening: ৳{acc.openingBalance.toLocaleString()}</span>
              <button
                onClick={() => {
                  setAdjustAccountId(acc.id);
                  setAdjustBalanceVal(String(acc.currentBalance));
                  setIsAdjustModalOpen(true);
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reconcile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Account or Mobile Wallet"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dutch Bangla Bank, bKash Secondary, Cash Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash in Hand</option>
                <option value="bkash">bKash Mobile Wallet</option>
                <option value="nagad">Nagad Mobile Wallet</option>
                <option value="rocket">Rocket Mobile Wallet</option>
                <option value="other">Other Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Balance (৳)</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account / Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 01711223344 or 110293847"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOfficeAcc"
              checked={isOfficeAccount}
              onChange={(e) => setIsOfficeAccount(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="isOfficeAcc" className="text-xs text-slate-700 font-medium">
              This is a dedicated office / employer advance wallet
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Reconcile Account Balance"
        subtitle="Manually set current balance with an audit record"
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Reconciled Balance (৳) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={adjustBalanceVal}
              onChange={(e) => setAdjustBalanceVal(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Explanation *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly bank statement reconciliation, unrecorded minor cash expense"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
