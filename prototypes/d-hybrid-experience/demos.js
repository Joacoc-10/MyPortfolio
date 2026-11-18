// Registro de demos incrustables. FUENTE DE VERDAD de qué proyectos pueden abrirse dentro del portfolio.
// Verificado el 2026-11-17 en Chrome (headless, 1280×800): se cargó cada URL dentro de un <iframe>
// y se revisó la captura. No se eludió ninguna restricción; el resultado es el comportamiento natural.
//   verified   → se vio renderizada dentro del iframe  → «Explorar demo» activo
//   blocked    → el sitio lo prohíbe (página de error)  → solo capturas + enlace
//   unverified → se renderiza, pero no se probó su funcionamiento completo → solo capturas + enlace
// Si se agrega un host verificado, hay que sumarlo también a D_FRAME_HOSTS en serve.mjs (CSP frame-src).
export const DEMOS = {
  zatobox: { status: "verified", note: "Landing de producto" },
  "fabio-producciones": { status: "verified", note: "Sitio con video de fondo y formulario por pasos" },
  "florencia-biaturi": { status: "verified", note: "Sitio institucional" },
  olibar: { status: "verified", note: "Carta digital" },
  "order-a": { status: "blocked", reason: "X-Frame-Options: SAMEORIGIN" },
  nexvia: { status: "blocked", reason: "X-Frame-Options: SAMEORIGIN" },
  "lienzo-culinario": { status: "unverified" },
  "futura-tech": { status: "unverified" },
  "bodega-cepa-real": { status: "unverified", note: "Se renderiza; depende de un backend no probado" },
  "movie-reel": { status: "unverified" },
  "portfolio-v1": { status: "unverified" },
};
export const demoStatus = (p) => (DEMOS[p.id]?.status === "verified" && p.links?.deploy ? "verified" : DEMOS[p.id]?.status ?? "none");
