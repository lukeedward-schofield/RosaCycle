import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search materials' }) {
  return (
    <div className="flex items-center gap-2 bg-gray-200/70 rounded-xl px-4 py-3">
      <Search size={18} className="text-gray-500 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
      />
    </div>
  );
}
