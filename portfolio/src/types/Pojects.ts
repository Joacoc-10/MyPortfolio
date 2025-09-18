export interface IProjectLinks{
  deploy?: string;
  gitHubFront?: string;
  gitHubback?: string;
}

export interface IProjectTechnologies {
  frontEnd?: string[];
  backEnd?: string[];
}

export interface IProjects {
  id: number;
  name: string;
  imageSrc: string;
  rol: string;
  description: string;
  technologies: IProjectTechnologies;
  links: IProjectLinks;
}

