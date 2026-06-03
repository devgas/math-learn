export function ProgressRing({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white shadow-soft">
      <svg viewBox="0 0 120 120" className="absolute h-28 w-28 -rotate-90">
        <circle cx="60" cy="60" r="48" stroke="#e6f3f5" strokeWidth="12" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="#13b6b0"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${safeValue * 3.02} 302`}
        />
      </svg>
      <div className="text-center">
        <strong className="block text-xl">{safeValue}%</strong>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  );
}
