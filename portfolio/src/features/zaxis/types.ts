// Modelo serializable que el servidor entrega a los componentes cliente de Z-AXIS (textos ya resueltos por idioma).
import type { Locale } from "@/i18n/routing";
import type { TechCategory, ProjectKind } from "@/data";

export interface ZTech {
  id: string;
  name: string;
  category: TechCategory;
  brandColor?: string;
}
export interface ZMedia {
  src: string;
  alt: string;
  caption?: string;
  full?: boolean;
  w: number;
  h: number;
}
export interface ZProject {
  id: string;
  kind: ProjectKind;
  companyId?: string;
  name: string;
  summary: string;
  problem?: string;
  contributions?: string[];
  featured: boolean;
  inProduction: boolean;
  pilot: boolean;
  techs: ZTech[];
  media: ZMedia[];
  /** URL publicada (referencia visual: dominio del marco). No implica que se ofrezca «Visitar el sitio»: ver `visitUrl`. */
  deploy?: string;
  /** Enlace «Visitar el sitio». Ausente en los proyectos del bootcamp Henry (ver `SHOW_VISIT_BY_KIND` en content.ts). */
  visitUrl?: string;
  repo?: string;
}
export interface ZCompany {
  id: string;
  name: string;
  website?: string;
  role: string;
  employmentType?: string;
  period?: { start: string; end: string | null };
  summary?: string;
}
export interface ZContent {
  locale: Locale;
  name: string;
  headline: string;
  valueProposition: string;
  availability: string;
  about: string[];
  links: { github: string; linkedin: string; email: string; cv: string; cvOther: string; otherLocale: Locale };
  companies: ZCompany[];
  projects: ZProject[];
  /** Capas del stack: categoría → tecnologías. «services» sale de las tecnologías reales usadas en proyectos. */
  stack: Record<TechCategory, ZTech[]>;
  /** Todas las tecnologías de la sección Stack, en orden de categoría (carrusel). */
  allStack: ZTech[];
}
