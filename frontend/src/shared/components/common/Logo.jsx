import logoIcon from '@/assets/logo.svg';

/**
 * Brand lockup. `iconOnly` shows just the mark (used on auth screens);
 * default shows "RosaCycle" text + mark together (used in the app header).
 */
const SIZES = {
  sm: { icon: 26, text: 'text-lg' },
  md: { icon: 34, text: 'text-2xl' },
  lg: { icon: 64, text: 'text-4xl' },
};

export default function Logo({ size = 'md', iconOnly = false, className = '' }) {
  const { icon, text } = SIZES[size] || SIZES.md;

  if (iconOnly) {
    return <img src={logoIcon} alt="RosaCycle" width={icon} height={icon} className={className} />;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`font-extrabold tracking-tight ${text}`} style={{ color: '#245f28' }}>
        RosaCycle
      </span>
      <img src={logoIcon} alt="" width={icon} height={icon} className="shrink-0" />
    </div>
  );
}
