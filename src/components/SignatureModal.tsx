import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, Check, Upload, PenTool, Image as ImageIcon } from 'lucide-react';
import { Member } from '../types';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveSignature: (memberIndex: number, signatureDataUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveSignature,
}) => {
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(0);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#1e3a8a'); // Professional blue ink
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      clearCanvas();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(selectedMemberIndex, dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onSaveSignature(selectedMemberIndex, dataUrl);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              ✍️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chèn chữ ký điện tử</h3>
              <p className="text-xs text-slate-500">Ký trực tiếp hoặc tải ảnh chữ ký có sẵn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chọn người ký trong danh sách thành viên:
            </label>
            <select
              value={selectedMemberIndex}
              onChange={(e) => setSelectedMemberIndex(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
            >
              {members.map((m, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {m.name || `Thành viên ${idx + 1}`} ({m.role || 'Thành viên'})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'draw' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Vẽ ký trực tiếp</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file ảnh chữ ký</span>
            </button>
          </div>

          {mode === 'draw' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Màu mực:</span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#1e3a8a', label: 'Xanh mực công văn' },
                    { color: '#000000', label: 'Mực đen' },
                    { color: '#dc2626', label: 'Mực đỏ' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setPenColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        penColor === item.color ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-transparent opacity-80'
                      }`}
                      title={item.label}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Xóa nét</span>
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-2 overflow-hidden flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white rounded-lg shadow-inner cursor-crosshair touch-none w-full max-w-[420px] h-[160px]"
                />
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Dùng chuột hoặc ngón tay (màn hình cảm ứng) để ký vào ô trên
              </p>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Tải ảnh chữ ký (PNG, JPG, HEIC)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Khuyên dùng ảnh nền trong suốt (PNG)</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh chữ ký</span>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
          >
            Đóng
          </button>
          {mode === 'draw' && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận & Chèn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
