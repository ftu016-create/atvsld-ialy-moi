import React from 'react';
import { Lightbulb, Plus, Trash2, Sparkles } from 'lucide-react';

interface RecommendationsEditorProps {
  recommendations: string[];
  onChange: (recommendations: string[]) => void;
}

const SAMPLE_RECOMMENDATIONS = [
  "Đề nghị các cá nhân khi thực hiện cấp Lệnh công tác, người cho phép, người chỉ huy trực tiếp và thành viên Đội công tác tăng cường kiểm tra, thực hiện đầy đủ các nội dung trong Lệnh công tác trước khi ký cho phép vào làm việc, trong quá trình thực hiện và khi kết thúc công việc.",
  "Các Trưởng ca tăng cường công tác tự kiểm tra đầu ca, trong ca và cuối ca; kịp thời phát hiện, xử lý hoặc báo cáo các nguy cơ mất an toàn, các bất thường của thiết bị và điều kiện làm việc.",
  "Nhân viên vận hành khi thực hiện công việc phải chủ động nhận diện mối nguy, đánh giá rủi ro; trường hợp điều kiện an toàn không bảo đảm phải báo cáo cấp có thẩm quyền để xử lý trước khi tiếp tục công việc.",
  "Người làm công tác an toàn Phân xưởng phối hợp với các Trưởng ca tiếp tục rà soát hồ sơ, biểu mẫu và minh chứng liên quan đến công tác ATVSLĐ; bảo đảm hồ sơ đầy đủ, thống nhất, đúng quy định.",
  "Tiếp tục phổ biến, rút kinh nghiệm các vụ tai nạn lao động, sự cố và vụ cận nguy; nâng cao ý thức chấp hành quy trình, quy định và Văn hóa an toàn của toàn thể nhân viên vận hành./.",
];

export const RecommendationsEditor: React.FC<RecommendationsEditorProps> = ({
  recommendations,
  onChange,
}) => {
  const handleItemChange = (index: number, value: string) => {
    const next = [...recommendations];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...recommendations, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(recommendations.filter((_, i) => i !== index));
  };

  const handleAddSample = (sample: string) => {
    if (!recommendations.includes(sample)) {
      onChange([...recommendations, sample]);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              4. Kết luận & Kiến nghị chung (Mục D)
            </h2>
            <p className="text-xs text-slate-500">
              Các chỉ đạo, yêu cầu đối với các cá nhân và đơn vị trực thuộc
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kiến nghị</span>
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
              {idx + 1}
            </span>
            <textarea
              rows={2}
              value={rec}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              placeholder="Nhập nội dung kết luận / kiến nghị..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              title="Xóa kiến nghị này"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Suggested Samples */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Gợi ý nội dung kiến nghị mẫu ATVSLĐ:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_RECOMMENDATIONS.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddSample(sample)}
              className="text-[11px] text-left px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200/60 transition truncate max-w-full sm:max-w-md"
            >
              + {sample.slice(0, 70)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
