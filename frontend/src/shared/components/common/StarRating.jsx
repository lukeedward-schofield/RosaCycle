import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          aria-label={`${n} star`}
          className="active:scale-90 transition-transform"
        >
          <Star
            size={36}
            className={n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
