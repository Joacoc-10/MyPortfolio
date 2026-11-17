// Contrato común entre la escena WebGL y el respaldo sin WebGL: el formulario solo habla con esta interfaz.
import type { FieldName, Phase } from "./scene";

export interface PortalDriver {
  readonly kind: "webgl" | "fallback";
  anchor?: HTMLElement;
  setFields(p: { name: number; email: number; message: number }, text: { name: string; email: string; message: string }, focus: string | null): void;
  typed(field: string): void;
  fieldDone(field: FieldName, rect?: DOMRect): void;
  invalid(): void;
  poke(): void;
  beginSend(): void;
  resolve(kind: "success" | "error"): void;
  reset(): void;
  setReducedMotion(on: boolean): void;
  relayout(): void;
  dispose(): void;
}

/** Respaldo sin WebGL 2: un sobre/portal CSS que recorre las mismas fases (el envío real no cambia). */
export class FallbackDriver implements PortalDriver {
  readonly kind = "fallback" as const;
  private timers: number[] = [];
  private phase: Phase = "idle";
  private queued: "success" | "error" | null = null;
  constructor(private onPhase: (p: Phase) => void) {}
  private at(ms: number, fn: () => void) { this.timers.push(window.setTimeout(fn, ms)); }
  private set(p: Phase) { this.phase = p; this.onPhase(p); }
  setFields() {}
  typed() {}
  fieldDone() {}
  invalid() {}
  poke() {}
  setReducedMotion() {}
  relayout() {}
  beginSend() {
    this.queued = null; this.set("compose");
    this.at(500, () => this.set("seal")); this.at(1000, () => this.set("portal"));
    this.at(1700, () => { this.set("ready"); if (this.queued) this.run(this.queued); });
  }
  resolve(kind: "success" | "error") { if (this.phase === "ready") this.run(kind); else this.queued = kind; }
  private run(kind: "success" | "error") {
    this.queued = null;
    if (kind === "success") { this.set("launch"); this.at(900, () => this.set("sent")); }
    else { this.set("reject"); this.at(500, () => this.set("error")); this.at(1200, () => this.set("recovered")); }
  }
  reset() { this.set("resetting"); this.at(500, () => this.set("idle")); }
  dispose() { this.timers.forEach(clearTimeout); this.timers.length = 0; }
}
