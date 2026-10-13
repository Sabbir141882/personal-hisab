import React, { useState } from 'react';
import { BarChart3, Download, FileText, Filter, Printer } from 'lucide-react';
import {
  Account,
  Category,
  FilterOptions,
  OfficeFund,
  Transaction,
  UserSettings,
} from '../../types/finance';
import { calculateFinancialSummary, filterTransactions, formatCurrency, formatDate } from '../../services/financialEngine';
import { exportTransactionsToCsv } from '../../services/csvExporter';
import { generatePdfReport } from '../../services/pdfReportGenerator';

interface ReportsModuleProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  officeFunds: OfficeFund[];
  userSettings: UserSettings;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  transactions,
  accounts,
  categories,
  officeFunds,
  userSettings,
}) => {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const filters: FilterOptions = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    ownership: selectedOwnership as any,
    categoryId: selectedCategory,
    accountId: selectedAccount,
  };

  const filteredTxs = filterTransactions(transactions, filters);
  const summary = calculateFinancialSummary(transactions, accounts, officeFunds, [], filters);

  const handleDownloadPdf = () => {
    const pdf = generatePdfReport({
      reportTitle: `${reportType.replace(/_/g, ' ').toUpperCase()} REPORT`,
      reportPeriodText: startDate && endDate ? `${startDate} to ${endDate}` : 'All Recorded Transactions',
      userSettings,
      summary,
      transactions: filteredTxs,
      accounts,
      categories,
      officeFunds,
      filtersText: `Ownership: ${selectedOwnership.toUpperCase()} · Account: ${selectedAccount}`,
      reportType,
    });
    pdf.save(`my_finance_report_${Date.now()}.pdf`);
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTxs, accounts, categories, 'my_finance_report.csv');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>Advanced Financial Reporting Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate custom date-wise, monthly, category-wise, office fund, and cash flow reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report to PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Report Configuration Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="monthly">Monthly Consolidated Report</option>
              <option value="date_wise">Date-Wise Detailed Ledger</option>
              <option value="category_wise">Category-Wise Breakdown</option>
              <option value="office_settlement">Office Fund Settlement Report</option>
              <option value="personal_expense">Personal Expense Report</option>
              <option value="family_expense">Family Expense Report</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Ownership Scope</label>
            <select
              value={selectedOwnership}
              onChange={(e) => setSelectedOwnership(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Ownerships</option>
              <option value="personal">Personal</option>
              <option value="office">Office (Work)</option>
              <option value="family">Family</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Account Filter</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Generated Report Preview Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
              REPORT PREVIEW
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 uppercase">{reportType.replace(/_/g, ' ')} REPORT</h3>
            <p className="text-xs text-slate-500">
              Period: {startDate && endDate ? `${startDate} to ${endDate}` : 'All Historical Records'} · Filtered Records: {filteredTxs.length}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">{userSettings.appName} Ledger System</p>
            <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Summary Metrics Grid in Report */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-semibold">Total Personal Income</span>
            <span className="font-mono font-bold text-sm text-emerald-700">
              {formatCurrency(summary.totalPersonalIncome, userSettings.currencySymbol)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-semibold">Total Personal Expenses</span>
            <span className="font-mono font-bold text-sm text-rose-700">
              {formatCurrency(summary.totalPersonalExpenses, userSettings.currencySymbol)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-semibold">Total Family Expenses</span>
            <span className="font-mono font-bold text-sm text-amber-700">
              {formatCurrency(summary.totalFamilyExpenses, userSettings.currencySymbol)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-semibold">Net Personal Cashflow</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {formatCurrency(summary.netPersonalCashFlow, userSettings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Report Transactions Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Payee / Party</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No transactions match the selected report parameters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const category = categories.find((c) => c.id === tx.categoryId);
                  const account = accounts.find((a) => a.id === tx.sourceAccountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 font-mono">
                      <td className="py-2.5 px-3 text-slate-600">{formatDate(tx.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{tx.payeePayer}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-sans">{category?.name || 'Uncategorized'}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold">
                          {tx.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{account?.name || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(tx.amount, userSettings.currencySymbol)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
