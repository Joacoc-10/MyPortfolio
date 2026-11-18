// Motor de movimiento mínimo (sin dependencias): resortes amortiguados + tweens con easing + línea de tiempo.
// Todo se avanza desde UN solo bucle (requestAnimationFrame) → pausable, interrumpible y sin temporizadores sueltos
// que limpiar al desmontar. Los resortes dan peso e inercia y garantizan continuidad: cambiar el objetivo a mitad de
// animación nunca produce saltos (la velocidad se conserva).

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inCubic: (t) => t * t * t,
  inQuart: (t) => t * t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};

/** Resorte con masa unitaria. `k` rigidez, `zeta` amortiguación (1 = crítico, <1 rebota). */
export class Spring {
  constructor(value = 0, k = 90, zeta = 1) {
    this.value = value; this.target = value; this.vel = 0; this.k = k; this.zeta = zeta; this.tw = null;
  }
  set(target, k, zeta) { this.tw = null; this.target = target; if (k != null) this.k = k; if (zeta != null) this.zeta = zeta; return this; }
  snap(v) { this.tw = null; this.value = this.target = v; this.vel = 0; return this; }
  kick(impulse) { this.vel += impulse; return this; }
  /** Tween con easing (para aceleraciones tipo "ease-in", que un resorte no puede dar). Respeta el valor actual. */
  tween(to, dur, easing = ease.inOutCubic, delay = 0) {
    this.tw = { from: this.value, to, t: -delay, dur, easing }; this.target = to; this.vel = 0; return this;
  }
  get active() { return !!this.tw || Math.abs(this.target - this.value) > 1e-4 || Math.abs(this.vel) > 1e-3; }
  step(dt) {
    if (this.tw) {
      const w = this.tw; w.t += dt;
      if (w.t < 0) return;
      const u = clamp(w.t / w.dur);
      const prev = this.value;
      this.value = w.from + (w.to - w.from) * w.easing(u);
      this.vel = dt > 0 ? (this.value - prev) / dt : 0;
      if (u >= 1) { this.tw = null; this.value = w.to; this.vel = 0; }
      return;
    }
    const k = this.k, c = 2 * Math.sqrt(k) * this.zeta;
    // sub-pasos para estabilidad con dt grandes
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = -k * (this.value - this.target) - c * this.vel;
      this.vel += a * h; this.value += this.vel * h;
    }
    if (Math.abs(this.target - this.value) < 1e-5 && Math.abs(this.vel) < 1e-4) { this.value = this.target; this.vel = 0; }
  }
}

/** Registro de canales (resortes con nombre). */
export class Channels {
  constructor() { this.map = new Map(); }
  add(name, value = 0, k = 90, zeta = 1) { const s = new Spring(value, k, zeta); this.map.set(name, s); return s; }
  get(name) { return this.map.get(name); }
  v(name) { return this.map.get(name).value; }
  step(dt) { let active = false; for (const s of this.map.values()) { s.step(dt); if (s.active) active = true; } return active; }
}

/** Línea de tiempo: eventos relativos al instante de arranque, avanzados por el bucle principal. */
export class Timeline {
  constructor() { this.items = []; this.t = 0; this.speed = 1; }
  clear() { this.items.length = 0; this.t = 0; }
  /** Programa `fn` a `at` segundos desde AHORA. */
  at(at, fn) { this.items.push({ t: this.t + at, fn, done: false }); return this; }
  get pending() { return this.items.some((i) => !i.done); }
  update(dt) {
    this.t += dt * this.speed;
    for (const it of this.items) if (!it.done && it.t <= this.t) { it.done = true; it.fn(); }
    if (this.items.length && this.items.every((i) => i.done)) this.items.length = 0;
  }
}
