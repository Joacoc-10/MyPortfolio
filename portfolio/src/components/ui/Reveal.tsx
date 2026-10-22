"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Retardo en ms, útil para escalonar elementos hermanos. */
  delay?: number;
};

/**
 * Aparece con fade y desplazamiento corto al entrar en pantalla (una sola vez).
 * Sin JS o con "reducir movimiento" el contenido queda siempre visible: solo se oculta
 * después de montar y únicamente si el elemento todavía está fuera de la pantalla.
 */
export function Reveal({ delay = 0, className, style, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        state === "hidden" && "translate-y-5 opacity-0",
        state === "shown" &&
          "translate-y-0 opacity-100 transition-[opacity,transform] duration-700 ease-out",
        className,
      )}
      style={state === "shown" ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...props}
    />
  );
}
