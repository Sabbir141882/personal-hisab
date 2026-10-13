import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Account, Category, FinancialSummary, OfficeFund, Transaction, UserSettings } from '../types/finance';
import { formatCurrency, formatDate } from './financialEngine';

export interface ReportPdfOptions {
  reportTitle: string;
  reportPeriodText: string;
  userSettings: UserSettings;
  summary: FinancialSummary;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  officeFunds: OfficeFund[];
  filtersText?: string;
  reportType: string;
}

export const generatePdfReport = (options: ReportPdfOptions): jsPDF => {
  const {
    reportTitle,
    reportPeriodText,
    userSettings,
    summary,
    transactions,
    accounts,
    categories,
    filtersText,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencySymbol = userSettings.currencySymbol || '৳';
  const primaryColor: [number, number, number] = [15, 23, 42]; // dark slate #0f172a
  const accentColor: [number, number, number] = [2, 132, 199]; // sky #0284c7

  // Helper for text formatting
  const marginX = 14;
  let currentY = 16;

  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(userSettings.appName || 'My Finance', marginX, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Financial Report — ${userSettings.userName}`, marginX, 18);

  const timestampText = `Generated: ${new Date().toLocaleString('en-GB')}`;
  doc.text(timestampText, 210 - marginX - doc.getTextWidth(timestampText), 18);

  currentY = 32;

  // Report Title Block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle.toUpperCase(), marginX, currentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${reportPeriodText}`, marginX, currentY + 5);

  if (filtersText) {
    doc.text(`Active Filters: ${filtersText}`, marginX, currentY + 10);
    currentY += 5;
  }

  currentY += 15;

  // Key Financial Metrics Summary Cards (2x4 grid in PDF)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);

  const cardWidth = 43;
  const cardHeight = 16;
  const cardGap = 3;

  const summaryMetrics = [
    { label: 'Total Personal Income', value: formatCurrency(summary.totalPersonalIncome, currencySymbol) },
    { label: 'Total Personal Exp', value: formatCurrency(summary.totalPersonalExpenses, currencySymbol) },
    { label: 'Total Family Exp', value: formatCurrency(summary.totalFamilyExpenses, currencySymbol) },
    { label: 'Net Personal Cashflow', value: formatCurrency(summary.netPersonalCashFlow, currencySymbol) },
    { label: 'Office Funds Received', value: formatCurrency(summary.totalOfficeFundsReceived, currencySymbol) },
    { label: 'Official Office Exp', value: formatCurrency(summary.totalOfficeExpenses, currencySymbol) },
    { label: 'Personal Use (Office)', value: formatCurrency(summary.totalPersonalExpensesViaOffice, currencySymbol) },
    { label: 'Unspent Office Funds', value: formatCurrency(summary.totalOfficeFundsUnspent, currencySymbol) },
  ];

  summaryMetrics.forEach((m, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = marginX + col * (cardWidth + cardGap);
    const y = currentY + row * (cardHeight + cardGap);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 2, y + 5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, x + 2, y + 11);
  });

  currentY += 2 * (cardHeight + cardGap) + 8;

  // Transactions Detailed Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Ledger Records', marginX, currentY);

  currentY += 4;

  const tableRows = transactions.map((tx) => {
    const acc = accounts.find((a) => a.id === tx.sourceAccountId);
    const cat = categories.find((c) => c.id === tx.categoryId);

    // Format transaction type display
    let typeLabel = tx.type.replace(/_/g, ' ').toUpperCase();
    if (tx.type === 'personal_expense_via_office') {
      typeLabel = 'PERS VIA OFFICE';
    }

    return [
      formatDate(tx.date),
      tx.payeePayer || '-',
      cat?.name || 'Uncategorized',
      typeLabel,
      acc?.name || 'Account',
      formatCurrency(tx.amount, currencySymbol),
      tx.ownership.toUpperCase(),
      tx.status.toUpperCase(),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Payee / Party', 'Category', 'Type', 'Account', 'Amount', 'Owner', 'Status']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 32 }, // Payee
      2: { cellWidth: 32 }, // Category
      3: { cellWidth: 28 }, // Type
      4: { cellWidth: 28 }, // Account
      5: { cellWidth: 24, halign: 'right' }, // Amount
      6: { cellWidth: 16, halign: 'center' }, // Owner
      7: { cellWidth: 16, halign: 'center' }, // Status
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);

      doc.text(
        `My Finance Ledger Report | Page ${data.pageNumber} of ${pageCount}`,
        marginX,
        pageHeight - 8
      );
      doc.text('Confidential Financial Document', 210 - marginX - 45, pageHeight - 8);
    },
  });

  return doc;
};
