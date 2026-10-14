import React, { useState } from 'react';
import { Clock, Plus, Repeat } from 'lucide-react';
import { Account, Category, RecurringTransaction, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface RecurringModuleProps {
  recurring: RecurringTransaction[];
  accounts: Account[];
  categories: Category[];
  userSettings: UserSettings;
  onSaveRecurring: (rule: Partial<RecurringTransaction>) => void;
  onProcessDueTransaction: (rule: RecurringTransaction) => void;
}

export const RecurringModule: React.FC<RecurringModuleProps> = ({
  recurring,
  accounts,
  categories,
  userSettings,
  onSaveRecurring,
  onProcessDueTransaction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [payeePayer, setPayeePayer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0 || !title.trim()) return;

    onSaveRecurring({
      title,
      type: 'personal_expense',
      amount: parsed,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0],
      sourceAccountId: accounts[0]?.id || '',
      categoryId: categories[0]?.id || '',
      payeePayer,
      description: title,
      autoProcess: false,
      status: 'active',
    });

    setTitle('');
    setAmount('');
    setPayeePayer('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-sky-600" />
            <span>Recurring Transactions & Schedules</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automate expected monthly salary, house rent, subscriptions, and utility bills
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Frequency</th>
              <th className="py-3 px-4">Payee / Payer</th>
              <th className="py-3 px-4">Next Due Date</th>
              <th className="py-3 px-4 text-right">Expected Amount</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recurring.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-900">{rec.title}</td>
                <td className="py-3 px-4 uppercase text-slate-600 font-medium">{rec.frequency}</td>
                <td className="py-3 px-4 text-slate-700">{rec.payeePayer}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{formatDate(rec.nextDueDate)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(rec.amount, userSettings.currencySymbol)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onProcessDueTransaction(rec)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded transition-colors"
                  >
                    Post to Ledger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Recurring Transaction Rule" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Broadband Bill, Apartment Rent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (BDT) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Next Due Date *</label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payee / Vendor</label>
              <input
                type="text"
                placeholder="e.g. Carnival Internet"
                value={payeePayer}
                onChange={(e) => setPayeePayer(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg">
              Save Recurring Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
