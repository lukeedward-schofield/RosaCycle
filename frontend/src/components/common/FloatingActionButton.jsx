import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed z-30 bottom-24 w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-brand-700"
      style={{ right: 'max(1.25rem, calc(50% - 240px + 1.25rem))' }}
    >
      <Plus size={26} />
    </button>
  );
}
