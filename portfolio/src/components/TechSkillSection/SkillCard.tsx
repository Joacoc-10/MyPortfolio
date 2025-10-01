"use client";
import { ISkill } from "@/types/TechSkills";
import React, { useRef, useEffect, useState } from "react";
import {
  FaCode,
  FaGitAlt,
  FaJs,
  FaPalette,
  FaDatabase,
  FaCloud,
} from "react-icons/fa";

interface SkillCardProps extends ISkill {
  position: "left" | "right" | "center";
}

const iconComponents = {
  code: FaCode,
  git: FaGitAlt,
  javascript: FaJs,
  style: FaPalette,
  database: FaDatabase,
  cloud: FaCloud,
};

const SkillCard = ({
  subTitle,
  description,
  icon,
  position,
}: SkillCardProps) => {
  // NOTE: el ref ahora apunta al WRAPPER exterior (para el observer)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) {
            observer.unobserve(cardRef.current);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // estilos del interior de la tarjeta
  const cardInnerClasses = `
    w-full max-w-2xl bg-black/20 border border-purple-500/30 rounded-xl
    p-6 md:p-8 flex flex-col space-y-4
    transition-all duration-1000 ease-out transform
    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
  `;

  // NOTA: el wrapper exterior controla la posición y overflow-visible
  const wrapperClasses = `relative overflow-visible`;

  const contentClasses = `
    relative z-20
    ${position === "left" ? "md:pl-20" : ""}
    ${position === "right" ? "md:pr-20" : ""}
    ${position === "center" ? "pt-16 md:pt-12" : ""}
  `;

  // Posición del icono (ahora fuera de la tarjeta, como sibling)
  const iconPositionClasses = `
    absolute w-24 h-24 rounded-full border border-esmeraldButton-400 flex items-center justify-center bg-black/20
    pointer-events-none
    ${position === "center" ? "-top-12 left-1/2 -translate-x-1/2" : ""}
    ${
      position === "left"
        ? "-left-6 top-1/2 -translate-y-1/2 md:block hidden"
        : ""
    }
    ${
      position === "right"
        ? "-right-6 top-1/2 -translate-y-1/2 md:block hidden"
        : ""
    }
  `;

  const IconComponent = iconComponents[icon];

  return (
    // wrapper: ref aquí para el observer y overflow-visible para que el círculo pueda sobresalir
    <div ref={cardRef} className={wrapperClasses}>
      {/* tarjeta principal */}
      <div
        className={`card card--border-glow ${cardInnerClasses} relative z-10`}
      >
        <div className={contentClasses}>
          <h3 className="mb-2 text-xl font-bold text-white md:text-2xl font-lexend">
            {subTitle}
          </h3>
          <p className="font-sans text-gray-300">{description}</p>
        </div>
      </div>

      {/* ícono: sibling absoluto (fuera de la .card), con zIndex alto para quedar por encima */}
      <div
        className={iconPositionClasses}
        // zIndex en línea para garantizar que esté por encima de partículas/ripples (si quieres, ajusta)
        style={{ zIndex: 1200 }}
        aria-hidden="true"
      >
        {IconComponent && (
          <div className="flex items-center justify-center w-full h-full">
            <IconComponent size={60} className="text-esmeraldButton-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillCard;
