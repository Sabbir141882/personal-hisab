import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';

interface ApproveLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (passwordInput: string) => boolean; // returns true if password matched
  unapprovedCount: number;
  isSingleTx?: boolean;
}

export const ApproveLockModal: React.FC<ApproveLockModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  unapprovedCount,
  isSingleTx = false,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = onConfirmApprove(password);
    if (success) {
      setPassword('');
      onClose();
    } else {
      setErrorMsg('Incorrect password! Please enter the correct password to finalize and lock entries.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPassword('');
        setErrorMsg('');
        onClose();
      }}
      title={isSingleTx ? "Approve & Lock Single Transaction Entry" : "Final Approve & Lock Ledger Entries"}
      subtitle="Once approved with password, selected record(s) will be permanently locked and cannot be edited or deleted"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Permanent Lock Warning ({unapprovedCount} {unapprovedCount === 1 ? 'Entry' : 'Entries'} Selected)</span>
          </p>
          <p>
            You are about to give final approval to <strong>{unapprovedCount}</strong> {unapprovedCount === 1 ? 'transaction record' : 'transaction record(s)'}. After entering the authorization password, these records will be marked as <strong className="text-emerald-800">APPROVED & LOCKED</strong>. No further editing, modification or deletion will be allowed!
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Authorization Password *
          </label>
          <input
            type="password"
            required
            placeholder="Enter authorization password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              setPassword('');
              setErrorMsg('');
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Password & Approve ({unapprovedCount})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

