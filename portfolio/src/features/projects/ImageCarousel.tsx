"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CarouselImage = {
  src: string;
  alt: string;
};

type ImageCarouselProps = {
  images: CarouselImage[];
  /** Atributo `sizes` de next/image. */
  sizes: string;
  /** Tiempo entre capturas. */
  intervalMs?: number;
  /** Retraso extra solo antes del primer cambio, para que las tarjetas no cambien al unísono. */
  offsetMs?: number;
  className?: string;
};

const FADE_MS = 450;

/**
 * Carrusel automático con fade, sin controles. Ocupa todo su contenedor (el padre define la proporción).
 *
 * - Solo rota mientras es visible (IntersectionObserver), la pestaña está activa, el cursor no está sobre la
 *   imagen, no hay foco dentro de la tarjeta y el usuario no pidió reducir el movimiento.
 * - Las capturas se montan de a una: la primera al renderizar y cada siguiente justo antes de mostrarse,
 *   así no se descargan todas a la vez.
 * - Con una sola imagen (o con reduced-motion) queda estática.
 */
export function ImageCarousel({
  images,
  sizes,
  intervalMs = 4000,
  offsetMs = 0,
  className,
}: ImageCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstCycle = useRef(true);
  const [active, setActive] = useState(0);
  // Índices ya montados (la primera siempre). Crece de a uno al acercarse el cambio.
  const [mounted, setMounted] = useState<number[]>([0]);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduced, setReduced] = useState(true); // conservador hasta conocer la preferencia

  const count = images.length;
  const canRotate = count > 1;
  const playing = canRotate && visible && !hovered && !focused && !tabHidden && !reduced;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canRotate) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [canRotate]);

  // El foco en cualquier control de la tarjeta (botones «Visitar sitio» / «Código») también pausa.
  useEffect(() => {
    const scope = rootRef.current?.closest<HTMLElement>("[data-carousel-scope]");
    if (!scope || !canRotate) return;
    const onIn = () => setFocused(true);
    const onOut = (event: FocusEvent) => {
      if (!scope.contains(event.relatedTarget as Node | null)) setFocused(false);
    };
    scope.addEventListener("focusin", onIn);
    scope.addEventListener("focusout", onOut);
    return () => {
      scope.removeEventListener("focusin", onIn);
      scope.removeEventListener("focusout", onOut);
    };
  }, [canRotate]);

  useEffect(() => {
    if (!playing) return;
    const next = (active + 1) % count;
    const delay = intervalMs + (firstCycle.current ? offsetMs : 0);
    // Monta la siguiente captura con margen para que ya esté descargada al hacer el fade.
    const preload = setTimeout(
      () => setMounted((m) => (m.includes(next) ? m : [...m, next])),
      Math.max(0, delay - 2000),
    );
    const advance = setTimeout(() => {
      firstCycle.current = false;
      setActive(next);
    }, delay);
    return () => {
      clearTimeout(preload);
      clearTimeout(advance);
    };
  }, [playing, active, count, intervalMs, offsetMs]);

  return (
    <div
      ref={rootRef}
      className={cn("absolute inset-0", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {images.map((image, index) => {
        if (!mounted.includes(index)) return null;
        const isActive = index === active;
        return (
          <Image
            key={image.src}
            src={image.src}
            alt={isActive ? image.alt : ""}
            aria-hidden={isActive ? undefined : true}
            fill
            sizes={sizes}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            className={cn(
              "object-cover object-top transition-opacity ease-in-out motion-reduce:transition-none",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
    </div>
  );
}
