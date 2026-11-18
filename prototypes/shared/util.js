export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const outCubic = (t) => 1 - Math.pow(1 - t, 3);
export const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Rango [a,b] → 0..1 */
export const range = (v, a, b) => clamp((v - a) / (b - a));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
