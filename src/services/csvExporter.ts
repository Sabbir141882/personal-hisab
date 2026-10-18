import { Account, Category, Transaction, formatTransactionType } from '../types/finance';
import { formatDate } from './financialEngine';

const sanitizeCell = (text: string | number | undefined | null): string => {
  if (text === null || text === undefined) return '""';
  let str = String(text).replace(/"/g, '""');
  // Prevent CSV injection vulnerability
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = `'${str}`;
  }
  return `"${str}"`;
};

export const exportTransactionsToCsv = (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[],
  filename = 'my_finance_transactions.csv'
) => {
  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Ownership',
    'Payee / Payer',
    'Category',
    'Subcategory',
    'Amount (BDT)',
    'Fee (BDT)',
    'Source Account',
    'Destination Account',
    'Description',
    'Reference Number',
    'Related Office Fund ID',
    'Status',
  ];

  const rows = transactions.map((tx) => {
    const srcAccount = accounts.find((a) => a.id === tx.sourceAccountId)?.name || tx.sourceAccountId;
    const destAccount = tx.destinationAccountId
      ? accounts.find((a) => a.id === tx.destinationAccountId)?.name || tx.destinationAccountId
      : '';
    const category = categories.find((c) => c.id === tx.categoryId);
    const subcat = category?.subcategories?.find((s) => s.id === tx.subcategoryId)?.name || '';

    return [
      sanitizeCell(tx.id),
      sanitizeCell(formatDate(tx.date)),
      sanitizeCell(tx.time || ''),
      sanitizeCell(formatTransactionType(tx.type)),
      sanitizeCell(tx.ownership),
      sanitizeCell(tx.payeePayer),
      sanitizeCell(category?.name || 'Uncategorized'),
      sanitizeCell(subcat),
      sanitizeCell(tx.amount),
      sanitizeCell(tx.fee || 0),
      sanitizeCell(srcAccount),
      sanitizeCell(destAccount),
      sanitizeCell(tx.description),
      sanitizeCell(tx.referenceNumber || ''),
      sanitizeCell(tx.relatedOfficeFundId || ''),
      sanitizeCell(tx.status),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
