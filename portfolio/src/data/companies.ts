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
    durationMonths: 6,
    // Describe la plataforma (dato confirmado), no atribuye funcionalidades ni tecnologías a mi trabajo.
    // PENDING: fechas exactas, tecnologías y responsabilidades propias (ver PENDING.md)
    summary: {
      es: "Plataforma POS y de gestión de inventario para pequeños comercios, con funcionalidades de ventas, productos, stock y seguimiento de operaciones.",
      en: "A POS and inventory management platform for small businesses, with features for sales, products, stock and operations tracking.",
    },
  },
];
