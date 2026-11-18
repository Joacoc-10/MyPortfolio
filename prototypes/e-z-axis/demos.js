// Registro de demos incrustables de E · Z-AXIS (misma verificación que la variante D, Chrome 2026-11-17).
//   verified   → renderiza dentro de un <iframe>    → «Explorar demo» activo
//   blocked    → el sitio lo prohíbe (X-Frame-Options) → capturas + enlace
//   unverified → renderiza pero sin probar a fondo    → capturas + enlace
// El <iframe> nunca existe hasta que el visitante pulsa el botón.
export const DEMOS = {
  zatobox: "verified",
  "fabio-producciones": "verified",
  "florencia-biaturi": "verified",
  olibar: "verified",
  "order-a": "blocked",
  nexvia: "blocked",
  "lienzo-culinario": "unverified",
  "futura-tech": "unverified",
  "bodega-cepa-real": "unverified",
  "movie-reel": "unverified",
  "portfolio-v1": "unverified",
};
export const demoStatus = (p) => {
  if (!p.links?.deploy) return "none";
  return DEMOS[p.id] ?? "none";
};
