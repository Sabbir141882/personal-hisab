import React from 'react';
import { Activity } from 'lucide-react';
import { AuditEvent } from '../../types/finance';
import { formatDate } from '../../services/financialEngine';

interface AuditLogModuleProps {
  auditLogs: AuditEvent[];
}

export const AuditLogModule: React.FC<AuditLogModuleProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <span>Activity & Audit Trail History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable log of all creations, modifications, reversals, and settlements
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 italic font-sans">
                  No audit events recorded yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500">{new Date(log.timestamp).toLocaleString('en-GB')}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded font-sans ${
                        log.action === 'create'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'reverse' || log.action === 'delete'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {log.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{log.entity.toUpperCase()}</td>
                  <td className="py-2.5 px-4 text-slate-700 font-sans">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
