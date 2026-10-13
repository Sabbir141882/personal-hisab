import React, { useState } from 'react';
import { AlertCircle, PieChart, Plus } from 'lucide-react';
import { Budget, Category, Transaction, UserSettings } from '../../types/finance';
import { calculateBudgetUtilization, formatCurrency } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface BudgetsModuleProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  userSettings: UserSettings;
  onSaveBudget: (budgetData: Partial<Budget>) => void;
}

export const BudgetsModule: React.FC<BudgetsModuleProps> = ({
  budgets,
  transactions,
  categories,
  userSettings,
  onSaveBudget,
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [ownership, setOwnership] = useState<'personal' | 'family' | 'overall'>('personal');

  const utilizationList = calculateBudgetUtilization(budgets, transactions, categories, selectedMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0 || !categoryId) return;

    onSaveBudget({
      month: selectedMonth,
      categoryId,
      ownership,
      budgetAmount: amount,
      alertThreshold: 80,
      rollover: false,
    });

    setBudgetAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-sky-600" />
            <span>Monthly Budget Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Set spending limits by category, track utilization, and prevent overspending
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {/* Utilization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {utilizationList.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 italic">
            No budget rules defined for {selectedMonth}. Click "Set Category Budget" to create one.
          </div>
        ) : (
          utilizationList.map((item) => (
            <div key={item.budget.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.categoryName}</h3>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    {item.budget.ownership.toUpperCase()} BUDGET
                  </span>
                </div>
                {item.isOverBudget && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>OVER BUDGET</span>
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Spent: {formatCurrency(item.actualSpent, userSettings.currencySymbol)}</span>
                  <span className="font-bold text-slate-900">
                    Target: {formatCurrency(item.budget.budgetAmount, userSettings.currencySymbol)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.isOverBudget ? 'bg-rose-500' : item.percentageUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentageUsed)}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-right">
                {item.remaining >= 0
                  ? `${formatCurrency(item.remaining, userSettings.currencySymbol)} remaining`
                  : `${formatCurrency(Math.abs(item.remaining), userSettings.currencySymbol)} over target`}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Monthly Category Budget" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Month</label>
            <input
              type="month"
              required
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.purpose.toUpperCase()})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Amount (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope *</label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="personal">Personal Spending</option>
                <option value="family">Family Spending</option>
                <option value="overall">Overall</option>
              </select>
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
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
