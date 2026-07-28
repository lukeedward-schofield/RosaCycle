import { ArrowLeft, Bell } from 'lucide-react';
import Logo from '../common/Logo';
import UserMenu from './UserMenu';

/**
 * Shared header used across all screens.
 * - Default: shows "RosaCycle" logo + notification bell + user avatar (rightmost)
 * - With `onBack`: shows a back arrow + optional title instead of the logo
 */
export default function Header({ onBack, title, showBell = true }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-1 -ml-1 text-gray-700 active:scale-95 transition-transform"
          >
            <ArrowLeft size={22} />
          </button>
        ) : null}
        {title ? <span className="font-semibold text-gray-900">{title}</span> : <Logo size="sm" />}
      </div>

      <div className="flex items-center gap-3">
        {showBell && (
          <button aria-label="Notifications" className="p-1 text-gray-700 active:scale-95 transition-transform">
            <Bell size={22} />
          </button>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
