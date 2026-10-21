import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckSquare,
  Download,
  FileText,
  Filter,
  Lock,
  PlusCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Square,
  Unlock,
} from 'lucide-react';
import {
  Account,
  Category,
  FilterOptions,
  OfficeFund,
  Transaction,
  UserSettings,
  formatTransactionType,
} from '../../types/finance';
import { filterTransactions, formatCurrency, formatDate, isUnpassBillTx } from '../../services/financialEngine';
import { exportTransactionsToCsv } from '../../services/csvExporter';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TransactionsModuleProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  officeFunds: OfficeFund[];
  userSettings: UserSettings;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onReverseTransaction: (txId: string) => void;
  onOpenApproveModal: (targetTxIds?: string[]) => void;
  onViewVoucher?: (tx: Transaction) => void;
}

export const TransactionsModule: React.FC<TransactionsModuleProps> = ({
  transactions,
  accounts,
  categories,
  officeFunds,
  userSettings,
  onOpenAddModal,
  onEditTransaction,
  onReverseTransaction,
  onOpenApproveModal,
  onViewVoucher,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [confirmTxId, setConfirmTxId] = useState<string | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  const filters: FilterOptions = {
    searchQuery,
    transactionType: selectedType as any,
    ownership: selectedOwnership as any,
    accountId: selectedAccount,
    categoryId: selectedCategory,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    includeUnapproved: true,
  };

  const filtered = filterTransactions(transactions, filters);
  const unapprovedTxs = transactions.filter((t) => t.status === 'completed' && !t.isApproved);
  const unapprovedCount = unapprovedTxs.length;

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    exportTransactionsToCsv(filtered, accounts, categories, 'my_finance_ledger.csv');
  };

  const toggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPageUnapproved = () => {
    const pageUnapprovedIds = paginated.filter((t) => !t.isApproved).map((t) => t.id);
    const allSelected = pageUnapprovedIds.every((id) => selectedTxIds.includes(id));

    if (allSelected) {
      setSelectedTxIds((prev) => prev.filter((id) => !pageUnapprovedIds.includes(id)));
    } else {
      setSelectedTxIds((prev) => Array.from(new Set([...prev, ...pageUnapprovedIds])));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, payee, ref #, tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {selectedTxIds.length > 0 && (
              <button
                onClick={() => {
                  onOpenApproveModal(selectedTxIds);
                  setSelectedTxIds([]);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve Selected ({selectedTxIds.length})</span>
              </button>
            )}

            {unapprovedCount > 0 && (
              <button
                onClick={() => onOpenApproveModal()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve All Pending ({unapprovedCount})</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ownership</label>
            <select
              value={selectedOwnership}
              onChange={(e) => {
                setSelectedOwnership(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Ownerships</option>
              <option value="personal">Personal</option>
              <option value="office">Office (Work)</option>
              <option value="family">Family</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Types</option>
              <option value="salary_income">Income</option>
              <option value="personal_expense">Personal Expense</option>
              <option value="family_expense">Family Expense</option>
              <option value="baby_expense">Baby Expense</option>
              <option value="mobile_expense">Mobile Expense</option>
              <option value="office_fund_received">Office Money Received</option>
              <option value="office_expense">Office Expense</option>
              <option value="office_fund_returned">Office Money Return</option>
              <option value="receivable_collection">Money Received</option>
              <option value="loan_issued">Money Given</option>
              <option value="account_transfer">Money Transfer</option>
              <option value="savings_contribution">Savings</option>
              <option value="investment">Investment</option>
              <option value="loan_received">Loan Received</option>
              <option value="loan_given">Loan Given</option>
              <option value="debt_repayment">Loan Repayment</option>
              <option value="other_expense">Other Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    title="Select/Deselect all pending on this page"
                    onChange={toggleSelectAllPageUnapproved}
                    className="rounded border-slate-300 text-sky-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Description & Payee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Approval</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3 text-right">Amount (BDT)</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No transactions found matching your selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const category = categories.find((c) => c.id === tx.categoryId);
                  const account = accounts.find((a) => a.id === tx.sourceAccountId);
                  const isIncome =
                    tx.type === 'personal_income' ||
                    tx.type === 'salary_income' ||
                    tx.type === 'office_fund_received' ||
                    tx.type === 'additional_income' ||
                    tx.type === 'refund';
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {!tx.isApproved ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTx(tx.id)}
                            className="rounded border-slate-300 text-sky-600 cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-300 text-[10px]">🔒</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-600 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{tx.description}</div>
                        <div className="text-[10px] text-slate-500">
                          {tx.payeePayer} {tx.referenceNumber && `· Ref: ${tx.referenceNumber}`}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {category?.name || 'Uncategorized'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            tx.type === 'office_fund_received'
                              ? 'bg-purple-100 text-purple-800'
                              : isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatTransactionType(tx.type).toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {tx.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700/60">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            <span>APPROVED & FINAL</span>
                          </span>
                        ) : isUnpassBillTx(tx, accounts) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-900/80 text-amber-200 rounded border border-amber-600/60" title="UNPASS BIL: Balance hits live balance immediately, approve option active">
                            <Unlock className="w-3 h-3 text-amber-300" />
                            <span>UNPASS BIL (LIVE BALANCE ACTIVE)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-700/60">
                            <Unlock className="w-3 h-3 text-amber-400" />
                            <span>UNAPPROVED (ব্যালেন্স আপডেট হবে না)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-300">{account?.name || '-'}</td>

                      <td className="py-3 px-3 text-right font-sans font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-400' : 'text-slate-200'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, userSettings.currencySymbol)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {onViewVoucher && (
                            <button
                              onClick={() => onViewVoucher(tx)}
                              className="px-2 py-1 text-[10px] font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 rounded border border-slate-700 cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                              title="View & Print Voucher (ভাউচার দেখুন ও প্রিন্ট করুন)"
                            >
                              <FileText className="w-3 h-3 text-sky-400" />
                              <span>Voucher</span>
                            </button>
                          )}

                          {tx.isApproved ? (
                            <span
                              className="text-[10px] text-emerald-400 font-semibold cursor-not-allowed flex items-center gap-1"
                              title="Approved with password. Locked and finalized."
                            >
                              🔒 Finalized
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => onOpenApproveModal([tx.id])}
                                className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded border border-emerald-500 cursor-pointer flex items-center gap-1 shadow-xs active:scale-98"
                                title="Approve this entry with password to update live account balance"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                <span>Approve (পাসওয়ার্ড দিন)</span>
                              </button>
                              <button
                                onClick={() => onEditTransaction(tx)}
                                className="px-2 py-1 text-[10px] font-semibold text-sky-600 hover:bg-sky-50 rounded cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmTxId(tx.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Reverse Record"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reversal Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmTxId}
        onClose={() => setConfirmTxId(null)}
        onConfirm={() => {
          if (confirmTxId) onReverseTransaction(confirmTxId);
        }}
        title="Reverse Transaction Entry"
        message="Reversing this unapproved record will exclude it from active totals."
        confirmLabel="Reverse Entry"
        isDanger={true}
      />
    </div>
  );
};

