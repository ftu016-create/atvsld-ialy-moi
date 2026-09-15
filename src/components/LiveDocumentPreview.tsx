import React from 'react';
import { Download, Printer, FileText, Layers } from 'lucide-react';
import { ReportData } from '../types';

interface LiveDocumentPreviewProps {
  report: ReportData;
  onExportDocx: () => void;
}

import { getCurrentMonthYear } from '../data/defaultData';

export const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({ report, onExportDocx }) => {
  const leader = report.members.find((m) => m.role.toLowerCase().includes('trưởng đoàn')) || report.members[0];
  const otherMembers = report.members.filter((m) => m !== leader);

  const defaultMonth = getCurrentMonthYear();
  const thang = report.thang_nam || defaultMonth;
  const ngay = report.ngay || `30/${defaultMonth}`;
  const dateParts = ngay.split('/');
  const dayNum = dateParts[0] || '30';
  const monthNum = dateParts[1] || (thang.split('/')[0] || defaultMonth.split('/')[0]);
  const yearNum = dateParts[2] || (thang.split('/')[1] || defaultMonth.split('/')[1]);
  const thangFormatted = thang.includes('/') ? `${parseInt(thang.split('/')[0], 10)}/${thang.split('/')[1]}` : thang;

  const maxStt = Math.max(
    1,
    ...report.images.map((img) => img.stt || 1),
    3
  );

  return (
    <div className="space-y-4">
      {/* Top Banner with Quick Export */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-900">
            Xem trước bản in (Khổ giấy A4 Ngang - Landscape)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Layers className="w-3 h-3" />
            297mm × 210mm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>In trực tiếp (A4 Ngang)</span>
          </button>

          <button
            onClick={onExportDocx}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Tải file Word A4 Ngang (.docx)</span>
          </button>
        </div>
      </div>

      {/* Realistic A4 Landscape Sheet */}
      <div className="bg-white rounded-2xl p-8 sm:p-14 border border-slate-300 shadow-xl text-slate-900 w-full max-w-6xl mx-auto text-[14px] leading-relaxed">
        
        {/* Header Quốc hiệu & Đơn vị (Khung 2 cột chuẩn công văn) */}
        <div className="grid grid-cols-2 gap-8 pb-4 text-center">
          <div>
            <p className="font-bold uppercase text-[13px] sm:text-[14px]">CÔNG TY THỦY ĐIỆN IALY</p>
            <p className="font-bold underline uppercase text-[13px] sm:text-[14px]">PHÂN XƯỞNG VHIALY</p>
            <p className="mt-2 text-[13px] text-slate-800">
              <span className="underline">Số:</span> {report.so_van_ban ? `${report.so_van_ban}/VHIALY` : '       /VHIALY'}
            </p>
          </div>

          <div>
            <p className="font-bold uppercase text-[13px] sm:text-[14px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-bold underline text-[13px] sm:text-[14px]">Độc lập - Tự do - Hạnh phúc</p>
            <p className="mt-2 text-[13px] italic text-slate-700">
              Gia Lai, ngày {dayNum} tháng {monthNum} năm {yearNum}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight">
            BIÊN BẢN KIỂM TRA
          </h1>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight mt-1">
            CÔNG TÁC AN TOÀN, VỆ SINH LAO ĐỘNG THÁNG {thangFormatted}
          </h2>
        </div>

        {/* Căn cứ pháp lý */}
        <div className="mb-6 space-y-1.5 text-justify text-[13px] sm:text-[14px]">
          <p className="indent-8">- Căn cứ Thông tư 07/2016/TT-BLĐTBXH ngày 15/5/2016 quy định một số nội dung tổ chức thực hiện công tác an toàn, vệ sinh lao động đối với cơ sở sản xuất, kinh doanh.</p>
          <p className="indent-8">- Căn cứ Quy định công tác an toàn trong Tập đoàn Điện lực Việt Nam ban hành kèm theo Quyết định số 278/QĐ-EVN và Quy định thực hiện công tác an toàn ban hành kèm theo Quyết định số 279/QĐ-EVN.</p>
          <p className="indent-8">- Quyết định số 423/QĐ-TĐIAL ngày 20/7/{yearNum} ban hành Quy định an toàn khi thực hiện công việc trong Công ty Thủy điện Ialy.</p>
          <p className="indent-8">- Phân xưởng VHIALY thực hiện tự kiểm tra công tác ATVSLĐ định kỳ tháng {parseInt(monthNum, 10)} năm {yearNum}</p>
        </div>

        {/* Section A: Thành phần đoàn kiểm tra (2 columns) */}
        <div className="mb-6">
          <h2 className="font-bold uppercase text-sm sm:text-[15px] mb-3">A. THÀNH PHẦN ĐOÀN KIỂM TRA</h2>
          <div className="space-y-1.5 pl-3 sm:pl-6">
            {report.members.map((m, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 text-[13px] sm:text-[14px]">
                <span className="col-span-5 sm:col-span-4 font-medium">
                  {idx + 1}. Ông {m.name}
                </span>
                <span className="col-span-7 sm:col-span-8 text-slate-800">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Thời gian và địa điểm */}
        <div className="mb-6">
          <h2 className="font-bold uppercase text-sm sm:text-[15px] mb-2">B. THỜI GIAN VÀ ĐỊA ĐIỂM KIỂM TRA</h2>
          <div className="space-y-1 text-[13px] sm:text-[14px]">
            <p className="indent-8">- Thời gian: Từ {report.gio_bd} đến {report.gio_kt}, các ngày từ {report.ngay_bd} đến {report.ngay_kt}.</p>
            <p className="indent-8">- Địa điểm: Nhà máy Thủy điện Ialy và Nhà máy Thủy điện Ialy Mở Rộng.</p>
          </div>
        </div>

        {/* Section C: Bảng kiểm tra 5 cột rộng rãi trên khổ ngang */}
        <div className="mb-8">
          <h2 className="font-bold uppercase text-sm sm:text-[15px] mb-3">C. NỘI DUNG VÀ KẾT QUẢ KIỂM TRA</h2>
          
          <div className="overflow-x-auto border border-slate-900 mt-2">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                  <th className="border-r border-slate-900 p-2.5 w-12">STT</th>
                  <th className="border-r border-slate-900 p-2.5 w-1/4">Nội dung kiểm tra</th>
                  <th className="border-r border-slate-900 p-2.5 w-1/3">Kết quả kiểm tra</th>
                  <th className="border-r border-slate-900 p-2.5 w-1/4">Tồn tại/kiến nghị cần xử lý</th>
                  <th className="p-2.5 w-20">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {report.groups.map((g) => (
                  <React.Fragment key={g.stt}>
                    {/* Header Nhóm */}
                    <tr className="bg-slate-50 font-bold border-b border-slate-900">
                      <td className="border-r border-slate-900 p-2 text-center">{g.stt}</td>
                      <td colSpan={4} className="p-2">{g.title}</td>
                    </tr>
                    {/* Các dòng con */}
                    {g.rows.map((r, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-400 hover:bg-slate-50/50">
                        <td className="border-r border-slate-900 p-2 text-center font-medium">{r.idx}</td>
                        <td className="border-r border-slate-900 p-2 whitespace-pre-line">{r.content}</td>
                        <td className="border-r border-slate-900 p-2 whitespace-pre-line">{r.result}</td>
                        <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-800">{r.recommendation}</td>
                        <td className="p-2 text-center">{r.note}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D: Kiến nghị */}
        <div className="mb-8">
          <h2 className="font-bold uppercase text-sm sm:text-[15px] mb-2">D. KIẾN NGHỊ ĐOÀN KIỂM TRA</h2>
          <div className="space-y-1.5 text-[13px] sm:text-[14px] text-justify">
            {report.recommendations.map((rec, idx) => (
              <p key={idx} className="indent-8">
                <strong>{idx + 1}. </strong>
                {rec}
              </p>
            ))}
          </div>
        </div>

        {/* Chữ ký 2 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 pt-6 text-center border-t border-slate-200">
          <div className="sm:col-span-7">
            <p className="font-bold uppercase text-[13px] sm:text-[14px] mb-4">
              CÁC THÀNH VIÊN ĐOÀN KIỂM TRA
            </p>
            <div className="grid grid-cols-2 gap-4 text-[12px] sm:text-[13px]">
              {otherMembers.map((m, i) => (
                <div key={i} className="pb-4 text-left pl-2">
                  <p className="font-medium">{i + 1}. Ông: {m.name}</p>
                  {m.signatureUrl ? (
                    <img src={m.signatureUrl} alt="Chữ ký" className="h-10 my-1 object-contain" />
                  ) : (
                    <p className="italic text-slate-400 text-[11px] mt-4">(Ký tên)</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-5">
            <p className="font-bold uppercase text-[13px] sm:text-[14px]">
              TRƯỞNG ĐOÀN KIỂM TRA
            </p>
            <p className="italic text-slate-500 text-[12px] mb-2">
              (Ký và ghi rõ họ tên)
            </p>
            {leader?.signatureUrl ? (
              <div className="h-20 flex items-center justify-center my-1">
                <img src={leader.signatureUrl} alt="Chữ ký Trưởng đoàn" className="h-16 object-contain" />
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center italic text-slate-400 text-xs">
                (Ký tên)
              </div>
            )}
            <p className="font-bold text-[13px] sm:text-[14px]">
              Ông: {leader?.name}
            </p>
          </div>
        </div>

        {/* Phụ lục hình ảnh khổ ngang */}
        <div className="mt-14 pt-10 border-t-2 border-dashed border-slate-300">
          <h2 className="text-center font-bold uppercase text-sm sm:text-base mb-6">
            PHỤ LỤC: CÁC HÌNH ẢNH KIỂM TRA THỰC TẾ THÁNG {thangFormatted}
          </h2>

          <div className="border border-slate-900">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                  <th className="border-r border-slate-900 p-2.5 w-10">STT</th>
                  <th className="border-r border-slate-900 p-2.5 w-1/2">Hình ảnh hiện trường NMTĐ Ialy</th>
                  <th className="border-r border-slate-900 p-2.5 w-10">STT</th>
                  <th className="p-2.5 w-1/2">Hình ảnh hiện trường NMTĐ Ialy MR</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxStt }).map((_, i) => {
                  const stt = i + 1;
                  const imgST = report.images.find((x) => x.stt === stt && x.side === 'ST');
                  const imgMR = report.images.find((x) => x.stt === stt && x.side === 'MR');

                  return (
                    <React.Fragment key={stt}>
                      {/* Caption row */}
                      <tr className="bg-slate-50/70 border-b border-slate-300 font-medium text-[12px]">
                        <td className="border-r border-slate-900 p-1.5 text-center font-bold">{stt}</td>
                        <td className="border-r border-slate-900 p-1.5 italic text-slate-700">
                          {imgST?.caption || `Vị trí kiểm tra ${stt} - NMTĐ Ialy`}
                        </td>
                        <td className="border-r border-slate-900 p-1.5 text-center font-bold">{stt}</td>
                        <td className="p-1.5 italic text-slate-700">
                          {imgMR?.caption || `Vị trí kiểm tra ${stt} - NMTĐ Ialy Mở Rộng`}
                        </td>
                      </tr>
                      {/* Image row */}
                      <tr className="border-b border-slate-900">
                        <td className="border-r border-slate-900 p-1"></td>
                        <td className="border-r border-slate-900 p-3 text-center">
                          {imgST?.dataUrl ? (
                            <img src={imgST.dataUrl} alt="NMTĐ Ialy" className="max-h-56 mx-auto rounded object-cover border border-slate-200" />
                          ) : (
                            <span className="text-slate-400 italic text-xs">(Chưa có ảnh)</span>
                          )}
                        </td>
                        <td className="border-r border-slate-900 p-1"></td>
                        <td className="p-3 text-center">
                          {imgMR?.dataUrl ? (
                            <img src={imgMR.dataUrl} alt="NMTĐ Ialy Mở Rộng" className="max-h-56 mx-auto rounded object-cover border border-slate-200" />
                          ) : (
                            <span className="text-slate-400 italic text-xs">(Chưa có ảnh)</span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
