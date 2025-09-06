// components/EffectsWrapper.tsx
"use client";
import React, { useRef } from "react";
import GlobalSpotlight from "./GlobalSpotlight";
import ParticleCard from "./ParticleCard";

interface EffectsWrapperProps {
  children: React.ReactNode;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  glowColor?: string;
  particleCount?: number;
}

const EffectsWrapper: React.FC<EffectsWrapperProps> = ({
  children,
  enableStars = true,
  enableSpotlight = true,
  glowColor = "132, 0, 255",
  particleCount = 12,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {enableSpotlight && (
        <GlobalSpotlight gridRef={gridRef} glowColor={glowColor} />
      )}
      <div ref={gridRef} className="relative">
        {enableStars ? (
          <ParticleCard
            glowColor={glowColor}
            particleCount={particleCount}
            enableTilt= {false}
            enableMagnetism = {false}
            clickEffect
          >
            {children}
          </ParticleCard>
        ) : (
          <div className="relative">{children}</div>
        )}
      </div>
    </div>
  );
};

export default EffectsWrapper;
