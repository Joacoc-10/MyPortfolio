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

  const buttonStyle =
    "flex items-center gap-2 px-4 py-2 font-sans font-semibold transition-transform shadow-md rounded-xl text-whiteHeadline-500 hover:scale-105";
  const deployButtonStyle = `${buttonStyle} bg-esmeraldButton-400/80 hover:bg-esmeraldButton-300`;
  const githubButtonStyle = `${buttonStyle} bg-secondaryBackground-600 text-whiteHeadline-500 hover:bg-secondaryBackground-300`;

  return (
    <div className="bg-black/20 border border-esmeraldButton-500/60 rounded-xl shadow-lg hover:shadow-2xl  transition-all duration-300 transform hover:scale-[1.02] group card flex flex-col min-h-[700px]">
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
          <span className="inline-block px-2 py-1 mb-4 font-sans font-medium rounded-full text-esmeraldButton-300 text-mb bg-esmeraldButton-600/30">
            {project.rol}
          </span>
        </div>

        <p className="mb-4 font-sans text-sm font-medium text-whiteHeadline-300">
          {truncatedDescription}
          {showReadMoreButton && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="ml-1 font-medium transition-colors text-esmeraldButton-300 hover:text-esmeraldButton-200"
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

        <div className="flex justify-center gap-4 mt-auto font-sans text-sm">
          {project.links.deploy && (
            <a
              href={project.links.deploy}
              target="_blank"
              rel="noopener noreferrer"
              className={deployButtonStyle}
            >
              <BiWorld size={20} /> Ver Proyecto
            </a>
          )}

          {hasBothRepos ? (
            <>
              {!showGitHubButtons && (
                <button
                  onClick={() => setShowGitHubButtons(true)}
                  className={githubButtonStyle}
                >
                  <BiCodeAlt size={20} /> GitHub
                </button>
              )}

              <div className="flex items-center gap-4 text-sm">
                {showGitHubButtons && (
                  <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
                    <a
                      href={project.links.gitHubFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={githubButtonStyle}
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
                      className={githubButtonStyle}
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
                className={githubButtonStyle}
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
