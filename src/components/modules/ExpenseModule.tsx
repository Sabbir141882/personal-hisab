import React, { useState } from 'react';
import { Heart, PlusCircle, ShoppingBag, TrendingDown, User } from 'lucide-react';
import { Account, Category, Transaction, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';

interface ExpenseModuleProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  userSettings: UserSettings;
  onOpenAddModal: (defaultType?: string) => void;
}

export const ExpenseModule: React.FC<ExpenseModuleProps> = ({
  transactions,
  accounts,
  categories,
  userSettings,
  onOpenAddModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'personal' | 'family'>('all');

  const allExpenseTxs = transactions.filter(
    (t) =>
      t.status === 'completed' &&
      (t.type === 'personal_expense' ||
        t.type === 'family_expense' ||
        t.type === 'personal_expense_via_office')
  );

  const totalPersonal = allExpenseTxs
    .filter((t) => t.type === 'personal_expense' || t.type === 'personal_expense_via_office')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFamily = allExpenseTxs
    .filter((t) => t.type === 'family_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllExpense = totalPersonal + totalFamily;

  const filteredTxs = allExpenseTxs.filter((t) => {
    if (activeFilter === 'personal') {
      return t.type === 'personal_expense' || t.type === 'personal_expense_via_office';
    }
    if (activeFilter === 'family') {
      return t.type === 'family_expense';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <span>Expense Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Centralized hub for all personal spending, family bills, house rent, utilities, and daily expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('personal_expense')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Personal Expense</span>
          </button>
          <button
            onClick={() => onOpenAddModal('family_expense')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Heart className="w-4 h-4" />
            <span>Add Family Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'border-rose-300 bg-rose-50/70 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-600">Total Consumption Expenses</span>
          <p className="text-2xl font-bold font-sans text-rose-900 mt-1">
            {formatCurrency(totalAllExpense, userSettings.currencySymbol)}
          </p>
        </button>

        <button
          onClick={() => setActiveFilter('personal')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'personal'
              ? 'border-rose-300 bg-rose-50/70 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-600">Personal Spending</span>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-1">
            {formatCurrency(totalPersonal, userSettings.currencySymbol)}
          </p>
        </button>

        <button
          onClick={() => setActiveFilter('family')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeFilter === 'family'
              ? 'border-amber-300 bg-amber-50/70 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-600">Family & Household</span>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-1">
            {formatCurrency(totalFamily, userSettings.currencySymbol)}
          </p>
        </button>
      </div>

      {/* Expense History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Expense Records ({filteredTxs.length})
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Expenses ({allExpenseTxs.length})
            </button>
            <button
              onClick={() => setActiveFilter('personal')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'personal' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personal Only
            </button>
            <button
              onClick={() => setActiveFilter('family')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === 'family' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Family Only
            </button>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Payee / Vendor</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Ownership</th>
              <th className="py-3 px-4">Payment Account</th>
              <th className="py-3 px-4 text-right">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No expense records found matching filter.
                </td>
              </tr>
            ) : (
              filteredTxs.map((tx) => {
                const category = categories.find((c) => c.id === tx.categoryId);
                const account = accounts.find((a) => a.id === tx.sourceAccountId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-sans text-slate-600">{formatDate(tx.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.payeePayer}</td>
                    <td className="py-3 px-4 text-slate-700">{tx.description}</td>
                    <td className="py-3 px-4 text-slate-600">{category?.name || 'Uncategorized'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tx.ownership === 'family'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.ownership.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{account?.name || '-'}</td>
                    <td className="py-3 px-4 text-right font-sans font-bold text-slate-900">
                      -{formatCurrency(tx.amount, userSettings.currencySymbol)}
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
