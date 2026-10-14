import React, { useState } from 'react';
import { Plus, Target, Trophy } from 'lucide-react';
import { SavingsGoal, UserSettings } from '../../types/finance';
import { formatCurrency, formatDate } from '../../services/financialEngine';
import { Modal } from '../common/Modal';

interface SavingsModuleProps {
  savingsGoals: SavingsGoal[];
  userSettings: UserSettings;
  onSaveGoal: (goalData: Partial<SavingsGoal>) => void;
}

export const SavingsModule: React.FC<SavingsModuleProps> = ({
  savingsGoals,
  userSettings,
  onSaveGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0 || !title.trim()) return;

    onSaveGoal({
      title,
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || '2027-12-31',
      category: 'General Savings',
      status: 'active',
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            <span>Savings & Financial Goals</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Emergency reserves, DPS, and purchase target progress tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{goal.title}</h3>
                  <p className="text-[10px] text-slate-500">Target Date: {formatDate(goal.targetDate)}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  {goal.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">
                    Saved: {formatCurrency(goal.currentAmount, userSettings.currencySymbol)}
                  </span>
                  <span className="font-bold text-slate-900">
                    Target: {formatCurrency(goal.targetAmount, userSettings.currencySymbol)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-right font-medium">
                {percentage.toFixed(0)}% Achieved · {formatCurrency(goal.targetAmount - goal.currentAmount, userSettings.currencySymbol)} remaining
              </p>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Financial Goal" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Reserve Fund, MacBook Upgrade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (BDT) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Saved (BDT)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
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
              Create Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
