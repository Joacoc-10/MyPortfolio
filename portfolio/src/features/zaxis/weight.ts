// Campo de peso tipográfico: el peso (eje wght de Geist) de cada letra responde a la cercanía del puntero.
// Sin puntero: una onda lenta y suave durante la entrada (`ambient` la apaga con un fundido y el bucle se detiene).
// Cada letra mide siempre su ancho a peso medio, así que el texto NO se reacomoda al cambiar de peso.
//
// Coste: las posiciones de las letras se miden UNA vez (en `fix()`, al cargar fuentes o cambiar de tamaño) y se cachean;
// `tick()` solo hace aritmética y escribe `font-weight` cuando el valor entero cambia. Sin lecturas de layout por frame.
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
  // Centros cacheados (x en viewport; y en página, para compensar el scroll sin volver a medir) y alto de línea.
  const cx = letters.map(() => 0);
  const cy = letters.map(() => 0);
  const hh = letters.map(() => 1);
  let settled = false;
  let dirty = true;
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
    settled = false;
    dirty = true;
  }

  /** Una sola ronda de lecturas. Se mide el contenedor `.mk` (sin transformaciones), no la letra, que durante la entrada
   *  está desplazada por la animación. Se invoca desde `tick` solo cuando la caché se ha invalidado. */
  function measure() {
    const sy = scrollY;
    letters.forEach((l, i) => {
      const r = (l.parentElement ?? l).getBoundingClientRect();
      cx[i] = r.left + r.width / 2;
      cy[i] = r.top + sy + r.height / 2;
      hh[i] = r.height;
    });
    dirty = false;
  }

  /** `strength` 0..1 permite apagar el efecto (p. ej. mientras el nombre se acopla); `ambient` 0..1 es la onda sin puntero.
   *  Devuelve `true` mientras todavía hay algo que animar (si no, el bucle puede dormirse). */
  function tick(now: number, strength = 1, ambient = 0): boolean {
    if (strength < 0.01 && settled) return false; // apagado y en reposo: ni una operación
    if (dirty) measure();
    const sy = scrollY;
    const hasPointer = pointer.x > -999 && now - pointer.last < 2600;
    let moving = false;
    const out: number[] = new Array(letters.length);
    for (let i = 0; i < letters.length; i++) {
      let t: number;
      if (hasPointer) {
        const dx = (pointer.x - cx[i]) / (radius * ampX);
        const dy = (pointer.y - (cy[i] - sy)) / Math.max(1, hh[i] * 0.9);
        t = Math.exp(-(dx * dx + dy * dy));
      } else {
        t = ambient > 0.001 ? wave * ambient * (0.5 + 0.5 * Math.sin(now / 1050 - i * 0.85)) : 0;
      }
      const target = t * strength;
      amp[i] = lerp(amp[i], target, 0.16);
      if (Math.abs(amp[i] - target) < 0.002) amp[i] = target; // converge del todo: permite detener el bucle
      else moving = true;
      out[i] = strength < 0.01 && amp[i] < 0.01 ? rest : Math.round(lerp(rest, max, amp[i]));
    }
    settled = strength < 0.01 && amp.every((a) => a < 0.01);
    for (let i = 0; i < letters.length; i++) {
      const w = clamp(out[i], min, max);
      if (w !== last[i]) {
        letters[i].style.fontWeight = String(w);
        last[i] = w;
      }
    }
    // La onda ambiente sigue viva mientras `ambient` > 0 y no hay puntero.
    return moving || (!hasPointer && ambient > 0.001 && strength >= 0.01);
  }

  function reset() {
    letters.forEach(base);
    amp.fill(0);
    last.fill(-1);
    settled = false;
  }
  /** Invalida la caché de posiciones (cambio de viewport, fuentes o geometría). */
  const invalidate = () => {
    dirty = true;
  };
  return { fix, tick, reset, invalidate };
}
