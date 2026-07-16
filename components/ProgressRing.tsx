export function ProgressRing({
  value,
  label,
  size = 112,
  color = "#13b6b0",
  trackColor = "#e6f3f5",
  strokeWidth = 12
}: {
  value: number;
  label?: string;
  size?: number;
  color?: string;
  trackColor?: string;
  strokeWidth?: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  const r = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <div
      className="relative grid place-items-center rounded-full bg-white shadow-soft"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute -rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(safeValue / 100) * circumference} ${circumference}`}
        />
      </svg>
      <div className="text-center">
        <strong className="block text-xl">{safeValue}%</strong>
        {label ? <span className="text-xs text-slate-500">{label}</span> : null}
      </div>
    </div>
  );
}
