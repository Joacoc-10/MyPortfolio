// src/components/Projects/ProjectCard.tsx
"use client";
import Image from "next/image";
import { IProjects } from "@/types/Pojects";
import { BiWorld, BiCodeAlt } from "react-icons/bi";
import { useState } from "react";

interface ProjectCardProps {
  project: IProjects;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [showGitHubButtons, setShowGitHubButtons] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const hasBothRepos = project.links.gitHubFront && project.links.gitHubback;

  const characterLimit = 150;
  const showReadMoreButton = project.description.length > characterLimit;
  const truncatedDescription = showFullDescription
    ? project.description
    : `${project.description.substring(0, characterLimit)}...`;

  return (
    <div className="bg-black/20 border border-purple-500/30 rounded-xl shadow-lg hover:shadow-2xl  transition-all duration-300 transform hover:scale-[1.02] group card flex flex-col min-h-[700px]">
      <div className="relative w-full overflow-hidden h-60 rounded-t-xl">
        <Image
          src={project.imageSrc}
          alt={`Captura del proyecto ${project.name}`}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col p-6 grow">
        <h3 className="mb-2 text-2xl font-bold text-center text-whiteHeadline-500 font-lexend">
          {project.name}
        </h3>

        <div className="mb-4 text-right">
          <span className="inline-block px-2 py-1 mb-4 font-sans font-medium text-purple-300 rounded-full text-mb bg-purple-600/30">
            {project.rol}
          </span>
        </div>

        <p className="mb-4 font-sans text-sm font-medium text-whiteHeadline-300">
          {truncatedDescription}
          {showReadMoreButton && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="ml-1 font-medium transition-colors text-purpleButton-300 hover:text-purple-300"
            >
              {showFullDescription ? "Leer menos" : "Leer más"}
            </button>
          )}
        </p>

        <div className="mb-4 font-sans">
          {project.technologies.frontEnd && (
            <div className="mb-2">
              <h4 className="font-semibold text-whiteHeadline-300">
                Front-end:
              </h4>
              <ul className="flex flex-wrap gap-2 mt-1 ">
                {project.technologies.frontEnd.map((tech, index) => (
                  <li
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-full text-whiteHeadline-200 bg-gray-700/60"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.technologies.backEnd && (
            <div>
              <h4 className="mt-4 font-semibold text-whiteHeadline-300">
                Back-end:
              </h4>
              <ul className="flex flex-wrap gap-2 mt-1 ">
                {project.technologies.backEnd.map((tech, index) => (
                  <li
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-full text-whiteHeadline-200 bg-gray-700/60"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6 mt-auto font-sans">
          {project.links.deploy && (
            <a
              href={project.links.deploy}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors text-purpleButton-300 hover:text-purpleButton-400"
            >
              <BiWorld size={20} /> Deploy
            </a>
          )}

          {hasBothRepos ? (
            <>
              {/* Botón de GitHub que desaparece */}
              {!showGitHubButtons && (
                <button
                  onClick={() => setShowGitHubButtons(true)}
                  className="flex items-center gap-2 transition-all duration-300 ease-in-out text-whiteHeadline-300 hover:text-purpleButton-400"
                >
                  <BiCodeAlt size={20} /> GitHub
                </button>
              )}

              {/* Contenedor de botones de repositorios */}
              <div className="flex items-center gap-4">
                {showGitHubButtons && (
                  <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
                    <a
                      href={project.links.gitHubFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors duration-300 text-whiteHeadline-300 hover:text-white"
                      style={{
                        animation: "slideInFromLeft 0.6s ease-out forwards",
                      }}
                    >
                      <BiCodeAlt size={20} /> Repo-Front
                    </a>
                    <a
                      href={project.links.gitHubback}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors duration-300 text-whiteHeadline-300 hover:text-white"
                      style={{
                        animation: "slideInFromRight 0.6s ease-out forwards",
                      }}
                    >
                      <BiCodeAlt size={20} /> Repo-Back
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            project.links.gitHubFront && (
              <a
                href={project.links.gitHubFront}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors text-whiteHeadline-300 hover:text-purpleButton-400"
              >
                <BiCodeAlt size={20} /> GitHub
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
