import React, { useState } from 'react';
import { Briefcase, Calendar, CheckCircle, DollarSign, FileText, PlusCircle, TrendingUp } from 'lucide-react';
import { Account, Category, Transaction, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';

interface IncomeModuleProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  userSettings: UserSettings;
  onOpenAddModal: (defaultType?: string) => void;
  onViewVoucher?: (tx: Transaction) => void;
}

export const IncomeModule: React.FC<IncomeModuleProps> = ({
  transactions,
  accounts,
  categories,
  userSettings,
  onOpenAddModal,
  onViewVoucher,
}) => {
  const incomeTxs = transactions.filter(
    (t) =>
      t.status === 'completed' &&
      (t.type === 'salary_income' ||
        t.type === 'personal_income' ||
        t.type === 'additional_income')
  );

  const totalSalary = incomeTxs
    .filter((t) => t.type === 'salary_income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAdditional = incomeTxs
    .filter((t) => t.type === 'additional_income' || t.type === 'personal_income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllIncome = totalSalary + totalAdditional;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Personal & Salary Income Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracks monthly salary, bonuses, overtime, freelance, and custom earnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('salary_income')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Salary Income</span>
          </button>
          <button
            onClick={() => onOpenAddModal('additional_income')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            + Additional Income
          </button>
        </div>
      </div>

      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
          <span className="text-xs font-semibold text-emerald-700">Total Recorded Income</span>
          <p className="text-2xl font-bold font-sans text-emerald-900">
            {formatCurrency(totalAllIncome, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <span className="text-xs font-semibold text-slate-500">Salary & Bonus Income</span>
          <p className="text-2xl font-bold font-sans text-slate-900">
            {formatCurrency(totalSalary, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <span className="text-xs font-semibold text-slate-500">Freelance & Additional</span>
          <p className="text-2xl font-bold font-sans text-slate-900">
            {formatCurrency(totalAdditional, userSettings.currencySymbol)}
          </p>
        </div>
      </div>

      {/* Salary Configuration & Expectation Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-600" />
          <span>Configured Monthly Salary Profile</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Employer Name:</span>
            <span className="font-bold text-slate-800">{userSettings.salaryEmployer || 'Not set'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Configured Basic Salary:</span>
            <span className="font-bold text-slate-800 font-sans">
              {formatCurrency(userSettings.monthlySalary, userSettings.currencySymbol)} / month
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block">Expected Payment Day:</span>
            <span className="font-bold text-slate-800">
              Day {userSettings.salaryPayDay} of every month
            </span>
          </div>
        </div>
      </div>

      {/* Income Records Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Income Disbursement History ({incomeTxs.length})
          </h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Employer / Payer</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Receiving Account</th>
              <th className="py-3 px-4 text-right">Amount (BDT)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incomeTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No income records found.
                </td>
              </tr>
            ) : (
              incomeTxs.map((tx) => {
                const account = accounts.find((a) => a.id === tx.sourceAccountId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-sans text-slate-600">{formatDate(tx.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.payeePayer}</td>
                    <td className="py-3 px-4 text-slate-700">{tx.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        {tx.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{account?.name || '-'}</td>
                    <td className="py-3 px-4 text-right font-sans font-bold text-emerald-700">
                      +{formatCurrency(tx.amount, userSettings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onViewVoucher && (
                        <button
                          onClick={() => onViewVoucher(tx)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded border border-slate-300 inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          title="View & Print Voucher (ভাউচার দেখুন ও প্রিন্ট করুন)"
                        >
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>Voucher</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
