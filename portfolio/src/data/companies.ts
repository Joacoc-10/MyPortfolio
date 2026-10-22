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
    // PENDING: cargo exacto, fechas, tecnologías y responsabilidades (ver PENDING.md)
    role: {
      es: "Prácticas profesionales",
      en: "Professional internship",
    },
    durationMonths: 6,
  },
];
