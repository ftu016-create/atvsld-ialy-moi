import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SecureSecretInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Component SecureSecretInput hoàn toàn không dùng <input type="password"> hay thẻ input thông thường
 * để các trình duyệt (Chrome, Edge, Safari...) và Password Manager tuyệt đối KHÔNG nhận diện được
 * và KHÔNG BAO GIỜ hiện popup gợi ý mật khẩu / fill mật khẩu đã lưu.
 */
export const SecureSecretInput: React.FC<SecureSecretInputProps> = ({
  id = 'secure-key-box',
  value,
  onChange,
  onEnter,
  placeholder = 'Nhập mã...',
  autoFocus = false,
  className = '',
}) => {
  const [showText, setShowText] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoFocus && boxRef.current) {
      boxRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (onEnter) onEnter();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      onChange('');
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab' || e.key.startsWith('Arrow')) {
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      onChange(value + e.key);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text') || '';
    if (pasted) {
      onChange(value + pasted.trim());
    }
  };

  const displayText = showText ? value : '•'.repeat(value.length);

  return (
    <div className="relative flex items-center w-full">
      <div
        ref={boxRef}
        id={id}
        tabIndex={0}
        role="textbox"
        aria-label="Nhập mã bí mật"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-hidden font-mono tracking-wider transition cursor-text select-none flex items-center pr-10 min-h-[42px] ${
          isFocused ? 'bg-white ring-2 ring-blue-500/20 border-blue-500 shadow-xs' : 'border-slate-300'
        } ${className}`}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 font-sans tracking-normal select-none pointer-events-none text-xs">
            {placeholder}
          </span>
        ) : (
          <span className="text-slate-900 font-bold text-base tracking-widest">{displayText}</span>
        )}
        {isFocused && (
          <span className="inline-block w-0.5 h-4 bg-blue-600 animate-pulse ml-0.5" />
        )}
      </div>

      {value.length > 0 && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowText(!showText)}
          title={showText ? 'Ẩn mã' : 'Hiện mã'}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition rounded-lg hover:bg-slate-100"
        >
          {showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
