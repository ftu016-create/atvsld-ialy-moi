import React, { useState } from 'react';
import { Users, Plus, Trash2, ShieldCheck, UserCheck, PenTool, CheckCircle } from 'lucide-react';
import { Member } from '../types';
import { SignatureModal } from './SignatureModal';

interface MembersManagerProps {
  members: Member[];
  onChange: (members: Member[]) => void;
}

const COMMON_ROLES = [
  "Phó Quản đốc - Trưởng đoàn",
  "QLKT - Người làm Công tác an toàn PX",
  "Trực ĐKTT",
  "Trực chính TBA 500kV",
  "Trực trạm 500kV Ialy",
  "Trực phụ máy Gian máy",
  "Trực chính Gian máy",
  "An toàn vệ sinh viên",
  "Kỹ sư vận hành",
  "Trưởng ca",
];

export const MembersManager: React.FC<MembersManagerProps> = ({ members, onChange }) => {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const next = [...members];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const handleAddMember = () => {
    onChange([...members, { name: "", role: "Thành viên đoàn" }]);
  };

  const handleRemoveMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const handleSetLeader = (index: number) => {
    const next = members.map((m, i) => {
      if (i === index) {
        return {
          ...m,
          role: m.role.includes('Trưởng đoàn') ? m.role : `${m.role ? m.role + ' - ' : ''}Trưởng đoàn`,
        };
      } else {
        return {
          ...m,
          role: m.role.replace(/(\s*-\s*)?Trưởng đoàn/gi, '').trim() || 'Thành viên đoàn',
        };
      }
    });
    onChange(next);
  };

  const handleSaveSignature = (memberIndex: number, signatureDataUrl: string) => {
    const next = [...members];
    if (next[memberIndex]) {
      next[memberIndex] = {
        ...next[memberIndex],
        signatureUrl: signatureDataUrl,
      };
      onChange(next);
    }
  };

  const handleRemoveSignature = (memberIndex: number) => {
    const next = [...members];
    if (next[memberIndex]) {
      next[memberIndex] = {
        ...next[memberIndex],
        signatureUrl: undefined,
      };
      onChange(next);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              2. Thành phần đoàn kiểm tra (Mục A)
            </h2>
            <p className="text-xs text-slate-500">
              Tổng số: {members.length} thành viên • Trưởng đoàn sẽ ký riêng ở cột phải
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSignatureModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition"
          >
            <span>✍️ Chèn chữ ký</span>
          </button>

          <button
            id="btn-add-member"
            type="button"
            onClick={handleAddMember}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thành viên</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {members.map((member, idx) => {
          const isLeader = member.role.toLowerCase().includes('trưởng đoàn');
          return (
            <div
              key={idx}
              className={`p-3 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                isLeader 
                  ? 'bg-amber-50/60 border-amber-200' 
                  : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2 min-w-[70px]">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                {isLeader ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    <ShieldCheck className="w-3 h-3 text-amber-800" />
                    Trưởng đoàn
                  </span>
                ) : (
                  <button
                    type="button"
                    title="Gán làm Trưởng đoàn"
                    onClick={() => handleSetLeader(idx)}
                    className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-0.5"
                  >
                    <UserCheck className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Họ và tên */}
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                  placeholder="Họ và tên..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              {/* Chức vụ */}
              <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                  placeholder="Chức vụ / Vị trí đảm nhiệm..."
                  list={`roles-list-${idx}`}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                />
                <datalist id={`roles-list-${idx}`}>
                  {COMMON_ROLES.map((r, i) => (
                    <option key={i} value={r} />
                  ))}
                </datalist>
              </div>

              {/* Signature status / preview */}
              {member.signatureUrl ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
                  <img src={member.signatureUrl} alt="Chữ ký" className="h-6 max-w-[50px] object-contain" />
                  <span className="text-[10px] font-semibold text-emerald-700">Đã ký</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSignature(idx)}
                    className="text-slate-400 hover:text-red-500 text-xs ml-1"
                    title="Xóa chữ ký"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/50 shrink-0"
                  title="Thêm chữ ký cho thành viên này"
                >
                  <PenTool className="w-3 h-3" />
                  <span>Ký</span>
                </button>
              )}

              {/* Action */}
              <button
                type="button"
                onClick={() => handleRemoveMember(idx)}
                title="Xóa thành viên này"
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition self-end sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        members={members}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
};
