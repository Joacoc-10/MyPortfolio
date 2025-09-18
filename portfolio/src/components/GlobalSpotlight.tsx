// components/GlobalSpotlight.tsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const DEFAULT_SPOTLIGHT_RADIUS = 150;
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const MAX_GLOW_INTENSITY = 0.4;


const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.4,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const cards = gridRef.current.querySelectorAll(".card");

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
             const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();

        // CAMBIO CLAVE: CÁLCULO DE LA DISTANCIA AL BORDE DE LA TARJETA
        const closestX = Math.max(cardRect.left, Math.min(e.clientX, cardRect.right));
        const closestY = Math.max(cardRect.top, Math.min(e.clientY, cardRect.bottom));
        const distance = Math.hypot(e.clientX - closestX, e.clientY - closestY);

        minDistance = Math.min(minDistance, distance);


           let glowIntensity = 0;
        // CAMBIO CLAVE: Lógica invertida para glowIntensity
        if (distance <= proximity) {
          // El mouse está muy cerca del borde, intensidad máxima
          glowIntensity = MAX_GLOW_INTENSITY;
        } else if (distance > proximity && distance <= fadeDistance) {
          // El mouse está entre proximity y fadeDistance, desvanece la intensidad
          // Cuanto más cerca de 'proximity', mayor intensidad. Cuanto más cerca de 'fadeDistance', menor.
          glowIntensity = ((fadeDistance - distance) / (fadeDistance - proximity)) * MAX_GLOW_INTENSITY;
        } else {
          // El mouse está demasiado lejos
          glowIntensity = 0;
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.15
          : minDistance <= fadeDistance
          ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.15
          : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll(".card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

export default GlobalSpotlight;
