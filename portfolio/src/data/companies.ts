import type { Company } from "./types";

/** Orden: más reciente primero. */
export const companies: Company[] = [
  {
    id: "coralunity",
    name: "Coralunity",
    website: "https://coralunity.com/es",
    role: { es: "Full Stack Developer", en: "Full Stack Developer" },
    period: { start: "2026-01", end: null },
    summary: {
      es: "Participación en el desarrollo de aplicaciones web, plataformas e integraciones, tanto frontend como backend.",
      en: "Involved in building web applications, platforms and integrations, on both the frontend and the backend.",
    },
  },
  {
    id: "zatobox",
    name: "ZatoBox",
    website: "https://www.zatobox.io/",
    role: { es: "Frontend Developer", en: "Frontend Developer" },
    employmentType: {
      es: "Prácticas profesionales",
      en: "Professional internship",
    },
    period: { start: "2025-08", end: "2025-12" },
    // Duración (6 meses) omitida a propósito: no coincide con el período confirmado (ago–dic 2025).
    // La plataforma se describe en el proyecto "zatobox" (projects.ts).
  },
];
