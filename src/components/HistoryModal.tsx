import React from 'react';
import { 
  X, 
  Clock, 
  Download, 
  Edit3, 
  Trash2, 
  Copy, 
  FileText, 
  Calendar,
  Eye,
  Lock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ReportData, UserRole } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportData[];
  currentReportId: string;
  userRole: UserRole;
  currentMonth: string;
  onSelectReport: (report: ReportData) => void;
  onViewReport?: (report: ReportData) => void;
  onDuplicateReport: (report: ReportData) => void;
  onDeleteReport: (id: string) => void;
  onDeletePreviousMonths?: () => void;
  onExportDocx: (report: ReportData) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  reports,
  currentReportId,
  userRole,
  currentMonth,
  onSelectReport,
  onViewReport,
  onDuplicateReport,
  onDeleteReport,
  onDeletePreviousMonths,
  onExportDocx,
}) => {
  if (!isOpen) return null;
  const isAdmin = userRole === 'admin';

  const previousMonthsReports = reports.filter((r) => r.thang_nam !== currentMonth);
  const oldReportsCount = previousMonthsReports.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Kho lưu trữ biên bản ATVSLĐ
                </h3>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Đồng nghiệp (Chỉ xem)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Tháng hiện tại: <span className="font-bold text-blue-700">{currentMonth}</span> • Tổng số {reports.length} biên bản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Toolbar for Admin */}
        {isAdmin && oldReportsCount > 0 && onDeletePreviousMonths && (
          <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between gap-2">
            <span className="text-xs text-amber-900 font-medium">
              Phát hiện <strong>{oldReportsCount}</strong> biên bản thuộc các tháng trước:
            </span>
            <button
              onClick={onDeletePreviousMonths}
              className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-800" />
              <span>Xóa các biên bản tháng trước ({oldReportsCount})</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Kho lưu trữ đang trống</p>
              <p className="text-xs text-slate-400 mt-1">
                Các biên bản tháng cũ đã được xóa hoàn toàn và không bị tự khôi phục lại.
              </p>
            </div>
          ) : (
            reports.map((item) => {
              const isCurrent = item.id === currentReportId;
              const isPreviousMonth = item.thang_nam !== currentMonth;
              const hasImages = item.images && item.images.length > 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20 shadow-xs'
                      : isPreviousMonth
                      ? 'bg-amber-50/20 border-slate-200 hover:bg-amber-50/40'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Biên bản ATVSLĐ Tháng {item.thang_nam}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                          Đang mở
                        </span>
                      )}
                      {isPreviousMonth && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Tháng trước
                        </span>
                      )}
                      {item.so_van_ban && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                          Số: {item.so_van_ban}/VHIALY
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Ngày lập: {item.ngay}
                      </span>
                      <span>•</span>
                      <span>{item.members?.length || 0} thành viên đoàn</span>
                      <span>•</span>
                      <span>{hasImages ? `${item.images.length} ảnh hiện trường` : 'Chưa có ảnh'}</span>
                      <span>•</span>
                      <span className="text-slate-400 text-[11px]">Cập nhật: {item.updated_at}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <button
                      onClick={() => {
                        if (onViewReport) {
                          onViewReport(item);
                        } else {
                          onSelectReport(item);
                        }
                      }}
                      title="Xem biên bản chi tiết A4"
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onSelectReport(item)}
                        title="Mở chỉnh sửa"
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onDuplicateReport(item)}
                        title="Nhân bản sang tháng tiếp theo"
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nhân bản</span>
                      </button>
                    )}

                    <button
                      onClick={() => onExportDocx(item)}
                      title="Tải file Word .docx"
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteReport(item.id)}
                        title="Xóa vĩnh viễn biên bản này"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống biên bản lưu trữ tại VHIALY - Công ty Thủy điện Ialy</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
