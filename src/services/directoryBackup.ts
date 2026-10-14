/**
 * Custom Folder Backup Service using the File System Access API
 * Allows the user to select a designated folder on their computer once,
 * and save date-wise backup JSON files directly into that folder.
 */

const DB_NAME = 'MyFinanceFolderBackupDB';
const DB_VERSION = 1;
const STORE_NAME = 'handles';
const HANDLE_KEY = 'customBackupDirHandle';

export const checkIsIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const openAppInNewTab = (): void => {
  window.open(window.location.href, '_blank');
};

// Helper to open IndexedDB for directory handle persistence
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save FileSystemDirectoryHandle in IndexedDB
export const storeDirectoryHandle = async (handle: FileSystemDirectoryHandle): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    await new Promise((res) => (tx.oncomplete = res));
  } catch (err) {
    console.warn('Could not store directory handle in IndexedDB:', err);
  }
};

// Get stored FileSystemDirectoryHandle from IndexedDB
export const getStoredDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const handle = await new Promise<FileSystemDirectoryHandle | null>((res, rej) => {
      const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
    return handle;
  } catch (err) {
    return null;
  }
};

// Clear stored directory handle
export const clearStoredDirectoryHandle = async (): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    await new Promise((res) => (tx.oncomplete = res));
  } catch (err) {
    console.warn('Could not clear directory handle:', err);
  }
};

// Verify/Request ReadWrite permission on a Directory Handle
export const verifyDirectoryPermission = async (
  handle: FileSystemDirectoryHandle,
  readWrite = true
): Promise<boolean> => {
  const options = {
    mode: readWrite ? ('readwrite' as const) : ('read' as const),
  };
  try {
    if ((await (handle as any).queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await (handle as any).requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (e) {
    console.warn('Permission query error:', e);
  }
  return false;
};

// User selects a folder on their device
export const selectCustomFolder = async (): Promise<{
  handle: FileSystemDirectoryHandle;
  folderName: string;
} | null> => {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('Your browser does not support the File System Access API. Please use Google Chrome, Microsoft Edge, or Brave on desktop.');
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });
    await storeDirectoryHandle(handle);
    return {
      handle,
      folderName: handle.name,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null; // User cancelled folder selection
    }
    if (err.message && err.message.includes('sub frames')) {
      throw new Error('SUBFRAME_RESTRICTION');
    }
    throw err;
  }
};

// Format current timestamp for date-wise file naming: YYYY-MM-DD_HH-mm-ss
export const generateDateWiseFilename = (customPrefix = 'my_finance_backup'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');

  const cleanPrefix = customPrefix.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'my_finance_backup';
  return `${cleanPrefix}_${year}-${month}-${day}_${hours}-${mins}-${secs}.json`;
};

// Save Backup JSON directly into designated directory handle
export const saveBackupToCustomFolder = async (
  payload: any,
  existingHandle?: FileSystemDirectoryHandle | null
): Promise<{
  success: boolean;
  folderName: string;
  fileName: string;
  message: string;
  isIframeError?: boolean;
}> => {
  let dirHandle = existingHandle || (await getStoredDirectoryHandle());

  if (!dirHandle) {
    try {
      const selected = await selectCustomFolder();
      if (!selected) {
        return {
          success: false,
          folderName: '',
          fileName: '',
          message: 'Folder selection was cancelled.',
        };
      }
      dirHandle = selected.handle;
    } catch (err: any) {
      if (err.message === 'SUBFRAME_RESTRICTION') {
        return {
          success: false,
          folderName: '',
          fileName: '',
          isIframeError: true,
          message: 'Browsers block folder selection inside embedded iframe previews. Click "Open App in Full Tab" to pick a folder directly.',
        };
      }
      return {
        success: false,
        folderName: '',
        fileName: '',
        message: err.message || 'Folder selection failed.',
      };
    }
  }

  // Ensure write permission
  const hasPermission = await verifyDirectoryPermission(dirHandle, true);
  if (!hasPermission) {
    try {
      const reselected = await selectCustomFolder();
      if (!reselected) {
        return {
          success: false,
          folderName: '',
          fileName: '',
          message: 'Permission to write to the chosen folder was denied.',
        };
      }
      dirHandle = reselected.handle;
    } catch (err: any) {
      if (err.message === 'SUBFRAME_RESTRICTION') {
        return {
          success: false,
          folderName: '',
          fileName: '',
          isIframeError: true,
          message: 'Browsers block folder selection inside embedded iframe previews. Click "Open App in Full Tab" to pick a folder directly.',
        };
      }
      return {
        success: false,
        folderName: '',
        fileName: '',
        message: err.message || 'Permission request failed.',
      };
    }
  }

  const fileName = generateDateWiseFilename();
  const jsonString = JSON.stringify(payload, null, 2);

  try {
    // Create new file inside the user's chosen folder
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(jsonString);
    await writable.close();

    return {
      success: true,
      folderName: dirHandle.name,
      fileName,
      message: `Backup successfully saved to folder "${dirHandle.name}" as "${fileName}".`,
    };
  } catch (err: any) {
    console.error('Error saving file to directory handle:', err);
    return {
      success: false,
      folderName: dirHandle.name,
      fileName,
      message: `Failed to save file to folder "${dirHandle.name}": ${err.message}`,
    };
  }
};
