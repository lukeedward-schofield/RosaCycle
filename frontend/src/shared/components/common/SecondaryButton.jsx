export default function SecondaryButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}
