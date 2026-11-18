// Utilidades de Z-AXIS: matemática de animación, bucles rAF pausables, puntero compartido y preferencias de movimiento.
// Todo lo que toca `window` se ejecuta dentro de efectos (nunca durante el render del servidor).

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Rango [a, b] → 0..1 */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const host = (url?: string) => {
  try {
    return url ? new URL(url).host.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};
export const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

/** «ene 2026» / «Jan 2026» a partir de AAAA-MM. */
export function fmtMonth(ym: string, lang: string) {
  const [y, m] = ym.split("-").map(Number);
  const s = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  return s.replace(/\./g, "").replace(/^\w/, (c) => c.toUpperCase());
}

/** Como mucho una ejecución por frame. */
export function frameThrottle<A extends unknown[]>(fn: (...a: A) => void) {
  let queued = false;
  return (...a: A) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...a);
    });
  };
}

/** Observa visibilidad. Devuelve una función para dejar de observar. */
export function watchVisible(el: Element, cb: (visible: boolean) => void, rootMargin = "0px") {
  const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0, rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

/** Bucle rAF bajo demanda: `fn` devuelve `true` mientras queda algo por animar; al devolver `false` el bucle se detiene
 *  (cero frames en reposo) y `wake()` lo reanuda ante una interacción. `pause()` lo suspende aunque haya trabajo. */
export function createLoop(fn: (t: number) => boolean | void) {
  let raf = 0;
  let paused = false;
  const tick = (t: number) => {
    raf = 0;
    if (paused) return;
    if (fn(t) === false) return;
    raf = requestAnimationFrame(tick);
  };
  return {
    wake() {
      if (!paused && !raf) raf = requestAnimationFrame(tick);
    },
    pause() {
      paused = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resume() {
      paused = false;
      this.wake();
    },
    get running() {
      return raf !== 0;
    },
  };
}

/** Color medio de una captura → luz ambiental del proyecto (se limita la luminosidad para no quemar el fondo). */
export function tintOf(img: HTMLImageElement): [number, number, number] {
  try {
    const c = document.createElement("canvas");
    c.width = 24;
    c.height = 15;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, 0, 0, 24, 15);
    const { data } = ctx.getImageData(0, 0, 24, 15);
    let r = 0, g = 0, b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r /= n; g /= n; b /= n;
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    const k = lum > 150 ? 150 / lum : 1;
    const mean = (r + g + b) / 3;
    const boost = 1.35; // capturas casi blancas darían una luz gris sin carácter
    const sat = (v: number) => clamp(Math.round((mean + (v - mean) * boost) * k), 0, 255);
    return [sat(r), sat(g), sat(b)];
  } catch {
    return [45, 212, 191];
  }
}

/* ---------- puntero compartido (solo ratón): un único listener para toda la página ---------- */
export const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, last: -1e9, fine: false };
let pointerBound = false;
const pointerSubs = new Set<() => void>();
/** Avisa (sin trabajo propio) cada vez que el ratón se mueve; los bucles bajo demanda lo usan para despertar. */
export const onPointerActivity = (fn: () => void) => {
  pointerSubs.add(fn);
  return () => {
    pointerSubs.delete(fn);
  };
};
export function bindPointer() {
  if (pointerBound || typeof window === "undefined") return;
  pointerBound = true;
  pointer.fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ny = (e.clientY / innerHeight - 0.5) * 2;
      pointer.last = performance.now();
      pointerSubs.forEach((fn) => fn());
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -9999;
    pointerSubs.forEach((fn) => fn());
  });
}

/* ---------- preferencias de movimiento y nivel de calidad ----------
   rm   → «reducir movimiento» (sistema o ?rm=1): sin parallax, sin túnel, todo estático.
   lite → equipo muy limitado (?lite=1, saveData, ≤ 2 núcleos o ≤ 2 GB): hero y coverflow estáticos, sin bucles.
   mid  → equipo modesto (táctil con ≤ 4 núcleos o ≤ 4 GB; escritorio con ≤ 4 núcleos Y ≤ 4 GB; ?mid=1) o que no mantiene
          los 60 fps medidos (ver watchFrames): se conservan el 3D y las animaciones, pero sin blur de fondo, sin brillos
          grandes ni reflejos. Un móvil actual con 6-8 núcleos y buena memoria NO se degrada.
   El mismo criterio se evalúa antes del primer pintado en el <script> del layout (clases en <html>). */
export interface MotionPrefs {
  rm: boolean;
  lite: boolean;
  mid: boolean;
  calm: boolean;
}
export function getMotionPrefs(): MotionPrefs {
  const q = new URLSearchParams(location.search);
  const rm = q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const cores = navigator.hardwareConcurrency || 8;
  const mem = nav.deviceMemory ?? 8;
  const lite = !rm && (q.get("lite") === "1" || Boolean(nav.connection?.saveData) || cores <= 2 || mem <= 2);
  const coarse = matchMedia("(pointer: coarse)").matches;
  const weak = coarse ? cores <= 4 || mem <= 4 : cores <= 4 && mem <= 4;
  const mid = !rm && !lite && (q.get("mid") === "1" || weak || document.documentElement.classList.contains("mid"));
  return { rm, lite, mid, calm: rm || lite };
}

/** Mide la fluidez real durante las primeras interacciones de scroll: si los frames se mantienen por encima de ~26 ms
 *  se activa el nivel `mid` (solo CSS: se quitan blur y brillos grandes). Se evalúa una vez y se detiene. */
export function watchFrames(onSlow: () => void) {
  let samples = 0, sum = 0, last = 0, raf = 0, idleT = 0, done = false;
  const stop = () => {
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(idleT);
    removeEventListener("scroll", kick);
  };
  const tick = (t: number) => {
    raf = 0;
    if (done) return;
    const dt = t - last;
    last = t;
    if (dt < 250) { sum += dt; samples++; } // se ignoran pausas (pestaña en segundo plano)
    if (samples >= 90) {
      stop();
      if (sum / samples > 26) onSlow();
      return;
    }
    raf = requestAnimationFrame(tick);
    clearTimeout(idleT);
    idleT = window.setTimeout(() => { cancelAnimationFrame(raf); raf = 0; last = 0; }, 160); // sin scroll no se mide
  };
  function kick() {
    if (done || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  addEventListener("scroll", kick, { passive: true });
  return stop;
}

/* ---------- bus de scroll: UN único listener, una función por frame ---------- */
type ScrollFn = (y: number, vh: number) => void;
const subs = new Set<ScrollFn>();
export const subscribeScroll = (fn: ScrollFn) => {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
};
export const runScrollSubs = (y: number, vh: number) => subs.forEach((fn) => fn(y, vh));

/* ---------- puente imperativo entre secciones (hero → proyectos, stack → detalle) ---------- */
export const bridge: { goProject: (id: string) => void } = { goProject: () => {} };
