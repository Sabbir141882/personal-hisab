import React, { useState } from 'react';
import { CreditCard, FileText, Plus, Printer } from 'lucide-react';
import { Category, DebtReceivable, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface LoansModuleProps {
  debts: DebtReceivable[];
  categories?: Category[];
  userSettings: UserSettings;
  onSaveDebt: (debtData: Partial<DebtReceivable>, andOpenVoucher?: boolean) => void;
  onRecordRepayment: (debtId: string, amount: number) => void;
  onViewVoucher?: (debt: DebtReceivable) => void;
}

export const LoansModule: React.FC<LoansModuleProps> = ({
  debts,
  categories = [],
  userSettings,
  onSaveDebt,
  onRecordRepayment,
  onViewVoucher,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<'money_given' | 'money_received'>('money_given');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitAction, setSubmitAction] = useState<'save' | 'save_and_voucher'>('save');

  const [repayDebtId, setRepayDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  // Find Category objects
  const moneyGivenCat = categories.find((c) => c.name.toLowerCase() === 'money given' || c.id === 'cat_money_given');
  const moneyReceivedCat = categories.find((c) => c.name.toLowerCase() === 'money received' || c.id === 'cat_money_received');

  // Available subcategories
  const currentSubcategories = categoryType === 'money_given'
    ? (moneyGivenCat?.subcategories || [
        { id: 'sub_mgiv_personal', name: 'Personal Loan' },
        { id: 'sub_mgiv_family', name: 'Family Loan' },
        { id: 'sub_mgiv_friend', name: 'Friend Loan' },
        { id: 'sub_mgiv_adv', name: 'Advance Payment' },
        { id: 'sub_mgiv_business', name: 'Business Loan' },
        { id: 'sub_mgiv_emerg', name: 'Emergency Help' },
        { id: 'sub_mgiv_other', name: 'Other Given' },
      ])
    : (moneyReceivedCat?.subcategories || [
        { id: 'sub_mrcvd_personal', name: 'Personal Borrowed' },
        { id: 'sub_mrcvd_family', name: 'Family Borrowed' },
        { id: 'sub_mrcvd_bank', name: 'Bank Loan' },
        { id: 'sub_mrcvd_micro', name: 'Microcredit Loan' },
        { id: 'sub_mrcvd_repay', name: 'Repayment Received' },
        { id: 'sub_mrcvd_adv', name: 'Advance Received' },
        { id: 'sub_mrcvd_emerg', name: 'Emergency Loan' },
        { id: 'sub_mrcvd_other', name: 'Other Received' },
      ]);

  const handleCategoryTypeChange = (newType: 'money_given' | 'money_received') => {
    setCategoryType(newType);
    const firstSub = newType === 'money_given'
      ? (moneyGivenCat?.subcategories?.[0]?.id || 'sub_mgiv_personal')
      : (moneyReceivedCat?.subcategories?.[0]?.id || 'sub_mrcvd_personal');
    setSelectedSubcategoryId(firstSub);

    const subName = newType === 'money_given'
      ? (moneyGivenCat?.subcategories?.[0]?.name || 'Personal Loan')
      : (moneyReceivedCat?.subcategories?.[0]?.name || 'Personal Borrowed');
    setTitle(subName);
  };

  const handleSubcategoryChange = (subId: string) => {
    setSelectedSubcategoryId(subId);
    const subObj = currentSubcategories.find((s) => s.id === subId);
    if (subObj) {
      setTitle(subObj.name);
    }
  };

  const loansTaken = debts.filter((d) => d.type === 'loan_taken' || d.type === 'debt_owed');
  const loansGiven = debts.filter((d) => d.type === 'loan_given' || d.type === 'receivable_owed');

  const totalLiabilities = loansTaken.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalReceivables = loansGiven.reduce((sum, d) => sum + d.currentBalance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(amount);
    if (isNaN(orig) || orig <= 0) return;

    const chosenCatId = categoryType === 'money_given'
      ? (moneyGivenCat?.id || 'cat_money_given')
      : (moneyReceivedCat?.id || 'cat_money_received');

    onSaveDebt(
      {
        title: title.trim() || (categoryType === 'money_given' ? 'Money Given' : 'Money Received'),
        type: categoryType === 'money_given' ? 'loan_given' : 'loan_taken',
        counterparty: counterparty.trim() || 'General',
        originalAmount: orig,
        currentBalance: orig,
        categoryId: chosenCatId,
        subcategoryId: selectedSubcategoryId,
        dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        accountId: 'acc_cash_1',
        status: 'active',
        notes: notes.trim() || undefined,
      },
      submitAction === 'save_and_voucher'
    );

    setTitle('');
    setAmount('');
    setCounterparty('');
    setNotes('');
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
            Track Money Given, Money Received, counterparties, and repayment status
          </p>
        </div>

        <button
          onClick={() => {
            handleCategoryTypeChange('money_given');
            setIsModalOpen(true);
          }}
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
              <th className="py-3 px-4">Person / Organization (ব্যক্তি/প্রতিষ্ঠান)</th>
              <th className="py-3 px-4">Category / Subcategory</th>
              <th className="py-3 px-4">Title / Notes</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Original Amount</th>
              <th className="py-3 px-4">Outstanding Balance</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {debts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  No active loans or receivables recorded.
                </td>
              </tr>
            ) : (
              debts.map((d) => {
                const isGiven = d.type === 'loan_given' || d.type === 'receivable_owed';
                const catObj = categories.find((c) => c.id === d.categoryId);
                const subObj = catObj?.subcategories?.find((s) => s.id === d.subcategoryId);

                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-xs block">
                        👤 {d.counterparty || 'Unspecified'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {isGiven ? 'Money Given' : 'Money Received'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {subObj?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{d.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          !isGiven
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isGiven ? 'MONEY GIVEN' : 'MONEY RECEIVED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">BDT {d.originalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      BDT {d.currentBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(d.dueDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {onViewVoucher && (
                          <button
                            onClick={() => onViewVoucher(d)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded border border-slate-300 flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                            title="View & Print Loan Voucher (ভাউচার দেখুন ও প্রিন্ট করুন)"
                          >
                            <FileText className="w-3 h-3 text-amber-600" />
                            <span>Voucher</span>
                          </button>
                        )}
                        {d.currentBalance > 0 ? (
                          <button
                            onClick={() => {
                              setRepayDebtId(d.id);
                              setRepayAmount(String(d.currentBalance));
                            }}
                            className="px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold text-[10px] rounded hover:bg-sky-100 cursor-pointer"
                          >
                            Repay / Collect
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">SETTLED</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Debt Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Loan or Receivable" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryType}
                onChange={(e) => handleCategoryTypeChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="money_given">Money Given (অন্যকে টাকা দেওয়া)</option>
                <option value="money_received">Money Received (টাকা পাওয়া / ঋণ নেওয়া)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory *</label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                {currentSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Person / Organization Name (ব্যক্তি বা প্রতিষ্ঠানের নাম) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahim Ahmed, Tanvir Hossain, City Bank, ABC Enterprise"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Purpose Details *</label>
            <input
              type="text"
              required
              placeholder="e.g. Personal Loan, Emergency Help, Bank Loan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes & Terms (শর্ত বা বিশেষ বিবরণ)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Return in 2 installments, Cheque #5502, Bank reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500">
              ভাউচার দেখতে <strong>"Save & View Voucher"</strong> চাপুন
            </div>

            <div className="flex items-center justify-end gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction('save')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 shadow-2xs"
              >
                Record Entry
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction('save_and_voucher')}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save & View Voucher (ভাউচার দেখুন)</span>
              </button>
            </div>
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
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRepayDebtId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg cursor-pointer hover:bg-sky-500 shadow-xs">
              Confirm Repayment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

