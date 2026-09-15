import React from 'react';
import { 
  FileText, 
  Download, 
  Save, 
  PlusCircle, 
  History, 
  CheckCircle2,
  ShieldCheck,
  LogOut,
  KeyRound,
  Eye,
  Edit3,
  Printer
} from 'lucide-react';
import { ReportData, UserRole, ViewTab } from '../types';

interface HeaderProps {
  report: ReportData;
  reportsList?: ReportData[];
  onSelectReport?: (report: ReportData) => void;
  userRole: UserRole;
  onSave: () => void;
  onNew: () => void;
  onOpenHistoryModal: () => void;
  onExportDocx: () => void;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  onPrint?: () => void;
  isSaving: boolean;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  report,
  reportsList,
  onSelectReport,
  userRole,
  onSave,
  onNew,
  onOpenHistoryModal,
  onExportDocx,
  onOpenAdminAuth,
  onLogoutAdmin,
  onPrint,
  isSaving,
  activeTab,
  setActiveTab,
}) => {
  const isAdmin = userRole === 'admin';

  const handleTabClick = (tab: ViewTab) => {
    if (tab === 'edit' && !isAdmin) {
      onOpenAdminAuth();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-3">
          
          {/* Left: Brand & Month Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                  Biên Bản ATVSLĐ
                </h1>
                
                {activeTab !== 'history' && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                    Tháng {report.thang_nam}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                VHIALY  •  Công ty Thủy điện Ialy
              </p>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop & Tablet) */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0">
            <button
              id="btn-desktop-history-tab"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử các tháng</span>
            </button>

            <button
              id="btn-desktop-preview-tab"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem văn bản</span>
            </button>

            {isAdmin && (
              <button
                id="btn-desktop-edit-tab"
                onClick={() => handleTabClick('edit')}
                title="Vào giao diện soạn thảo & sửa đổi"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'edit' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Soạn thảo</span>
              </button>
            )}
          </div>

          {/* Right: Actions & User Role Controls */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Role Badge / Login Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Admin</span>
                <span className="text-emerald-300">|</span>
                <button
                  id="btn-header-logout-admin"
                  onClick={onLogoutAdmin}
                  title="Thoát quyền Admin (Chuyển sang chế độ Đồng nghiệp)"
                  className="text-emerald-700 hover:text-red-600 transition flex items-center gap-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login-admin"
                onClick={onOpenAdminAuth}
                title="Đăng nhập tài khoản Quản trị viên để soạn thảo và chỉnh sửa biên bản"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition whitespace-nowrap cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin</span>
              </button>
            )}

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            {/* Admin-Only New Report */}
            {isAdmin && (
              <button
                id="btn-header-new-report"
                onClick={onNew}
                title="Tạo biên bản tháng mới"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg transition whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Tạo mới</span>
              </button>
            )}

            {/* Admin-Only Save Button: only shown when editing */}
            {isAdmin && activeTab === 'edit' && (
              <button
                id="btn-header-save"
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition whitespace-nowrap shadow-2xs cursor-pointer"
              >
                {isSaving ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{isSaving ? 'Lưu...' : 'Lưu'}</span>
              </button>
            )}

            {/* Export & Print actions */}
            {activeTab !== 'history' && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-header-print-pdf"
                  onClick={onPrint || (() => window.print())}
                  title={`In hoặc Lưu PDF (khổ A4 Ngang) cho biên bản Tháng ${report.thang_nam}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden lg:inline">In PDF</span>
                </button>

                <button
                  id="btn-header-export-docx"
                  onClick={onExportDocx}
                  title={`Xuất file Word (.docx) cho biên bản Tháng ${report.thang_nam}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 transition whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Word</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Mobile View Toggle Bar */}
        <div className="flex md:hidden items-center justify-center pb-2 pt-1 border-t border-slate-100">
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs w-full max-w-xs justify-center">
            <button
              id="btn-mobile-history-tab"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition ${
                activeTab === 'history' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Lịch sử
            </button>
            <button
              id="btn-mobile-preview-tab"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-1 text-center font-medium rounded-md transition ${
                activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Xem chi tiết
            </button>
            {isAdmin && (
              <button
                id="btn-mobile-edit-tab"
                onClick={() => handleTabClick('edit')}
                className={`flex-1 py-1 text-center font-medium rounded-md transition flex items-center justify-center gap-1 ${
                  activeTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Edit3 className="w-3 h-3 text-blue-600" />
                <span>Soạn thảo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
