import type { Links } from "./types";

/** Dominio por defecto (producción actual). */
const DEFAULT_SITE_URL = "https://jcoding.vercel.app";

/**
 * Dominio canónico del sitio: ÚNICA fuente para canonical, hreflang, sitemap, robots, Open Graph y JSON-LD.
 * Para migrar (p. ej. a https://jcoding.app) basta con definir NEXT_PUBLIC_SITE_URL en el entorno y volver a desplegar.
 * Se normaliza al origen (sin barra final ni ruta); un valor inválido cae al dominio por defecto.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.hostname === "localhost" ? url.origin : DEFAULT_SITE_URL;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = resolveSiteUrl();

export const links: Links = {
  github: "https://github.com/Joacoc-10",
  linkedin: "https://www.linkedin.com/in/j-coding/",
  email: "joacoc-10@hotmail.com",
  cv: {
    es: "/CV_JCoding_ES.pdf",
    en: "/CV_JCoding_EN.pdf",
  },
};
