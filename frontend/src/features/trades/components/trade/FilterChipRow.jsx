export default function FilterChipRow({
  options = ['All Items', 'Wood', 'Metal', 'Plastic', 'Fabric', 'Paper', 'E-waste', 'Mixed'],
  active,
  onSelect,
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 -mx-4 pb-1">
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <button
            key={opt}
            onClick={() => onSelect?.(opt)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
