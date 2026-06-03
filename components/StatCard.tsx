import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="contrast-surface rounded-2xl border border-white/70 bg-white p-4 shadow-soft">
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-1 block text-2xl text-ink">{value}</strong>
    </div>
  );
}
