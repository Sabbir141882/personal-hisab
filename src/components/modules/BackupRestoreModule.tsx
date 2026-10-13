import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Database, Download, RefreshCw, Upload } from 'lucide-react';
import { createExportBackupPayload, restoreFromBackupPayload } from '../../services/storage';

interface BackupRestoreModuleProps {
  onDataRestored: () => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

export const BackupRestoreModule: React.FC<BackupRestoreModuleProps> = ({
  onDataRestored,
  onResetDemoData,
  onClearAllData,
}) => {
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleDownloadBackup = () => {
    const payload = createExportBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = restoreFromBackupPayload(parsed);
        setRestoreStatus(res);
        if (res.success) {
          onDataRestored();
        }
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          message: 'Failed to parse JSON backup file. Ensure it is a valid backup payload.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span>Data Backup, Export & Restore</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Export full JSON database snapshot with accounts, ledger entries, office settlements, and audit logs
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Full JSON Backup</span>
        </button>
      </div>

      {restoreStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            restoreStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {restoreStatus.success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-xs font-semibold">{restoreStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restore Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Restore from Backup Payload</span>
          </h3>
          <p className="text-xs text-slate-500">
            Select a previously exported JSON backup file to validate schema and restore your complete ledger.
          </p>

          <label className="block w-full border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="text-xs font-semibold text-sky-600 block">Click to upload JSON backup file</span>
            <span className="text-[10px] text-slate-400 block mt-1">Validates schema before overwriting records</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* System Reset / Demo Data Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Database Reset & Demo Seeding</span>
          </h3>
          <p className="text-xs text-slate-500">
            Reset database to pristine sample data or clear all records for a clean start.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={onResetDemoData}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>Reset to Sample Demo Data</span>
            </button>

            <button
              onClick={onClearAllData}
              className="w-full px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Clear All User Ledger Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
