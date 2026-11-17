import { companies } from "@/data/companies";
import { links } from "@/data/links";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { technologies } from "@/data/technologies";
import { stackCategories } from "@/data";
import type { Locale } from "@/i18n/routing";
import type { TechCategory } from "@/data";
import type { ZContent, ZProject, ZTech } from "./types";

const techById = new Map(technologies.map((t) => [t.id, t]));
const toTech = (t: (typeof technologies)[number]): ZTech => ({ id: t.id, name: t.name, category: t.category, ...(t.brandColor ? { brandColor: t.brandColor } : {}) });

/** Orden de visualización: profesionales → personales → bootcamp (el mismo del portfolio actual). */
export function getZContent(locale: Locale): ZContent {
  const other: Locale = locale === "es" ? "en" : "es";
  const zProjects: ZProject[] = projects.map((p) => ({
    id: p.id,
    kind: p.kind,
    ...(p.companyId ? { companyId: p.companyId } : {}),
    name: p.name,
    summary: p.summary[locale],
    ...(p.problem ? { problem: p.problem[locale] } : {}),
    ...(p.contributions ? { contributions: p.contributions[locale] } : {}),
    featured: !!p.featured,
    inProduction: !!p.inProduction,
    pilot: p.stage === "pilot",
    techs: p.techIds.flatMap((id) => techById.get(id) ?? []).map(toTech),
    media: (p.media ?? []).filter((m) => m.type === "image").map((m) => ({
      src: m.src,
      alt: m.alt[locale],
      ...(m.caption ? { caption: m.caption[locale] } : {}),
      w: m.width,
      h: m.height,
    })),
    ...(p.links.deploy ? { deploy: p.links.deploy } : {}),
    ...(p.links.repo ? { repo: p.links.repo } : {}),
  }));

  const stack = {} as Record<TechCategory, ZTech[]>;
  for (const c of stackCategories) stack[c] = technologies.filter((t) => t.inStack && t.category === c).map(toTech);
  // «Servicios e integraciones» no figura en la sección Stack original: se toma de las tecnologías reales de los proyectos.
  const services = new Map<string, ZTech>();
  zProjects.forEach((p) => p.techs.filter((t) => t.category === "services").forEach((t) => services.set(t.id, t)));
  stack.services = [...services.values()];

  return {
    locale,
    name: profile.name,
    headline: profile.headline[locale],
    valueProposition: profile.valueProposition[locale],
    availability: profile.availability[locale],
    about: profile.about[locale],
    links: { github: links.github, linkedin: links.linkedin, email: links.email, cv: links.cv[locale], cvOther: links.cv[other], otherLocale: other },
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      ...(c.website ? { website: c.website } : {}),
      role: c.role[locale],
      ...(c.employmentType ? { employmentType: c.employmentType[locale] } : {}),
      ...(c.period ? { period: c.period } : {}),
      ...(c.summary ? { summary: c.summary[locale] } : {}),
    })),
    projects: zProjects,
    stack,
    allStack: stackCategories.flatMap((c) => stack[c]),
  };
}
