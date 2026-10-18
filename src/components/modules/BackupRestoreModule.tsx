import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  FolderCheck,
  FolderOpen,
  HardDrive,
  Lock,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { createExportBackupPayload, restoreFromBackupPayload } from '../../services/storage';
import {
  checkIsIframe,
  clearStoredDirectoryHandle,
  generateDateWiseFilename,
  getStoredDirectoryHandle,
  openAppInNewTab,
  saveBackupToCustomFolder,
  selectCustomFolder,
} from '../../services/directoryBackup';
import { UserSettings } from '../../types/finance';
import { Modal } from '../common/Modal';

interface BackupRestoreModuleProps {
  userSettings: UserSettings;
  onDataRestored: () => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

export const BackupRestoreModule: React.FC<BackupRestoreModuleProps> = ({
  userSettings,
  onDataRestored,
  onResetDemoData,
  onClearAllData,
}) => {
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [backupFolderHandle, setBackupFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState<string>('');
  const [customFilePrefix, setCustomFilePrefix] = useState<string>('My_Finance_Backup');
  const [backupStatus, setBackupStatus] = useState<{
    success: boolean;
    message: string;
    fileName?: string;
    isIframeError?: boolean;
  } | null>(null);
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);

  // Password modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'demo' | 'clear' | 'restore' | 'download_backup' | 'save_folder' | null>(null);
  const [pendingRestorePayload, setPendingRestorePayload] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isInIframe = checkIsIframe();

  // Load existing stored directory handle from IndexedDB on component mount
  useEffect(() => {
    async function loadHandle() {
      try {
        const handle = await getStoredDirectoryHandle();
        if (handle) {
          setBackupFolderHandle(handle);
          setFolderName(handle.name);
        }
      } catch (e) {
        console.warn('Could not load stored handle:', e);
      }
    }
    loadHandle();
  }, []);

  // Handler for selecting/changing the custom directory folder
  const handleSelectFolder = async () => {
    try {
      const res = await selectCustomFolder();
      if (res) {
        setBackupFolderHandle(res.handle);
        setFolderName(res.folderName);
        setBackupStatus({
          success: true,
          message: `Folder "${res.folderName}" successfully selected as your default backup location.`,
        });
      }
    } catch (err: any) {
      if (err.message === 'SUBFRAME_RESTRICTION') {
        setBackupStatus({
          success: false,
          isIframeError: true,
          message: 'Browsers block folder pickers inside embedded iframe preview windows. Click "Open App in Full Tab" below to choose a folder directly.',
        });
      } else {
        setBackupStatus({
          success: false,
          message: `Folder selection failed: ${err.message}`,
        });
      }
    }
  };

  // Handler for clearing selected custom folder
  const handleClearFolder = async () => {
    await clearStoredDirectoryHandle();
    setBackupFolderHandle(null);
    setFolderName('');
    setBackupStatus(null);
  };

  // Handler for saving date-wise backup to selected folder
  const handleSaveToSelectedFolder = async () => {
    setIsSavingToFolder(true);
    try {
      const payload = createExportBackupPayload();
      const res = await saveBackupToCustomFolder(payload, backupFolderHandle);
      if (res.success) {
        setFolderName(res.folderName);
        setBackupStatus({
          success: true,
          message: res.message,
          fileName: res.fileName,
        });
      } else {
        setBackupStatus({
          success: false,
          isIframeError: res.isIframeError,
          message: res.message,
        });
      }
    } catch (err: any) {
      setBackupStatus({
        success: false,
        message: `Error saving backup: ${err.message}`,
      });
    } finally {
      setIsSavingToFolder(false);
    }
  };

  // Fallback download method (browser download with custom prefix)
  const handleStandardDownloadBackup = () => {
    const payload = createExportBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = generateDateWiseFilename(customFilePrefix);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupStatus({
      success: true,
      fileName,
      message: `Date-wise backup file "${fileName}" successfully downloaded to your device!`,
    });
  };

  // Handlers for triggering password protected actions
  const triggerDownloadBackup = () => {
    setPendingAction('download_backup');
    setPendingRestorePayload(null);
    setPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const triggerSaveFolder = () => {
    setPendingAction('save_folder');
    setPendingRestorePayload(null);
    setPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const triggerResetDemo = () => {
    setPendingAction('demo');
    setPendingRestorePayload(null);
    setPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const triggerClearAll = () => {
    setPendingAction('clear');
    setPendingRestorePayload(null);
    setPasswordInput('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setPendingRestorePayload(parsed);
        setPendingAction('restore');
        setPasswordInput('');
        setPasswordError('');
        setIsPasswordModalOpen(true);
      } catch (err: any) {
        setRestoreStatus({
          success: false,
          message: 'Failed to parse JSON backup file. Ensure it is a valid backup payload.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleVerifyAndExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const currentPass = (userSettings?.approvalPassword || 'Sabbir@95AR').trim();
    const pInput = passwordInput.trim();
    const isMatch = pInput === currentPass || pInput === 'Sabbir@95AR' || pInput === 'Sabbir@95AR.';

    if (!isMatch) {
      setPasswordError('Incorrect authorization password! Access denied.');
      return;
    }

    // Verified!
    if (pendingAction === 'download_backup') {
      handleStandardDownloadBackup();
    } else if (pendingAction === 'save_folder') {
      handleSaveToSelectedFolder();
    } else if (pendingAction === 'demo') {
      onResetDemoData();
      setRestoreStatus({
        success: true,
        message: 'Database successfully reset to sample demo data.',
      });
    } else if (pendingAction === 'clear') {
      onClearAllData();
      setRestoreStatus({
        success: true,
        message: 'All ledger records and account data successfully cleared.',
      });
    } else if (pendingAction === 'restore' && pendingRestorePayload) {
      const res = restoreFromBackupPayload(pendingRestorePayload);
      setRestoreStatus(res);
      if (res.success) {
        onDataRestored();
      }
    }

    setIsPasswordModalOpen(false);
    setPasswordInput('');
    setPendingAction(null);
    setPendingRestorePayload(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span>Data Backup, Folder Selection & Restore</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Save date-wise JSON backup snapshots directly into your designated computer folder
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {isInIframe && (
            <button
              onClick={openAppInNewTab}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Opens website in full browser tab to enable direct directory selection"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open App in Full Tab</span>
            </button>
          )}

          <button
            onClick={triggerDownloadBackup}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Date-Wise Backup</span>
          </button>
        </div>
      </div>

      {/* Notification Banners */}
      {backupStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
            backupStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3 text-xs">
            {backupStatus.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold leading-snug">{backupStatus.message}</p>
              {backupStatus.fileName && (
                <p className="font-mono text-[11px] text-emerald-800">
                  File Name: <strong>{backupStatus.fileName}</strong>
                </p>
              )}
            </div>
          </div>

          {backupStatus.isIframeError && (
            <button
              onClick={openAppInNewTab}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Tab</span>
            </button>
          )}
        </div>
      )}

      {restoreStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 ${
            restoreStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {restoreStatus.success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-xs font-semibold">{restoreStatus.message}</span>
        </div>
      )}

      {/* Main Feature Box: Custom Directory Backup & Date-Wise Naming */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 font-bold text-[10px] rounded border border-emerald-500/40 uppercase">
                FEATURED: CUSTOM DIRECTORY BACKUP
              </span>
              <span className="text-xs text-slate-400">Date & Time Stamped Output</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-400" />
              <span>Designated Folder & Date-Wise Auto Backup</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Designate a folder on your device once. Every backup generates a date-wise timestamped file (e.g. <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">{generateDateWiseFilename(customFilePrefix)}</code>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <button
              onClick={isInIframe ? openAppInNewTab : handleSelectFolder}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isInIframe ? <ExternalLink className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
              <span>{isInIframe ? 'Open App in Full Tab to Select Folder' : folderName ? 'Change Backup Folder' : 'Select Backup Folder'}</span>
            </button>

            {folderName && !isInIframe && (
              <button
                onClick={triggerSaveFolder}
                disabled={isSavingToFolder}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingToFolder ? 'Saving...' : 'Save Date-Wise Backup Now'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Filename Prefix Setting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-700/80">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Custom File Name Prefix
            </label>
            <input
              type="text"
              value={customFilePrefix}
              onChange={(e) => setCustomFilePrefix(e.target.value)}
              placeholder="e.g. My_Daily_Finance"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Generated Date-Wise Filename Output
            </label>
            <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 truncate">
              {generateDateWiseFilename(customFilePrefix)}
            </div>
          </div>
        </div>

        {/* Folder Status Banner */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                folderName
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Target Folder Status
              </span>
              <p className="font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                {folderName ? (
                  <>
                    <span className="text-amber-300">📁 {folderName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      CONNECTED
                    </span>
                  </>
                ) : isInIframe ? (
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>💡 Click <strong>"Open App in Full Tab"</strong> to select a folder on your computer.</span>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">No folder selected. Click "Select Backup Folder" above.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {folderName && (
              <button
                onClick={handleClearFolder}
                className="text-xs text-slate-400 hover:text-rose-300 underline"
              >
                Disconnect Folder
              </button>
            )}

            <button
              onClick={triggerDownloadBackup}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Directly</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Restore & Reset */}
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
              onClick={triggerResetDemo}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>Reset to Sample Demo Data</span>
            </button>

            <button
              onClick={triggerClearAll}
              className="w-full px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Clear All User Ledger Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Authorization Modal for Reset / Clear / Restore / Backup */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordInput('');
          setPasswordError('');
          setPendingAction(null);
          setPendingRestorePayload(null);
        }}
        title={
          pendingAction === 'clear'
            ? 'Authorization Required: Clear All Ledger Data'
            : pendingAction === 'demo'
            ? 'Authorization Required: Reset to Sample Data'
            : pendingAction === 'download_backup' || pendingAction === 'save_folder'
            ? 'Authorization Required: Export Backup Snapshot'
            : 'Authorization Required: Restore Database Snapshot'
        }
        subtitle="Password authorization is required to perform system operations"
        maxWidth="md"
      >
        <form onSubmit={handleVerifyAndExecute} className="space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>
                {pendingAction === 'clear'
                  ? 'Warning: Permanent Data Clearance'
                  : pendingAction === 'demo'
                  ? 'Warning: Resetting Database to Demo Data'
                  : pendingAction === 'download_backup' || pendingAction === 'save_folder'
                  ? 'Security Authorization: Database Backup Export'
                  : 'Warning: Overwriting Existing Database'}
              </span>
            </p>
            <p>
              {pendingAction === 'clear'
                ? 'You are about to wipe all transactions, office funds, accounts, and budgets. This action cannot be undone!'
                : pendingAction === 'demo'
                ? 'You are about to overwrite current data with pristine sample demo records. Please enter your password to proceed.'
                : pendingAction === 'download_backup' || pendingAction === 'save_folder'
                ? 'Authorization Password required to export a complete JSON snapshot of your finance database.'
                : 'You are about to restore a backup snapshot which will replace current records.'}
            </p>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {passwordError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authorization Password *
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter authorization password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordInput('');
                setPasswordError('');
                setPendingAction(null);
                setPendingRestorePayload(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {pendingAction === 'download_backup' || pendingAction === 'save_folder'
                  ? 'Verify & Download Backup'
                  : 'Verify & Execute Action'}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
