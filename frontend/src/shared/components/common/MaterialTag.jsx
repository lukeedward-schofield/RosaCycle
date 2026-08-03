const COLORS = {
  wood: 'bg-amber-100 text-amber-800',
  metal: 'bg-slate-200 text-slate-700',
  plastic: 'bg-blue-100 text-blue-700',
  fabric: 'bg-pink-100 text-pink-700',
  paper: 'bg-yellow-100 text-yellow-800',
  'e-waste': 'bg-indigo-100 text-indigo-700',
  mixed: 'bg-brand-100 text-brand-700',
  organic: 'bg-brand-100 text-brand-700',
};

export default function MaterialTag({ material, className = '' }) {
  const key = (material || '').toLowerCase();
  const style = COLORS[key] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${style} ${className}`}>
      {material}
    </span>
  );
}
