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
  onOpenTransferModal: () => void;
}

export const AccountsModule: React.FC<AccountsModuleProps> = ({
  accounts,
  transactions,
  userSettings,
  onSaveAccount,
  onOpenTransferModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-400" />
            <span>Accounts, Banks & Mobile Wallets</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage cash in hand, bank accounts, bKash, Nagad, and mobile wallets with audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Account</span>
          </button>
        </div>
      </div>

      {/* Total Liquidity Card */}
      <div className="p-4 rounded-xl border border-sky-800/60 bg-sky-950/40 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-sky-300">Total Active Cash, Bank & Wallet Balances</span>
          <p className="text-2xl font-bold font-sans text-sky-200 mt-0.5">
            {formatCurrency(totalBalance, userSettings.currencySymbol)}
          </p>
        </div>
        <span className="text-xs font-semibold text-sky-300 bg-sky-900/60 px-3 py-1 rounded-lg border border-sky-700/60">
          {accounts.length} Wallets Active
        </span>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isBank = acc.type === 'bank' || acc.name.toLowerCase().includes('bank');
          const isBkash = acc.type === 'bkash' || acc.name.toLowerCase().includes('bkash');
          const isNagad = acc.type === 'nagad' || acc.name.toLowerCase().includes('nagad');
          const isOther = acc.type === 'other' || acc.type === 'rocket' || acc.name.toLowerCase().includes('rocket') || acc.name.toLowerCase().includes('upay') || acc.name.toLowerCase().includes('others') || acc.name.toLowerCase().includes('other');
          const isUnpass = acc.type === 'unpass_bill' || acc.name.toLowerCase().includes('unpass');
          const isCash = acc.type === 'cash' || acc.name.toLowerCase().includes('cash');

          let cardBg = 'bg-slate-900 border-slate-800';
          let iconBg = 'bg-slate-800 text-slate-300';
          let titleColor = 'text-white';
          let balanceColor = 'text-white';
          let badgeBg = acc.isOfficeAccount ? 'bg-purple-900/80 text-purple-300 border border-purple-700' : 'bg-slate-800 text-slate-300';
          let brandTag = acc.type.toUpperCase();

          if (isBkash) {
            brandTag = 'bKash';
            cardBg = 'bg-pink-950/40 border-pink-700/60 hover:border-pink-500/80';
            iconBg = 'bg-[#E2136E] text-white font-bold';
            titleColor = 'text-pink-300';
            balanceColor = 'text-pink-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-[#E2136E] text-white font-bold';
          } else if (isNagad) {
            brandTag = 'Nagad';
            cardBg = 'bg-red-950/40 border-red-700/60 hover:border-red-500/80';
            iconBg = 'bg-[#E03823] text-white font-bold';
            titleColor = 'text-red-300';
            balanceColor = 'text-red-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-[#E03823] text-white font-bold';
          } else if (isOther) {
            brandTag = 'Others Wallet';
            cardBg = 'bg-orange-950/40 border-orange-700/60 hover:border-orange-500/80';
            iconBg = 'bg-[#F97316] text-white font-bold';
            titleColor = 'text-orange-300';
            balanceColor = 'text-orange-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-[#F97316] text-white font-bold';
          } else if (isUnpass) {
            brandTag = 'UNPASS BIL Wallet';
            cardBg = 'bg-amber-950/40 border-amber-600/60 hover:border-amber-400/80';
            iconBg = 'bg-[#F59E0B] text-slate-950 font-bold';
            titleColor = 'text-amber-300';
            balanceColor = 'text-amber-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-[#F59E0B] text-slate-950 font-bold';
          } else if (isBank) {
            brandTag = 'Bank Account';
            cardBg = 'bg-indigo-950/40 border-indigo-700/60 hover:border-indigo-500/80';
            iconBg = 'bg-indigo-600 text-white font-bold';
            titleColor = 'text-indigo-300';
            balanceColor = 'text-indigo-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-indigo-600 text-white font-bold';
          } else if (isCash) {
            brandTag = 'Physical Cash';
            cardBg = 'bg-emerald-950/40 border-emerald-700/60 hover:border-emerald-500/80';
            iconBg = 'bg-emerald-600 text-white font-bold';
            titleColor = 'text-emerald-300';
            balanceColor = 'text-emerald-400 font-bold';
            if (!acc.isOfficeAccount) badgeBg = 'bg-emerald-600 text-white font-bold';
          }

          return (
            <div key={acc.id} className={`rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${cardBg}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl shadow-xs shrink-0 ${iconBg}`}>
                    {isCash ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${titleColor}`}>{acc.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                      {brandTag} {acc.accountNumber && `· ${acc.accountNumber}`}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs ${badgeBg}`}>
                  {acc.isOfficeAccount ? 'OFFICE WALLET' : brandTag}
                </span>
              </div>

              <div className="py-2.5 border-y border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Balance</span>
                <p className={`text-xl font-bold font-sans tracking-tight tabular-nums mt-0.5 ${balanceColor}`}>
                  {formatCurrency(acc.currentBalance, userSettings.currencySymbol)}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Opening: BDT {acc.openingBalance.toLocaleString()}</span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Ledger Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inter-Account Transfer History Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-sky-600" />
              <span>Inter-Account Transfer History</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent fund transfers between bank accounts, bKash, Nagad, and cash wallets
            </p>
          </div>
          <button
            onClick={onOpenTransferModal}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-sky-200"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>+ Transfer Funds</span>
          </button>
        </div>

        {(() => {
          const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
          const transferTxs = transactions.filter((t) => t.type === 'account_transfer');

          if (transferTxs.length === 0) {
            return (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">No inter-account transfers recorded yet.</p>
                <button
                  onClick={onOpenTransferModal}
                  className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  Make your first transfer
                </button>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">From (Source)</th>
                    <th className="py-2.5 px-3">To (Destination)</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Fee</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transferTxs.slice(0, 10).map((tx) => {
                    const srcName = accountMap.get(tx.sourceAccountId) || 'Unknown Account';
                    const destName = tx.destinationAccountId ? accountMap.get(tx.destinationAccountId) || 'Unknown Account' : 'N/A';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-600">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {srcName}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-sky-700">
                          {destName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans text-amber-700 font-medium">
                          {tx.fee ? `BDT ${tx.fee.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-sans text-slate-900">
                          {formatCurrency(tx.amount, userSettings.currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
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
                <option value="other">Others Mobile Wallet (Orange)</option>
                <option value="unpass_bill">UNPASS BIL Wallet (Instant Live Balance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Balance (BDT)</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-sans"
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
    </div>
  );
};
