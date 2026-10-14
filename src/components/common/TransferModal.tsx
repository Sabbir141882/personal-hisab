import React, { useState } from 'react';
import { Account, Transaction } from '../../types/finance';
import { Modal } from './Modal';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Partial<Transaction>) => void;
  accounts: Account[];
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('Account Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount.');
      return;
    }
    if (!sourceAccountId || !destinationAccountId) {
      setErrorMessage('Please select both source and destination accounts.');
      return;
    }
    if (sourceAccountId === destinationAccountId) {
      setErrorMessage('Source and Destination accounts cannot be the same.');
      return;
    }

    onSave({
      date,
      time: '12:00',
      type: 'account_transfer',
      ownership: 'personal',
      amount: parsedAmount,
      fee: parseFloat(fee) || 0,
      sourceAccountId,
      destinationAccountId,
      categoryId: 'cat_utilities',
      payeePayer: 'Self Transfer',
      description: description || 'Account Transfer',
      referenceNumber: referenceNumber || undefined,
      tags: ['Transfer', 'Inter-Account'],
      status: 'completed',
    });

    setAmount('');
    setFee('0');
    setDescription('Account Transfer');
    setReferenceNumber('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Money Between Accounts"
      subtitle="Moves liquidity between your wallets without altering net income or consumption expenses"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Account (From) *
            </label>
            <select
              required
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (BDT {acc.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Account (To) *
            </label>
            <select
              required
              value={destinationAccountId}
              onChange={(e) => setDestinationAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (BDT {acc.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Amount (BDT) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-sans focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cashout Fee / Charge (BDT)
            </label>
            <input
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-sans focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Bank Add Money to bKash for electric bill"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer"
          >
            Execute Transfer
          </button>
        </div>
      </form>
    </Modal>
  );
};
