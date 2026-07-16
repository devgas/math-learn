import { Bot, Hammer, Rocket, Shield, Sparkles, WandSparkles } from "lucide-react";

const iconMap = {
  rocket: Rocket,
  robot: Bot,
  wizard: WandSparkles,
  ninja: Shield,
  builder: Hammer,
  astronaut: Sparkles
};

const colorMap: Record<string, string> = {
  rocket: "bg-gradient-to-br from-aqua to-sky text-white",
  robot: "bg-gradient-to-br from-leaf to-sky text-white",
  wizard: "bg-gradient-to-br from-sky to-aqua text-white",
  ninja: "bg-gradient-to-br from-ink to-slate-700 text-white",
  builder: "bg-gradient-to-br from-mango to-coral text-ink",
  astronaut: "bg-gradient-to-br from-coral to-mango text-white"
};

export function AvatarBadge({ avatar, size = "md" }: { avatar: string; size?: "sm" | "md" | "lg" }) {
  const Icon = iconMap[avatar as keyof typeof iconMap] ?? Rocket;
  const bg = colorMap[avatar as keyof typeof colorMap] ?? "bg-gradient-to-br from-aqua to-sky text-white";
  const box = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  return (
    <div className={`${box} grid place-items-center rounded-2xl ${bg} shadow-soft ring-2 ring-white/70 transition-transform hover:scale-105`}>
      <Icon aria-hidden className={size === "lg" ? "h-9 w-9" : "h-6 w-6"} />
    </div>
  );
}
