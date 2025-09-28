"use client";
import React, { useState, useEffect } from 'react';
import AnimatedNumber from './AnimatedNumber';

interface ExperienceData {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateExperience(): ExperienceData {
  const graduationDate = new Date('2025-03-17T00:00:00');
  const now = new Date();
  const diffInMilliseconds = now.getTime() - graduationDate.getTime();

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInMonth = secondsInDay * 30.44; 
  const secondsInYear = secondsInDay * 365.25;

  let diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  const years = Math.floor(diffInSeconds / secondsInYear);
  diffInSeconds %= secondsInYear;

  const months = Math.floor(diffInSeconds / secondsInMonth);
  diffInSeconds %= secondsInMonth;

  const days = Math.floor(diffInSeconds / secondsInDay);
  diffInSeconds %= secondsInDay;

  const hours = Math.floor(diffInSeconds / secondsInHour);
  diffInSeconds %= secondsInHour;

  const minutes = Math.floor(diffInSeconds / secondsInMinute);
  const seconds = diffInSeconds % secondsInMinute;

  return { years, months, days, hours, minutes, seconds };
}

const ExperienceCounter: React.FC = () => {
  // Estado para saber si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  const [experience, setExperience] = useState<ExperienceData>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Esto solo se ejecuta en el cliente después de que el componente se monta
    setIsClient(true);
    setExperience(calculateExperience());

    const timer = setInterval(() => {
      setExperience(calculateExperience());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hasOneYear = experience.years >= 1;

  // Renderiza una versión estática en el servidor para evitar errores
  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">Experiencia</h1>
        <div className="flex justify-center space-x-4 font-extrabold font-lexend md:space-x-8">
          <div>
            <span className="leading-none tracking-tight text-8xl md:text-9xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Años</span>
          </div>
          <div>
            <span className="text-6xl leading-tight tracking-tight md:text-7xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Meses</span>
          </div>
          <div>
            <span className="text-4xl leading-snug tracking-tight md:text-5xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Días</span>
          </div>
          <div>
            <span className="text-2xl leading-normal tracking-tight md:text-3xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Horas</span>
          </div>
          <div>
            <span className="text-xl leading-loose tracking-tight md:text-2xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Min.</span>
          </div>
          <div>
            <span className="text-lg leading-relaxed tracking-tight md:text-xl">-</span>
            <span className="mt-2 text-sm font-normal text-greyParagraph-500">Seg.</span>
          </div>
        </div>
      </div>
    );
  }

  // Si ya estamos en el cliente, renderiza la versión animada
  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">Experiencia</h1>
      <div className="flex justify-center space-x-4 font-extrabold font-lexend md:space-x-8">
        {hasOneYear ? (
          <>
            <AnimatedNumber value={experience.years} className="leading-none tracking-tight text-8xl md:text-9xl text-whiteHeadline-500" label="Años" />
            <AnimatedNumber value={experience.months} className="text-6xl leading-tight tracking-tight md:text-7xl text-whiteHeadline-500" label="Meses" />
            <AnimatedNumber value={experience.days} className="text-4xl leading-snug tracking-tight md:text-5xl text-whiteHeadline-500"  label="Días" />
            <AnimatedNumber value={experience.hours} className="text-2xl leading-normal tracking-tight md:text-3xl text-whiteHeadline-500" label="Horas" />
            <AnimatedNumber value={experience.minutes} className="text-xl leading-loose tracking-tight md:text-2xl text-whiteHeadline-500" label="Min." />
            <AnimatedNumber value={experience.seconds} className="text-lg leading-relaxed tracking-tight md:text-xl text-whiteHeadline-500" label="Seg." />
          </>
        ) : (
          <>
            <AnimatedNumber value={experience.months} className="leading-none tracking-tight text-8xl md:text-9xl text-whiteHeadline-500" label="Meses" />
            <AnimatedNumber value={experience.days} className="text-6xl leading-tight tracking-tight md:text-7xl text-whiteHeadline-500" label="Días" />
            <AnimatedNumber value={experience.hours} className="text-4xl leading-snug tracking-tight md:text-5xl text-whiteHeadline-500" label="Horas" />
            <AnimatedNumber value={experience.minutes} className="text-2xl leading-normal tracking-tight md:text-3xl text-whiteHeadline-500" label="Min." />
            <AnimatedNumber value={experience.seconds} className="text-xl leading-loose tracking-tight md:text-2xl text-whiteHeadline-500" label="Seg." />
          </>
        )}
      </div>
    </div>
  );
};

export default ExperienceCounter;