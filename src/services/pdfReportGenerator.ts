import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Account, Category, FinancialSummary, OfficeFund, Transaction, UserSettings, formatTransactionType } from '../types/finance';
import { formatCurrency, formatDate, formatNumberOnly } from './financialEngine';

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

  const currencySymbol = userSettings.currencySymbol || 'BDT';
  const primaryColor: [number, number, number] = [15, 23, 42]; // dark slate #0f172a
  const marginX = 14;
  let currentY = 16;

  // Top Corporate Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(userSettings.appName || 'My Finance', marginX, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Executive Financial Statement — ${userSettings.userName}`, marginX, 19);

  const timestampText = `Date: ${new Date().toLocaleDateString('en-GB')}`;
  doc.text(timestampText, 210 - marginX - doc.getTextWidth(timestampText), 19);

  currentY = 34;

  // Report Title & Period
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle.toUpperCase(), marginX, currentY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Reporting Period: ${reportPeriodText}`, marginX, currentY + 5);

  if (filtersText) {
    doc.text(`Active Scope: ${filtersText}`, marginX, currentY + 10);
    currentY += 5;
  }

  currentY += 16;

  // Summary Metrics Cards (Executive 2x2 Grid)
  const cardWidth = 88;
  const cardHeight = 20;
  const cardGapX = 6;
  const cardGapY = 4;

  const formatPdfAmount = (amount: number): string => {
    return `BDT ${formatNumberOnly(amount)}`;
  };

  const executiveMetrics = [
    {
      label: 'TOTAL PERSONAL INCOME',
      value: formatPdfAmount(summary.totalPersonalIncome),
      bgColor: [240, 253, 244] as [number, number, number], // soft emerald
      borderColor: [187, 247, 208] as [number, number, number],
      textColor: [6, 78, 59] as [number, number, number],
    },
    {
      label: 'TOTAL PERSONAL EXPENSES',
      value: formatPdfAmount(summary.totalPersonalExpenses),
      bgColor: [254, 242, 242] as [number, number, number], // soft rose
      borderColor: [254, 202, 202] as [number, number, number],
      textColor: [136, 19, 55] as [number, number, number],
    },
    {
      label: 'TOTAL FAMILY EXPENSES',
      value: formatPdfAmount(summary.totalFamilyExpenses),
      bgColor: [255, 251, 235] as [number, number, number], // soft amber
      borderColor: [253, 230, 138] as [number, number, number],
      textColor: [120, 53, 15] as [number, number, number],
    },
    {
      label: 'TOTAL NET CASH & BANK BALANCE',
      value: formatPdfAmount(summary.totalCashAndBankBalances),
      bgColor: [240, 249, 255] as [number, number, number], // soft sky
      borderColor: [186, 230, 253] as [number, number, number],
      textColor: [12, 74, 110] as [number, number, number],
    },
  ];

  executiveMetrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = marginX + col * (cardWidth + cardGapX);
    const y = currentY + row * (cardHeight + cardGapY);

    doc.setFillColor(...m.bgColor);
    doc.setDrawColor(...m.borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 4, y + 6);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...m.textColor);
    doc.text(m.value, x + 4, y + 14);
  });

  currentY += 2 * (cardHeight + cardGapY) + 8;

  // Transactions Ledger Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Financial Ledger Records', marginX, currentY);

  currentY += 4;

  const tableRows = transactions.map((tx) => {
    const acc = accounts.find((a) => a.id === tx.sourceAccountId);
    const cat = categories.find((c) => c.id === tx.categoryId);

    const typeLabel = formatTransactionType(tx.type).toUpperCase();

    return [
      formatDate(tx.date),
      tx.payeePayer || '-',
      cat?.name || 'Uncategorized',
      typeLabel,
      acc?.name || 'Account',
      formatNumberOnly(tx.amount),
      tx.ownership.toUpperCase(),
      tx.isApproved ? 'APPROVED' : 'PENDING',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Payee / Counterparty', 'Category', 'Type', 'Account', 'Amount', 'Owner', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      fontStyle: 'normal',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Date
      1: { cellWidth: 34 }, // Payee
      2: { cellWidth: 32 }, // Category
      3: { cellWidth: 26 }, // Type
      4: { cellWidth: 26 }, // Account
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }, // Amount
      6: { cellWidth: 16, halign: 'center' }, // Owner
      7: { cellWidth: 18, halign: 'center' }, // Status
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);

      doc.text(
        `My Finance Executive Report | Page ${data.pageNumber} of ${pageCount}`,
        marginX,
        pageHeight - 8
      );
      doc.text('Confidential Financial Document', 210 - marginX - 45, pageHeight - 8);
    },
  });

  return doc;
};
