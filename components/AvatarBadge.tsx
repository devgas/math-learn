import { Bot, Hammer, Rocket, Shield, Sparkles, WandSparkles } from "lucide-react";

const iconMap = {
  rocket: Rocket,
  robot: Bot,
  wizard: WandSparkles,
  ninja: Shield,
  builder: Hammer,
  astronaut: Sparkles
};

export function AvatarBadge({ avatar, size = "md" }: { avatar: string; size?: "sm" | "md" | "lg" }) {
  const Icon = iconMap[avatar as keyof typeof iconMap] ?? Rocket;
  const box = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  return (
    <div className={`${box} grid place-items-center rounded-2xl bg-white text-aqua shadow-soft ring-2 ring-white`}>
      <Icon aria-hidden className={size === "lg" ? "h-9 w-9" : "h-6 w-6"} />
    </div>
  );
}
