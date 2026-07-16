import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  sub
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: string;
  sub?: string;
}) {
  return (
    <div className="contrast-surface rounded-2xl border border-white/70 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ring-1 ring-black/5 ${tone}`}>
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <strong className="mt-1 block text-2xl text-ink">{value}</strong>
      {sub ? <span className="mt-0.5 block text-xs text-slate-400">{sub}</span> : null}
    </div>
  );
}
