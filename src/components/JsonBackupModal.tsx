import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  FileJson
} from 'lucide-react';
import { ReportData } from '../types';

interface JsonBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport: ReportData;
  allReports: ReportData[];
  onImportReports: (imported: ReportData[]) => void;
}

export const JsonBackupModal: React.FC<JsonBackupModalProps> = ({
  isOpen,
  onClose,
  currentReport,
  allReports,
  onImportReports,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportCurrent = () => {
    const dataStr = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BienBan_ATVSLD_${currentReport.thang_nam.replace(/[\/\\]/g, '_')}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(allReports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TatCa_BienBan_ATVSLD_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportReports(parsed);
          setImportStatus(`Đã khôi phục thành công ${parsed.length} biên bản.`);
        } else if (parsed && parsed.groups && parsed.members) {
          onImportReports([parsed]);
          setImportStatus('Đã nạp thành công 1 biên bản.');
        } else {
          setImportStatus('Lỗi: File JSON không đúng định dạng biên bản ATVSLĐ.');
        }
      } catch (err) {
        setImportStatus('Lỗi: Không thể đọc dữ liệu file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Sao lưu & Phục hồi dữ liệu
              </h3>
              <p className="text-xs text-slate-500">
                Xuất file JSON để chuyển sang máy tính khác hoặc lưu trữ dài hạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Export Options */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Tải về file sao lưu (.JSON)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCurrent}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition text-left flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Biên bản hiện tại</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tháng {currentReport.thang_nam} ({currentReport.members?.length || 0} thành viên)
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                  <Download className="w-3.5 h-3.5" />
                  Xuất file JSON
                </span>
              </button>

              <button
                onClick={handleExportAll}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition text-left flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Toàn bộ kho lưu trữ</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Tất cả {allReports.length} biên bản đã lưu trong hệ thống
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                  <Download className="w-3.5 h-3.5" />
                  Xuất toàn bộ JSON
                </span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Nạp file sao lưu từ máy tính
            </span>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl cursor-pointer transition">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                Chọn file JSON sao lưu để khôi phục
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Chấp nhận file .json đã xuất trước đó
              </span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => handleImportFile(e.target.files)}
              />
            </label>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  importStatus.includes('Lỗi')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {importStatus.includes('Lỗi') ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{importStatus}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
