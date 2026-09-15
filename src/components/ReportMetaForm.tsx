import React from 'react';
import { Calendar, Clock, FileSpreadsheet, Hash } from 'lucide-react';
import { ReportData } from '../types';
import { getCurrentMonthYear } from '../data/defaultData';

interface ReportMetaFormProps {
  report: ReportData;
  onChange: (field: keyof ReportData, value: any) => void;
}

export const ReportMetaForm: React.FC<ReportMetaFormProps> = ({ report, onChange }) => {
  const curMonth = getCurrentMonthYear();
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900">
          1. Thông tin chung & Thời gian kiểm tra
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tháng kiểm tra */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Tháng / Năm kiểm tra:
          </label>
          <input
            id="input-thang-nam"
            type="text"
            value={report.thang_nam}
            onChange={(e) => onChange('thang_nam', e.target.value)}
            placeholder={curMonth}
            className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
          />
          <p className="text-[11px] text-slate-400 mt-1">VD: {curMonth}</p>
        </div>

        {/* Ngày lập biên bản */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Ngày lập biên bản:
          </label>
          <input
            id="input-ngay-lap"
            type="text"
            value={report.ngay}
            onChange={(e) => onChange('ngay', e.target.value)}
            placeholder={`30/${curMonth}`}
            className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
          />
          <p className="text-[11px] text-slate-400 mt-1">VD: 30/{curMonth}</p>
        </div>

        {/* Số văn bản */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            Số văn bản:
          </label>
          <div className="flex items-center">
            <input
              id="input-so-van-ban"
              type="text"
              value={report.so_van_ban}
              onChange={(e) => onChange('so_van_ban', e.target.value)}
              placeholder="VD: 108"
              className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
            />
            <span className="px-3 py-2 text-xs font-semibold bg-slate-100 border border-l-0 border-slate-200 text-slate-600 rounded-r-xl whitespace-nowrap">
              /VHIALY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Để trống nếu chưa có số</p>
        </div>

        {/* Khung giờ kiểm tra */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Khung giờ làm việc:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="input-gio-bd"
              type="text"
              value={report.gio_bd}
              onChange={(e) => onChange('gio_bd', e.target.value)}
              placeholder="08:00"
              className="w-full px-2.5 py-2 text-xs text-center bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
            />
            <input
              id="input-gio-kt"
              type="text"
              value={report.gio_kt}
              onChange={(e) => onChange('gio_kt', e.target.value)}
              placeholder="16:00"
              className="w-full px-2.5 py-2 text-xs text-center bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Từ giờ - Đến giờ</p>
        </div>
      </div>

      {/* Khoảng ngày kiểm tra */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Khoảng ngày diễn ra đợt kiểm tra:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Từ ngày:</span>
            <input
              id="input-ngay-bd"
              type="text"
              value={report.ngay_bd}
              onChange={(e) => onChange('ngay_bd', e.target.value)}
              placeholder="29/07/2026"
              className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Đến ngày:</span>
            <input
              id="input-ngay-kt"
              type="text"
              value={report.ngay_kt}
              onChange={(e) => onChange('ngay_kt', e.target.value)}
              placeholder="31/07/2026"
              className="w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
