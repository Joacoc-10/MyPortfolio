"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// El shader (y la librería ogl) se descargan solo cuando se van a usar.
const DarkVeil = dynamic(() => import("./DarkVeil"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type SaveDataConnection = { connection?: { saveData?: boolean } };

/**
 * Fondo del hero. Siempre pinta un fallback estático en CSS (con JS desactivado, sin WebGL,
 * con "reducir movimiento" o ahorro de datos). El shader se activa en idle, después del primer paint.
 */
export function HeroBackground() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & SaveDataConnection).connection
      ?.saveData;

    if (reducedMotion.matches || saveData || !supportsWebGL()) return;

    const enable = () => {
      if (!reducedMotion.matches) setAnimated(true);
    };
    // Safari no implementa requestIdleCallback.
    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const handle = hasIdleCallback
      ? window.requestIdleCallback(enable, { timeout: 1500 })
      : window.setTimeout(enable, 400);

    // Si la persona activa "reducir movimiento" mientras navega, volvemos al fallback.
    const onChange = () => {
      if (reducedMotion.matches) setAnimated(false);
    };
    reducedMotion.addEventListener("change", onChange);

    return () => {
      if (hasIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      reducedMotion.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="hero-fallback absolute inset-0" />
      {animated && (
        <div className="absolute inset-0 opacity-70">
          <DarkVeil hueShift={48} resolutionScale={0.5} maxFps={30} />
        </div>
      )}
      {/* Velo para asegurar contraste del texto y fundido hacia el resto de la página */}
      <div className="absolute inset-0 bg-linear-to-b from-canvas/30 via-canvas/55 to-canvas" />
      <div className="bg-grid absolute inset-0" />
    </div>
  );
}
