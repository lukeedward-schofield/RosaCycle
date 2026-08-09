import { Recycle, Camera, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * FINAL structure per team decision (confirmed by Luke/Franz/Albert):
 * 3 tabs — Trades (Browse + My Trades as internal sub-tabs), Camera, Map.
 * Dashboard was dropped. "Rate Trader" remains a one-off screen reached only
 * after a completed trade — intentionally NOT in this bottom nav.
 */
const TABS = [
  { key: 'trades', label: 'Trades', icon: Recycle, path: '/trades' },
  { key: 'camera', label: 'Camera', icon: Camera, path: '/camera' },
  { key: 'map', label: 'Map', icon: MapPin, path: '/map' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 flex items-stretch z-30">
      {TABS.map(({ key, label, icon: Icon, path }) => {
        const isActive = location.pathname.startsWith(path);
        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            <span
              className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
            </span>
            <span className={`text-[11px] ${isActive ? 'text-brand-600 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
