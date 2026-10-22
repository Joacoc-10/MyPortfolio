"use client";

import { cn } from "@/lib/utils";

/**
 * Tarjeta con spotlight que sigue al puntero (solo CSS + dos variables).
 * Los hijos pueden ser Server Components.
 */
export function Card({
  className,
  onPointerMove,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
        onPointerMove?.(event);
      }}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-line-strong",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:opacity-0 before:transition-opacity before:duration-300 before:content-['']",
        "before:bg-[radial-gradient(360px_circle_at_var(--mx,50%)_var(--my,50%),rgb(45_212_191/0.09),transparent_65%)] hover:before:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
