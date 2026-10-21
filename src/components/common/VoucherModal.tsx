import React from 'react';
import {
  Building2,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Account, Category, DebtReceivable, Transaction, UserSettings } from '../../types/finance';
import { formatDate, getVoucherNumber } from '../../services/financialEngine';

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
  categories: Category[],
  allTransactions?: Transaction[]
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

  const vNo = getVoucherNumber(tx, allTransactions || []);

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
        return { en: 'CREDIT / RECEIPT VOUCHER', bn: 'জমা ও প্রাপ্তি ভাউচার' };
      case 'debit':
        return { en: 'DEBIT / PAYMENT VOUCHER', bn: 'ডেবিট ও ব্যয় ভাউচার' };
      case 'loan_given':
        return { en: 'LOAN DISBURSEMENT VOUCHER', bn: 'ঋণ / টাকা প্রদান ভাউচার' };
      case 'loan_received':
        return { en: 'LOAN RECEIPT VOUCHER', bn: 'ধার / টাকা গ্রহণ ভাউচার' };
      case 'transfer':
        return { en: 'ACCOUNT TRANSFER VOUCHER', bn: 'তহবিল স্থানান্তর ভাউচার' };
      case 'office':
        return { en: 'OFFICE ADVANCE & EXPENSE VOUCHER', bn: 'অফিস ব্যয় ভাউচার' };
      default:
        return { en: 'PAYMENT VOUCHER', bn: 'অফিসিয়াল ভাউচার' };
    }
  };

  const vInfo = getVoucherTitle();
  const totalAmount = voucher.amount + (voucher.fee || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block">
                Executive Official Voucher (5.5" × 4.25" Format)
              </span>
              <span className="text-[11px] text-slate-300 block">
                A4 পেজে ১টি প্রফেশনাল কর্পোরেট ভাউচার প্রিন্ট করার জন্য প্রস্তুত
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
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

        {/* Scrollable Modal Body showing preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/90 flex flex-col items-center justify-center min-h-[440px]">
          
          <div className="no-print mb-3 text-center text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Accounting Ledger Format · Print Size: 5.5" × 4.25"</span>
          </div>

          {/* THE PRINTABLE VOUCHER (Targeted by #printable-voucher in CSS) */}
          <div
            id="printable-voucher"
            className="bg-white p-4 rounded-md border-2 border-slate-900 shadow-md text-slate-900 font-sans text-xs w-full max-w-[5.5in] box-border relative flex flex-col justify-between"
            style={{ minHeight: '4.25in' }}
          >
            {/* 1. ELEGANT HEADER / BRANDING & VOUCHER TITLE */}
            <div>
              <div className="border-b-2 border-slate-900 pb-2.5 flex flex-row items-start justify-between gap-2">
                {/* Organization Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black tracking-wider text-slate-950 uppercase font-mono leading-none">
                      {userSettings.appName || 'MY FINANCE'}
                    </h1>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-900 text-white rounded">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-600 leading-tight">
                    {userSettings.userName || 'Md Sabbir Ahmed'}
                    {userSettings.userEmail ? ` · ${userSettings.userEmail}` : ''}
                  </p>
                </div>

                {/* Right Voucher Designation Box */}
                <div className="text-right shrink-0">
                  <div className="bg-slate-900 text-white px-2.5 py-1 rounded shadow-2xs text-right inline-block">
                    <span className="block text-[10px] font-black tracking-wider uppercase font-mono leading-none">
                      {vInfo.en}
                    </span>
                    <span className="block text-[9px] font-normal text-slate-200 mt-0.5 leading-none">
                      {vInfo.bn}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] font-mono font-medium text-slate-900">
                    <span>No: </span>
                    <strong className="font-bold text-slate-950">{voucher.voucherNo}</strong>
                    <span className="mx-1.5">|</span>
                    <span>Date: </span>
                    <strong className="font-bold text-slate-950">{formatDate(voucher.date)}</strong>
                  </div>
                </div>
              </div>

              {/* 2. EXECUTIVE LEDGER METADATA GRID */}
              <div className="my-2.5 border border-slate-300 rounded bg-slate-50/60 p-2 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex justify-between items-baseline border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-600 uppercase text-[9px]">
                    Person / Org (ব্যক্তি/প্রতিষ্ঠান):
                  </span>
                  <span className="font-bold text-slate-950 text-[10.5px]">
                    {voucher.personOrOrganization}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-600 uppercase text-[9px]">
                    Category (ক্যাটাগরি):
                  </span>
                  <span className="font-bold text-slate-950 text-[10.5px]">
                    {voucher.categoryName}
                    {voucher.subcategoryName && (
                      <span className="font-normal text-slate-600 text-[9px] ml-1">
                        ({voucher.subcategoryName})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-200 pb-1 sm:border-b-0 sm:pb-0">
                  <span className="font-bold text-slate-600 uppercase text-[9px]">
                    Payment Account (মাধ্যম):
                  </span>
                  <span className="font-bold text-slate-950 text-[10.5px]">
                    {voucher.accountName}
                    {voucher.destinationAccountName && (
                      <span className="font-normal text-slate-600 text-[9px]"> → {voucher.destinationAccountName}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-600 uppercase text-[9px]">
                    Ref & Due (রেফারেন্স/মেয়াদ):
                  </span>
                  <span className="font-semibold text-slate-900 text-[10px] font-mono">
                    Ref: {voucher.referenceNumber || 'N/A'}
                    {voucher.dueDate && (
                      <span className="text-rose-700 font-bold ml-1.5">Due: {formatDate(voucher.dueDate)}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 3. FORMAL PARTICULARS LEDGER TABLE */}
              <div className="my-2">
                <table className="w-full text-left border-collapse border border-slate-900 text-[10px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                      <th className="border border-slate-900 py-1 px-1.5 w-7 text-center font-mono">SL</th>
                      <th className="border border-slate-900 py-1 px-2">Description & Particulars (বিবরণ)</th>
                      <th className="border border-slate-900 py-1 px-2 w-28">Head / Category</th>
                      <th className="border border-slate-900 py-1 px-2 w-24 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-900 py-1.5 px-1.5 text-center font-mono font-bold">01</td>
                      <td className="border border-slate-900 py-1.5 px-2">
                        <div className="font-bold text-slate-950 text-[11px] leading-tight">{voucher.description}</div>
                        {voucher.notes && (
                          <div className="text-[9px] text-slate-600 italic mt-0.5">Note: {voucher.notes}</div>
                        )}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 font-semibold text-slate-800">
                        {voucher.categoryName}
                      </td>
                      <td className="border border-slate-900 py-1.5 px-2 text-right font-mono font-extrabold text-slate-950 text-[11px]">
                        ৳ {voucher.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>

                    {voucher.fee && voucher.fee > 0 ? (
                      <tr>
                        <td className="border border-slate-900 py-1 px-1.5 text-center font-mono">02</td>
                        <td className="border border-slate-900 py-1 px-2 font-medium text-slate-700">
                          Transaction Fee / Service Charge
                        </td>
                        <td className="border border-slate-900 py-1 px-2 text-slate-600">Service Charge</td>
                        <td className="border border-slate-900 py-1 px-2 text-right font-mono font-bold text-slate-900">
                          ৳ {voucher.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ) : null}

                    {/* NET TOTAL ROW */}
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-[11px]">
                      <td colSpan={3} className="border border-slate-900 py-1 px-2 text-right uppercase tracking-wider text-slate-900">
                        Net Total Amount (সর্বমোট টাকা):
                      </td>
                      <td className="border border-slate-900 py-1 px-2 text-right font-mono font-black text-slate-950 text-xs">
                        ৳ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* AMOUNT IN WORDS */}
                <div className="mt-1.5 p-1.5 bg-slate-50 border border-slate-300 rounded text-[10px] flex items-center justify-between">
                  <span className="font-bold text-slate-600 uppercase text-[8.5px] shrink-0">In Words:</span>
                  <span className="font-bold text-slate-950 italic font-serif text-[10.5px] truncate ml-2">
                    {amountToWords(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. OFFICIAL SIGNATURES BLOCK */}
            <div className="pt-7">
              <div className="grid grid-cols-3 gap-6 text-center text-[9.5px]">
                <div>
                  <div className="border-t-2 border-slate-900 pt-1 font-bold text-slate-950 uppercase tracking-tight">
                    Prepared By
                  </div>
                  <div className="text-[8.5px] font-medium text-slate-600">
                    {userSettings.userName || 'Accountant'}
                  </div>
                </div>

                <div>
                  <div className="border-t-2 border-slate-900 pt-1 font-bold text-slate-950 uppercase tracking-tight">
                    Checked / Approved
                  </div>
                  <div className="text-[8.5px] font-medium text-slate-600">
                    Manager / Authority
                  </div>
                </div>

                <div>
                  <div className="border-t-2 border-slate-900 pt-1 font-bold text-slate-950 uppercase tracking-tight">
                    Receiver's Signature
                  </div>
                  <div className="text-[8.5px] font-medium text-slate-600 truncate">
                    {voucher.personOrOrganization}
                  </div>
                </div>
              </div>

              {/* Watermark Footer */}
              <div className="mt-2 pt-1 border-t border-slate-200 text-center text-[7.5px] text-slate-400 font-mono tracking-wider uppercase">
                Official Computer Generated Financial Voucher · Valid with Official Stamp & Signatures
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer (hidden in print) */}
        <div className="no-print bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            A4 Print Layout: Standard 5.5" × 4.25" Executive Corporate Voucher.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher (প্রিন্ট করুন)</span>
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
