import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  CheckCircle2, 
  Info,
  Maximize2,
  X,
  Loader2,
  Layers
} from 'lucide-react';
import heic2any from 'heic2any';
import { ReportImage } from '../types';

interface ImagesManagerProps {
  images: ReportImage[];
  onChange: (images: ReportImage[]) => void;
}

export const ImagesManager: React.FC<ImagesManagerProps> = ({ images, onChange }) => {
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertingMessage, setConvertingMessage] = useState<string>('');

  // Process File with HEIC/HEIF conversion & Canvas resizing
  const processImageFile = async (file: File): Promise<string> => {
    let sourceBlob: Blob = file;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isHeic = ['heic', 'heif'].includes(ext) || ['image/heic', 'image/heif'].includes(file.type);

    if (isHeic) {
      try {
        setIsConverting(true);
        setConvertingMessage(`Đang chuyển đổi định dạng ảnh iPhone (HEIC) ${file.name}...`);
        const conversion = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.88,
        });
        sourceBlob = Array.isArray(conversion) ? conversion[0] : conversion;
      } catch (err) {
        console.error('HEIC conversion failed:', err);
      } finally {
        setIsConverting(false);
        setConvertingMessage('');
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(sourceBlob);
    });
  };

  // Upload for a specific row & side
  const handleSingleUpload = async (file: File, stt: number, side: 'ST' | 'MR') => {
    const dataUrl = await processImageFile(file);
    const sideName = side === 'ST' ? 'NMTĐ Ialy' : 'NMTĐ Ialy MR';
    const defaultCaption = `Hiện trường kiểm tra vị trí ${stt} (${sideName})`;

    const nextImages = [...images];
    const existingIdx = nextImages.findIndex((img) => img.stt === stt && img.side === side);

    if (existingIdx >= 0) {
      nextImages[existingIdx] = {
        ...nextImages[existingIdx],
        dataUrl,
        filename: file.name,
      };
    } else {
      nextImages.push({
        id: `img_${Date.now()}_${stt}_${side}`,
        stt,
        side,
        caption: defaultCaption,
        dataUrl,
        filename: file.name,
      });
    }

    nextImages.sort((a, b) => a.stt - b.stt || (a.side === 'ST' ? -1 : 1));
    onChange(nextImages);
  };

  // Bulk Upload Multiple Files
  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let nextImages = [...images];
    let currentMaxStt = nextImages.length > 0 ? Math.max(...nextImages.map((x) => Number(x.stt))) : 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await processImageFile(file);
      const stt = currentMaxStt + Math.floor(i / 2) + 1;
      const side: 'ST' | 'MR' = i % 2 === 0 ? 'ST' : 'MR';
      const sideName = side === 'ST' ? 'NMTĐ Ialy' : 'NMTĐ Ialy MR';

      nextImages.push({
        id: `img_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        stt,
        side,
        caption: `Hiện trường kiểm tra vị trí ${stt} (${sideName})`,
        dataUrl,
        filename: file.name,
      });
    }

    nextImages.sort((a, b) => a.stt - b.stt || (a.side === 'ST' ? -1 : 1));
    onChange(nextImages);
  };

  const handleUpdateCaption = (stt: number, side: 'ST' | 'MR', caption: string) => {
    const nextImages = [...images];
    const targetIdx = nextImages.findIndex((img) => img.stt === stt && img.side === side);
    if (targetIdx >= 0) {
      nextImages[targetIdx] = { ...nextImages[targetIdx], caption };
      onChange(nextImages);
    } else {
      nextImages.push({
        id: `img_${Date.now()}_${stt}_${side}`,
        stt,
        side,
        caption,
        dataUrl: '',
        filename: '',
      });
      onChange(nextImages);
    }
  };

  const handleAddImageRow = () => {
    const maxStt = images.length > 0 ? Math.max(...images.map((img) => Number(img.stt))) + 1 : 1;
    const newItems: ReportImage[] = [
      ...images,
      {
        id: `img_${Date.now()}_st`,
        stt: maxStt,
        side: 'ST',
        caption: `Hiện trường kiểm tra vị trí ${maxStt} (NMTĐ Ialy)`,
        dataUrl: '',
        filename: '',
      },
      {
        id: `img_${Date.now()}_mr`,
        stt: maxStt,
        side: 'MR',
        caption: `Hiện trường kiểm tra vị trí ${maxStt} (NMTĐ Ialy MR)`,
        dataUrl: '',
        filename: '',
      },
    ];
    onChange(newItems);
  };

  const handleRemoveImageRow = (sttToRemove: number) => {
    // Remove all images with this stt and renumber remaining
    const remaining = images.filter((img) => img.stt !== sttToRemove);
    const uniqueStts = (Array.from(new Set(remaining.map((img) => Number(img.stt)))) as number[]).sort((a: number, b: number) => a - b);
    
    // Remap STT sequentially 1, 2, 3...
    const sttMap: Record<number, number> = {};
    uniqueStts.forEach((oldStt: number, index: number) => {
      sttMap[oldStt] = index + 1;
    });

    const renumbered = remaining.map((img) => ({
      ...img,
      stt: sttMap[img.stt] || img.stt,
    }));

    onChange(renumbered);
  };

  // Get distinct list of row STTs
  const allSttList: number[] = (Array.from(new Set(images.map((x) => Number(x.stt)))) as number[]).sort((a: number, b: number) => a - b);
  if (allSttList.length === 0) {
    allSttList.push(1, 2, 3);
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              5. Phụ lục: Các hình ảnh kiểm tra thực tế
            </h2>
            <p className="text-xs text-slate-500">
              Mỗi dòng gồm NMTĐ Ialy và NMTĐ Ialy MR song song • Hỗ trợ JPG/PNG/HEIC iPhone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick upload all */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Tải hàng loạt ảnh</span>
            <input
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={(e) => handleBulkUpload(e.target.files)}
            />
          </label>

          <button
            type="button"
            onClick={handleAddImageRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm dòng hình ảnh</span>
          </button>
        </div>
      </div>

      {/* Converting notification */}
      {isConverting && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs font-medium text-blue-800 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>{convertingMessage || 'Đang xử lý và chuyển đổi định dạng ảnh...'}</span>
        </div>
      )}

      {/* Rows Container */}
      <div className="space-y-4" id="images">
        {allSttList.map((stt) => {
          const imgST = images.find((x) => x.stt === stt && x.side === 'ST');
          const imgMR = images.find((x) => x.stt === stt && x.side === 'MR');

          return (
            <div
              key={stt}
              data-stt={stt}
              className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl transition hover:border-slate-300"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {stt}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Cặp hình ảnh vị trí số {stt}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveImageRow(stt)}
                  className="text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition flex items-center gap-1"
                  title="Xóa dòng hình ảnh này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa dòng {stt}</span>
                </button>
              </div>

              {/* Side by Side Grid (NMTĐ Ialy & MR) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. NMTĐ Ialy */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      NMTĐ Ialy
                    </span>
                    {imgST?.dataUrl && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã có ảnh
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={imgST?.caption || ''}
                    onChange={(e) => handleUpdateCaption(stt, 'ST', e.target.value)}
                    placeholder="Chú thích hình NMTĐ Ialy..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                  />

                  {imgST?.dataUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imgST.dataUrl}
                        alt="NMTĐ Ialy"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(imgST.dataUrl)}
                          className="px-2.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          Xem to
                        </button>
                        <label className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          Đổi ảnh
                          <input
                            type="file"
                            accept="image/*,.heic,.heif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSingleUpload(f, stt, 'ST');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Chưa chọn hình
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Bấm để chọn file (JPG, PNG, HEIC)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleSingleUpload(f, stt, 'ST');
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* 2. NMTĐ Ialy Mở Rộng */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      NMTĐ Ialy Mở Rộng
                    </span>
                    {imgMR?.dataUrl && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã có ảnh
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={imgMR?.caption || ''}
                    onChange={(e) => handleUpdateCaption(stt, 'MR', e.target.value)}
                    placeholder="Chú thích hình NMTĐ Ialy Mở Rộng..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                  />

                  {imgMR?.dataUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imgMR.dataUrl}
                        alt="NMTĐ Ialy MR"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(imgMR.dataUrl)}
                          className="px-2.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-medium shadow-xs flex items-center gap-1"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          Xem to
                        </button>
                        <label className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium shadow-xs flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          Đổi ảnh
                          <input
                            type="file"
                            accept="image/*,.heic,.heif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSingleUpload(f, stt, 'MR');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Chưa chọn hình
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Bấm để chọn file (JPG, PNG, HEIC)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleSingleUpload(f, stt, 'MR');
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">Xem ảnh chi tiết</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-900">
              <img
                src={previewModalUrl}
                alt="Preview"
                className="max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
