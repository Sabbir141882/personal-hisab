import React from 'react';
import {
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Lock,
  Printer,
  Tag,
  User,
  X,
} from 'lucide-react';
import { Account, Category, DebtReceivable, Transaction, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';

export interface VoucherData {
  voucherNo: string;
  voucherType: 'debit' | 'credit' | 'loan_given' | 'loan_received' | 'transfer' | 'office';
  title: string;
  date: string;
  time?: string;
  personOrOrganization: string;
  categoryName: string;
  subcategoryName?: string;
  accountName: string;
  destinationAccountName?: string;
  description: string;
  amount: number;
  fee?: number;
  referenceNumber?: string;
  ownership?: string;
  notes?: string;
  dueDate?: string;
  status: string;
  isApproved?: boolean;
  approvedAt?: string;
  tags?: string[];
  familyMember?: string;
}

export function amountToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Taka Only';
  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertNumber(n: number): string {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertNumber(n % 100) : '');
    if (n < 100000) return convertNumber(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertNumber(n % 1000) : '');
    if (n < 10000000) return convertNumber(Math.floor(n / 100000)) + ' Lac' + (n % 100000 !== 0 ? ' ' + convertNumber(n % 100000) : '');
    return convertNumber(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertNumber(n % 10000000) : '');
  }

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);
  let result = convertNumber(integerPart) + ' Taka';
  if (decimalPart > 0) {
    result += ' and ' + convertNumber(decimalPart) + ' Paisa';
  }
  return result + ' Only';
}

export function createVoucherFromTransaction(
  tx: Transaction,
  accounts: Account[],
  categories: Category[]
): VoucherData {
  const cat = categories.find((c) => c.id === tx.categoryId);
  const sub = cat?.subcategories?.find((s) => s.id === tx.subcategoryId);
  const sourceAcc = accounts.find((a) => a.id === tx.sourceAccountId);
  const destAcc = accounts.find((a) => a.id === tx.destinationAccountId);

  let vType: VoucherData['voucherType'] = 'debit';
  if (
    tx.type === 'income' ||
    tx.type === 'salary_income' ||
    tx.type === 'additional_income' ||
    tx.type === 'personal_income' ||
    tx.type === 'refund'
  ) {
    vType = 'credit';
  } else if (tx.type === 'account_transfer') {
    vType = 'transfer';
  } else if (tx.type.startsWith('office_')) {
    vType = 'office';
  } else if (tx.categoryId === 'cat_money_given' || tx.type === 'loan_given') {
    vType = 'loan_given';
  } else if (tx.categoryId === 'cat_money_received' || tx.type === 'money_received') {
    vType = 'loan_received';
  }

  const vNo = tx.referenceNumber
    ? `VCH-${tx.referenceNumber}`
    : `VCH-${tx.id.replace('tx_', '').toUpperCase().slice(0, 10)}`;

  return {
    voucherNo: vNo,
    voucherType: vType,
    title: tx.description || 'Transaction Voucher',
    date: tx.date,
    time: tx.time,
    personOrOrganization: tx.payeePayer || 'Unspecified',
    categoryName: cat?.name || 'General',
    subcategoryName: sub?.name,
    accountName: sourceAcc?.name || 'Cash in Hand',
    destinationAccountName: destAcc?.name,
    description: tx.description,
    amount: tx.amount,
    fee: tx.fee,
    referenceNumber: tx.referenceNumber,
    ownership: tx.ownership,
    notes: tx.notes,
    status: tx.status,
    isApproved: tx.isApproved,
    approvedAt: tx.approvedAt,
    tags: tx.tags,
    familyMember: tx.familyMember,
  };
}

export function createVoucherFromDebt(
  debt: DebtReceivable,
  accounts: Account[],
  categories: Category[]
): VoucherData {
  const isGiven = debt.type === 'loan_given' || debt.type === 'receivable_owed';
  const cat = categories.find((c) => c.id === debt.categoryId);
  const sub = cat?.subcategories?.find((s) => s.id === debt.subcategoryId);
  const acc = accounts.find((a) => a.id === debt.accountId);

  return {
    voucherNo: `VCH-LN-${debt.id.replace('debt_', '').toUpperCase().slice(0, 8)}`,
    voucherType: isGiven ? 'loan_given' : 'loan_received',
    title: debt.title,
    date: debt.createdAt ? debt.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    personOrOrganization: debt.counterparty || 'Unspecified',
    categoryName: cat?.name || (isGiven ? 'Money Given' : 'Money Received'),
    subcategoryName: sub?.name,
    accountName: acc?.name || 'Cash in Hand',
    description: debt.title,
    amount: debt.originalAmount,
    dueDate: debt.dueDate,
    status: debt.status.toUpperCase(),
    notes: debt.notes,
  };
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherData | null;
  userSettings: UserSettings;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  voucher,
  userSettings,
}) => {
  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const getVoucherTitle = () => {
    switch (voucher.voucherType) {
      case 'credit':
        return { en: 'CREDIT VOUCHER', bn: 'জমা / আয় ভাউচার', color: 'emerald' };
      case 'debit':
        return { en: 'DEBIT VOUCHER', bn: 'খরচ / ব্যয় ভাউচার', color: 'rose' };
      case 'loan_given':
        return { en: 'LOAN DISBURSEMENT VOUCHER', bn: 'টাকা প্রদান / ঋণ ভাউচার', color: 'amber' };
      case 'loan_received':
        return { en: 'LOAN RECEIPT VOUCHER', bn: 'টাকা গ্রহণ / ধার ভাউচার', color: 'indigo' };
      case 'transfer':
        return { en: 'TRANSFER VOUCHER', bn: 'তহবিল স্থানান্তর ভাউচার', color: 'sky' };
      case 'office':
        return { en: 'OFFICE ADVANCE & EXPENSE VOUCHER', bn: 'অফিস ভাউচার', color: 'purple' };
      default:
        return { en: 'PAYMENT VOUCHER', bn: 'ভাউচার', color: 'slate' };
    }
  };

  const vInfo = getVoucherTitle();
  const totalAmount = voucher.amount + (voucher.fee || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-sm tracking-wide">Official Financial Voucher / ভাউচার</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher (প্রিন্ট করুন)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Voucher Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-50/50">
          
          {/* THE PRINTABLE VOUCHER DOCUMENT */}
          <div
            id="printable-voucher"
            className="bg-white p-6 sm:p-8 rounded-xl border-2 border-slate-900 shadow-sm space-y-6 text-slate-900 font-sans"
          >
            {/* Header / Brand */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase font-mono">
                  {userSettings.appName || 'MY FINANCE'}
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  Account Owner: {userSettings.userName || 'Sabbir Ahmed'}
                </p>
                {userSettings.userEmail && (
                  <p className="text-[11px] text-slate-500">Contact: {userSettings.userEmail}</p>
                )}
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Financial Ledger & Accounting Voucher
                </p>
              </div>

              {/* Voucher Badge & Metadata */}
              <div className="text-left sm:text-right shrink-0">
                <div className="inline-block border-2 border-slate-900 px-3 py-1 bg-slate-100 rounded-md">
                  <span className="block text-xs font-black tracking-wider text-slate-950">
                    {vInfo.en}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-600">
                    {vInfo.bn}
                  </span>
                </div>

                <div className="mt-2 space-y-0.5 text-xs font-mono">
                  <p>
                    <span className="text-slate-500 font-sans font-medium">Voucher No:</span>{' '}
                    <span className="font-bold text-slate-950">{voucher.voucherNo}</span>
                  </p>
                  <p>
                    <span className="text-slate-500 font-sans font-medium">Date:</span>{' '}
                    <span className="font-semibold text-slate-900">{formatDate(voucher.date)}</span>
                    {voucher.time && <span className="text-slate-500"> ({voucher.time})</span>}
                  </p>
                  {voucher.isApproved && (
                    <p className="text-[10px] font-bold text-emerald-700 flex sm:justify-end items-center gap-1 mt-1">
                      <Lock className="w-3 h-3" />
                      <span>APPROVED & VERIFIED</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Key Entities & Categorization Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Person / Organization Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Person / Organization (ব্যক্তি বা প্রতিষ্ঠান)
                </span>
                <p className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{voucher.personOrOrganization}</span>
                </p>
                {voucher.familyMember && (
                  <p className="text-[11px] text-slate-600">
                    Family Member: <span className="font-semibold">{voucher.familyMember}</span>
                  </p>
                )}
              </div>

              {/* Category & Subcategory Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Category & Classification (ক্যাটাগরি)
                </span>
                <p className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{voucher.categoryName}</span>
                </p>
                {voucher.subcategoryName && (
                  <p className="text-[11px] text-slate-600">
                    Subcategory: <span className="font-semibold text-slate-800">{voucher.subcategoryName}</span>
                  </p>
                )}
              </div>

              {/* Account / Payment Method Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Payment Account / Method (হিসাব / মাধ্যম)
                </span>
                <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{voucher.accountName}</span>
                  {voucher.destinationAccountName && (
                    <span className="text-slate-600 font-normal">→ {voucher.destinationAccountName}</span>
                  )}
                </p>
              </div>

              {/* Reference & Terms Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Reference & Due Info (রেফারেন্স / মেয়াদ)
                </span>
                <p className="text-xs font-semibold text-slate-900">
                  Ref No: <span className="font-mono">{voucher.referenceNumber || 'N/A'}</span>
                </p>
                {voucher.dueDate && (
                  <p className="text-[11px] font-semibold text-rose-700">
                    Due Date: {formatDate(voucher.dueDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Particulars Table */}
            <div>
              <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-900">
                    <th className="border border-slate-900 py-2 px-3 w-12 text-center">SL</th>
                    <th className="border border-slate-900 py-2 px-3">Description & Particulars (বিবরণ)</th>
                    <th className="border border-slate-900 py-2 px-3 w-32">Category</th>
                    <th className="border border-slate-900 py-2 px-3 w-32 text-right">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-900 py-3 px-3 text-center font-mono">01</td>
                    <td className="border border-slate-900 py-3 px-3">
                      <div className="font-bold text-slate-900 text-sm">{voucher.description}</div>
                      {voucher.notes && (
                        <div className="text-[11px] text-slate-600 mt-1 italic">Note: {voucher.notes}</div>
                      )}
                      {voucher.tags && voucher.tags.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">Tags: {voucher.tags.join(', ')}</div>
                      )}
                    </td>
                    <td className="border border-slate-900 py-3 px-3 font-medium text-slate-800">
                      <div>{voucher.categoryName}</div>
                      {voucher.subcategoryName && (
                        <div className="text-[10px] text-slate-500">{voucher.subcategoryName}</div>
                      )}
                    </td>
                    <td className="border border-slate-900 py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      ৳ {voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {voucher.fee && voucher.fee > 0 ? (
                    <tr>
                      <td className="border border-slate-900 py-2 px-3 text-center font-mono">02</td>
                      <td className="border border-slate-900 py-2 px-3 font-medium text-slate-700">
                        Transaction Fee / Charge
                      </td>
                      <td className="border border-slate-900 py-2 px-3 text-slate-500">Service Fee</td>
                      <td className="border border-slate-900 py-2 px-3 text-right font-mono font-medium text-slate-800">
                        ৳ {voucher.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ) : null}

                  {/* Total Row */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-sm">
                    <td colSpan={3} className="border border-slate-900 py-2.5 px-3 text-right uppercase tracking-wider">
                      Net Total (সর্বমোট):
                    </td>
                    <td className="border border-slate-900 py-2.5 px-3 text-right font-mono font-extrabold text-slate-950 text-base">
                      ৳ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount in words banner */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                  Amount in Words (কথায়):
                </span>
                <span className="font-bold text-slate-950 font-serif italic text-sm mt-0.5 block">
                  {amountToWords(totalAmount)}
                </span>
              </div>
            </div>

            {/* Official Signatures Footer */}
            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="border-t border-dashed border-slate-900 pt-2 font-bold text-slate-900">
                  Prepared By (প্রস্তুতকারী)
                </div>
                <div className="text-[10px] text-slate-500">{userSettings.userName || 'Accountant'}</div>
              </div>

              <div className="space-y-1">
                <div className="border-t border-dashed border-slate-900 pt-2 font-bold text-slate-900">
                  Verified / Approved By
                </div>
                <div className="text-[10px] text-slate-500">
                  {voucher.isApproved ? 'Approved with Password' : 'Management'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="border-t border-dashed border-slate-900 pt-2 font-bold text-slate-900">
                  Received By / Counterparty
                </div>
                <div className="text-[10px] text-slate-500 truncate">{voucher.personOrOrganization}</div>
              </div>
            </div>

            {/* Print Footer Notice */}
            <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>System Generated Official Voucher · {userSettings.appName || 'My Finance'}</span>
              <span>Generated on: {new Date().toLocaleString('en-GB')}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (hidden in print) */}
        <div className="no-print bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            This voucher can be printed or saved as PDF using your browser's Print dialog.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print (প্রিন্ট করুন)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
