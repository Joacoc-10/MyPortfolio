"use client";
import { ISkill } from '@/types/TechSkills';
import React, { useRef, useEffect, useState } from 'react';
import { FaCode, FaGitAlt, FaJs, FaPalette, FaDatabase, FaCloud } from 'react-icons/fa';

interface SkillCardProps extends ISkill {
  position: 'left' | 'right' | 'center';
}

const iconComponents = {
  code: FaCode,
  git: FaGitAlt,
  javascript: FaJs,
  style: FaPalette,
  database: FaDatabase,
  cloud: FaCloud,
};

const SkillCard = ({ subTitle, description, icon, position }: SkillCardProps) => {
  const cardRef = useRef(null);
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

  const cardClasses = `
    w-full max-w-2xl bg-black/20 border border-purple-500/30 rounded-xl
    p-6 md:p-8 flex flex-col space-y-4 relative z-10
    transition-all duration-1000 ease-out transform
    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
  `;
  
  const iconContainerClasses = `
    absolute w-24 h-24 rounded-full border border-purple-400 flex items-center justify-center
    ${position === 'center' ? '-top-12 left-1/2 -translate-x-1/2' : ''}
    ${position === 'left' ? '-left-6 top-1/2 -translate-y-1/2 md:block hidden' : ''}
    ${position === 'right' ? '-right-6 top-1/2 -translate-y-1/2 md:block hidden' : ''}
  `;
  
  const contentClasses = `
    relative z-20
    ${position === 'left' ? 'md:pl-20' : ''}
    ${position === 'right' ? 'md:pr-20' : ''}
    ${position === 'center' ? 'pt-16 md:pt-12' : ''}
  `;

  const IconComponent = iconComponents[icon];

  return (
    <div ref={cardRef} className={cardClasses}>
      <div className={iconContainerClasses}>
        {/* ✅ CAMBIO: Contenedor adicional para asegurar el centrado del ícono */}
        {IconComponent && (
          <div className="flex items-center justify-center w-full h-full">
            <IconComponent size={60} className="text-purple-400" />
          </div>
        )}
      </div>
      
      <div className={contentClasses}>
        <h3 className="mb-2 text-xl font-bold text-white md:text-2xl font-lexend">
          {subTitle}
        </h3>
        <p className="font-sans text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default SkillCard;