import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { InspectionGroup, InspectionRow } from '../types';

interface InspectionTableEditorProps {
  groups: InspectionGroup[];
  onChange: (groups: InspectionGroup[]) => void;
}

export const InspectionTableEditor: React.FC<InspectionTableEditorProps> = ({ groups, onChange }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIssuesOnly, setFilterIssuesOnly] = useState(false);

  const toggleGroup = (stt: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [stt]: !prev[stt],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    groups.forEach((g) => (all[g.stt] = true));
    setExpandedGroups(all);
  };

  const collapseAll = () => {
    setExpandedGroups({});
  };

  const getNextGroupStt = () => {
    if (groups.length === 0) return '1';
    const numericStts = groups
      .map((g) => parseInt(g.stt, 10))
      .filter((n) => !isNaN(n));
    if (numericStts.length > 0) {
      return String(Math.max(...numericStts) + 1);
    }
    return String(groups.length + 1);
  };

  const handleAddNewGroup = () => {
    const nextStt = getNextGroupStt();
    const newGroup: InspectionGroup = {
      stt: nextStt,
      title: `Nội dung kiểm tra bổ sung (Mục ${nextStt})`,
      rows: [
        {
          idx: `${nextStt}.1`,
          content: '',
          result: 'Bảo đảm yêu cầu an toàn theo quy định',
          recommendation: 'Không phát sinh kiến nghị sau kiểm tra',
          note: '',
        },
      ],
    };
    const nextGroups = [...groups, newGroup];
    onChange(nextGroups);
    setExpandedGroups((prev) => ({ ...prev, [nextStt]: true }));
  };

  const handleRemoveGroup = (groupIndex: number) => {
    if (groups.length <= 1) return;
    const targetStt = groups[groupIndex]?.stt;
    const nextGroups = groups.filter((_, idx) => idx !== groupIndex);
    onChange(nextGroups);
    if (targetStt) {
      setExpandedGroups((prev) => {
        const next = { ...prev };
        delete next[targetStt];
        return next;
      });
    }
  };

  const handleGroupTitleChange = (groupIndex: number, newTitle: string) => {
    const nextGroups = [...groups];
    nextGroups[groupIndex] = { ...nextGroups[groupIndex], title: newTitle };
    onChange(nextGroups);
  };

  const handleRowChange = (
    groupIndex: number,
    rowIndex: number,
    field: keyof InspectionRow,
    value: string
  ) => {
    const nextGroups = [...groups];
    const targetGroup = { ...nextGroups[groupIndex] };
    const targetRows = [...targetGroup.rows];
    targetRows[rowIndex] = { ...targetRows[rowIndex], [field]: value };
    targetGroup.rows = targetRows;
    nextGroups[groupIndex] = targetGroup;
    onChange(nextGroups);
  };

  const handleAddRow = (groupIndex: number) => {
    const nextGroups = [...groups];
    const targetGroup = { ...nextGroups[groupIndex] };
    const nextIndex = `${targetGroup.stt}.${targetGroup.rows.length + 1}`;
    targetGroup.rows = [
      ...targetGroup.rows,
      {
        idx: nextIndex,
        content: "",
        result: "Bảo đảm yêu cầu an toàn theo quy định",
        recommendation: "Không phát sinh kiến nghị sau kiểm tra",
        note: "",
      },
    ];
    nextGroups[groupIndex] = targetGroup;
    onChange(nextGroups);
  };

  const handleRemoveRow = (groupIndex: number, rowIndex: number) => {
    const nextGroups = [...groups];
    const targetGroup = { ...nextGroups[groupIndex] };
    const filteredRows = targetGroup.rows.filter((_, idx) => idx !== rowIndex);
    targetGroup.rows = filteredRows.map((r, i) => ({
      ...r,
      idx: `${targetGroup.stt}.${i + 1}`,
    }));
    nextGroups[groupIndex] = targetGroup;
    onChange(nextGroups);
  };

  const handleResetRowStandard = (groupIndex: number, rowIndex: number) => {
    handleRowChange(groupIndex, rowIndex, 'recommendation', 'Không phát sinh kiến nghị sau kiểm tra');
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.rows.some(
        (r) =>
          r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.recommendation.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchSearch) return false;

    if (filterIssuesOnly) {
      return g.rows.some(
        (r) =>
          r.recommendation.trim() !== '' &&
          !r.recommendation.toLowerCase().includes('không phát sinh kiến nghị')
      );
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              3. Bảng nội dung & Kết quả kiểm tra ({groups.length} Nhóm tiêu chí)
            </h2>
            <p className="text-xs text-slate-500">
              Chuẩn quy định ATVSLĐ Nhà máy Thủy điện Ialy & Ialy Mở Rộng
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddNewGroup}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Mục {getNextGroupStt()}</span>
          </button>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tiêu chí..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden w-40 sm:w-52"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterIssuesOnly(!filterIssuesOnly)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1 ${
              filterIssuesOnly
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Chỉ mục có kiến nghị</span>
          </button>

          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Mở hết
          </button>

          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="space-y-3">
        {filteredGroups.map((group) => {
          const originalGroupIndex = groups.findIndex((g) => g.stt === group.stt);
          const isExpanded = expandedGroups[group.stt] || searchQuery.length > 0;
          const hasIssue = group.rows.some(
            (r) =>
              r.recommendation.trim() !== '' &&
              !r.recommendation.toLowerCase().includes('không phát sinh kiến nghị')
          );

          return (
            <div
              key={group.stt}
              className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition"
            >
              {/* Group Header Title */}
              <div
                onClick={() => toggleGroup(group.stt)}
                className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none transition ${
                  isExpanded ? 'bg-slate-100/90 border-b border-slate-200' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5 flex-1 pr-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    {group.stt}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      Mục {group.stt}: {group.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500">
                        {group.rows.length} nội dung kiểm tra
                      </span>
                      {hasIssue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Có tồn tại / kiến nghị
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>

              {/* Group Rows */}
              {isExpanded && (
                <div className="p-3 sm:p-4 bg-white space-y-4">
                  {/* Group Title Editor Bar */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold text-blue-900 whitespace-nowrap">
                        Tên Mục {group.stt}:
                      </span>
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => handleGroupTitleChange(originalGroupIndex, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                        placeholder={`Nhập tên Mục ${group.stt}...`}
                      />
                    </div>
                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(originalGroupIndex)}
                        title={`Xóa Mục ${group.stt}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition self-end sm:self-auto shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Mục {group.stt}</span>
                      </button>
                    )}
                  </div>

                  {group.rows.map((row, rowIdx) => {
                    const rowHasIssue =
                      row.recommendation.trim() !== '' &&
                      !row.recommendation.toLowerCase().includes('không phát sinh kiến nghị');

                    return (
                      <div
                        key={rowIdx}
                        className={`p-3.5 rounded-xl border transition ${
                          rowHasIssue
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                              {row.idx}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              Nội dung {row.idx}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {rowHasIssue && (
                              <button
                                type="button"
                                onClick={() => handleResetRowStandard(originalGroupIndex, rowIdx)}
                                title="Đặt lại thành 'Không phát sinh kiến nghị'"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Đặt đạt chuẩn</span>
                              </button>
                            )}

                            {group.rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(originalGroupIndex, rowIdx)}
                                title="Xóa dòng con này"
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Nội dung kiểm tra */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Tên nội dung kiểm tra:
                            </label>
                            <textarea
                              rows={2}
                              value={row.content}
                              onChange={(e) =>
                                handleRowChange(originalGroupIndex, rowIdx, 'content', e.target.value)
                              }
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                              placeholder="Mô tả nội dung tiêu chí..."
                            />
                          </div>

                          {/* Kết quả kiểm tra */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Kết quả kiểm tra thực tế:
                            </label>
                            <textarea
                              rows={2}
                              value={row.result}
                              onChange={(e) =>
                                handleRowChange(originalGroupIndex, rowIdx, 'result', e.target.value)
                              }
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                              placeholder="Ghi nhận tình hình kiểm tra..."
                            />
                          </div>

                          {/* Kiến nghị khắc phục */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                              <span>Kiến nghị, biện pháp khắc phục:</span>
                              {rowHasIssue ? (
                                <span className="text-[10px] text-amber-600 font-semibold">Cần khắc phục</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold">Đạt chuẩn</span>
                              )}
                            </label>
                            <textarea
                              rows={2}
                              value={row.recommendation}
                              onChange={(e) =>
                                handleRowChange(originalGroupIndex, rowIdx, 'recommendation', e.target.value)
                              }
                              className={`w-full px-3 py-1.5 text-xs rounded-lg focus:ring-2 outline-hidden font-medium border ${
                                rowHasIssue
                                  ? 'bg-amber-50/50 border-amber-300 focus:ring-amber-500/20 focus:border-amber-500'
                                  : 'bg-white border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                              }`}
                              placeholder="Không phát sinh kiến nghị sau kiểm tra..."
                            />
                          </div>

                          {/* Ghi chú */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ghi chú (nếu có):
                            </label>
                            <textarea
                              rows={2}
                              value={row.note}
                              onChange={(e) =>
                                handleRowChange(originalGroupIndex, rowIdx, 'note', e.target.value)
                              }
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                              placeholder="Ghi chú thêm..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleAddRow(originalGroupIndex)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 shadow-2xs transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm dòng vào Mục {group.stt}</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Tổng {group.rows.length} dòng
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Action Footer at the end of groups */}
      <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-slate-50 border border-blue-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Thêm Mục kiểm tra mới hoặc thêm dòng tiêu chí</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Hiện có {groups.length} Mục. Bạn có thể mở rộng thêm Mục 17, 18... không giới hạn
          </p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={handleAddNewGroup}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Mục {getNextGroupStt()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
