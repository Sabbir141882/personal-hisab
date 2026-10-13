import React, { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { UserSettings } from '../../types/finance';

interface SettingsModuleProps {
  userSettings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  userSettings,
  onSaveSettings,
}) => {
  const [appName, setAppName] = useState(userSettings.appName || 'My Finance');
  const [userName, setUserName] = useState(userSettings.userName || 'Sabbir Ahmed');
  const [userEmail, setUserEmail] = useState(userSettings.userEmail || 'sabbir@myfinance.bd');
  const [monthlySalary, setMonthlySalary] = useState(String(userSettings.monthlySalary || 120000));
  const [salaryPayDay, setSalaryPayDay] = useState(String(userSettings.salaryPayDay || 1));
  const [salaryEmployer, setSalaryEmployer] = useState(userSettings.salaryEmployer || 'TechCorp Bangladesh Ltd.');
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>Settings & Application Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure profile, salary defaults, currency, date formatting, and regional parameters
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          Settings successfully saved!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: User Profile */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            1. User Profile & Application Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Name</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">User Full Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">User Email Address</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Salary Configuration */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Salary Profile Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employer Name</label>
              <input
                type="text"
                value={salaryEmployer}
                onChange={(e) => setSalaryEmployer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Configured Monthly Salary (BDT / ৳)</label>
              <input
                type="number"
                step="0.01"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary Payment Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={salaryPayDay}
                onChange={(e) => setSalaryPayDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Localization */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. Localization & Regional Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Currency</label>
              <input
                type="text"
                disabled
                value="Bangladeshi Taka (BDT / ৳)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date Format Display</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 12 Oct 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-12)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
