// Campo de peso tipográfico: el peso (eje wght de Geist) de cada letra responde a la cercanía del puntero.
// Sin puntero (táctil o en reposo): una onda lenta y suave. Cada letra mide siempre su ancho a peso medio,
// así que el texto NO se reacomoda al cambiar de peso (sin saltos de layout). Lecturas primero, escrituras después.
import { clamp, lerp, pointer } from "./lib";

interface WeightOpts {
  min?: number;
  rest?: number;
  max?: number;
  mid?: number;
  radius?: number;
  wave?: number;
  ampX?: number;
}

export function createWeightField(letters: HTMLElement[], { min = 330, rest = 440, max = 800, mid = 560, radius = 170, wave = 0.3, ampX = 1 }: WeightOpts = {}) {
  const amp = letters.map(() => 0);
  const last = letters.map(() => -1);
  const base = (l: HTMLElement) => {
    l.style.fontWeight = String(rest);
  };

  /** Congela el ancho de cada letra a peso medio. Llamar tras cargar fuentes y al cambiar de tamaño. */
  function fix() {
    letters.forEach((l) => {
      l.style.width = "";
      l.style.fontWeight = String(mid);
    });
    const widths = letters.map((l) => l.getBoundingClientRect().width);
    letters.forEach((l, i) => {
      l.style.width = `${widths[i]}px`;
      base(l);
    });
    last.fill(-1);
  }

  /** `strength` 0..1 permite apagar el efecto (p. ej. mientras el nombre se acopla). */
  function tick(now: number, strength = 1) {
    const rects = letters.map((l) => l.getBoundingClientRect());
    const hasPointer = pointer.x > -999 && now - pointer.last < 2600;
    const out: number[] = new Array(letters.length);
    for (let i = 0; i < letters.length; i++) {
      const r = rects[i];
      let t: number;
      if (hasPointer) {
        const dx = (pointer.x - (r.left + r.width / 2)) / (radius * ampX);
        const dy = (pointer.y - (r.top + r.height / 2)) / Math.max(1, r.height * 0.9);
        t = Math.exp(-(dx * dx + dy * dy));
      } else {
        t = wave * (0.5 + 0.5 * Math.sin(now / 1050 - i * 0.85));
      }
      amp[i] = lerp(amp[i], t * strength, 0.16);
      out[i] = strength < 0.01 && amp[i] < 0.01 ? rest : Math.round(lerp(rest, max, amp[i]));
    }
    for (let i = 0; i < letters.length; i++) {
      const w = clamp(out[i], min, max);
      if (w !== last[i]) {
        letters[i].style.fontWeight = String(w);
        last[i] = w;
      }
    }
  }

  function reset() {
    letters.forEach(base);
    amp.fill(0);
    last.fill(-1);
  }
  return { fix, tick, reset };
}
