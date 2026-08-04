import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/signin', { replace: true });
  };

  const handleEditProfile = () => {
    setOpen(false);
    navigate('/profile/edit');
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username;
  const initial = user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User profile"
        aria-expanded={open}
        className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold flex items-center justify-center active:scale-95 transition-transform"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-30">
          <button
            onClick={handleEditProfile}
            className="w-full text-left px-4 py-2 border-b border-gray-100 hover:bg-gray-50"
          >
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName || 'RosaCycle User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-gray-50"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
