import React from 'react';
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
  const expenseTxs = transactions.filter(
    (t) =>
      t.status === 'completed' &&
      (t.type === 'personal_expense' ||
        t.type === 'family_expense' ||
        t.type === 'personal_expense_via_office')
  );

  const totalPersonal = expenseTxs
    .filter((t) => t.type === 'personal_expense' || t.type === 'personal_expense_via_office')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFamily = expenseTxs
    .filter((t) => t.type === 'family_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllExpense = totalPersonal + totalFamily;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <span>Expense Management Overview</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracks personal spending, family bills, utilities, rent, and household support
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
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
          <span className="text-xs font-semibold text-rose-700">Total Consumption Expenses</span>
          <p className="text-2xl font-bold font-mono text-rose-900">
            {formatCurrency(totalAllExpense, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <span className="text-xs font-semibold text-slate-500">Personal Spending</span>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalPersonal, userSettings.currencySymbol)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
          <span className="text-xs font-semibold text-slate-500">Family & Household</span>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalFamily, userSettings.currencySymbol)}
          </p>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Expense Records ({expenseTxs.length})
          </h3>
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
            {expenseTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No expense records found.
                </td>
              </tr>
            ) : (
              expenseTxs.map((tx) => {
                const category = categories.find((c) => c.id === tx.categoryId);
                const account = accounts.find((a) => a.id === tx.sourceAccountId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-600">{formatDate(tx.date)}</td>
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
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
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
