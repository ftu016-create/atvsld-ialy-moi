import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Users, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Clock,
  ShieldCheck,
  PlusCircle,
  Upload
} from 'lucide-react';
import { ReportData, UserRole } from '../types';

interface HistoryPageProps {
  reports: ReportData[];
  currentReportId: string;
  userRole: UserRole;
  currentMonth: string;
  onViewReport: (report: ReportData) => void;
  onEditReport: (report: ReportData) => void;
  onDuplicateReport: (report: ReportData) => void;
  onDeleteReport: (id: string) => void;
  onDeletePreviousMonths?: () => void;
  onExportDocx: (report: ReportData) => void;
  onSelectReport?: (report: ReportData) => void;
  onOpenAdminAuth: () => void;
  onCreateNewReport: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  reports,
  currentReportId,
  userRole,
  currentMonth,
  onViewReport,
  onEditReport,
  onDuplicateReport,
  onDeleteReport,
  onDeletePreviousMonths,
  onExportDocx,
  onSelectReport,
  onOpenAdminAuth,
  onCreateNewReport,
  onExportBackup,
  onImportBackup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const isAdmin = userRole === 'admin';

  // Count previous months reports
  const previousMonthsReports = reports.filter((r) => r.thang_nam !== currentMonth);
  const oldReportsCount = previousMonthsReports.length;

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    reports.forEach((r) => {
      const parts = (r.thang_nam || '').split('/');
      if (parts[1]) years.add(parts[1]);
    });
    return Array.from(years).sort().reverse();
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (selectedYear !== 'all') {
          const parts = (r.thang_nam || '').split('/');
          if (parts[1] !== selectedYear) return false;
        }

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        const thangMatch = (r.thang_nam || '').toLowerCase().includes(q);
        const soMatch = (r.so_van_ban || '').toLowerCase().includes(q);
        const dateMatch = (r.ngay || '').toLowerCase().includes(q);
        const recMatch = (r.recommendations || []).some((rec) => rec.toLowerCase().includes(q));
        const memberMatch = (r.members || []).some((m) => m.name.toLowerCase().includes(q));

        return thangMatch || soMatch || dateMatch || recMatch || memberMatch;
      })
      .sort((a, b) => {
        const parseDate = (val: string) => {
          const [m, y] = (val || '01/2000').split('/');
          return new Date(parseInt(y || '2000', 10), parseInt(m || '1', 10) - 1).getTime();
        };
        const timeA = parseDate(a.thang_nam);
        const timeB = parseDate(b.thang_nam);
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [reports, searchTerm, selectedYear, sortOrder]);

  return (
    <div className="space-y-5">
      {/* Admin Quick Action & Backup Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">
                Bảng điều khiển Quản trị viên (Admin)
              </p>
              <p className="text-[11px] text-blue-700/80">
                Tháng hiện tại: <span className="font-bold">{currentMonth}</span> • Xóa biên bản sẽ xóa sạch vĩnh viễn không bị hiện lại
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {oldReportsCount > 0 && onDeletePreviousMonths && (
              <button
                id="btn-history-delete-old-months"
                onClick={onDeletePreviousMonths}
                title="Xóa nhanh tất cả các biên bản không thuộc tháng hiện tại"
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Xóa các biên bản tháng trước ({oldReportsCount})</span>
              </button>
            )}

            <button
              id="btn-history-create-new"
              onClick={onCreateNewReport}
              title="Tự động tính tháng tiếp theo và chuyển tiếp tồn tại từ kỳ trước"
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tạo tháng mới (Tự động)</span>
            </button>

            {onExportBackup && (
              <button
                id="btn-history-export-backup"
                onClick={onExportBackup}
                title="Sao lưu toàn bộ dữ liệu ra file JSON an toàn trên máy của bạn"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Sao lưu JSON</span>
              </button>
            )}

            {onImportBackup && (
              <label
                id="btn-history-import-backup"
                title="Nhập dữ liệu từ file backup JSON đã lưu trước đây"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phục hồi từ file</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onImportBackup(file);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-history-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tháng, số văn bản, người..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Năm:
            </span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}</span>
          </button>
        </div>

      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Kho lưu trữ đang trống hoặc không có biên bản phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">
            Các biên bản tháng cũ đã được dọn sạch hoàn toàn và sẽ không tự động phục hồi lại.
          </p>
          {(searchTerm || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('all');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((item) => {
            const isCurrent = item.id === currentReportId;
            const isPreviousMonth = item.thang_nam !== currentMonth;
            const leader = item.members?.find((m) => m.role.toLowerCase().includes('trưởng đoàn')) || item.members?.[0];
            const imagesCount = item.images?.length || 0;
            const recsCount = item.recommendations?.length || 0;

            return (
              <div
                key={item.id}
                id={`report-card-${item.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:shadow-md ${
                  isCurrent
                    ? 'border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : isPreviousMonth
                    ? 'border-slate-200/90 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPreviousMonth ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.thang_nam.split('/')[0] || '07'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition">
                            Biên bản Tháng {item.thang_nam}
                          </h3>
                          {isPreviousMonth && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Tháng trước
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Phân xưởng Vận hành Ialy
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                        Số: {item.so_van_ban ? `${item.so_van_ban}/VHIALY` : '---/VHIALY'}
                      </span>
                    </div>
                  </div>

                  {/* Date & Details */}
                  <div 
                    onClick={() => onViewReport(item)}
                    className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 cursor-pointer"
                    title={`Bấm để xem chi tiết văn bản Tháng ${item.thang_nam}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Ngày lập:
                      </span>
                      <span className="font-medium text-slate-800">{item.ngay}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Đợt kiểm tra:
                      </span>
                      <span className="font-medium text-slate-800">
                        {item.ngay_bd} - {item.ngay_kt}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Trưởng đoàn:
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]" title={leader?.name}>
                        {leader?.name || 'Nguyễn Hoàng Phi'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                      <Users className="w-3 h-3 text-slate-400" />
                      {item.members?.length || 0} thành viên
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      {recsCount} kiến nghị
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
                      <Camera className="w-3 h-3 text-blue-500" />
                      {imagesCount} ảnh hiện trường
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => onViewReport(item)}
                      title={`Xem toàn văn bản Tháng ${item.thang_nam} chuẩn A4`}
                      className="flex-1 py-1.5 px-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 hover:text-blue-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem chi tiết</span>
                    </button>

                    <button
                      id={`btn-export-card-${item.id}`}
                      onClick={() => onExportDocx(item)}
                      title={`Xuất file Word (.docx) của riêng Tháng ${item.thang_nam}`}
                      className="py-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất Word</span>
                    </button>
                  </div>

                  {/* Right: Admin Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 border-l pl-2 border-slate-200">
                      <button
                        onClick={() => onEditReport(item)}
                        title="Vào giao diện soạn thảo & sửa đổi nội dung"
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDuplicateReport(item)}
                        title="Nhân bản làm mẫu cho tháng mới"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteReport(item.id)}
                        title="Xóa vĩnh viễn biên bản này khỏi hệ thống"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Info footer banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Biên bản khi xóa sẽ được loại bỏ hoàn toàn trên mọi máy trạm và không bị khôi phục tự động.
        </span>
      </div>

    </div>
  );
};
