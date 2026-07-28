const STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-brand-100 text-brand-700',
  declined: 'bg-red-100 text-red-700',
};

export default function StatusPill({ status }) {
  const key = (status || '').toLowerCase();
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STYLES[key] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
