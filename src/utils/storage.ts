import { ReportData } from '../types';
import { createNewReport, createInitialReportsList } from '../data/defaultData';
import { 
  deleteReportFromFirestore, 
  getLocalDeletedReportIds, 
  markReportAsDeletedLocally,
  saveReportToFirestore
} from '../lib/firebase';

const DB_NAME = 'atvsld_db_v2';
const DB_VERSION = 2;
const STORE_NAME = 'app_state';

const STORAGE_KEY = 'atvsld_ialy_reports_v2';
const CURRENT_REPORT_KEY = 'atvsld_ialy_current_v2';
const INITIALIZED_FLAG_KEY = 'atvsld_ialy_initialized_v2';

// Open IndexedDB safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
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
}

// Get item from IndexedDB
async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

// Set item in IndexedDB
async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Ignore IndexedDB failures
  }
}

/**
 * Lọc bỏ mọi biên bản đã bị xóa (dựa trên tombstones LocalStorage)
 */
export function filterOutDeletedReports(reports: ReportData[]): ReportData[] {
  if (!Array.isArray(reports)) return [];
  const deletedSet = getLocalDeletedReportIds();
  return reports.filter((r) => r && r.id && !deletedSet.has(r.id));
}

// Tải dữ liệu ban đầu từ LocalStorage
export function loadInitialReportsFromLocalStorage(): {
  currentReport: ReportData;
  history: ReportData[];
} {
  let currentReport: ReportData | null = null;
  let history: ReportData[] = [];
  const deletedSet = getLocalDeletedReportIds();

  try {
    const rawHistory = localStorage.getItem(STORAGE_KEY);
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        history = parsed.filter((r) => r && r.id && !deletedSet.has(r.id));
      }
    }
  } catch (e) {
    console.warn('Cannot read history from localStorage', e);
  }

  // Nếu chưa từng khởi tạo dữ liệu mẫu và chưa có lịch sử, khởi tạo 1 lần duy nhất
  const isInitialized = localStorage.getItem(INITIALIZED_FLAG_KEY);
  if (!isInitialized && history.length === 0) {
    const initialList = createInitialReportsList().filter((r) => !deletedSet.has(r.id));
    history = initialList;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
    } catch (_) {}
  }

  try {
    const rawCurrent = localStorage.getItem(CURRENT_REPORT_KEY);
    if (rawCurrent) {
      const parsedCurrent = JSON.parse(rawCurrent);
      if (parsedCurrent && parsedCurrent.id && !deletedSet.has(parsedCurrent.id)) {
        currentReport = parsedCurrent;
      }
    }
  } catch (e) {
    console.warn('Cannot read current report from localStorage', e);
  }

  // Nếu không có biên bản hiện tại hoặc biên bản hiện tại đã bị xóa
  if (!currentReport) {
    currentReport = history.length > 0 ? history[0] : createNewReport();
  }

  return { currentReport, history };
}

// Tải bất đồng bộ từ IndexedDB
export async function loadReportsFromIndexedDB(): Promise<{
  currentReport: ReportData | null;
  history: ReportData[] | null;
}> {
  try {
    const deletedSet = getLocalDeletedReportIds();
    const [rawHistory, rawCurrent] = await Promise.all([
      idbGet<ReportData[]>('history'),
      idbGet<ReportData>('current'),
    ]);

    const history = rawHistory ? rawHistory.filter((r) => r && r.id && !deletedSet.has(r.id)) : null;
    const currentReport = (rawCurrent && !deletedSet.has(rawCurrent.id)) ? rawCurrent : null;

    return { currentReport, history };
  } catch (e) {
    return { currentReport: null, history: null };
  }
}

// Lưu biên bản nháp hiện tại vào cả IndexedDB & localStorage
export async function persistCurrentReport(report: ReportData): Promise<void> {
  const deletedSet = getLocalDeletedReportIds();
  if (deletedSet.has(report.id)) {
    // Nếu biên bản này đã bị đánh dấu xóa, không lưu lại nữa
    return;
  }

  try {
    localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(report));
  } catch (e) {
    console.warn('localStorage quota exceeded while saving current report', e);
  }
  await idbSet('current', report);
}

// Lưu danh sách lịch sử vào cả IndexedDB & localStorage
export async function persistReportsHistory(history: ReportData[]): Promise<void> {
  const cleanHistory = filterOutDeletedReports(history);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanHistory));
  } catch (e) {
    console.warn('localStorage quota exceeded while saving history', e);
  }
  await idbSet('history', cleanHistory);
}

/**
 * XÓA VĨNH VIỄN 1 BIÊN BẢN:
 * 1. Đánh dấu xóa vào danh sách Tombstones LocalStorage.
 * 2. Xóa khỏi localStorage và IndexedDB.
 * 3. Xóa trực tiếp khỏi cơ sở dữ liệu Firestore và ghi vào deleted_reports để các máy khác cũng xóa.
 * 4. Không bao giờ phục hồi lại khi làm mới trang hoặc chuyển tab.
 */
export async function deleteReportFromStorage(
  deletedId: string,
  currentReport: ReportData,
  currentHistory: ReportData[]
): Promise<{ nextHistory: ReportData[]; nextCurrentReport: ReportData }> {
  // Tìm tháng của biên bản cần xóa để ghi nhận
  const targetReport = currentHistory.find((r) => r.id === deletedId) || (currentReport.id === deletedId ? currentReport : null);
  const targetMonth = targetReport?.thang_nam;

  // 1. Đánh dấu xóa vĩnh viễn
  markReportAsDeletedLocally(deletedId);

  // 2. Lọc bỏ khỏi danh sách lịch sử
  const nextHistory = currentHistory.filter((r) => r.id !== deletedId);

  // 3. Nếu biên bản đang mở chính là biên bản bị xóa, chuyển sang biên bản khác hoặc tạo mới
  let nextCurrentReport = currentReport;
  if (currentReport.id === deletedId) {
    if (nextHistory.length > 0) {
      nextCurrentReport = nextHistory[0];
    } else {
      nextCurrentReport = createNewReport();
    }
  }

  // 4. Lưu lại ngay lập tức vào LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(nextCurrentReport));
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
  } catch (e) {
    console.warn('Storage error on delete', e);
  }

  // 5. Lưu lại IndexedDB
  await idbSet('history', nextHistory);
  await idbSet('current', nextCurrentReport);

  // 6. Xóa triệt để trên đám mây Firestore
  try {
    await deleteReportFromFirestore(deletedId, targetMonth);
  } catch (e) {
    console.warn('Could not delete from Firestore', e);
  }

  return { nextHistory, nextCurrentReport };
}

/**
 * XÓA TẤT CẢ CÁC BIÊN BẢN THUỘC THÁNG TRƯỚC (CHỈ GIỮ LẠI THÁNG HIỆN TẠI):
 * Đảm bảo xóa sạch cả LocalStorage, IndexedDB và Firestore, không bị hiện lại!
 */
export async function deletePreviousMonthsReports(
  currentMonth: string,
  currentReport: ReportData,
  currentHistory: ReportData[]
): Promise<{ nextHistory: ReportData[]; nextCurrentReport: ReportData; deletedCount: number }> {
  const toDelete = currentHistory.filter((r) => r.thang_nam !== currentMonth);
  const nextHistory = currentHistory.filter((r) => r.thang_nam === currentMonth);
  const deletedCount = toDelete.length;

  // 1. Đánh dấu xóa tất cả các ID này vào Tombstones
  toDelete.forEach((r) => {
    markReportAsDeletedLocally(r.id);
  });

  // Nếu biên bản đang soạn thảo cũng thuộc tháng trước, đánh dấu xóa nó luôn
  if (currentReport.thang_nam !== currentMonth) {
    markReportAsDeletedLocally(currentReport.id);
  }

  let nextCurrentReport = currentReport;
  if (currentReport.thang_nam !== currentMonth) {
    if (nextHistory.length > 0) {
      nextCurrentReport = nextHistory[0];
    } else {
      nextCurrentReport = createNewReport(currentMonth);
    }
  }

  // 2. Cập nhật LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(nextCurrentReport));
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
  } catch (e) {
    console.warn('Storage error on delete old reports', e);
  }

  // 3. Cập nhật IndexedDB
  await idbSet('history', nextHistory);
  await idbSet('current', nextCurrentReport);

  // 4. Xóa hàng loạt trên Firestore
  const deletePromises = toDelete.map((r) => deleteReportFromFirestore(r.id, r.thang_nam));
  if (currentReport.thang_nam !== currentMonth && !toDelete.some((r) => r.id === currentReport.id)) {
    deletePromises.push(deleteReportFromFirestore(currentReport.id, currentReport.thang_nam));
  }
  await Promise.all(deletePromises);

  return { nextHistory, nextCurrentReport, deletedCount };
}

// Xóa sạch toàn bộ biên bản
export async function clearAllReportsStorage(): Promise<{
  nextHistory: ReportData[];
  nextCurrentReport: ReportData;
}> {
  const fresh = createNewReport();
  const nextHistory: ReportData[] = [];

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_REPORT_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(fresh));
    localStorage.setItem(INITIALIZED_FLAG_KEY, 'true');
  } catch (e) {
    console.warn('Storage error on clear all', e);
  }

  await idbSet('history', nextHistory);
  await idbSet('current', fresh);

  return { nextHistory, nextCurrentReport: fresh };
}
