import React, { useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { DebtReceivable, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface LoansModuleProps {
  debts: DebtReceivable[];
  userSettings: UserSettings;
  onSaveDebt: (debtData: Partial<DebtReceivable>) => void;
  onRecordRepayment: (debtId: string, amount: number) => void;
}

export const LoansModule: React.FC<LoansModuleProps> = ({
  debts,
  userSettings,
  onSaveDebt,
  onRecordRepayment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DebtReceivable['type']>('loan_taken');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [repayDebtId, setRepayDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  const loansTaken = debts.filter((d) => d.type === 'loan_taken' || d.type === 'debt_owed');
  const loansGiven = debts.filter((d) => d.type === 'loan_given' || d.type === 'receivable_owed');

  const totalLiabilities = loansTaken.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalReceivables = loansGiven.reduce((sum, d) => sum + d.currentBalance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(amount);
    if (isNaN(orig) || orig <= 0 || !title.trim()) return;

    onSaveDebt({
      title,
      type,
      counterparty,
      originalAmount: orig,
      currentBalance: orig,
      dueDate: dueDate || '2026-12-31',
      accountId: 'acc_cash_1',
      status: 'active',
    });

    setTitle('');
    setAmount('');
    setCounterparty('');
    setIsModalOpen(false);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = parseFloat(repayAmount);
    if (isNaN(rep) || rep <= 0 || !repayDebtId) return;

    onRecordRepayment(repayDebtId, rep);
    setRepayDebtId(null);
    setRepayAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" />
            <span>Loans, Debts & Receivables Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track borrowed loans, lent money, counterparties, and partial repayment history
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record Loan / Debt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
          <span className="text-xs font-semibold text-rose-800">Total Outstanding Liabilities (Owed by You)</span>
          <p className="text-2xl font-bold font-sans text-rose-950">
            {formatCurrency(totalLiabilities, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
          <span className="text-xs font-semibold text-emerald-800">Total Outstanding Receivables (Owed to You)</span>
          <p className="text-2xl font-bold font-sans text-emerald-950">
            {formatCurrency(totalReceivables, userSettings.currencySymbol)}
          </p>
        </div>
      </div>

      {/* Debts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Active Debts & Receivables ({debts.length})
          </h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Counterparty</th>
              <th className="py-3 px-4">Original Amount</th>
              <th className="py-3 px-4">Outstanding Balance</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {debts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No active loans or receivables recorded.
                </td>
              </tr>
            ) : (
              debts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.title}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        d.type.includes('taken') || d.type.includes('debt')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {d.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{d.counterparty}</td>
                  <td className="py-3 px-4 font-sans">BDT {d.originalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    BDT {d.currentBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(d.dueDate)}</td>
                  <td className="py-3 px-4 text-center">
                    {d.currentBalance > 0 ? (
                      <button
                        onClick={() => {
                          setRepayDebtId(d.id);
                          setRepayAmount(String(d.currentBalance));
                        }}
                        className="px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold text-[10px] rounded hover:bg-sky-100"
                      >
                        Repay / Collect
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-[10px]">SETTLED</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Debt Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Loan or Receivable" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Loan from Cousin, Lent to Colleague Tanvir"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="loan_taken">Loan Taken (Liability)</option>
                <option value="loan_given">Loan Issued (Receivable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Counterparty Person / Bank *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahim Ahmed, City Bank"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
              Record Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* Repayment Modal */}
      <Modal isOpen={!!repayDebtId} onClose={() => setRepayDebtId(null)} title="Record Loan Repayment / Collection" maxWidth="sm">
        <form onSubmit={handleRepaySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repayment Amount (BDT) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-sans"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRepayDebtId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg">
              Confirm Repayment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
