import React from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Calendar, 
  FileText, 
  Users, 
  Camera 
} from 'lucide-react';
import { ReportData } from '../types';

interface DeleteReportModalProps {
  isOpen: boolean;
  report: ReportData | null;
  onClose: () => void;
  onConfirmDelete: (reportId: string) => void;
}

export const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xóa vĩnh viễn biên bản kiểm tra
              </h3>
              <p className="text-xs text-red-700/80">
                Xác nhận quyền Quản trị viên (Admin)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-700">
            Bạn có chắc chắn muốn xóa vĩnh viễn biên bản này không? Sau khi xóa, biên bản sẽ <strong>không bao giờ tự động hiện lại</strong>.
          </p>

          {/* Report summary card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-sm text-slate-900">
              <span>Biên bản Tháng {report.thang_nam}</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                Số: {report.so_van_ban ? `${report.so_van_ban}/VHIALY` : '---/VHIALY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngày lập: {report.ngay}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.members?.length || 0} thành viên</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{report.recommendations?.length || 0} kiến nghị</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                <span>{report.images?.length || 0} ảnh hiện trường</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              Biên bản này sẽ được xóa hoàn toàn khỏi cả bộ nhớ máy tính và cơ sở dữ liệu dùng chung đám mây.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            id="btn-confirm-delete-report"
            type="button"
            onClick={() => {
              onConfirmDelete(report.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xác nhận xóa vĩnh viễn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
