export default function PrimaryButton({ children, onClick, disabled = false, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors active:scale-[0.98] ${
        disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}
