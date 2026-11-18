// Escena 3D de Message Portal: orquesta sobre, portal, partículas, luces y la coreografía de cada estado.
// Los estados (escribir → componer → sellar → portal → tránsito → éxito/error → reinicio) se expresan como
// cambios de objetivo en resortes + un puñado de eventos en una línea de tiempo; nunca como saltos de valor.
import * as THREE from "three";
import { Channels, Timeline, ease, clamp, lerp, smoothstep, rand } from "./motion";
import { makeShared, makeSlab, makeTick, LetterTexture, makeEnvironment, Shards, makeFloor, type LetterLabels, type Shared, type Slab } from "./parts";
import { Portal, makeRing } from "./portal";
import { Particles, type EmitOpts } from "./particles";
import type { PortalDriver } from "./driver";

const TAU = Math.PI * 2;
const PULSE: Record<string, string> = { back: "pulseName", pocL: "pulseEmail", pocR: "pulseEmail", pocB: "pulseEmail", flap: "pulseMsg", letter: "pulseMsg" };
const W = 2.4, H = 1.55, FH = 1.02;
const TEAL = new THREE.Color(0x2dd4bf), AMBER = new THREE.Color(0xff9a5c);
const TIERS = {
  high: { dpr: 2, particles: 900, shards: 30 },
  mid: { dpr: 1.5, particles: 620, shards: 22 },
  low: { dpr: 1, particles: 360, shards: 14 },
};

export function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch { return false; }
}

export type Tier = keyof typeof TIERS;
export type Phase = "idle" | "compose" | "seal" | "portal" | "ready" | "launch" | "cross" | "sent" | "reject" | "bounce" | "error" | "recovered" | "resetting";
export type FieldName = "name" | "email" | "message";
export interface SceneOptions {
  canvas: HTMLCanvasElement; stage: HTMLElement; anchor: HTMLElement; tier?: Tier; reduced?: boolean;
  labels: LetterLabels; onPhase?: (p: Phase) => void;
}
interface Beam { t: number; dur: number; a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; ch: string }
interface Part { src: string; s: number[]; r: number[]; node: THREE.Object3D; base: THREE.Vector3 }
type SealMesh = THREE.Group & { userData: { ring: THREE.Mesh; gem: THREE.Mesh; ring2: THREE.Mesh; m: THREE.MeshBasicMaterial } };

export class PortalScene implements PortalDriver {
  readonly kind = "webgl" as const;
  o: SceneOptions; stage: HTMLElement; anchor: HTMLElement; tierName: Tier; tier: (typeof TIERS)[Tier]; reduced: boolean; onPhase: (p: Phase) => void;
  disposed = false; raf = 0; last = 0; clock = 0; onscreen = true; tabVisible = !document.hidden; phase: Phase = "idle"; queued: "success" | "error" | null = null; pointerAt = -99;
  pointer = { x: 0, y: 0 }; fields = { name: 0, email: 0, message: 0 }; focusField: string | null = null;
  beams: Beam[] = []; listeners: (() => void)[] = []; frameTimes: number[] = []; flashShown = -1; trail = false; paused = false; lost = false; layoutDirty = false; behind = false;
  ready = false; scrollAt = -1e9; dprLevel = 0; slowWin = 0; fps = 60; cw = 1; ch = 1; f = 0.01; srect: DOMRect | null = null; spinBase = 0; pPhase = 0; spinPhase = 0; clockOn = true;
  tiltX = { x: 0, y: 0 };
  renderer: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera; scene: THREE.Scene; envRT?: THREE.WebGLRenderTarget;
  shared: Shared; C = new Channels(); tl = new Timeline();
  root = new THREE.Group(); tilt = new THREE.Group(); env = new THREE.Group(); halo = new THREE.Group(); hinge = new THREE.Group();
  floor!: ReturnType<typeof makeFloor>; key!: THREE.PointLight; rim!: THREE.PointLight; portalLight!: THREE.PointLight;
  letter!: LetterTexture; P!: Record<"back" | "pocL" | "pocR" | "pocB" | "flap" | "letter", Slab>; def!: Record<string, Part>;
  seal!: SealMesh; badge!: SealMesh; tick!: ReturnType<typeof makeTick>; shards!: Shards; portal!: Portal; particles!: Particles;
  haloA!: ReturnType<typeof makeRing>; haloB!: ReturnType<typeof makeRing>;
  ro!: ResizeObserver; io!: IntersectionObserver;
  constructor(o: SceneOptions) {
    this.o = o; this.stage = o.stage; this.anchor = o.anchor;
    this.tierName = o.tier ?? "high"; this.tier = TIERS[this.tierName];
    this.reduced = !!o.reduced; this.onPhase = o.onPhase || (() => {});

    const r = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: this.tierName !== "low", alpha: true, powerPreference: this.tierName === "high" ? "high-performance" : "default" });
    this.renderer = r;
    r.setClearColor(0x000000, 0); r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80); this.camera.position.set(0, 0.8, 11); this.camera.lookAt(0, 0, 0);
    this.scene = new THREE.Scene();
    this.shared = makeShared();
    this.buildChannels();
  }

  /** Construcción por etapas, cediendo el hilo entre ellas: ninguna tarea larga durante el scroll de la página. */
  async init() {
    const yieldNow = () => new Promise<void>((res) => setTimeout(res, 0));
    await yieldNow(); if (this.disposed) return;
    this.envRT = makeEnvironment(this.renderer); this.scene.environment = this.envRT.texture;
    await yieldNow(); if (this.disposed) return;
    this.buildWorld();
    await yieldNow(); if (this.disposed) return;
    this.bindEvents(); this.resize();
    await this.warmup();
  }

  /** Compila los shaders sin bloquear el hilo principal (compilación paralela) y dibuja el primer fotograma. */
  private async warmup() {
    const hidden: THREE.Object3D[] = [this.portal.group, this.badge, this.env];
    const was = hidden.map((o) => o.visible);
    hidden.forEach((o) => { o.visible = true; });
    try { await this.renderer.compileAsync(this.scene, this.camera); } catch { /* sin compilación paralela: se compilará en el primer render */ }
    hidden.forEach((o, i) => { o.visible = was[i]; });
    if (!this.disposed) { this.ready = true; this.drawOnce(); }
  }

  /* ---------- canales ---------- */
  buildChannels() {
    const C = this.C; // en reduced-motion todo es crítico y rápido
    const add = (n: string, v: number, k: number, ze: number) => C.add(n, v, k * (this.reduced ? 6 : 1), this.reduced ? 1 : ze);
    // progreso por campo (resortes algo elásticos: "se ensambla")
    add("pName", 0, 38, 0.72); add("pEmail", 0, 38, 0.72); add("pMsg", 0, 34, 0.72);
    add("build", 0, 60, 0.8);
    add("pulseName", -1, 1, 1); add("pulseEmail", -1, 1, 1); add("pulseMsg", -1, 1, 1);
    add("letterIn", 0, 50, 0.7); add("flap", 0, 80, 0.5); add("seal", 0, 170, 0.45);
    add("fold", 0, 36, 0.9); add("spin", 0, 18, 0.85); add("pitch", 0, 46, 0.72);
    add("rise", 0, 40, 0.8); add("fly", 0, 40, 1); add("pull", 0, 90, 0.7); add("stretch", 0, 60, 0.9);
    add("envScale", 1, 70, 0.6); add("wobble", 0, 60, 0.35); add("hover", 0, 20, 1);
    add("pOpen", 0, 34, 0.6); add("pScale", 0, 28, 0.58); add("pEnergy", 0, 24, 1); add("pSpeed", 0, 12, 1);
    add("pFlash", 0, 90, 0.85); add("amber", 0, 18, 1); add("unstable", 0, 40, 1); add("flow", 0, 16, 1);
    add("hot", 0, 30, 1); add("shake", 0, 140, 0.4); add("fov", 0, 80, 0.5); add("flash", 0, 120, 0.9);
    add("idle", 1, 14, 1); add("aim", 0, 14, 1); add("badge", 0, 120, 0.5); add("tick", 0, 70, 0.62); add("tickPulse", 0, 16, 1); add("gem", 1, 40, 1); add("breath", 0, 90, 0.6); add("light", 0.45, 30, 1);
    add("wave", -10, 1, 1); add("waveAmp", 0, 8, 1); add("done", 0, 12, 1);
    this.spinPhase = 0; this.pPhase = 0;
  }

  /* ---------- mundo 3D ---------- */
  buildWorld() {
    const S = this.shared, scene = this.scene;
    scene.add(this.root); this.root.add(this.tilt);
    this.floor = makeFloor(S); this.root.add(this.floor.mesh);

    // luces
    scene.add(new THREE.HemisphereLight(0x3a5a78, 0x05070b, 0.55));
    this.key = new THREE.PointLight(0xbffcf3, 40, 0, 2); this.key.position.set(2, 3.5, 5); scene.add(this.key);
    this.rim = new THREE.PointLight(0x2dd4bf, 10, 0, 2); this.rim.position.set(-4, 1, -2); scene.add(this.rim);
    this.portalLight = new THREE.PointLight(0x2dd4bf, 0, 0, 2); this.tilt.add(this.portalLight);

    // sobre
    this.letter = new LetterTexture(this.o.labels); this.tilt.add(this.env);
    const mk = (o: Parameters<typeof makeSlab>[1]) => makeSlab(S, o);
    const tri = (a: number[], b: number[], c: number[]) => [...a, ...b, ...c];
    const hw = W / 2, hh = H / 2;
    this.P = {
      back: mk({ w: W, h: H, color: 0x0a1f2c, opacity: 0.38 }),
      pocL: mk({ w: W, h: H, tri: tri([-hw, hh], [-hw, -hh], [-0.02, -0.04]), color: 0x0a1f2c, opacity: 0.34 }),
      pocR: mk({ w: W, h: H, tri: tri([hw, hh], [-0.02 + 0.04, -0.04], [hw, -hh]), color: 0x0a1f2c, opacity: 0.34 }),
      pocB: mk({ w: W, h: H, tri: tri([-hw, -hh], [-0.02, -0.04], [hw, -hh]), color: 0x0a1f2c, opacity: 0.34 }),
      flap: mk({ w: W, h: FH, tri: tri([-hw, FH / 2], [hw, FH / 2], [0, -FH / 2]), color: 0x0c2735, opacity: 0.4 }),
      letter: mk({ w: 2.06, h: 1.3, rad: 0.05, color: 0x0b1722, opacity: 0.92, map: this.letter.tex }),
    };
    const P = this.P;
    P.back.mesh.position.z = 0; P.letter.mesh.position.z = 0.04;
    for (const k of ["pocL", "pocR", "pocB"] as const) P[k].mesh.position.z = 0.078;
    this.hinge.position.set(0, hh, 0.125);
    P.flap.mesh.position.y = -FH / 2; this.hinge.add(P.flap.mesh);
    this.seal = this.makeSealMesh(0.1); this.seal.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.userData.ro = 10; }); this.seal.position.set(0, -FH + 0.06, 0.05); this.hinge.add(this.seal);
    this.env.add(P.back.mesh, P.letter.mesh, P.pocL.mesh, P.pocR.mesh, P.pocB.mesh, this.hinge);
    // definición de dispersión (cómo está "sin ensamblar") y a qué campo responde cada pieza
    this.def = {
      back: { src: "pName", s: [-0.35, 0.3, -1.0], r: [0.35, -0.5, 0.15], node: P.back.mesh, base: new THREE.Vector3() },
      pocL: { src: "pEmail", s: [-2.2, -0.5, 1.15], r: [0.25, 0.9, -0.5], node: P.pocL.mesh, base: new THREE.Vector3() },
      pocR: { src: "pEmail", s: [2.3, -0.75, 0.95], r: [-0.35, -1.0, 0.65], node: P.pocR.mesh, base: new THREE.Vector3() },
      pocB: { src: "pEmail", s: [0.3, -2.05, 1.45], r: [1.05, 0.25, 0.3], node: P.pocB.mesh, base: new THREE.Vector3() },
      flap: { src: "pMsg", s: [0.45, 1.95, 0.85], r: [-0.9, 0.3, 0.25], node: this.hinge, base: new THREE.Vector3() },
      letter: { src: "pMsg", s: [0.7, 0.55, 1.55], r: [0.3, -0.35, 0.14], node: P.letter.mesh, base: new THREE.Vector3() },
    };
    for (const d of Object.values(this.def)) d.base = d.node.position.clone();

    // halos orbitales (nombre)
    this.halo = new THREE.Group(); this.tilt.add(this.halo);
    this.haloA = makeRing(S, { radius: 2.05, width: 0.012, softness: 1, z: 0 }); this.haloB = makeRing(S, { radius: 2.4, width: 0.008, dashes: 40, dashDuty: 0.5, z: 0 });
    this.haloA.mesh.rotation.set(1.15, 0.3, 0); this.haloB.mesh.rotation.set(0.5, -0.7, 0.4);
    this.halo.add(this.haloA.mesh, this.haloB.mesh); this.haloB.mat.uniforms.uGain.value = 0.7;

    this.shards = new Shards(this.tier.shards); this.tilt.add(this.shards.mesh);
    this.badge = this.makeSealMesh(0.5); this.badge.position.set(0, 0.1, 0.2); this.tilt.add(this.badge); this.badge.visible = false;
    this.tick = makeTick(0.74, this.tierName === "low" ? 2 : 4); this.badge.add(this.tick.group);
    this.portal = new Portal(S); this.tilt.add(this.portal.group);
    this.particles = new Particles(this.tier.particles); this.tilt.add(this.particles.points);
  }

  makeSealMesh(r: number): SealMesh {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.5, 3.2, 2.9), toneMapped: false, transparent: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 8, 48), m);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(r * 0.46, 0), m);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r * 1.45, r * 0.035, 6, 64), m);
    g.add(ring, gem, ring2); g.userData = { ring, gem, ring2, m }; g.scale.setScalar(0.0001); g.renderOrder = 10;
    return g as SealMesh;
  }

  /* ---------- eventos / layout ---------- */
  bindEvents() {
    const on = (t: EventTarget, ev: string, fn: EventListener, opt?: AddEventListenerOptions) => { t.addEventListener(ev, fn, opt); this.listeners.push(() => t.removeEventListener(ev, fn, opt)); };
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.stage);
    this.io = new IntersectionObserver((e) => { this.onscreen = e[e.length - 1].isIntersecting; this.wake(); }, { threshold: 0 }); this.io.observe(this.stage);
    on(document, "visibilitychange", () => { this.tabVisible = !document.hidden; if (this.tabVisible) { this.last = 0; this.wake(); } });
    on(window, "pointermove", (e) => this.setPointer((e as PointerEvent).clientX, (e as PointerEvent).clientY), { passive: true });
    on(window, "scroll", () => { this.layoutDirty = true; this.scrollAt = performance.now(); this.wake(); }, { passive: true });
    on(this.o.canvas, "webglcontextlost", (e) => { e.preventDefault(); this.lost = true; });
    on(this.o.canvas, "webglcontextrestored", () => { this.lost = false; this.wake(); });
  }

  /** DPR efectivo: tope del nivel (high 2 · mid 1.5 · low 1) limitado por el de la pantalla y por el gobernador de fluidez
   *  (cada escalón reduce un 20 %, sin bajar de 1). Un iPhone (DPR 3) nunca renderiza a 3: el canvas es pequeño y se escala. */
  curDpr() { return Math.max(1, Math.min(window.devicePixelRatio || 1, this.tier.dpr) * Math.pow(0.8, this.dprLevel)); }

  resize() {
    if (this.disposed) return;
    const rect = this.stage.getBoundingClientRect(); this.cw = Math.max(1, rect.width); this.ch = Math.max(1, rect.height);
    const dpr = this.curDpr();
    this.renderer.setPixelRatio(dpr); this.renderer.setSize(this.cw, this.ch, false);
    this.camera.aspect = this.cw / this.ch; this.camera.updateProjectionMatrix();
    this.particles.setPx(dpr * (this.ch > 500 ? 1.0 : 0.85) * 1.15); this.portal.setPx(dpr * 1.1);
    this.layoutDirty = true; this.layout();
    if (this.ready) this.renderer.render(this.scene, this.camera); // evita un fotograma en blanco al cambiar de tamaño
    this.wake();
  }
  layout() {
    this.layoutDirty = false;
    const sr = this.stage.getBoundingClientRect(), ar = this.anchor.getBoundingClientRect();
    this.cw = sr.width; this.ch = sr.height;
    const D = this.camera.position.z, fov = THREE.MathUtils.degToRad(this.camera.fov);
    const f = (2 * D * Math.tan(fov / 2)) / this.ch; // unidades de mundo por píxel en z=0
    const cx = ar.left + ar.width / 2 - (sr.left + sr.width / 2), cy = ar.top + ar.height / 2 - (sr.top + sr.height / 2);
    const compact = ar.width < 700 || ar.height < 420, mobileK = this.anchor === this.stage ? 0.82 : 1, s = mobileK * Math.min((ar.width * f) / (compact ? 5.9 : 4.8), (ar.height * f) / (compact ? 4.7 : 3.9));
    this.root.scale.setScalar(Math.max(0.05, s)); this.root.position.set(cx * f, -cy * f, 0);
    this.root.rotation.y = -Math.atan2(cx * f, D) * 0.55;
    this.srect = sr; this.f = f;
  }
  setPointer(x: number, y: number) {
    const ar = this.anchor.getBoundingClientRect();
    this.pointer.x = clamp((x - (ar.left + ar.width / 2)) / (window.innerWidth * 0.5), -1, 1);
    this.pointer.y = clamp((y - (ar.top + ar.height / 2)) / (window.innerHeight * 0.5), -1, 1);
    this.pointerAt = this.clock; this.wake();
  }
  /** Convierte un punto de pantalla a coordenadas locales de `tilt` (plano z≈0.4). */
  screenToLocal(px: number, py: number) {
    const sr = this.srect || this.stage.getBoundingClientRect();
    const x = clamp(px, sr.left + 8, sr.right - 8), y = clamp(py, sr.top + 8, sr.bottom - 8);
    const v = new THREE.Vector3(((x - sr.left) / sr.width) * 2 - 1, -(((y - sr.top) / sr.height) * 2 - 1), 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize(), t = (0.4 - this.camera.position.z) / dir.z;
    const w = this.camera.position.clone().add(dir.multiplyScalar(t));
    this.root.updateMatrixWorld(true); return this.tilt.worldToLocal(w);
  }

  /* ---------- API pública ---------- */
  /** Progreso de los campos (0..1 cada uno) y texto vivo para la carta. */
  setFields(p: { name: number; email: number; message: number }, text: { name: string; email: string; message: string }, focus: string | null) {
    const old = this.fields; this.fields = p; this.focusField = focus;
    this.C.get("pName").set(p.name); this.C.get("pEmail").set(p.email); this.C.get("pMsg").set(p.message);
    this.letter.set({ ...text, caret: focus === "message" });
    this.wake();
    void old;
  }
  /** Pulso sutil al teclear: chispa en la carta y respiración del cristal. */
  typed(field: string) {
    if (this.reduced || (this.phase !== "idle" && this.phase !== "recovered")) return;
    this.C.get("breath").kick(5);
    if (field === "message") { const x = rand(-0.9, 0.9), y = rand(-0.2, 0.5); this.pEmit(x, y, 0.2, rand(-0.2, 0.2), rand(0.1, 0.5), rand(0.1, 0.3), { life: 0.9, size: 5, color: 0x6ee7d6, drag: 1.6 }); }
    this.wake();
  }
  /** Un campo se completó: rayo de luz desde el campo hasta su pieza y barrido de trazo. */
  fieldDone(field: FieldName, rect?: DOMRect) {
    const map: Record<FieldName, [string, number[]]> = { name: ["pulseName", [0, 0.0, 0.1]], email: ["pulseEmail", [0, -0.5, 0.15]], message: ["pulseMsg", [0, 0.35, 0.1]] };
    const [ch, target] = map[field];
    const pc = this.C.get(ch);
    if (this.reduced) { pc.snap(-1); this.wake(); return; }
    const start = rect ? this.screenToLocal(rect.right - 20, rect.top + rect.height / 2) : new THREE.Vector3(-4, 0, 0.4);
    const to = new THREE.Vector3(target[0], target[1], target[2]);
    const ctrl = start.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.9, 0.9));
    this.beams.push({ t: 0, dur: 0.7, a: start, b: ctrl, c: to, ch });
    this.wake();
  }

  /** Toque táctil sobre la escena: pulso de luz sin interferir con el scroll. */
  poke() { if (this.reduced) return; this.C.get("breath").kick(7); this.C.get("shake").kick(1.5); this.pBurst(18, 0, 0.1, 0.3, 1.4, { life: 0.9, size: 6, color: 0x9ff7ea, drag: 2 }); const w = this.C.get("wave"); w.snap(3); w.tween(-8, 1.2, ease.outCubic); this.C.get("waveAmp").set(0.7); this.wake(); }
  /** Envío con campos inválidos: un parpadeo ámbar discreto en el objeto. */
  invalid() { if (this.reduced) return; this.C.get("shake").kick(2.5); this.C.get("amber").snap(0.8); this.C.get("amber").set(0, 6, 1); this.wake(); }

  beginSend() {
    if (this.phase !== "idle" && this.phase !== "recovered") return;
    this.tl.clear(); this.queued = null; const C = this.C, tl = this.tl;
    this.setPhase("compose");
    if (this.reduced) return this.sendReduced();
    // 1 · componer: todo encaja, las esquirlas se absorben
    C.get("build").set(1); C.get("aim").set(1); C.get("idle").set(0.35); C.get("hot").set(0.55); C.get("light").set(1);
    for (const ch of ["pulseName", "pulseEmail", "pulseMsg"]) { const c = C.get(ch); c.snap(0); c.tween(1.2, 0.95, ease.inOutSine); }
    this.shards.p.forEach((p, i) => { if (i % 2 === 0) this.pEmit(Math.cos(p.a) * p.r * 0.8, p.y, Math.sin(p.a) * p.r * 0.6, 0, 0, 0, { life: 0.8, size: 7, pull: [0, 0, 0.1], pullK: 9, drag: 2.4, color: 0x6ee7d6 }); });
    C.get("waveAmp").set(1); C.get("wave").snap(3); C.get("wave").tween(-8, 1.6, ease.inOutCubic);
    // 2 · la carta entra, la solapa se cierra y el sello se enciende
    tl.at(0.6, () => { C.get("letterIn").set(1); C.get("hot").set(0.25); });
    tl.at(1.0, () => { C.get("flap").set(1); });
    tl.at(1.12, () => { C.get("seal").set(1); this.setPhase("seal"); const v = this.sealWorldLocal(); this.pBurst(36, v.x, v.y, v.z, 2.6, { life: 0.9, size: 7, color: 0xbafff4 }); C.get("breath").kick(6); C.get("shake").kick(2.5); });
    // 3 · portal: se abre detrás, el sobre se pliega, gira y se eleva
    tl.at(1.45, () => {
      this.setPhase("portal"); C.get("pOpen").set(1.0); C.get("pScale").set(1); C.get("pEnergy").set(0.55); C.get("flow").set(0.5);
      C.get("pSpeed").set(1.2); C.get("pFlash").snap(0.9); C.get("pFlash").set(0); C.get("fov").kick(10); C.get("shake").kick(3); C.get("light").set(1.5);
      C.get("wave").snap(-7); C.get("wave").tween(1, 1.1, ease.outCubic);
    });
    tl.at(1.75, () => { C.get("fold").set(1); this.spinBase = C.v("spin"); C.get("spin").set(this.spinBase + TAU * 1.0, 16, 0.82); C.get("rise").set(0.55); C.get("hot").set(0); });
    tl.at(2.5, () => { C.get("pitch").set(-1.12); C.get("pull").set(0.75, 30, 0.8); C.get("envScale").set(1.12, 40, 0.8); C.get("rise").set(0.25); });
    tl.at(3.1, () => { this.setPhase("ready"); C.get("hover").set(1); C.get("pEnergy").set(0.85); C.get("flow").set(0.75); if (this.queued) { const q = this.queued; this.queued = null; this.runResult(q); } });
    this.wake();
  }
  sendReduced() {
    const C = this.C, tl = this.tl;
    for (const [k, v] of [["build", 1], ["letterIn", 1], ["flap", 1], ["seal", 1], ["pOpen", 1], ["pScale", 1], ["pEnergy", 0.6], ["light", 1]] as [string, number][]) C.get(k).set(v);
    C.get("idle").set(0);
    tl.at(0.5, () => { this.setPhase("ready"); if (this.queued) { const q = this.queued; this.queued = null; this.runResult(q); } });
    this.wake();
  }
  /** Llega el resultado de la "red". Nunca confirma éxito antes de que la secuencia esté en tránsito. */
  resolve(kind: "success" | "error") {
    if (this.phase === "ready") this.runResult(kind); else if (this.phase === "compose" || this.phase === "seal" || this.phase === "portal") this.queued = kind;
  }
  runResult(kind: "success" | "error") { if (kind === "success") this.success(); else this.error(); }

  success() {
    const C = this.C, tl = this.tl; tl.clear(); this.setPhase("launch");
    if (this.reduced) {
      C.get("envScale").set(0); C.get("pOpen").set(0); C.get("pScale").set(0); C.get("badge").set(1); C.get("gem").snap(0); C.get("tick").snap(1);
      tl.at(0.3, () => { this.setPhase("sent"); this.badge.visible = true; });
      return this.wake();
    }
    C.get("hover").set(0); C.get("pull").set(1.35, 70, 0.7); C.get("fov").set(0.5); C.get("hot").set(0.6); C.get("pEnergy").set(1.2); C.get("flow").set(1.4); C.get("pSpeed").set(4);
    tl.at(0.24, () => { this.trail = true; C.get("fly").tween(-6.8, 1.0, ease.inCubic); C.get("pull").set(0.0, 40, 1); C.get("stretch").set(0.7, 22, 1); C.get("fov").set(-1.2, 40, 1); });
    // cruce del plano del portal (≈ z = -2.7)
    tl.at(0.24 + 0.74, () => {
      this.setPhase("cross"); C.get("pFlash").snap(1.4); C.get("pFlash").set(0, 55, 1); C.get("shake").kick(6); C.get("fov").kick(24); C.get("flash").snap(0.6); C.get("flash").set(0, 30, 1);
      this.pRing(150, -2.7, 4.4, 0xbafff4); this.pBurst(70, 0, 0.05, -2.5, 3.2, { life: 1.3, size: 8, color: 0x7ef2e2, drag: 1.4 });
      for (let i = 0; i < 90; i++) this.pEmit(rand(-0.25, 0.25), rand(-0.25, 0.25), -2.8, rand(-0.7, 0.7), rand(-0.7, 0.7), rand(-9, -4), { life: rand(0.8, 1.6), size: rand(5, 11), color: 0xbafff4, drag: 0.8 });
      C.get("wave").snap(-1); C.get("wave").tween(-12, 1.0, ease.outCubic); C.get("waveAmp").set(1.6); C.get("envScale").set(0.0, 90, 1);
    });
    // el portal se contrae
    tl.at(1.75, () => { C.get("pScale").tween(0, 0.62, ease.inCubic); C.get("pSpeed").set(9); C.get("pEnergy").set(1.6); C.get("flow").set(0); C.get("unstable").set(0); C.get("hot").set(0); });
    tl.at(2.4, () => { C.get("pOpen").snap(0); C.get("pFlash").snap(0.8); C.get("pFlash").set(0); this.pBurst(40, 0, 0.1, -2.7, 2.2, { life: 0.8, size: 6, color: 0x9ff7ea }); C.get("shake").kick(2); });
    // la escena se estabiliza + confirmación
    tl.at(2.15, () => { this.trail = false; this.env.visible = false; this.badge.visible = true; C.get("badge").set(1); C.get("aim").set(0); C.get("light").set(0.8); C.get("done").set(1); C.get("pSpeed").set(0.8); this.setPhase("sent"); });
    // el rombo se transforma en el tick 3D (solo tras éxito confirmado) y emite un pulso suave
    tl.at(2.15 + 0.5, () => { C.get("gem").tween(0, 0.35, ease.inCubic); C.get("tick").set(1); });
    tl.at(2.15 + 0.85, () => { C.get("tickPulse").snap(1); C.get("tickPulse").set(0); this.pBurst(14, 0, 0.1, 0.25, 0.9, { life: 0.9, size: 5, color: 0x9ff7ea, drag: 2 }); });
    tl.at(2.8, () => { C.get("pEnergy").set(0.0); this.clearEnvChannels(); });
    this.wake();
  }

  error() {
    const C = this.C, tl = this.tl; tl.clear(); this.setPhase("reject");
    if (this.reduced) {
      C.get("amber").set(1); C.get("pOpen").set(0); C.get("pScale").set(0); C.get("flap").set(0); C.get("letterIn").set(0); C.get("seal").set(0); C.get("build").set(0); C.get("idle").set(1);
      tl.at(0.15, () => this.setPhase("error"));
      tl.at(0.6, () => { this.setPhase("recovered"); C.get("amber").set(0); });
      return this.wake();
    }
    C.get("hover").set(0); C.get("pull").set(1.4, 70, 0.7); C.get("pEnergy").set(1.1); C.get("unstable").set(1); C.get("amber").set(1, 24, 1); C.get("hot").set(0.2);
    tl.at(0.25, () => { C.get("pull").set(0, 40, 1); C.get("fly").tween(-2.15, 0.5, ease.inCubic); C.get("stretch").set(0.45); C.get("flow").set(0.2); });
    tl.at(0.71, () => {
      this.setPhase("bounce");
      const f = C.get("fly"); f.snap(f.value); f.set(0, 26, 0.4); f.kick(9);
      C.get("stretch").set(0, 50, 0.6); C.get("wobble").kick(7); C.get("shake").kick(9); C.get("fov").kick(-14);
      C.get("pFlash").snap(0.9); C.get("pFlash").set(0, 70, 1); C.get("flash").snap(0.35); C.get("flash").set(0, 24, 1);
      this.pRing(90, -2.5, 3.2, 0xffa070);
      this.pBurst(60, 0, 0, -1.9, 4.2, { life: 1.1, size: 8, color: 0xff9a5c, drag: 1.6, grav: 1.2 });
      C.get("wave").snap(-4); C.get("wave").tween(3, 0.8, ease.outCubic); C.get("waveAmp").set(1.2);
    });
    tl.at(1.05, () => { C.get("pScale").tween(0, 0.7, ease.inCubic); C.get("pSpeed").set(-4); C.get("pEnergy").set(0); });
    tl.at(1.1, () => { this.setPhase("error"); });
    tl.at(1.5, () => { C.get("envScale").set(1, 40, 0.8); C.get("pOpen").snap(0); C.get("fold").set(0); C.get("pitch").set(0); C.get("rise").set(0); C.get("spin").set(this.spinBase ?? 0, 20, 0.9); C.get("flow").set(0); });
    tl.at(2.15, () => { C.get("flap").set(0, 60, 0.55); C.get("letterIn").set(0, 40, 0.7); C.get("seal").set(0); C.get("build").set(0); C.get("idle").set(1); C.get("hot").set(0); C.get("light").set(0.5); });
    tl.at(2.7, () => { C.get("amber").set(0, 4, 1); C.get("unstable").set(0); C.get("pSpeed").set(0); C.get("aim").set(0); this.setPhase("recovered"); });
    this.wake();
  }

  /** Vuelve del estado "enviado" al formulario: el sobre resurge de las partículas. */
  reset() {
    this.tl.clear(); const C = this.C; this.setPhase("resetting"); this.queued = null; this.trail = false;
    this.clearEnvChannels(true); this.env.visible = true; this.badge.visible = true;
    C.get("badge").set(0); C.get("tick").set(0, 120, 1); C.get("tickPulse").snap(0); C.get("gem").snap(0); C.get("done").set(0); C.get("idle").set(1); C.get("light").set(0.45); C.get("amber").snap(0); C.get("hot").set(0);
    C.get("pName").snap(0); C.get("pEmail").snap(0); C.get("pMsg").snap(0); C.get("build").snap(0);
    if (this.reduced) { C.get("envScale").snap(1); C.get("tick").snap(0); C.get("gem").snap(1); this.badge.visible = false; this.tl.at(0.2, () => this.setPhase("idle")); return this.wake(); }
    C.get("envScale").snap(0); C.get("envScale").set(1, 46, 0.5);
    for (let i = 0; i < 110; i++) { const a = rand(0, TAU), r = rand(2.4, 3.4); this.pEmit(Math.cos(a) * r, rand(-1.4, 1.4), Math.sin(a) * r * 0.5, 0, 0, 0, { life: rand(0.8, 1.3), size: rand(5, 10), pull: [0, 0, 0.1], pullK: rand(7, 12), drag: 3, color: 0x7ef2e2 }); }
    C.get("wave").snap(4); C.get("wave").tween(-10, 1.4, ease.outCubic); C.get("waveAmp").set(1);
    C.get("shake").kick(2); C.get("breath").kick(5);
    this.tl.at(1.0, () => { this.badge.visible = false; C.get("tick").snap(0); C.get("gem").snap(1); this.setPhase("idle"); });
    this.wake();
  }
  clearEnvChannels(snap = false) {
    const C = this.C, z = ["letterIn", "flap", "seal", "fold", "pitch", "rise", "fly", "pull", "stretch", "wobble", "hover", "pOpen", "pScale", "unstable", "flow", "pFlash", "pSpeed", "pEnergy"];
    for (const k of z) { const c = C.get(k); c.snap(0); }
    C.get("spin").snap(0); this.spinBase = 0; this.spinPhase = 0;
    if (snap) C.get("envScale").snap(0);
  }
  setPhase(p: Phase) { this.phase = p; this.onPhase(p); }

  /* ---------- helpers de partículas (coordenadas locales de tilt) ---------- */
  pEmit(x: number, y: number, z: number, vx: number, vy: number, vz: number, o?: EmitOpts) { this.particles.emit(x, y, z, vx, vy, vz, o); }
  pBurst(n: number, x: number, y: number, z: number, speed: number, o?: EmitOpts) { this.particles.burst(n, x, y, z, speed, o); }
  pRing(n: number, z: number, speed: number, color: number) {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rand(-0.03, 0.03); this.pEmit(Math.cos(a) * 1.3, Math.sin(a) * 1.3 + 0.1, z, Math.cos(a) * speed * rand(0.8, 1.1), Math.sin(a) * speed * rand(0.8, 1.1), rand(-1, 1), { life: rand(0.7, 1.2), size: rand(5, 9), drag: 2.2, color }); }
  }
  sealWorldLocal() { const v = new THREE.Vector3(); this.seal.getWorldPosition(v); return this.tilt.worldToLocal(v); }

  /* ---------- bucle ---------- */
  get seqActive() { return this.phase !== "idle" && this.phase !== "recovered" && this.phase !== "sent" || this.tl.pending || this.particles.alive > 0 || this.beams.length > 0; }
  wake() { if (!this.raf && !this.disposed && this.tabVisible && !this.paused) this.raf = requestAnimationFrame((t) => this.frame(t)); }
  drawOnce() { this.update(0.016, 0); this.renderer.render(this.scene, this.camera); }

  frame(now: number) {
    this.raf = 0; if (this.disposed) return;
    if (!this.last) this.last = now;
    if (this.lost) return;
    const seq = this.seqActive, run = this.onscreen || seq;
    if (!run) { this.last = 0; return; }
    // Tope de fotogramas. En pantallas ProMotion (120 Hz) rAF llega cada ~8 ms: se renderiza como mucho a ~60 fps (la escena
    // avanza por tiempo, no por fotograma: mismo movimiento con la mitad de trabajo de GPU). Además, en reposo (flotado ambiente)
    // y mientras la página se desplaza, ~30 fps: el compositor ya está ocupado con el scroll y ese movimiento es lentísimo.
    const throttled = !seq && now - this.scrollAt < 180;
    const minGap = throttled ? 30 : 15;
    if (now - this.last < minGap) { this.raf = requestAnimationFrame((t) => this.frame(t)); return; }
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    const active = this.update(dt, now);
    this.fps = (this.fps || 60) * 0.92 + (1 / Math.max(dt, 0.001)) * 0.08;
    this.renderer.render(this.scene, this.camera);
    this.adaptQuality(dt, throttled);
    // modo "reducido": solo se anima mientras algo se mueve. En modo normal, el flotado continuo mantiene el bucle.
    if (!this.reduced || active || this.seqActive) this.raf = requestAnimationFrame((t) => this.frame(t)); else this.last = 0;
  }

  /** Gobernador de resolución: si los fotogramas a ritmo completo no bajan de ~54 fps de media (dos ventanas seguidas) se reduce el DPR un 20 %.
   *  Solo reduce (sin oscilar) y solo mide fotogramas no limitados, así que un tope de 30 fps o un monitor de 120 Hz no lo disparan. */
  adaptQuality(dt: number, throttled: boolean) {
    if (this.reduced || throttled || this.dprLevel >= 3 || this.curDpr() <= 1) { this.frameTimes.length = 0; return; }
    this.frameTimes.push(dt); if (this.frameTimes.length < 45) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length; this.frameTimes.length = 0;
    this.slowWin = avg > 0.0185 ? this.slowWin + 1 : 0;
    if (this.slowWin >= 2) { this.slowWin = 0; this.dprLevel++; this.resize(); this.stage.dataset.dpr = this.curDpr().toFixed(2); }
  }

  update(dt: number, now: number) {
    const C = this.C, v = (n: string) => C.v(n), t = this.clock += this.reduced ? 0 : dt;
    this.tl.update(dt);
    const moving = C.step(dt);
    if (this.layoutDirty) this.layout();
    const S = this.shared;
    S.uTime.value = t;
    this.letter.tick(now || 0);

    // tinte (turquesa ↔ ámbar) y luces
    const amber = clamp(v("amber"), 0, 1);
    S.uTint.value.copy(TEAL).lerp(AMBER, amber); S.uHot.value = clamp(v("hot"), 0, 1);
    const L = v("light");
    this.key.intensity = 28 + L * 26 + v("breath") * 20; this.key.color.copy(S.uTint.value).lerp(new THREE.Color(0xffffff), 0.55);
    this.rim.color.copy(S.uTint.value); this.rim.intensity = 6 + L * 14;
    this.portalLight.intensity = clamp(v("pOpen"), 0, 1) * clamp(v("pScale"), 0, 1.1) * (26 + v("pEnergy") * 30 + v("pFlash") * 120); this.portalLight.color.copy(S.uTint.value);
    this.portalLight.position.set(0, 0.1, -2.2);

    // puntero → inclinación + luz que sigue al cursor
    let px = this.pointer.x, py = this.pointer.y;
    const idle = this.reduced ? 0 : v("idle");
    if (!this.reduced && t - this.pointerAt > 2.2) { px = Math.sin(t * 0.33) * 0.5; py = Math.cos(t * 0.27) * 0.3; }
    this.tiltX = this.tiltX ?? { x: 0, y: 0 };
    const k = 1 - Math.exp(-dt * 5);
    this.tiltX.x += ((this.reduced ? 0 : px) - this.tiltX.x) * k; this.tiltX.y += ((this.reduced ? 0 : py) - this.tiltX.y) * k;
    const tg = 1 - 0.85 * clamp(v("aim"), 0, 1);
    this.tilt.rotation.y = this.tiltX.x * 0.42 * tg; this.tilt.rotation.x = this.tiltX.y * 0.2 * tg;
    this.key.position.set(this.tiltX.x * 5 + 1, -this.tiltX.y * 3 + 3.2, 5.5);

    // progreso de las piezas
    const a = (n: string) => clamp(v(n), 0, 1.15), build = clamp(v("build"), 0, 1);
    const prog: Record<string, number> = { pName: Math.max(a("pName"), build), pEmail: Math.max(a("pEmail"), build), pMsg: Math.max(a("pMsg"), build) };
    const sum = (prog.pName + prog.pEmail + prog.pMsg) / 3, assemble = clamp(sum, 0, 1);
    for (const [name, d] of Object.entries(this.def)) {
      const m = clamp(prog[d.src], 0, 1.12), me = m;
      const mc = clamp(m, 0, 1), sc = (1 - mc) * 0.78;
      const fl = idle * Math.sin(t * 0.9 + d.s[0] * 2) * 0.05 * sc;
      d.node.position.set(d.base.x + d.s[0] * sc, d.base.y + d.s[1] * sc + fl, d.base.z + d.s[2] * sc);
      d.node.rotation.set(d.r[0] * sc + (name === "flap" ? (1 - clamp(v("flap"), 0, 1.05)) * Math.PI * 0.93 : 0) , d.r[1] * sc, d.r[2] * sc);
      if (name === "letter") {
        const li = v("letterIn"); d.node.position.y += lerp(0.78, 0, li) * (0.35 + 0.65 * mc) ; d.node.position.z += lerp(0.1, 0, li);
      }
      const mat = this.P[name as keyof typeof this.P], ghost = 0.3 + 0.7 * smoothstep(0.0, 0.9, me);
      mat.mat.opacity = (name === "letter" ? 0.92 : 0.36) * ghost;
      mat.u.uProg.value = 0.24 + 0.84 * clamp(me, 0, 1.0);
      mat.u.uGlow.value = (1.0 + 0.35 * me + this.glowBoost(name)) * (1 + v("hot") * 0.8);
      mat.u.uBreath.value = v("breath");
      const pc = v(PULSE[name] ?? "pulseName");
      mat.u.uPulse.value = pc > 1.15 ? -1 : pc;
    }
    // halo (nombre)
    const pn = clamp(prog.pName, 0, 1);
    for (const [h, sp] of [[this.haloA, 0.12], [this.haloB, -0.07]] as [ReturnType<typeof makeRing>, number][]) { const u = h.mat.uniforms; u.uProg.value = pn >= 0.995 ? 1 : pn * 1.02; u.uAlpha.value = (0.25 + 0.75 * pn + v("done") * 0.2) * (h === this.haloB ? 0.5 : 1); u.uRot.value = t * sp; u.uAmber.value = amber; u.uGain.value = 1 + v("hot") * 1.5 + v("pFlash"); }
    this.halo.visible = pn > 0.01 || v("done") > 0.1;
    this.halo.scale.setScalar(1 + (1 - v("envScale")) * 0.0); this.halo.rotation.y = t * 0.05;

    // seal
    const sl = clamp(v("seal"), 0, 1.3); this.seal.scale.setScalar(Math.max(0.0001, sl)); this.seal.rotation.z = t * 1.2; this.seal.userData.m.opacity = 1;
    this.seal.userData.gem.rotation.y = t * 2;
    const bd = v("badge"); this.badge.scale.setScalar(Math.max(0.0001, bd) * (1 + Math.sin(t * 1.6) * 0.03));
    this.badge.rotation.y = t * 0.6; this.badge.userData.gem.rotation.x = t * 1.3; this.badge.userData.ring2.rotation.x = t * 0.4;
    this.badge.position.y = 0.1 + Math.sin(t * 1.1) * 0.06;
    const tk = v("tick"), tp = clamp(v("tickPulse"), 0, 1.2), tkm = this.tick;
    tkm.group.visible = tk > 0.002; tkm.group.scale.setScalar(Math.max(0.0001, tk));
    tkm.group.rotation.y = -this.badge.rotation.y + Math.sin(t * 0.7) * 0.5 - (1 - clamp(tk, 0, 1)) * 1.4; // siempre de frente (balanceo suave) y se desenrolla al aparecer
    tkm.group.rotation.z = -0.08;
    tkm.mat.opacity = clamp(tk * 1.4, 0, 1); tkm.mat.emissiveIntensity = 1.25 + tp * 2.2;
    tkm.glowMat.opacity = clamp(tk, 0, 1) * (0.28 + tp * 0.45);
    this.badge.userData.ring2.scale.setScalar(1 + tp * 0.1);
    this.badge.userData.gem.scale.setScalar(Math.max(0.0001, v("gem")));

    // sobre
    const hov = v("hover"), env = this.env;
    const stretch = v("stretch");
    env.position.set(0, v("rise") + idle * Math.sin(t * 0.8) * 0.07 * 0.0 + hov * Math.sin(t * 1.7) * 0.05, v("fly") + v("pull") + hov * Math.sin(t * 1.3) * 0.06);
    const flo = idle * (0.5 + 0.5 * assemble);
    env.position.y += flo * Math.sin(t * 0.8) * 0.09; env.rotation.set(v("pitch") + hov * Math.sin(t * 1.1) * 0.03 + flo * Math.sin(t * 0.55) * 0.035, v("spin"), v("wobble") * 0.14 + hov * Math.sin(t * 0.9) * 0.05 + flo * Math.sin(t * 0.63) * 0.03);
    const es = Math.max(0.0001, v("envScale"));
    env.scale.set(es * (1 - stretch * 0.28), es * (1 + stretch * 0.9), es * (1 - stretch * 0.1));
    this.env.visible = es > 0.003 && !this.envHidden();
    const behind = env.position.z < -2.55; if (behind !== this.behind) { this.behind = behind; env.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.renderOrder = behind ? 3.5 : (o.userData.ro ?? 8); }); }
    S.uFold.value = clamp(v("fold"), 0, 1.1);

    // propagar matrices al shader de plegado
    this.root.updateMatrixWorld(true);
    S.uEnv.value.copy(env.matrixWorld); S.uEnvInv.value.copy(env.matrixWorld).invert();

    // portal
    this.pPhase += v("pSpeed") * dt; // integra la velocidad de giro
    this.portal.apply({ open: v("pOpen"), scale: v("pScale"), energy: clamp(v("pEnergy"), 0, 1.6) + (this.reduced ? 0 : Math.sin(t * 2.2) * 0.06 * clamp(v("pOpen"), 0, 1)), spin: this.pPhase, flash: Math.max(0, v("pFlash")), amber, unstable: clamp(v("unstable"), 0, 1), flow: this.reduced ? 0 : v("flow") });
    const pg = this.portal.group; pg.rotation.set(-this.tiltX.y * 0.15, this.tiltX.x * 0.2, 0);

    // suelo
    const fu = this.floor.mat.uniforms; fu.uFlow.value = clamp(v("flow"), 0, 1.5) * 0.6 + (this.phase === "launch" || this.phase === "cross" ? 0.7 : 0); fu.uWave.value = v("wave"); fu.uAmp.value = clamp(v("waveAmp"), 0, 2) * (v("waveAmp") > 0.01 ? 1 : 0);
    fu.uOpen.value = clamp(v("pOpen"), 0, 1);
    if (v("waveAmp") > 0.01 && Math.abs(v("wave")) > 9.9) C.get("waveAmp").set(0);

    // partículas: estela del sobre y rayos de luz
    if (!this.reduced) {
      if (this.trail) {
        const p = new THREE.Vector3(env.position.x, env.position.y, env.position.z);
        for (let i = 0; i < 9; i++) this.pEmit(p.x + rand(-0.5, 0.5), p.y + rand(-0.15, 0.15), p.z + rand(-0.3, 0.9), rand(-0.4, 0.4), rand(-0.4, 0.4), rand(1.5, 5), { life: rand(0.6, 1.2), size: rand(7, 15), drag: 1.5, color: i % 3 ? 0x6ee7d6 : 0xe9fffb });
      }
      this.updateBeams(dt);
      this.shards.update(t, this.phase === "sent" ? Math.min(0.55, assemble) : assemble, v("spin") * 0.0 + (this.phase === "portal" || this.phase === "ready" ? 1 : 0));
    } else this.shards.update(0, assemble, 0);
    if (this.particles.n) this.particles.update(dt);

    // cámara
    const sh = v("shake");
    this.camera.position.set(Math.sin(t * 37) * sh * 0.02 + this.tiltX.x * 0.0, 0.8 + Math.cos(t * 43) * sh * 0.02, 11 + 0);
    this.camera.fov = 30 + v("fov") * 0.35; this.camera.updateProjectionMatrix(); this.camera.lookAt(0, 0, 0);
    const fl = clamp(v("flash"), 0, 1);
    if (Math.abs(fl - this.flashShown) > 0.004) { this.flashShown = fl; this.stage.style.setProperty("--flash", fl.toFixed(3)); this.stage.toggleAttribute("data-flash", fl > 0.004); }

    return moving;
  }
  envHidden() { return this.phase === "sent" && this.C.v("envScale") < 0.01; }
  glowBoost(name: string) { return name === "letter" ? 0.0 : 0.0; }

  updateBeams(dt: number) {
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i]; b.t += dt; const u = clamp(b.t / b.dur), e = ease.inOutSine(u);
      const x = (1 - e) * (1 - e) * b.a.x + 2 * (1 - e) * e * b.b.x + e * e * b.c.x, y = (1 - e) * (1 - e) * b.a.y + 2 * (1 - e) * e * b.b.y + e * e * b.c.y, z = (1 - e) * (1 - e) * b.a.z + 2 * (1 - e) * e * b.b.z + e * e * b.c.z;
      this.pEmit(x, y, z, 0, 0, 0, { life: 0.12, size: 17, color: 0xe9fffb, drag: 4 });
      for (let k = 0; k < 3; k++) this.pEmit(x + rand(-0.04, 0.04), y + rand(-0.04, 0.04), z, rand(-0.25, 0.25), rand(-0.25, 0.25), rand(-0.1, 0.1), { life: rand(0.35, 0.8), size: rand(4, 8), drag: 2, color: 0x2dd4bf });
      if (u >= 1) {
        this.beams.splice(i, 1);
        const c = this.C.get(b.ch); c.snap(0); c.tween(1.2, 0.85, ease.inOutSine);
        this.pBurst(16, b.c.x, b.c.y, b.c.z, 1.1, { life: 0.8, size: 6, color: 0x9ff7ea, drag: 2.2 });
        this.C.get("breath").kick(4);
      }
    }
  }

  /** Recalcula el encuadre (cambio de breakpoint). */
  relayout() { this.layoutDirty = true; this.wake(); }

  /** Pruebas deterministas: congela el reloj y avanza a mano (no se usa en producción). */
  freeze(on = true) { this.paused = on; if (on) { cancelAnimationFrame(this.raf); this.raf = 0; } else { this.last = 0; this.wake(); } }
  advance(seconds: number, step = 1 / 60) { let t = 0; while (t < seconds - 1e-9) { const d = Math.min(step, seconds - t); this.update(d, performance.now()); t += d; } this.renderer.render(this.scene, this.camera); }

  /** Estado actual para pruebas automáticas. */
  debug() {
    const C = this.C;
    return { phase: this.phase, tier: this.tierName, reduced: this.reduced, particles: this.particles.alive, beams: this.beams.length, running: !!this.raf,
      geometries: this.renderer.info.memory.geometries, textures: this.renderer.info.memory.textures, programs: this.renderer.info.programs?.length,
      calls: this.renderer.info.render.calls, tris: this.renderer.info.render.triangles,
      channels: Object.fromEntries(["pName", "pEmail", "pMsg", "build", "fold", "fly", "pOpen", "pScale", "amber", "badge", "envScale", "letterIn", "flap", "seal"].map((k) => [k, +C.v(k).toFixed(3)])) };
  }

  setReducedMotion(on: boolean) {
    if (on === this.reduced) return;
    this.reduced = on; this.tl.clear(); this.beams.length = 0; this.particles.clear();
    this.C.map.clear(); this.buildChannels();
    const p = this.fields; this.C.get("pName").snap(p.name); this.C.get("pEmail").snap(p.email); this.C.get("pMsg").snap(p.message);
    this.phase = "idle"; this.env.visible = true; this.badge.visible = false; this.wake();
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    cancelAnimationFrame(this.raf); this.raf = 0; this.tl.clear(); this.beams.length = 0;
    this.listeners.forEach((off) => off()); this.listeners.length = 0; this.ro?.disconnect(); this.io?.disconnect();
    this.scene.traverse((o) => { const mesh = o as THREE.Mesh; mesh.geometry?.dispose(); const m = mesh.material as THREE.Material | THREE.Material[] | undefined; if (m) (Array.isArray(m) ? m : [m]).forEach((x) => { (x as THREE.MeshBasicMaterial).map?.dispose(); x.dispose(); }); });
    this.letter?.dispose(); this.particles?.dispose(); this.shards?.dispose(); this.envRT?.dispose(); this.scene.environment = null;
    this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
