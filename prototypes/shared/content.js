// Carga el contenido real del portfolio (vía /api/content.json) y las preferencias del comparador.
// Parámetros de URL: ?lang=es|en  ?rm=1 (fuerza "reducir movimiento")
const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => entities[c]);

export async function boot() {
  const query = new URLSearchParams(location.search);
  const lang = query.get("lang") === "en" ? "en" : "es";
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const rm = query.get("rm") === "1" || media.matches;
  document.documentElement.lang = lang;
  document.documentElement.classList.toggle("rm", rm);
  // Si cambia la preferencia del sistema mientras se navega, se recompone la página.
  media.addEventListener("change", () => location.reload());

  const response = await fetch("/api/content.json");
  if (!response.ok) throw new Error("No se pudo cargar el contenido");
  const data = await response.json();
  const msg = data.messages[lang];
  const L = (localized) => localized[lang];
  /** Etiqueta de tipo: la empresa para lo profesional, «Proyecto personal» para lo independiente. */
  const kindLabel = (project) => (project.kind === "personal" ? msg.Projects.kindPersonal : project.company);
  return { data, lang, rm, msg, L, kindLabel, esc };
}

/** Color medio de una imagen (para el "derrame de luz" cinematográfico). Devuelve [r,g,b]. */
export function averageColor(img) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 15;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, 24, 15);
    const { data } = ctx.getImageData(0, 0, 24, 15);
    let r = 0, g = 0, b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  } catch {
    return [90, 120, 160];
  }
}
