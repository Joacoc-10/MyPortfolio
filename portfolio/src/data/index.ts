import type { Locale } from "@/i18n/routing";
import { companies } from "./companies";
import { links } from "./links";
import { profile } from "./profile";
import { projects } from "./projects";
import { technologies } from "./technologies";
import type {
  Company,
  Localized,
  Project,
  TechCategory,
  Technology,
} from "./types";

export { siteUrl } from "./links";
export type * from "./types";

/** Resuelve un texto traducible al idioma activo. */
export function localize<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

export const getProfile = () => profile;
export const getLinks = () => links;
export const getCompanies = (): Company[] => companies;

/** Empresa actual (la que no tiene fecha de fin). */
export const getCurrentCompany = (): Company | undefined =>
  companies.find((c) => c.period && c.period.end === null);

export const getProjectsByCompany = (companyId: string): Project[] =>
  projects.filter((p) => p.companyId === companyId);

/** Proyectos independientes: personales primero y luego los del bootcamp. */
export const getIndependentProjects = (): Project[] => [
  ...projects.filter((p) => p.kind === "personal"),
  ...projects.filter((p) => p.kind === "bootcamp"),
];

export const getTechnologies = (ids: string[]): Technology[] =>
  ids.flatMap((id) => technologies.find((t) => t.id === id) ?? []);

export const stackCategories: Exclude<TechCategory, "services">[] = [
  "frontend",
  "backend",
  "database",
  "devops",
  "tools",
];

/** Tecnologías de la sección Stack agrupadas por categoría. */
export const getStack = () =>
  stackCategories.map((category) => ({
    category,
    items: technologies.filter((t) => t.inStack && t.category === category),
  }));

/** Las mismas tecnologías en una sola lista, en el orden de las categorías (usada por el carrusel). */
export const getStackTechnologies = (): Technology[] =>
  getStack().flatMap(({ items }) => items);
