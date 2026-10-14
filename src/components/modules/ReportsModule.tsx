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
import { calculateFinancialSummary, filterTransactions, formatCurrency, formatDate, formatNumberOnly } from '../../services/financialEngine';
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
            <span>Executive Financial Reporting Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate custom date-wise, monthly, category-wise, and office fund statements
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
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Official PDF Report</span>
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
              <option value="personal_expense">Personal Expense Statement</option>
              <option value="family_expense">Family Expense Statement</option>
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
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm space-y-6">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-200 uppercase tracking-wide">
              OFFICIAL STATEMENT PREVIEW
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 uppercase tracking-tight">{reportType.replace(/_/g, ' ')} STATEMENT</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Period: {startDate && endDate ? `${startDate} to ${endDate}` : 'All Historical Records'} · Total Records: {filteredTxs.length}
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-900 text-sm">{userSettings.appName}</p>
            <p className="text-slate-500">{userSettings.userName}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Executive Metrics Cards in Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Personal Income</span>
            <p className="text-xl font-bold font-sans tracking-tight text-emerald-950 tabular-nums">
              {formatCurrency(summary.totalPersonalIncome, userSettings.currencySymbol)}
            </p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Total Personal Expenses</span>
            <p className="text-xl font-bold font-sans tracking-tight text-rose-950 tabular-nums">
              {formatCurrency(summary.totalPersonalExpenses, userSettings.currencySymbol)}
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Total Family Expenses</span>
            <p className="text-xl font-bold font-sans tracking-tight text-amber-950 tabular-nums">
              {formatCurrency(summary.totalFamilyExpenses, userSettings.currencySymbol)}
            </p>
          </div>

          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">Net Wallet Cash Balance</span>
            <p className="text-xl font-bold font-sans tracking-tight text-sky-950 tabular-nums">
              {formatCurrency(summary.totalCashAndBankBalances, userSettings.currencySymbol)}
            </p>
          </div>
        </div>

        {/* Report Transactions Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payee / Counterparty</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    No transactions match the selected report parameters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const category = categories.find((c) => c.id === tx.categoryId);
                  const account = accounts.find((a) => a.id === tx.sourceAccountId);
                  const isIncome =
                    tx.type === 'personal_income' ||
                    tx.type === 'salary_income' ||
                    tx.type === 'office_fund_received' ||
                    tx.type === 'additional_income' ||
                    tx.type === 'refund';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{tx.payeePayer}</td>
                      <td className="py-3 px-4 text-slate-700">{category?.name || 'Uncategorized'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold">
                          {tx.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{account?.name || '-'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-sans tracking-tight tabular-nums">
                        <span className={isIncome ? 'text-emerald-700' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}{formatNumberOnly(tx.amount)}
                        </span>
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
