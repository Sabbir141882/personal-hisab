import React, { useEffect, useState } from 'react';
import { Account, Category, FinancialOwnership, OfficeFund, Transaction, TransactionType } from '../../types/finance';
import { Modal } from './Modal';

import { FileText, Printer } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Partial<Transaction>, andOpenVoucher?: boolean) => void;
  editingTransaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  officeFunds: OfficeFund[];
  defaultType?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  accounts,
  categories,
  officeFunds,
  defaultType = 'personal_expense',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('12:00');
  const [type, setType] = useState<TransactionType>(defaultType as TransactionType);
  const [ownership, setOwnership] = useState<FinancialOwnership>('personal');
  const [amount, setAmount] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [destinationAccountId, setDestinationAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [payeePayer, setPayeePayer] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [relatedOfficeFundId, setRelatedOfficeFundId] = useState<string>('');
  const [familyMember, setFamilyMember] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '12:00');
      setType(editingTransaction.type);
      setOwnership(editingTransaction.ownership);
      setAmount(String(editingTransaction.amount));
      setFee(String(editingTransaction.fee || 0));
      setSourceAccountId(editingTransaction.sourceAccountId);
      setDestinationAccountId(editingTransaction.destinationAccountId || '');
      setCategoryId(editingTransaction.categoryId);
      setSubcategoryId(editingTransaction.subcategoryId || '');
      setPayeePayer(editingTransaction.payeePayer);
      setDescription(editingTransaction.description);
      setReferenceNumber(editingTransaction.referenceNumber || '');
      setRelatedOfficeFundId(editingTransaction.relatedOfficeFundId || '');
      setFamilyMember(editingTransaction.familyMember || '');
      setTagsText((editingTransaction.tags || []).join(', '));
      setNotes(editingTransaction.notes || '');
    } else {
      setDate(todayStr);
      setTime('12:00');
      const initialType = (defaultType || 'personal_expense') as TransactionType;
      setType(initialType);

      // Auto set ownership based on type
      if (initialType.startsWith('office_')) setOwnership('office');
      else if (initialType === 'family_expense') setOwnership('family');
      else setOwnership('personal');

      setAmount('');
      setFee('0');
      setSourceAccountId(accounts.find((a) => a.status === 'active')?.id || '');
      setDestinationAccountId('');
      setCategoryId('');
      setSubcategoryId('');
      setPayeePayer('');
      setDescription('');
      setReferenceNumber('');
      setRelatedOfficeFundId('');
      setFamilyMember('');
      setTagsText('');
      setNotes('');
    }
    setErrorMessage('');
  }, [editingTransaction, isOpen, defaultType, accounts]);

  // Adjust default ownership & category filtering when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'office_expense' || newType === 'office_fund_received' || newType === 'office_fund_returned') {
      setOwnership('office');
    } else if (newType === 'family_expense') {
      setOwnership('family');
    } else {
      setOwnership('personal');
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const [submitAction, setSubmitAction] = useState<'save' | 'save_and_voucher'>('save');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0.');
      return;
    }
    if (!sourceAccountId) {
      setErrorMessage('Please select a payment/source account.');
      return;
    }
    if (type === 'account_transfer' && !destinationAccountId) {
      setErrorMessage('Please select a destination account for the transfer.');
      return;
    }
    if (type === 'account_transfer' && sourceAccountId === destinationAccountId) {
      setErrorMessage('Source and Destination accounts cannot be the same for a transfer.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a description or note.');
      return;
    }

    const tagsArray = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave(
      {
        id: editingTransaction?.id,
        date,
        time,
        type,
        ownership,
        amount: parsedAmount,
        fee: parseFloat(fee) || 0,
        sourceAccountId,
        destinationAccountId: destinationAccountId || undefined,
        categoryId: categoryId || categories[0]?.id || 'cat_family_expense',
        subcategoryId: subcategoryId || undefined,
        payeePayer: payeePayer || (type.includes('income') ? 'Employer/Client' : 'Vendor'),
        description,
        referenceNumber: referenceNumber || undefined,
        relatedOfficeFundId: relatedOfficeFundId || undefined,
        familyMember: familyMember || undefined,
        tags: tagsArray,
        notes: notes || undefined,
        status: editingTransaction?.status || 'completed',
      },
      submitAction === 'save_and_voucher'
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Edit Ledger Record' : 'Record New Transaction'}
      subtitle="Accurately log income, expense, office funds, or transfers"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Transaction Type Grid Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="salary_income">1. Income — (টাকা আয়)</option>
            <option value="personal_expense">2. Personal Expense — (ব্যক্তিগত খরচ)</option>
            <option value="family_expense">3. Family Expense — (পরিবারের খরচ)</option>
            <option value="baby_expense">4. Baby Expense — (বাচ্চার খরচ)</option>
            <option value="mobile_expense">5. Mobile Expense — (মোবাইলের খরচ)</option>
            <option value="office_fund_received">6. Office Money Received — (অফিস থেকে টাকা নেওয়া)</option>
            <option value="office_expense">7. Office Expense — (অফিসের কাজের খরচ)</option>
            <option value="office_fund_returned">8. Office Money Return — (অফিসে টাকা ফেরত)</option>
            <option value="receivable_collection">9. Money Received — (টাকা পাওয়া)</option>
            <option value="loan_issued">10. Money Given — (টাকা দেওয়া)</option>
            <option value="account_transfer">11. Money Transfer — (এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে)</option>
            <option value="savings_contribution">12. Savings — (সঞ্চয়)</option>
            <option value="investment">13. Investment — (বিনিযোগ)</option>
            <option value="loan_received">14. Loan Received — (ধার নেওয়া)</option>
            <option value="loan_given">15. Loan Given — (ধার দেওয়া)</option>
            <option value="debt_repayment">16. Loan Repayment — (ধার পরিশোধ)</option>
            <option value="other_expense">17. Other Expense — (অন্যান্য খরচ)</option>
          </select>
        </div>

        {/* Highlight Banner if Personal Expense via Office */}
        {type === 'personal_expense_via_office' && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-lg leading-relaxed">
            <strong>Personal Expense Paid via Office Advance:</strong> This transaction will be counted in
            your personal expense reports, reduce your office cash balance, and be flagged in office fund settlement
            as recoverable by employer.
          </div>
        )}

        {/* Row 1: Amount, Fee, Date, Time */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (BDT) *
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
              Cashout Fee (BDT)
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

        {/* Row 2: Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'account_transfer' ? 'Source Account *' : 'Payment / Receiving Account *'}
            </label>
            <select
              required
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Select Account --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()}) — Bal: BDT {acc.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {type === 'account_transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Account *
              </label>
              <select
                required
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Select Destination --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Related Office Fund Selector if office related */}
          {(type === 'office_expense' ||
            type === 'office_fund_received' ||
            type === 'personal_expense_via_office' ||
            type === 'office_fund_returned') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Office Fund / Advance
              </label>
              <select
                value={relatedOfficeFundId}
                onChange={(e) => setRelatedOfficeFundId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">-- General Office Account --</option>
                {officeFunds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.title} (Rcvd: BDT {fund.amountReceived.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.purpose.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Select Subcategory --</option>
                {selectedCategory.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 4: Payee / Counterparty & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Person / Organization Name (ব্যক্তি বা প্রতিষ্ঠানের নাম)
            </label>
            <input
              type="text"
              placeholder="e.g. Rahim Ahmed, City Bank, ABC Enterprise"
              value={payeePayer}
              onChange={(e) => setPayeePayer(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number</label>
            <input
              type="text"
              placeholder="e.g. Invoice #, Check #, Transaction ID"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Memo *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. October House Rent, Client Visit Train Ticket, Grocery Shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Tags & Family Member */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Travel, Urgent, TaxDeductible"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {ownership === 'family' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Family Member Purpose</label>
              <input
                type="text"
                placeholder="e.g. Whole Family, Parents, Children, Spouse"
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Notes / Special Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Special Remarks (মন্তব্য / বিশেষ বিবরণ)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Paid by Cheque #10245, specific terms, receiver contact or details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            ভাউচার ও প্রিন্ট কপি পেতে <strong>"Save & View Voucher"</strong> চাপুন
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setSubmitAction('save')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              {editingTransaction ? 'Update Record' : 'Save Record'}
            </button>
            <button
              type="submit"
              onClick={() => setSubmitAction('save_and_voucher')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save & View Voucher (ভাউচার দেখুন)</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
