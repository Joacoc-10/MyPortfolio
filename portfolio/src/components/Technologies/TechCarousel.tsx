"use client";
import { technologies } from '@/helpers/Technologies';
import LogoLoop from './LogoLoop';
import TechHover from './TechHover';

const TechCarousel = () => {
  const loopLogos = technologies.map((tech) => ({
    node: <TechHover title={tech.title} src={tech.src} />,
    title: tech.title,
    href: tech.href,
  }));

  return (
    <div className="relative h-[100px] w-full overflow-hidden mt-20">
      <LogoLoop
        logos={loopLogos}
        speed={30}
        direction="right"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        ariaLabel="Tecnologías usadas en mis proyectos"
      />
    </div>
  );
};

export default TechCarousel;