import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ReportData } from '../types';
import { 
  getNextMonthYear, 
  suggestNextDocNumber, 
  extractUnresolvedIssues,
  createAutomatedNewReport 
} from '../utils/reportAutomation';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestReport: ReportData;
  onConfirmCreate: (newReport: ReportData, transferredCount: number) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  latestReport,
  onConfirmCreate,
}) => {
  const [targetMonth, setTargetMonth] = useState('');
  const [targetDocNum, setTargetDocNum] = useState('');
  const [rolloverIssues, setRolloverIssues] = useState(true);

  const unresolvedIssues = extractUnresolvedIssues(latestReport);

  useEffect(() => {
    if (isOpen && latestReport) {
      const { nextMonth } = getNextMonthYear(latestReport.thang_nam);
      const nextDoc = suggestNextDocNumber(latestReport.so_van_ban);
      setTargetMonth(nextMonth);
      setTargetDocNum(nextDoc);
      setRolloverIssues(true);
    }
  }, [isOpen, latestReport]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const res = createAutomatedNewReport(latestReport, {
      customMonth: targetMonth,
      customDocNum: targetDocNum,
      rolloverIssues,
    });
    onConfirmCreate(res.report, res.transferredCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tạo biên bản ATVSLĐ tháng mới (Tự động)
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống tự động tính tháng kế tiếp và chuyển tiếp tồn tại từ kỳ trước
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

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Comparison / Flow Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="text-center flex-1">
              <span className="text-slate-400 font-medium block text-[11px]">Kỳ trước</span>
              <span className="font-bold text-slate-700 text-sm">Tháng {latestReport.thang_nam}</span>
              <span className="text-[11px] text-slate-500 block">Số {latestReport.so_van_ban ? `${latestReport.so_van_ban}/VHIALY` : '---'}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500 shrink-0 mx-2" />
            <div className="text-center flex-1 bg-blue-50/80 border border-blue-200 py-1.5 px-2 rounded-lg">
              <span className="text-blue-600 font-semibold block text-[11px]">Kỳ mới tạo</span>
              <span className="font-bold text-blue-900 text-sm">Tháng {targetMonth || '...'}</span>
              <span className="text-[11px] text-blue-700 block">Số {targetDocNum || '...'}/VHIALY</span>
            </div>
          </div>

          {/* Quick Config Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Tháng kiểm tra (MM/YYYY):
              </label>
              <input
                type="text"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                placeholder="08/2026"
                className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-bold text-slate-800 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Đã tự động cộng thêm 1 tháng</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Số văn bản biên bản:
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={targetDocNum}
                  onChange={(e) => setTargetDocNum(e.target.value)}
                  placeholder="109"
                  className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-bold text-slate-800 transition"
                />
                <span className="px-3 py-2 text-xs bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-slate-600 font-semibold whitespace-nowrap">
                  /VHIALY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tự động tăng số hiệu văn bản</p>
            </div>
          </div>

          {/* Rollover Unresolved Issues Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800">
                  Chuyển tiếp tồn tại kiến nghị vào Mục 7:
                </h4>
              </div>
              {unresolvedIssues.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  {unresolvedIssues.length} kiến nghị
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Đạt chuẩn 100%
                </span>
              )}
            </div>

            {unresolvedIssues.length > 0 ? (
              <div className="mt-3 space-y-2.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rolloverIssues}
                    onChange={(e) => setRolloverIssues(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>
                    Tự động chuyển tiếp {unresolvedIssues.length} kiến nghị chưa xử lý từ Tháng {latestReport.thang_nam} sang Mục 7
                  </span>
                </label>

                {rolloverIssues && (
                  <div className="mt-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
                    {unresolvedIssues.map((issue, idx) => (
                      <div key={idx} className="border-b border-amber-200/50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px]">
                            Mục {issue.originalIdx}
                          </span>
                          <span className="truncate">{issue.content}</span>
                        </div>
                        <p className="text-[11px] text-amber-800/90 mt-0.5 italic">
                          ↳ Kiến nghị: {issue.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tháng {latestReport.thang_nam} không có tồn tại nào cần khắc phục. Mục 7 tháng mới sẽ được tự động ghi nhận đạt yêu cầu.
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-800">
            💡 <strong>Ghi chú:</strong> Danh sách thành viên đoàn kiểm tra sẽ được giữ nguyên theo cơ cấu mới nhất để không mất công nhập lại. Bạn có thể thay đổi sau khi tạo.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            id="btn-confirm-create-new-report"
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo biên bản Tháng {targetMonth} ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
