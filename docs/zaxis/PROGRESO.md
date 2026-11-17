# Z-AXIS · registro de progreso

Rama `redesign-2026`. Referencia visual: `prototypes/e-z-axis/` (no se toca).
Port a Next 15 / React 19 / Tailwind 4 / next-intl en `portfolio/src/features/zaxis/` (+ `portfolio/src/styles/zaxis/`).

| Fase | Estado | Notas |
|---|---|---|
| 0 Base | hecho | tokens/CSS portado, fuentes (Geist variable, Geist Mono, Instrument Serif), mensajes `Z` y `ContactForm`, utilidades, logos, modelo de datos |
| 1 Shell, Navbar, Hero | hecho | hero con túnel; Fabio Producciones = última ventana en escritorio y móvil |
| 2 Proyectos | hecho | coverflow 3D, mazo móvil, índice, detalle (`<dialog>`), sin demos |
| 3 Experiencia y Stack | hecho | timeline, capas con logos, carrusel de logos al final de Stack |
| 4 Sobre mí, Contacto, Footer | hecho | formulario EmailJS con validación y estados |
| 5 Efectos y pulido | en curso | |
| 6 Auditoría final | pendiente | |

Reanudar: `cd portfolio && npm run dev`; prototipo: `node --no-warnings prototypes/serve.mjs` → http://127.0.0.1:4747/e-z-axis/
