// src/components/ProjectCounter.jsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import { projects } from '@/helpers/Projects';
import React from 'react';

const ProjectCounter = () => {
  const projectCount = projects.length;
  const { t } = useLanguage();

  let displayValue;

  if (projectCount >= 15) {
    displayValue = "15+";
  } else if (projectCount > 10) {
    displayValue = "10+";
  } else if (projectCount > 5) {
    displayValue = "5+";
  } else {
    displayValue = projectCount;
  }

  return (
    <div className="flex flex-col items-center font-lexend">
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">{t("Proyectos")}</h1>
      <div className="text-5xl font-bold text-whiteHeadline-500 md:text-6xl">
        {displayValue}
      </div>
    </div>
  );
};

export default ProjectCounter;