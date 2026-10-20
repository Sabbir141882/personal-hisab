import React, { useState } from 'react';
import { Lock, Save, Settings } from 'lucide-react';
import { UserSettings } from '../../types/finance';

interface SettingsModuleProps {
  userSettings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  userSettings,
  onSaveSettings,
}) => {
  const [appName, setAppName] = useState(userSettings.appName || 'Planet Finance');
  const [userName, setUserName] = useState(userSettings.userName || 'Sabbir Ahmed');
  const [userEmail, setUserEmail] = useState(userSettings.userEmail || 'sabbir@myfinance.bd');
  const [approvalPassword, setApprovalPassword] = useState(userSettings.approvalPassword || 'Sabbir@95AR');
  const [monthlySalary, setMonthlySalary] = useState(String(userSettings.monthlySalary || 0));
  const [salaryPayDay, setSalaryPayDay] = useState(String(userSettings.salaryPayDay || 1));
  const [salaryEmployer, setSalaryEmployer] = useState(userSettings.salaryEmployer || '');
  const [dateFormat, setDateFormat] = useState(userSettings.dateFormat || 'DD MMM YYYY');
  const [timezone, setTimezone] = useState(userSettings.timezone || 'Asia/Dhaka');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...userSettings,
      appName,
      userName,
      userEmail,
      approvalPassword: approvalPassword.trim() || 'Sabbir@95AR',
      monthlySalary: parseFloat(monthlySalary) || 0,
      salaryPayDay: parseInt(salaryPayDay) || 1,
      salaryEmployer,
      dateFormat,
      timezone,
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <span>Settings & Application Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure profile, salary defaults, currency, password security, and regional parameters
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold rounded-xl">
          Settings successfully saved!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xs space-y-6 text-slate-100">
        {/* Section 1: User Profile */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            1. User Profile & Application Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Application Title</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">User Full Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">User Email Address</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Password Security */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>2. Authorization Password Security</span>
          </h3>
          <p className="text-xs text-slate-400">
            This password protects sensitive operations such as resetting data, clearing ledger entries, and locking transactions.
          </p>

          <div className="max-w-sm text-xs">
            <label className="block font-semibold text-slate-300 mb-1">Authorization Password</label>
            <input
              type="password"
              required
              value={approvalPassword}
              onChange={(e) => setApprovalPassword(e.target.value)}
              placeholder="Enter authorization password"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Section 3: Salary Configuration */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            3. Salary Profile Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Employer Name</label>
              <input
                type="text"
                value={salaryEmployer}
                onChange={(e) => setSalaryEmployer(e.target.value)}
                placeholder="e.g. Company Name"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Configured Monthly Salary (BDT)</label>
              <input
                type="number"
                step="0.01"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-bold text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Salary Payment Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={salaryPayDay}
                onChange={(e) => setSalaryPayDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Localization */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            4. Localization & Regional Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Default Currency</label>
              <input
                type="text"
                disabled
                value="Bangladeshi Taka (BDT)"
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg font-semibold text-slate-400 cursor-not-allowed text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date Format Display</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 13 Oct 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-13)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
