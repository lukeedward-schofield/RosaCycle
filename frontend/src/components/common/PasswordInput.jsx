import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Password field with a show/hide toggle. Hidden by default (closed eye).
 */
export default function PasswordInput({ value, onChange, placeholder, className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pr-11 px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 active:scale-90 transition-transform"
      >
        {visible ? <Eye size={19} /> : <EyeOff size={19} />}
      </button>
    </div>
  );
}
