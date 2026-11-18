// E · Z-AXIS — utilidades. Reutiliza /shared/util.js (matemática y selectores) y /api/full.json (contenido real).
import { clamp, lerp, smooth, range, outCubic, inOutCubic, $, $$ } from "/shared/util.js";
export { clamp, lerp, smooth, range, outCubic, inOutCubic, $, $$ };

const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => entities[c]);
export const pad2 = (n) => String(n).padStart(2, "0");
export const host = (url) => { try { return new URL(url).host.replace(/^www\./, ""); } catch { return ""; } };

/** Contenido real + preferencias. ?lang=es|en  ?rm=1 (reducir movimiento)  ?lite=1 (modo ligero). */
export async function boot() {
  const q = new URLSearchParams(location.search);
  const lang = q.get("lang") === "en" ? "en" : "es";
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const rm = q.get("rm") === "1" || media.matches;
  const cores = navigator.hardwareConcurrency || 8;
  const lite = !rm && (q.get("lite") === "1" || Boolean(navigator.connection?.saveData) || cores <= 2);
  const root = document.documentElement;
  root.lang = lang;
  root.classList.toggle("rm", rm);
  root.classList.toggle("lite", lite);
  media.addEventListener("change", () => location.reload());
  const res = await fetch("/api/full.json");
  if (!res.ok) throw new Error("No se pudo cargar el contenido (/api/full.json)");
  const data = await res.json();
  return { data, lang, rm, lite, calm: rm || lite, msg: data.messages[lang], L: (x) => x?.[lang] };
}

/** «ene 2026» / «Jan 2026» a partir de AAAA-MM. */
export function fmtMonth(ym, lang) {
  const [y, m] = ym.split("-").map(Number);
  const s = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  return s.replace(/\./g, "").replace(/^\w/, (c) => c.toUpperCase());
}

/** Como mucho una ejecución por frame. */
export function frameThrottle(fn) {
  let queued = false;
  return (...a) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...a); });
  };
}

/** Observa visibilidad. Devuelve una función para dejar de observar. */
export function watchVisible(el, cb, rootMargin = "0px") {
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0, rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

/** Color medio de una captura → luz ambiental del proyecto (se limita la luminosidad para no quemar el fondo). */
export function tintOf(img) {
  try {
    const c = document.createElement("canvas");
    c.width = 24; c.height = 15;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, 24, 15);
    const { data } = ctx.getImageData(0, 0, 24, 15);
    let r = 0, g = 0, b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
    r /= n; g /= n; b /= n;
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    const k = lum > 150 ? 150 / lum : 1;
    // Se satura un poco: capturas casi blancas darían una luz gris sin carácter.
    const mean = (r + g + b) / 3;
    const boost = 1.35;
    const sat = (v) => clamp(Math.round((mean + (v - mean) * boost) * k), 0, 255);
    return [sat(r), sat(g), sat(b)];
  } catch {
    return [45, 212, 191];
  }
}

/** Puntero compartido (solo ratón). Un único listener para todo el prototipo. */
export const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, last: -1e9, fine: matchMedia("(hover: hover) and (pointer: fine)").matches };
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  pointer.x = e.clientX; pointer.y = e.clientY;
  pointer.nx = (e.clientX / innerWidth - 0.5) * 2;
  pointer.ny = (e.clientY / innerHeight - 0.5) * 2;
  pointer.last = performance.now();
}, { passive: true });
document.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });

/** Bucle rAF que se puede pausar. */
export function createLoop(fn) {
  let raf = 0, on = false;
  const tick = (t) => { raf = 0; if (!on) return; fn(t); raf = requestAnimationFrame(tick); };
  return {
    start() { on = true; if (!raf) raf = requestAnimationFrame(tick); },
    stop() { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    get running() { return on; },
  };
}
