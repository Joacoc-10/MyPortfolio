import { cn } from "@/lib/utils";

type ChipProps = React.ComponentPropsWithoutRef<"span"> & {
  /** "signal": estado laboral ("Actual"). "live": proyecto en producción. */
  tone?: "neutral" | "brand" | "signal" | "live";
};

const tones = {
  neutral: "border-line bg-surface text-ink-muted",
  brand: "border-brand/30 bg-brand/10 text-brand",
  signal: "border-signal/30 bg-signal/10 text-signal",
  live: "border-live/30 bg-live/10 text-live",
};

export function Chip({ tone = "neutral", className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
