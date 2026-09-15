import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Check, 
  Copy, 
  Terminal, 
  Github, 
  Zap, 
  FileCode, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const vercelJsonContent = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Hướng dẫn chạy & Deploy ứng dụng trên Vercel
              </h3>
              <p className="text-xs text-slate-300">
                Toàn bộ cấu hình đã được tối ưu hóa 100% cho Vercel Edge & Static Hosting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 text-sm">
          
          {/* Highlight advantages */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">
                Tại sao bản Web React này chạy hoàn hảo trên Vercel?
              </p>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Ứng dụng sử dụng bộ tạo tài liệu <strong>Word (.docx) trực tiếp trên Client & Vercel Edge</strong> bằng thư viện <code>docx</code> chuẩn quốc tế, không phụ thuộc vào máy chủ Python hay MS Word. Nhờ đó, ứng dụng chạy <strong>miễn phí 100%, không bị giới hạn thời gian chạy (Cold-start 0s), tải nhanh tức thì trên toàn cầu</strong>.
              </p>
            </div>
          </div>

          {/* Cách 1: Deploy qua Vercel CLI (Nhanh nhất - 1 phút) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>Cách 1: Triển khai trực tiếp bằng Vercel CLI</span>
            </div>

            <p className="text-xs text-slate-600">
              Mở Terminal (Command Prompt / PowerShell / Bash) trong thư mục dự án và chạy 2 lệnh sau:
            </p>

            <div className="space-y-2">
              <div className="relative bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <span>npm install -g vercel</span>
                <button
                  onClick={() => handleCopy("npm install -g vercel", "cli1")}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] flex items-center gap-1 text-slate-200"
                >
                  {copiedKey === 'cli1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli1' ? 'Đã sao chép' : 'Copy'}</span>
                </button>
              </div>

              <div className="relative bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                <span>vercel --prod</span>
                <button
                  onClick={() => handleCopy("vercel --prod", "cli2")}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] flex items-center gap-1 text-slate-200"
                >
                  {copiedKey === 'cli2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli2' ? 'Đã sao chép' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cách 2: Deploy qua GitHub */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Github className="w-5 h-5 text-slate-800" />
              <span>Cách 2: Triển khai tự động qua GitHub & Vercel Dashboard</span>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 pl-1">
              <li>Đẩy toàn bộ mã nguồn lên GitHub (hoặc GitLab / Bitbucket).</li>
              <li>Truy cập <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-3 h-3" /></a></li>
              <li>Chọn Import repository vừa tạo.</li>
              <li>
                Ở mục <strong>Build and Output Settings</strong>, giữ nguyên mặc định:
                <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-600">
                  <li>Framework Preset: <code>Vite</code></li>
                  <li>Build Command: <code>npm run build</code></li>
                  <li>Output Directory: <code>dist</code></li>
                </ul>
              </li>
              <li>Nhấn <strong>Deploy</strong>. Vercel sẽ tự động cấp phát domain HTTPS miễn phí (VD: <code>https://atvsld-ialy.vercel.app</code>).</li>
            </ol>
          </div>

          {/* File vercel.json */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Nội dung file vercel.json (Đã tạo sẵn ở thư mục gốc)</span>
              </div>
              <button
                onClick={() => handleCopy(vercelJsonContent, "vercel_json")}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                {copiedKey === 'vercel_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vercel_json' ? 'Đã sao chép' : 'Sao chép file'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              {vercelJsonContent}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hỗ trợ tùy chỉnh tên miền riêng hoàn toàn miễn phí trên Vercel</span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition"
          >
            Đã hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
