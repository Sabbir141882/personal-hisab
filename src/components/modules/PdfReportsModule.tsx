import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { Account, Category, OfficeFund, Transaction, UserSettings } from '../../types/finance';
import { calculateFinancialSummary, formatCurrency } from '../../services/financialEngine';
import { generatePdfReport } from '../../services/pdfReportGenerator';

interface PdfReportsModuleProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  officeFunds: OfficeFund[];
  userSettings: UserSettings;
}

export const PdfReportsModule: React.FC<PdfReportsModuleProps> = ({
  transactions,
  accounts,
  categories,
  officeFunds,
  userSettings,
}) => {
  const [reportTitle, setReportTitle] = useState('OFFICIAL MONTHLY FINANCIAL STATEMENT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const summary = calculateFinancialSummary(transactions, accounts, officeFunds, []);

  const handleGenerateAndDownload = () => {
    const pdf = generatePdfReport({
      reportTitle,
      reportPeriodText: startDate && endDate ? `${startDate} to ${endDate}` : 'Complete Ledger Period',
      userSettings,
      summary,
      transactions,
      accounts,
      categories,
      officeFunds,
      reportType: 'PDF_EXECUTIVE_REPORT',
    });
    pdf.save(`my_finance_official_report_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>Dedicated PDF Report Generation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generates vector PDF reports formatted in BDT (৳) without website sidebars or UI clutter
          </p>
        </div>

        <button
          onClick={handleGenerateAndDownload}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download A4 PDF Report</span>
        </button>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">PDF Report Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Report Header Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* PDF Document Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-md max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base">{userSettings.appName}</h1>
            <p className="text-xs text-slate-300">Official Financial Statement · {userSettings.userName}</p>
          </div>
          <span className="text-xs font-mono">{new Date().toLocaleDateString('en-GB')}</span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 uppercase">{reportTitle}</h2>
          <p className="text-xs text-slate-500">
            Period: {startDate && endDate ? `${startDate} to ${endDate}` : 'All Ledger Entries'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-sans">Personal Income</span>
            <span className="font-bold text-emerald-700">{formatCurrency(summary.totalPersonalIncome, userSettings.currencySymbol)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-sans">Personal Expenses</span>
            <span className="font-bold text-rose-700">{formatCurrency(summary.totalPersonalExpenses, userSettings.currencySymbol)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-sans">Office Advances</span>
            <span className="font-bold text-purple-700">{formatCurrency(summary.totalOfficeFundsReceived, userSettings.currencySymbol)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-sans">Official Office Exp</span>
            <span className="font-bold text-slate-900">{formatCurrency(summary.totalOfficeExpenses, userSettings.currencySymbol)}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 italic text-center pt-4 border-t border-slate-100">
          Clicking "Download A4 PDF Report" generates a pristine multi-page vector PDF file formatted for A4 printing.
        </p>
      </div>
    </div>
  );
};
