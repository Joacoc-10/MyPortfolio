// Utilidades de la variante D. Sin dependencias.
const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => entities[c]);
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const pad2 = (n) => String(n).padStart(2, "0");

/** Carga el contenido real (/api/full.json) y las preferencias (?lang=es|en, ?rm=1). */
export async function boot() {
  const q = new URLSearchParams(location.search);
  const lang = q.get("lang") === "en" ? "en" : "es";
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const rm = q.get("rm") === "1" || media.matches;
  document.documentElement.lang = lang;
  document.documentElement.classList.toggle("rm", rm);
  media.addEventListener("change", () => location.reload());
  const res = await fetch("/api/full.json");
  if (!res.ok) throw new Error("No se pudo cargar el contenido");
  const data = await res.json();
  return { data, lang, rm, msg: data.messages[lang], L: (x) => x?.[lang], esc };
}

/** «ene 2026» / «Jan 2026» a partir de AAAA-MM. */
export function fmtMonth(ym, lang) {
  const [y, m] = ym.split("-").map(Number);
  const s = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  return s.replace(/\./g, "").replace(/^\w/, (c) => c.toUpperCase());
}

/** Programa una función como máximo una vez por frame. */
export function frameThrottle(fn) {
  let queued = false;
  return (...a) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...a); });
  };
}
