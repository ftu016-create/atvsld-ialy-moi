import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, X, CheckCircle2, Loader2 } from 'lucide-react';
import { getSharedAdminPin, setSharedAdminPin, subscribeToSharedAdminPin, DEFAULT_ADMIN_PIN } from '../lib/firebase';
import { SecureSecretInput } from './SecureSecretInput';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export { DEFAULT_ADMIN_PIN };

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPin, setCurrentPin] = useState<string>(DEFAULT_ADMIN_PIN);

  useEffect(() => {
    if (!isOpen) return;

    setPin('');
    setError('');
    setSuccessMsg('');
    setIsChangingPin(false);
    setOldPin('');
    setNewPin('');
    setConfirmNewPin('');

    getSharedAdminPin().then((p) => {
      if (p) setCurrentPin(p);
    });

    const unsubscribe = subscribeToSharedAdminPin((newRemotePin) => {
      if (newRemotePin) setCurrentPin(newRemotePin);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (!pin.trim()) {
      setError('Vui lòng nhập mã PIN Admin.');
      return;
    }
    setIsLoading(true);

    try {
      const latestPin = await getSharedAdminPin();
      const activePin = latestPin || currentPin;

      if (pin.trim() === activePin.trim()) {
        setError('');
        setSuccessMsg('Xác thực Admin thành công!');
        setTimeout(() => {
          setSuccessMsg('');
          setPin('');
          setIsLoading(false);
          onSuccess();
        }, 400);
      } else {
        setIsLoading(false);
        setError('Mã PIN không chính xác. Vui lòng kiểm tra lại.');
      }
    } catch {
      setIsLoading(false);
      if (pin.trim() === currentPin.trim()) {
        setError('');
        setSuccessMsg('Xác thực Admin thành công!');
        setTimeout(() => {
          setSuccessMsg('');
          setPin('');
          onSuccess();
        }, 400);
      } else {
        setError('Mã PIN không chính xác. Vui lòng kiểm tra lại.');
      }
    }
  };

  const handleChangePinSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    setError('');

    if (!oldPin) {
      setError('Vui lòng nhập mã PIN cũ hiện tại.');
      return;
    }

    const latestPin = await getSharedAdminPin();
    const activePin = latestPin || currentPin;

    if (oldPin.trim() !== activePin.trim()) {
      setError('Mã PIN cũ không chính xác. Bạn không có quyền đổi mã PIN.');
      return;
    }
    if (newPin.trim().length < 4) {
      setError('Mã PIN mới phải từ 4 ký tự trở lên.');
      return;
    }
    if (newPin.trim() === oldPin.trim()) {
      setError('Mã PIN mới không được trùng với mã PIN cũ.');
      return;
    }
    if (newPin.trim() !== confirmNewPin.trim()) {
      setError('Xác nhận mã PIN mới không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await setSharedAdminPin(newPin.trim());
      setCurrentPin(newPin.trim());
      setSuccessMsg('Đã đổi mã PIN Admin thành công và đồng bộ cho tất cả các máy!');
      setIsChangingPin(false);
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể đồng bộ mã PIN mới lên cơ sở dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Xác thực Quản trị viên</h3>
              <p className="text-xs text-blue-200">Phân quyền soạn thảo biên bản ATVSLĐ</p>
            </div>
          </div>

          <button
            onClick={() => {
              setError('');
              setSuccessMsg('');
              setIsChangingPin(false);
              onClose();
            }}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isChangingPin ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Quy định quyền truy cập:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  <li><strong>Đồng nghiệp:</strong> Chỉ có quyền xem và tải biên bản các tháng.</li>
                  <li><strong>Quản trị viên (Admin):</strong> Được phép tạo mới, chỉnh sửa dữ liệu, xóa và lưu trữ.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Nhập mã PIN Admin:
                  </span>
                </label>
                <SecureSecretInput
                  id="secure-admin-pin"
                  value={pin}
                  onChange={(val) => {
                    setPin(val);
                    if (error) setError('');
                  }}
                  onEnter={() => handleLogin()}
                  placeholder="Nhấp vào đây và gõ mã PIN..."
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setOldPin('');
                    setNewPin('');
                    setConfirmNewPin('');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer"
                >
                  Đổi mã PIN mới?
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    id="btn-confirm-admin-login"
                    type="button"
                    onClick={() => handleLogin()}
                    disabled={isLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Mở khóa soạn thảo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 mb-2">
                Để đổi mã PIN, vui lòng xác nhận mã PIN hiện tại trước:
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã PIN cũ (hiện tại):</label>
                <SecureSecretInput
                  id="secure-old-pin"
                  value={oldPin}
                  onChange={(val) => {
                    setOldPin(val);
                    if (error) setError('');
                  }}
                  placeholder="Nhập mã PIN cũ..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã PIN mới:</label>
                <SecureSecretInput
                  id="secure-new-pin"
                  value={newPin}
                  onChange={(val) => {
                    setNewPin(val);
                    if (error) setError('');
                  }}
                  placeholder="Nhập mã PIN mới (từ 4 ký tự)..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập lại mã PIN mới:</label>
                <SecureSecretInput
                  id="secure-confirm-pin"
                  value={confirmNewPin}
                  onChange={(val) => {
                    setConfirmNewPin(val);
                    if (error) setError('');
                  }}
                  onEnter={() => handleChangePinSubmit()}
                  placeholder="Nhập lại mã PIN mới..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setOldPin('');
                    setNewPin('');
                    setConfirmNewPin('');
                    setError('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => handleChangePinSubmit()}
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Xác nhận đổi PIN</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
