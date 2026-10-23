import { cn } from "@/lib/utils";
import type { Technology } from "@/data";
import { getTechIcon } from "./tech-icons";

type TechChipProps = {
  tech: Technology;
  size?: "sm" | "md";
  className?: string;
};

export function TechChip({ tech, size = "sm", className }: TechChipProps) {
  const Icon = getTechIcon(tech.id);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-line bg-canvas/40 text-ink-muted",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        className,
      )}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" />}
      {tech.name}
    </span>
  );
}
