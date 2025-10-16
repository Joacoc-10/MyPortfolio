// src/components/Projects/ProjectSection.tsx
"use client";
import { projects } from "@/helpers/Projects";
import ProjectCard from "./ProjectCard";
import EffectsWrapper from "../EffectsWrapper";
import ScrollFloat from "../ScrollFloat";
import { useLanguage } from "@/context/LanguageContext";

const ProjectsSection: React.FC = () => {
  const sortedProjects = [...projects].sort((a, b) => b.id - a.id);
  const { t } = useLanguage();

  return (
    <section className="py-20" id="ProjectsSection">
      <div className="container px-4 mx-auto">
        {/* Titulo de Project section */}
        <ScrollFloat
          animationDuration={1.5}
          ease="power3.out"
          scrollStart="top bottom-=120"
        >
          <div className="flex flex-col items-center justify-center mt-32 mb-12 text-center md:mb-24">
            <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
              {t("Mis Proyectos")}
            </h2>
          </div>
        </ScrollFloat>

        {/* Mapeo de mis proyectos */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {sortedProjects.map((project) => (
            <ScrollFloat
              animationDuration={1.3}
              ease="power3.out"
              scrollStart="top bottom-=100"
              key={project.id}
            >
              <EffectsWrapper>
                <ProjectCard project={project} />
              </EffectsWrapper>
            </ScrollFloat>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
