import React, { useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  Receipt,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import {
  Account,
  Category,
  OfficeFund,
  OfficeFundSettlementSummary,
  OfficeFundStatus,
  Transaction,
  UserSettings,
} from '../../types/finance';
import { calculateOfficeFundSettlement, formatCurrency, formatDate } from '../../services/financialEngine';

interface OfficeFundModuleProps {
  officeFunds: OfficeFund[];
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  userSettings: UserSettings;
  onOpenAddFundModal: () => void;
  onOpenAddTxModal: (defaultType?: string) => void;
}

export const OfficeFundModule: React.FC<OfficeFundModuleProps> = ({
  officeFunds,
  transactions,
  accounts,
  categories,
  userSettings,
  onOpenAddFundModal,
  onOpenAddTxModal,
}) => {
  const [selectedFundId, setSelectedFundId] = useState<string>(officeFunds[0]?.id || '');

  const settlements: OfficeFundSettlementSummary[] = officeFunds.map((fund) =>
    calculateOfficeFundSettlement(fund.id, officeFunds, transactions)
  );

  const selectedSettlement =
    settlements.find((s) => s.fundId === selectedFundId) || settlements[0];

  const fundTxs = transactions.filter(
    (t) => t.relatedOfficeFundId === selectedFundId && t.status === 'completed'
  );

  const statusBadge = (status: OfficeFundStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded">OPEN</span>;
      case 'partially_settled':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">PARTIALLY SETTLED</span>;
      case 'fully_settled':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">FULLY SETTLED</span>;
      case 'returned':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-bold rounded">RETURNED</span>;
      default:
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-950 text-white p-6 rounded-2xl border border-purple-800/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 font-bold text-[10px] rounded border border-purple-500/40">
              OFFICE ADVANCE LEDGER
            </span>
            <span className="text-xs text-purple-200">Strict Employer Advance Accounting</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Employer Advances & Office Expense Settlement
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Money received from an employer for official purposes is kept in a separate office advance ledger and NOT counted as personal salary or personal income.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddFundModal}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Employer Advance</span>
          </button>
        </div>
      </div>

      {/* Office Funds List & Settlement Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Advances */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Employer Advances ({officeFunds.length})
            </h3>
            <button
              onClick={onOpenAddFundModal}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              + New Advance
            </button>
          </div>

          <div className="space-y-2">
            {officeFunds.map((fund) => {
              const settlement = settlements.find((s) => s.fundId === fund.id);
              const isSelected = selectedFundId === fund.id;

              return (
                <div
                  key={fund.id}
                  onClick={() => setSelectedFundId(fund.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{fund.title}</h4>
                    {statusBadge(settlement?.settlementStatus || fund.status)}
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">{fund.employerSource} · {formatDate(fund.dateReceived)}</p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600">Advance Amount:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(fund.amountReceived, userSettings.currencySymbol)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Settlement Breakdown */}
        {selectedSettlement && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Settlement Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">{selectedSettlement.fundTitle}</h3>
                  {statusBadge(selectedSettlement.settlementStatus)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Advance Date: {formatDate(selectedSettlement.dateReceived)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAddTxModal('office_expense')}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg border border-purple-200 transition-colors cursor-pointer"
                >
                  + Add Official Expense
                </button>
                <button
                  onClick={() => onOpenAddTxModal('personal_expense_via_office')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg border border-amber-200 transition-colors cursor-pointer"
                >
                  + Add Personal Use
                </button>
              </div>
            </div>

            {/* Settlement Formula Matrix */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Office Fund Settlement Statement Formula
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">1. Total Advance Received</span>
                  <p className="font-mono font-bold text-sm text-slate-900">
                    {formatCurrency(selectedSettlement.totalReceived, userSettings.currencySymbol)}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">2. Official Work Expenses</span>
                  <p className="font-mono font-bold text-sm text-purple-700">
                    - {formatCurrency(selectedSettlement.officialExpenses, userSettings.currencySymbol)}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">3. Personal Use Amount</span>
                  <p className="font-mono font-bold text-sm text-amber-700">
                    - {formatCurrency(selectedSettlement.personalUse, userSettings.currencySymbol)}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">4. Unspent Closing Balance</span>
                  <p className="font-mono font-bold text-sm text-emerald-700">
                    = {formatCurrency(selectedSettlement.unspentOfficeFundRemaining, userSettings.currencySymbol)}
                  </p>
                </div>
              </div>

              {selectedSettlement.reimbursementDueToUser > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                  <strong>Reimbursement Due to User:</strong> You spent {formatCurrency(selectedSettlement.reimbursementDueToUser, userSettings.currencySymbol)} of your personal money for official work beyond the advance. Employer owes you this reimbursement.
                </div>
              )}

              {selectedSettlement.personalUse > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                  <strong>Personal Use Flag:</strong> {formatCurrency(selectedSettlement.personalUse, userSettings.currencySymbol)} was used for personal purposes. This appears in personal spending reports and is deducted from the office cash balance.
                </div>
              )}
            </div>

            {/* Allocated Transactions for this Fund */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Allocated Transactions ({fundTxs.length})
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Payee</th>
                      <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fundTxs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          No expenses allocated to this office fund advance yet.
                        </td>
                      </tr>
                    ) : (
                      fundTxs.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{formatDate(tx.date)}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                tx.type === 'office_expense'
                                  ? 'bg-purple-100 text-purple-800'
                                  : tx.type === 'personal_expense_via_office'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {tx.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{tx.description}</td>
                          <td className="py-2.5 px-3 text-slate-600">{tx.payeePayer}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(tx.amount, userSettings.currencySymbol)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
