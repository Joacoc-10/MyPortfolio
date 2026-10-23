import type { Locale } from "@/i18n/routing";

/** Texto traducible dentro de los datos de contenido. */
export type Localized<T = string> = Record<Locale, T>;

export type TechCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "tools"
  | "services";

export interface Technology {
  /** Identificador estable, referenciado desde Project.techIds. */
  id: string;
  name: string;
  category: TechCategory;
  url?: string;
  /** Color de marca (hex) para resaltar el logo al pasar el cursor. Solo si tiene buen contraste sobre fondo oscuro. */
  brandColor?: string;
  /** Si aparece en la sección Stack (el resto solo se muestra dentro de proyectos). */
  inStack: boolean;
}

export interface Links {
  github: string;
  linkedin: string;
  email: string;
  /** Ruta pública del CV por idioma. */
  cv: Localized<string>;
}

export interface Profile {
  name: string;
  headline: Localized;
  valueProposition: Localized;
  availability: Localized;
  about: Localized<string[]>;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  role: Localized;
  /** Modalidad de la experiencia (ej. prácticas profesionales). Se muestra junto al rol. */
  employmentType?: Localized;
  /** Formato AAAA-MM. `end: null` significa "actualidad". */
  period?: { start: string; end: string | null };
  /** Para experiencias sin fechas exactas confirmadas. */
  durationMonths?: number;
  summary?: Localized;
}

export type ProjectKind = "professional" | "personal" | "bootcamp";

export interface Project {
  id: string;
  kind: ProjectKind;
  /** Obligatorio cuando kind === "professional". */
  companyId?: string;
  name: string;
  summary: Localized;
  /** Problema que resuelve el producto (opcional; se muestra bajo el resumen en el proyecto destacado). */
  problem?: Localized;
  /** Contribuciones propias confirmadas. No incluir nada que no esté verificado. */
  contributions?: Localized<string[]>;
  /** Tecnologías que efectivamente usé en este proyecto (no el stack completo del proyecto). */
  techIds: string[];
  image?: string;
  featured?: boolean;
  /** Estado del proyecto, independiente del estado laboral de la empresa. */
  inProduction?: boolean;
  /** Etapa comercial, independiente de `inProduction` (ej. "pilot": en producción pero aún en piloto con comercios reales). */
  stage?: "pilot";
  links: { deploy?: string; repo?: string };
}
