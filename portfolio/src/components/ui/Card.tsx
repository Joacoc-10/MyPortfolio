"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "./Sparkles";

type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  /** "featured": borde esmeralda siempre visible, para el proyecto destacado. */
  glow?: "default" | "featured";
  /** Puntos luminosos decorativos. */
  sparkles?: "hover" | "always";
};

/**
 * Tarjeta con spotlight y borde brillante que siguen al puntero (CSS + dos variables, sin librerías).
 * Los estilos están en `.card-glow` de globals.css. Los hijos pueden ser Server Components.
 */
export function Card({
  glow = "default",
  sparkles,
  className,
  onPointerMove,
  children,
  ...props
}: CardProps) {
  return (
    <div
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
        onPointerMove?.(event);
      }}
      className={cn(
        "card-glow group/card relative overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-line-strong",
        glow === "featured" && "card-glow--featured",
        className,
      )}
      {...props}
    >
      {sparkles && <Sparkles mode={sparkles} />}
      {children}
    </div>
  );
}
