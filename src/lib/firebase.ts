import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { ReportData } from '../types';

export const DEFAULT_ADMIN_PIN = 'ialy2026';

export const firebaseConfig = {
  projectId: "disco-velocity-91ttq",
  appId: "1:1023774001112:web:2809f9ddec418d22e494ad",
  apiKey: "AIzaSyACeL2wmOoH5BFN0QPNOa-LU2Vur36pMrc",
  authDomain: "disco-velocity-91ttq.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixatvsldrepor-188c401c-590d-4e3f-928d-af22e1660072",
  storageBucket: "disco-velocity-91ttq.firebasestorage.app",
  messagingSenderId: "1023774001112",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const DELETED_IDS_STORAGE_KEY = 'atvsld_deleted_report_ids_v2';

/**
 * Lấy danh sách các ID biên bản đã bị xóa từ LocalStorage
 */
export function getLocalDeletedReportIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.error('Error reading local deleted IDs', e);
  }
  return new Set<string>();
}

/**
 * Ghi nhận một ID biên bản đã bị xóa vào LocalStorage
 */
export function markReportAsDeletedLocally(reportId: string): void {
  try {
    const set = getLocalDeletedReportIds();
    set.add(reportId);
    localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Error saving local deleted ID', e);
  }
}

/**
 * Xóa đánh dấu xóa nếu biên bản được tạo lại hoặc khôi phục
 */
export function unmarkReportAsDeletedLocally(reportId: string): void {
  try {
    const set = getLocalDeletedReportIds();
    set.delete(reportId);
    localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Error unmarking local deleted ID', e);
  }
}

/**
 * Lấy mã PIN Admin được đồng bộ từ Firestore.
 */
export async function getSharedAdminPin(): Promise<string> {
  const docRef = doc(db, 'app_settings', 'system_config');
  
  try {
    const serverSnap = await getDocFromServer(docRef);
    if (serverSnap.exists() && serverSnap.data()?.adminPin) {
      const pin = String(serverSnap.data().adminPin).trim();
      try {
        localStorage.setItem('atvsld_admin_pin_v1', pin);
      } catch (_) {}
      return pin;
    }
  } catch (serverErr) {
    console.warn('Không thể lấy trực tiếp từ server, thử cache Firestore:', serverErr);
  }

  try {
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.adminPin) {
      const pin = String(snap.data().adminPin).trim();
      try {
        localStorage.setItem('atvsld_admin_pin_v1', pin);
      } catch (_) {}
      return pin;
    }
  } catch (err) {
    console.warn('Chưa lấy được PIN từ Firestore:', err);
  }

  return localStorage.getItem('atvsld_admin_pin_v1') || DEFAULT_ADMIN_PIN;
}

/**
 * Cập nhật mã PIN Admin đồng bộ lên đám mây Firestore cho tất cả các máy.
 */
export async function setSharedAdminPin(newPin: string): Promise<void> {
  const cleanPin = newPin.trim();
  try {
    localStorage.setItem('atvsld_admin_pin_v1', cleanPin);
  } catch (_) {}

  try {
    const docRef = doc(db, 'app_settings', 'system_config');
    await setDoc(
      docRef,
      {
        adminPin: cleanPin,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Lỗi khi lưu mã PIN lên Firestore:', err);
    throw err;
  }
}

/**
 * Lắng nghe thay đổi mã PIN Admin theo thời gian thực (real-time) cho tất cả các máy
 */
export function subscribeToSharedAdminPin(onPinChange: (pin: string) => void): () => void {
  try {
    const docRef = doc(db, 'app_settings', 'system_config');
    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges: false },
      (snap) => {
        if (snap.exists() && snap.data()?.adminPin) {
          const pin = String(snap.data().adminPin).trim();
          try {
            localStorage.setItem('atvsld_admin_pin_v1', pin);
          } catch (_) {}
          onPinChange(pin);
        }
      },
      (err) => {
        console.warn('Lỗi kết nối theo dõi mã PIN real-time:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Không thể khởi tạo theo dõi mã PIN:', err);
    return () => {};
  }
}

/**
 * Lấy danh sách các ID biên bản đã xóa từ collection `deleted_reports` trên Firestore
 */
export async function fetchRemoteDeletedReportIds(): Promise<Set<string>> {
  const deletedSet = new Set<string>();
  try {
    const colRef = collection(db, 'deleted_reports');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      deletedSet.add(d.id);
      if (d.data()?.id) {
        deletedSet.add(d.data().id);
      }
    });
  } catch (err) {
    console.warn('Lỗi lấy danh sách deleted_reports từ Firestore:', err);
  }
  return deletedSet;
}

/**
 * Tải toàn bộ danh sách biên bản từ đám mây dùng chung,
 * loại trừ triệt để bất kỳ biên bản nào đã bị đánh dấu xóa (cả local và remote).
 */
export async function fetchAllSharedReports(): Promise<ReportData[] | null> {
  try {
    const localDeleted = getLocalDeletedReportIds();
    const remoteDeleted = await fetchRemoteDeletedReportIds();
    
    // Hợp nhất danh sách đã xóa
    const allDeleted = new Set([...localDeleted, ...remoteDeleted]);

    const colRef = collection(db, 'reports');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const reports: ReportData[] = [];
      const promisesToDelete: Promise<void>[] = [];

      snap.forEach((d) => {
        const reportId = d.id;
        // Nếu biên bản này thuộc danh sách đã xóa, tiến hành dọn dẹp khỏi Firestore luôn
        if (allDeleted.has(reportId)) {
          promisesToDelete.push(deleteDoc(d.ref).catch(() => {}));
          return;
        }

        const data = d.data();
        if (data.dataJson) {
          try {
            const r: ReportData = JSON.parse(data.dataJson);
            if (!allDeleted.has(r.id)) {
              reports.push(r);
            }
          } catch (_) {}
        }
      });

      if (promisesToDelete.length > 0) {
        Promise.all(promisesToDelete).catch(() => {});
      }

      return reports;
    } else {
      return [];
    }
  } catch (err) {
    console.warn('Lỗi lấy danh sách báo cáo từ Firestore:', err);
  }
  return null;
}

/**
 * Lưu hoặc cập nhật biên bản lên Firestore cho các máy khác cùng thấy.
 * Đồng thời gỡ bỏ khỏi danh sách đã xóa (nếu trước đó từng xóa rồi tạo lại).
 */
export async function saveReportToFirestore(report: ReportData): Promise<void> {
  unmarkReportAsDeletedLocally(report.id);

  try {
    // Nếu có tombstone trong deleted_reports, xóa nó đi vì biên bản đã được lưu lại
    const tombstoneRef = doc(db, 'deleted_reports', report.id);
    deleteDoc(tombstoneRef).catch(() => {});

    const docRef = doc(db, 'reports', report.id);
    await setDoc(
      docRef,
      {
        id: report.id,
        month: report.thang_nam,
        reportDate: report.ngay,
        dataJson: JSON.stringify(report),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Lỗi đồng bộ báo cáo lên Firestore:', err);
  }
}

/**
 * Xóa biên bản trên Firestore và ghi nhận tombstone để KHÔNG BAO GIỜ bị phục hồi lại.
 */
export async function deleteReportFromFirestore(reportId: string, month?: string): Promise<void> {
  // 1. Đánh dấu xóa ngay lập tức ở LocalStorage
  markReportAsDeletedLocally(reportId);

  try {
    // 2. Xóa tài liệu khỏi collection reports trên Firestore
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);

    // 3. Ghi vào collection deleted_reports để các máy khác hoặc lần nạp sau biết là đã xóa
    const tombstoneRef = doc(db, 'deleted_reports', reportId);
    await setDoc(
      tombstoneRef,
      {
        id: reportId,
        month: month || '',
        deletedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Lỗi khi xóa tài liệu trên Firestore:', err);
  }
}
