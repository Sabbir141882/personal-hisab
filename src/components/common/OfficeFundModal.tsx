import React, { useState } from 'react';
import { Account, OfficeFund } from '../../types/finance';
import { Modal } from './Modal';

interface OfficeFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fundData: Partial<OfficeFund>) => void;
  accounts: Account[];
}

export const OfficeFundModal: React.FC<OfficeFundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [dateReceived, setDateReceived] = useState(todayStr);
  const [amountReceived, setAmountReceived] = useState('');
  const [employerSource, setEmployerSource] = useState('TechCorp Accounts');
  const [receivingAccountId, setReceivingAccountId] = useState(accounts[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountReceived);
    if (isNaN(amount) || amount <= 0) return;

    onSave({
      title: title || 'Office Advance Fund',
      dateReceived,
      amountReceived: amount,
      employerSource,
      receivingAccountId: receivingAccountId || accounts[0]?.id,
      purpose,
      referenceNumber: referenceNumber || undefined,
      status: 'open',
      notes: notes || undefined,
    });

    // Reset
    setTitle('');
    setAmountReceived('');
    setPurpose('');
    setReferenceNumber('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record New Office Fund / Advance"
      subtitle="Track money received from employer for official work purposes"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fund / Advance Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Chittagong Client Visit, IT Server Procurement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount Received (BDT) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-sans focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date Received *
            </label>
            <input
              type="date"
              required
              value={dateReceived}
              onChange={(e) => setDateReceived(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employer / Dept Source
            </label>
            <input
              type="text"
              placeholder="e.g. TechCorp Finance, HR Dept"
              value={employerSource}
              onChange={(e) => setEmployerSource(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receiving Wallet / Account *
            </label>
            <select
              required
              value={receivingAccountId}
              onChange={(e) => setReceivingAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Purpose
          </label>
          <input
            type="text"
            placeholder="e.g. Travel tickets, hotel stay, team meal, stationery"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reference / Voucher #
            </label>
            <input
              type="text"
              placeholder="e.g. ADV-2026-10-099"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Submitted approval email to HR"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
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
            className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer"
          >
            Create Office Advance Record
          </button>
        </div>
      </form>
    </Modal>
  );
};
