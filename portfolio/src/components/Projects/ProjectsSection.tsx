// src/components/Projects/ProjectSection.tsx
import { projects } from "@/helpers/Projects";
import ProjectCard from "./ProjectCard";
import EffectsWrapper from "../EffectsWrapper";

const ProjectSection: React.FC = () => {
  const sortedProjects = [...projects].sort((a, b) => b.id - a.id);

  return (
    <section className="py-20" id="projects">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center justify-center mb-12 text-center md:mb-24">
          <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
            Mis Proyectos.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {sortedProjects.map((project) => (
            <EffectsWrapper key={project.id}>
              <ProjectCard project={project} />
            </EffectsWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;
