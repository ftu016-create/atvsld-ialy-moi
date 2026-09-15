import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Save, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cloud,
  Trash2,
  PlusCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { ReportData, UserRole, ViewTab } from './types';
import { createNewReport, getCurrentMonthYear } from './data/defaultData';
import { 
  loadInitialReportsFromLocalStorage,
  loadReportsFromIndexedDB,
  persistCurrentReport,
  persistReportsHistory,
  deleteReportFromStorage,
  deletePreviousMonthsReports,
  clearAllReportsStorage,
  filterOutDeletedReports
} from './utils/storage';
import { 
  fetchAllSharedReports, 
  saveReportToFirestore, 
  getLocalDeletedReportIds 
} from './lib/firebase';
import { generateAndDownloadDocx } from './utils/docxGenerator';
import { exportBackupToJson, importBackupFromJson, sanitizeReportGroups } from './utils/reportAutomation';

import { Header } from './components/Header';
import { ReportMetaForm } from './components/ReportMetaForm';
import { MembersManager } from './components/MembersManager';
import { InspectionTableEditor } from './components/InspectionTableEditor';
import { RecommendationsEditor } from './components/RecommendationsEditor';
import { ImagesManager } from './components/ImagesManager';
import { LiveDocumentPreview } from './components/LiveDocumentPreview';
import { HistoryPage } from './components/HistoryPage';
import { HistoryModal } from './components/HistoryModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NewReportModal } from './components/NewReportModal';
import { DeleteReportModal } from './components/DeleteReportModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { JsonBackupModal } from './components/JsonBackupModal';

export default function App() {
  // Current user role: admin or colleague
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedRole = sessionStorage.getItem('atvsld_user_role');
      if (savedRole === 'admin' || savedRole === 'colleague') {
        return savedRole;
      }
    } catch (_) {}
    return 'colleague';
  });

  // Navigation tab: history, preview, or edit
  const [activeTab, setActiveTab] = useState<ViewTab>('history');

  // Active loaded report
  const [report, setReport] = useState<ReportData>(() => {
    const { currentReport } = loadInitialReportsFromLocalStorage();
    return sanitizeReportGroups(currentReport);
  });

  // History of reports
  const [reportsHistory, setReportsHistory] = useState<ReportData[]>(() => {
    const { history } = loadInitialReportsFromLocalStorage();
    return filterOutDeletedReports(history.map(sanitizeReportGroups));
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportData | null>(null);
  const [isVercelGuideOpen, setIsVercelGuideOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Toast notification helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Initial background load from IndexedDB and Firestore
  useEffect(() => {
    // Load from IndexedDB
    loadReportsFromIndexedDB().then(({ currentReport: idbCurrent, history: idbHistory }) => {
      if (idbHistory && idbHistory.length > 0) {
        const cleanHistory = filterOutDeletedReports(idbHistory.map(sanitizeReportGroups));
        setReportsHistory(cleanHistory);
      }
      if (idbCurrent) {
        const cleanCurrent = sanitizeReportGroups(idbCurrent);
        const deletedSet = getLocalDeletedReportIds();
        if (!deletedSet.has(cleanCurrent.id)) {
          setReport(cleanCurrent);
        }
      }
    });

    // Sync from Firestore shared database
    fetchAllSharedReports().then((remoteReports) => {
      if (remoteReports && remoteReports.length > 0) {
        const cleanRemote = filterOutDeletedReports(remoteReports.map(sanitizeReportGroups));
        if (cleanRemote.length > 0) {
          setReportsHistory((prev) => {
            const deletedSet = getLocalDeletedReportIds();
            const map = new Map<string, ReportData>();
            // Add remote reports
            cleanRemote.forEach((r) => {
              if (!deletedSet.has(r.id)) {
                map.set(r.id, r);
              }
            });
            // Keep any local that is not deleted
            prev.forEach((r) => {
              if (!deletedSet.has(r.id) && !map.has(r.id)) {
                map.set(r.id, r);
              }
            });
            const merged = Array.from(map.values());
            persistReportsHistory(merged);
            return merged;
          });
        }
      }
    });
  }, []);

  // 2. Persist current report when edited
  useEffect(() => {
    const deletedSet = getLocalDeletedReportIds();
    if (!deletedSet.has(report.id)) {
      persistCurrentReport(report);
    }
  }, [report]);

  // 3. Persist history changes
  useEffect(() => {
    const clean = filterOutDeletedReports(reportsHistory);
    persistReportsHistory(clean);
  }, [reportsHistory]);

  // Handle Admin logout
  const handleLogoutAdmin = () => {
    setUserRole('colleague');
    try {
      sessionStorage.removeItem('atvsld_user_role');
    } catch (_) {}
    if (activeTab === 'edit') {
      setActiveTab('preview');
    }
    showToast('Đã đăng xuất quyền Quản trị viên.', 'info');
  };

  // Handle Admin login success
  const handleAdminAuthSuccess = () => {
    setUserRole('admin');
    try {
      sessionStorage.setItem('atvsld_user_role', 'admin');
    } catch (_) {}
    setIsAdminAuthOpen(false);
    showToast('Đăng nhập Quản trị viên (Admin) thành công!', 'success');
  };

  // Update field in current report
  const handleUpdateField = (field: keyof ReportData, value: any) => {
    setReport((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toLocaleString('vi-VN'),
    }));
  };

  // Save report (Admin)
  const handleSaveReport = async () => {
    setIsSaving(true);
    const updated = {
      ...report,
      updated_at: new Date().toLocaleString('vi-VN'),
    };
    setReport(updated);

    const cleanHistory = filterOutDeletedReports(reportsHistory);
    const existingIdx = cleanHistory.findIndex((r) => r.id === updated.id);
    let nextHistory = [...cleanHistory];
    if (existingIdx >= 0) {
      nextHistory[existingIdx] = updated;
    } else {
      nextHistory.unshift(updated);
    }
    setReportsHistory(nextHistory);

    await persistReportsHistory(nextHistory);
    await persistCurrentReport(updated);

    // Sync to Firestore for other machines
    try {
      await saveReportToFirestore(updated);
    } catch (e) {
      console.warn('Firestore sync error', e);
    }

    setTimeout(() => {
      setIsSaving(false);
      showToast(`Đã lưu biên bản Tháng ${updated.thang_nam} thành công!`, 'success');
    }, 300);
  };

  // View report details (switches to Preview tab)
  const handleViewReport = (target: ReportData) => {
    setReport(sanitizeReportGroups(target));
    setActiveTab('preview');
  };

  // Edit report (Admin only, switches to Edit tab)
  const handleEditReport = (target: ReportData) => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    setReport(sanitizeReportGroups(target));
    setActiveTab('edit');
  };

  // Duplicate report
  const handleDuplicateReport = async (source: ReportData) => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    const clone: ReportData = {
      ...JSON.parse(JSON.stringify(source)),
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toLocaleString('vi-VN'),
      updated_at: new Date().toLocaleString('vi-VN'),
    };
    setReport(clone);
    const nextHistory = [clone, ...reportsHistory];
    setReportsHistory(nextHistory);
    await persistReportsHistory(nextHistory);
    await persistCurrentReport(clone);
    setActiveTab('edit');
    showToast(`Đã nhân bản biên bản sang bản sao mới!`, 'success');
  };

  // Trigger delete modal for a report
  const handleDeleteReportPrompt = (id: string) => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    const target = reportsHistory.find((r) => r.id === id) || (report.id === id ? report : null);
    if (target) {
      setReportToDelete(target);
      setIsDeleteModalOpen(true);
    }
  };

  // Confirm delete single report
  const handleConfirmDeleteReport = async (id: string) => {
    const isCurrent = report.id === id;
    const { nextHistory, nextCurrentReport } = await deleteReportFromStorage(id, report, reportsHistory);
    setReportsHistory(nextHistory);
    if (isCurrent) {
      setReport(nextCurrentReport);
    }
    setReportToDelete(null);
    showToast('Đã xóa vĩnh viễn biên bản. Biên bản sẽ không bao giờ hiện lại!', 'info');
  };

  // Delete all reports belonging to previous months
  const handleDeletePreviousMonths = async () => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    const currentMonth = getCurrentMonthYear();
    const oldReports = reportsHistory.filter((r) => r.thang_nam !== currentMonth);
    const isCurrentOld = report.thang_nam !== currentMonth;

    if (oldReports.length === 0 && !isCurrentOld) {
      showToast('Không có biên bản nào thuộc các tháng trước.', 'info');
      return;
    }

    const count = oldReports.length + (isCurrentOld && !reportsHistory.some((r) => r.id === report.id) ? 1 : 0);
    const confirmed = window.confirm(
      `XÁC NHẬN XÓA:\n\nBạn có chắc chắn muốn xóa vĩnh viễn toàn bộ ${count} biên bản thuộc các tháng trước và chỉ giữ lại tháng hiện tại (${currentMonth}) không?\n\nSau khi xóa, các biên bản này sẽ được xóa triệt để khỏi cả bộ nhớ máy và đám mây, tuyệt đối KHÔNG bị phục hồi lại.`
    );

    if (confirmed) {
      const { nextHistory, nextCurrentReport, deletedCount } = await deletePreviousMonthsReports(
        currentMonth,
        report,
        reportsHistory
      );
      setReportsHistory(nextHistory);
      setReport(nextCurrentReport);
      showToast(`Đã xóa vĩnh viễn ${deletedCount} biên bản của các tháng trước!`, 'success');
    }
  };

  // Export DOCX
  const handleExportDocx = async (targetReport?: ReportData) => {
    const docData = targetReport || report;
    try {
      showToast('Đang tạo và đóng gói file Word (.docx)...', 'info');
      await generateAndDownloadDocx(docData);
      showToast(`Đã xuất file Word Tháng ${docData.thang_nam} thành công!`, 'success');
    } catch (err: any) {
      console.error('Export docx error', err);
      showToast(`Lỗi khi xuất Word: ${err?.message || 'Vui lòng kiểm tra lại ảnh'}`, 'error');
    }
  };

  // Trigger New Report Creation Modal
  const handleTriggerNewReport = () => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    setIsNewReportModalOpen(true);
  };

  // Handle successful creation of new automated report
  const handleConfirmCreateNewReport = async (newReport: ReportData, transferredCount: number) => {
    const sanitized = sanitizeReportGroups(newReport);
    setReport(sanitized);

    const nextHistory = [sanitized, ...reportsHistory.filter((r) => r.id !== sanitized.id)];
    setReportsHistory(nextHistory);

    await persistReportsHistory(nextHistory);
    await persistCurrentReport(sanitized);

    // Save to Firestore
    try {
      await saveReportToFirestore(sanitized);
    } catch (_) {}

    setActiveTab('edit');
    showToast(
      `Đã khởi tạo biên bản Tháng ${sanitized.thang_nam}! (Đã chuyển tiếp ${transferredCount} kiến nghị sang Mục 7)`,
      'success'
    );
  };

  // Backup & Restore
  const handleExportBackup = () => {
    exportBackupToJson(reportsHistory);
    showToast('Đã xuất file sao lưu JSON thành công!', 'success');
  };

  const handleImportBackup = async (file: File) => {
    if (userRole !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    try {
      const imported = await importBackupFromJson(file);
      const cleaned = filterOutDeletedReports(imported.map(sanitizeReportGroups));
      const map = new Map<string, ReportData>();
      cleaned.forEach((r) => map.set(r.id, r));
      reportsHistory.forEach((r) => {
        if (!map.has(r.id)) map.set(r.id, r);
      });
      const combined = Array.from(map.values());
      setReportsHistory(combined);
      await persistReportsHistory(combined);
      if (cleaned.length > 0) {
        setReport(cleaned[0]);
        await persistCurrentReport(cleaned[0]);
      }
      showToast(`Đã phục hồi thành công ${cleaned.length} biên bản từ file JSON!`, 'success');
    } catch (err: any) {
      showToast(`Lỗi nhập file: ${err?.message || 'File không hợp lệ'}`, 'error');
    }
  };

  const curMonth = getCurrentMonthYear();
  const isEditingPreviousMonth = report.thang_nam !== curMonth;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white ${
              toastMessage.type === 'error'
                ? 'bg-red-600 border-red-700'
                : toastMessage.type === 'info'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-emerald-600 border-emerald-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        report={report}
        reportsList={reportsHistory}
        onSelectReport={(r) => {
          setReport(sanitizeReportGroups(r));
          setActiveTab('preview');
        }}
        userRole={userRole}
        onSave={handleSaveReport}
        onNew={handleTriggerNewReport}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onExportDocx={() => handleExportDocx(report)}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onPrint={() => window.print()}
        isSaving={isSaving}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: HISTORY (Kho lưu trữ & Tra cứu biên bản các tháng) */}
        {activeTab === 'history' && (
          <HistoryPage
            reports={reportsHistory}
            currentReportId={report.id}
            userRole={userRole}
            currentMonth={curMonth}
            onViewReport={handleViewReport}
            onEditReport={handleEditReport}
            onDuplicateReport={handleDuplicateReport}
            onDeleteReport={handleDeleteReportPrompt}
            onDeletePreviousMonths={handleDeletePreviousMonths}
            onExportDocx={handleExportDocx}
            onSelectReport={(r) => {
              setReport(sanitizeReportGroups(r));
              setActiveTab('preview');
            }}
            onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
            onCreateNewReport={handleTriggerNewReport}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {/* TAB 2: PREVIEW (Xem toàn văn bản A4 Ngang chuẩn EVN) */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <LiveDocumentPreview
              report={report}
              onExportDocx={() => handleExportDocx(report)}
            />
          </div>
        )}

        {/* TAB 3: EDIT (Biên tập & Chỉnh sửa - Dành cho Quản trị viên) */}
        {activeTab === 'edit' && (
          <div className="space-y-6">
            
            {/* Previous Month Notice Banner */}
            {isEditingPreviousMonth && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">
                      Đang biên tập biên bản của tháng trước: Tháng {report.thang_nam}
                    </h4>
                    <p className="text-xs text-amber-700">
                      Tháng hiện tại là <span className="font-semibold">{curMonth}</span>. Bạn có thể xóa biên bản này hoặc tạo biên bản mới cho tháng hiện tại.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDeleteReportPrompt(report.id)}
                    className="px-3 py-1.5 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa biên bản này</span>
                  </button>

                  <button
                    onClick={handleTriggerNewReport}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tạo tháng mới</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Helper Banner */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Edit3 className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base">
                    Giao diện soạn thảo Biên bản ATVSLĐ Tháng {report.thang_nam}
                  </h2>
                  <p className="text-xs text-blue-100">
                    Phân xưởng Vận hành Ialy • Quyền Quản trị viên (Admin) • Dữ liệu tự động đồng bộ đám mây
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold backdrop-blur transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem bản in A4</span>
                </button>
                <button
                  onClick={() => handleExportDocx(report)}
                  className="px-4 py-1.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất file Word</span>
                </button>
              </div>
            </div>

            {/* Step 1: General Info */}
            <ReportMetaForm
              report={report}
              onChange={handleUpdateField}
            />

            {/* Step 2: Members */}
            <MembersManager
              members={report.members}
              onChange={(members) => handleUpdateField('members', members)}
            />

            {/* Step 3: Inspection Criteria Table (16 Groups) */}
            <InspectionTableEditor
              groups={report.groups}
              onChange={(groups) => handleUpdateField('groups', groups)}
            />

            {/* Step 4: Recommendations & Conclusion */}
            <RecommendationsEditor
              recommendations={report.recommendations}
              onChange={(recommendations) => handleUpdateField('recommendations', recommendations)}
            />

            {/* Step 5: Field Photos (Appendix) */}
            <ImagesManager
              images={report.images}
              onChange={(images) => handleUpdateField('images', images)}
            />

            {/* Bottom Export & Save Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <p className="font-semibold text-slate-800">Hoàn tất cập nhật biên bản?</p>
                <p>Nhấn "Lưu" để đồng bộ dữ liệu vào hệ thống hoặc "Xuất Word" để tải file .docx.</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-blue-600" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu vào hệ thống'}</span>
                </button>

                <button
                  onClick={() => handleExportDocx(report)}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file Word (.docx)</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Global Application Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Hệ thống Biên bản ATVSLĐ Công ty Thủy điện Ialy • Phân xưởng Vận hành Ialy</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVercelGuideOpen(true)}
              className="text-blue-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              Hướng dẫn Deploy Vercel
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackupOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Sao lưu JSON
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        latestReport={report}
        onConfirmCreate={handleConfirmCreateNewReport}
      />

      <DeleteReportModal
        isOpen={isDeleteModalOpen}
        report={reportToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirmDelete={handleConfirmDeleteReport}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        reports={reportsHistory}
        currentReportId={report.id}
        userRole={userRole}
        currentMonth={curMonth}
        onSelectReport={(r) => {
          setReport(sanitizeReportGroups(r));
          setIsHistoryModalOpen(false);
          setActiveTab('edit');
        }}
        onViewReport={(r) => {
          setReport(sanitizeReportGroups(r));
          setIsHistoryModalOpen(false);
          setActiveTab('preview');
        }}
        onDuplicateReport={handleDuplicateReport}
        onDeleteReport={handleDeleteReportPrompt}
        onDeletePreviousMonths={handleDeletePreviousMonths}
        onExportDocx={handleExportDocx}
      />

      <VercelDeployModal
        isOpen={isVercelGuideOpen}
        onClose={() => setIsVercelGuideOpen(false)}
      />

      <JsonBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        currentReport={report}
        allReports={reportsHistory}
        onImportReports={async (imported) => {
          const cleaned = filterOutDeletedReports(imported.map(sanitizeReportGroups));
          const map = new Map<string, ReportData>();
          cleaned.forEach((r) => map.set(r.id, r));
          reportsHistory.forEach((r) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          const combined = Array.from(map.values());
          setReportsHistory(combined);
          await persistReportsHistory(combined);
          if (cleaned.length > 0) {
            setReport(cleaned[0]);
            await persistCurrentReport(cleaned[0]);
          }
          showToast(`Đã nhập thành công ${cleaned.length} biên bản từ file JSON!`, 'success');
        }}
      />

    </div>
  );
}
