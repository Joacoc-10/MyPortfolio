// Piezas del sobre holográfico: losas de cristal con trazos de luz dibujados por SDF en el shader,
// textura viva de la carta, esquirlas orbitales, suelo en perspectiva y entorno para los reflejos.
import * as THREE from "three";

type U<T> = { value: T };
/** Uniforms compartidos por todo el sistema (se actualizan una vez por fotograma). */
export interface Shared {
  uTime: U<number>; uFold: U<number>; uEnv: U<THREE.Matrix4>; uEnvInv: U<THREE.Matrix4>; uTint: U<THREE.Color>; uHot: U<number>;
}
export function makeShared(): Shared {
  return {
    uTime: { value: 0 },
    uFold: { value: 0 },
    uEnv: { value: new THREE.Matrix4() },
    uEnvInv: { value: new THREE.Matrix4() },
    uTint: { value: new THREE.Color(0x2dd4bf) },
    uHot: { value: 0 },
  };
}

const SDF_GLSL = /* glsl */ `
  float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2){
    vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2; vec2 v0=p-p0,v1=p-p1,v2=p-p2;
    vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.);
    vec2 pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.);
    vec2 pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
    float s=sign(e0.x*e2.y-e0.y*e2.x);
    vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
    return -sqrt(d.x)*sign(d.y);
  }
  float sdRR(vec2 p, vec2 h, float r){ vec2 q=abs(p)-(h-vec2(r)); return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
`;

/** Parchea MeshPhysicalMaterial: máscara SDF (rect. redondeado / triángulo), trazos de luz, plegado del sobre. */
function patch(mat: THREE.MeshPhysicalMaterial, shared: Shared, u: Record<string, U<unknown>>) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>
        varying vec2 vLocal; uniform mat4 uEnv; uniform mat4 uEnvInv; uniform float uFold;
        vec4 foldWorld(vec4 wp){
          if (uFold < 0.0005) return wp;
          vec4 e = uEnvInv * wp; float f = uFold; float ax = abs(e.x);
          float tt = clamp((e.y + 0.8) / 1.6, 0.0, 1.0);
          e.y -= ax * 0.6 * f;            // alas barridas hacia atrás
          e.z += ax * 0.42 * f;           // diedro (V)
          e.x *= 1.0 - f * (0.22 + 0.5 * tt); // flecha: se afina hacia la punta
          return uEnv * e;
        }`)
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n vLocal = position.xy;")
      .replace("#include <project_vertex>", `
        vec4 wpF = foldWorld(modelMatrix * vec4(transformed, 1.0));
        vec4 mvPosition = viewMatrix * wpF;
        gl_Position = projectionMatrix * mvPosition;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", `varying vec2 vLocal;
        uniform float uMaskType, uRad, uProg, uPulse, uGlow, uTime, uHot, uBreath;
        uniform vec2 uHalf, uA, uB, uC, uCen; uniform vec3 uTint;
        ${SDF_GLSL}
        void main() {`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
        vec3 zxStroke = vec3(0.0);
        float sd = sdRR(vLocal, uHalf, uRad);
        if (uMaskType > 0.5) sd = max(sd, sdTri(vLocal, uA, uB, uC));
        if (sd > 0.0) discard;`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        {
          float e = -sd;
          float ang = atan(vLocal.y - uCen.y, vLocal.x - uCen.x) / 6.2831853 + 0.5;
          float lit = 1.0 - smoothstep(uProg - 0.05, uProg, ang);
          float head = exp(-pow((ang - uProg) * 16.0, 2.0)) * step(0.002, uProg) * (1.0 - step(1.0, uProg));
          float line = smoothstep(0.02, 0.003, e);
          float halo = exp(-e * 22.0) * 0.55;
          float pulse = exp(-pow((ang - uPulse) * 8.0, 2.0)) * step(0.0, uPulse);
          float band = (0.5 + 0.5 * sin(vLocal.y * 46.0 - uTime * 1.6)) * 0.028;
          float fr = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0);
          vec3 sc = mix(uTint, vec3(1.0), clamp(uHot * 0.65 + pulse * 0.5, 0.0, 1.0));
          float L = (line * lit * 1.7 + halo * lit * 0.75 + head * (line + halo) * 2.6 + pulse * (line * 2.2 + halo) ) * uGlow;
          zxStroke = sc * L * 0.75;
          totalEmissiveRadiance += sc * (band + fr * 0.32 + uBreath * 0.05) * uGlow;
        }`)
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>
        { // trazos de luz: aditivos y siempre nítidos, aunque el cristal esté casi transparente
          vec3 st = pow(min(zxStroke, vec3(1.6)), vec3(0.4545)); float sa = clamp(max(max(st.r, st.g), st.b), 0.0, 1.0);
          float a0 = gl_FragColor.a, a1 = clamp(a0 + sa * (1.0 - a0), 0.0, 1.0);
          gl_FragColor = vec4((gl_FragColor.rgb * a0 + st) / max(a1, 0.001), a1);
        }`);
  };
  mat.customProgramCacheKey = () => "zx-part";
}

export interface SlabOpts { w: number; h: number; t?: number; rad?: number; tri?: number[] | null; color?: number; opacity?: number; map?: THREE.Texture | null; nx?: number; ny?: number }
export interface Slab { mesh: THREE.Mesh; u: Record<string, U<any>>; mat: THREE.MeshPhysicalMaterial; geo: THREE.BoxGeometry } // eslint-disable-line @typescript-eslint/no-explicit-any
/** Crea una losa de cristal. Devuelve {mesh, u (uniforms por material), mat}. */
export function makeSlab(shared: Shared, o: SlabOpts): Slab {
  const { w, h, t = 0.034, rad = 0.07, tri = null, color = 0x0b1c27, opacity = 0.4, map = null, nx = 28, ny = 18 } = o;
  const geo = new THREE.BoxGeometry(w, h, t, nx, ny, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color, metalness: 0.22, roughness: 0.14, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
    iridescence: 1, iridescenceIOR: 1.55, iridescenceThicknessRange: [180, 620], clearcoat: 0.8, clearcoatRoughness: 0.08,
    envMapIntensity: 1.35, map, emissive: map ? 0xffffff : 0x000000, emissiveMap: map, emissiveIntensity: map ? 0.85 : 1,
  });
  const u: Slab["u"] = {
    uMaskType: { value: tri ? 1 : 0 }, uHalf: { value: new THREE.Vector2(w / 2, h / 2) }, uRad: { value: rad },
    uA: { value: new THREE.Vector2(...(tri ? tri.slice(0, 2) : [0, 0])) }, uB: { value: new THREE.Vector2(...(tri ? tri.slice(2, 4) : [0, 0])) },
    uC: { value: new THREE.Vector2(...(tri ? tri.slice(4, 6) : [0, 0])) },
    uCen: { value: new THREE.Vector2(...(tri ? [(tri[0] + tri[2] + tri[4]) / 3, (tri[1] + tri[3] + tri[5]) / 3] : [0, 0])) },
    uProg: { value: 0 }, uPulse: { value: -1 }, uGlow: { value: 1 }, uBreath: { value: 0 },
  };
  patch(mat, shared, u);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 8;
  return { mesh, u, mat, geo };
}

/** Textura viva de la carta: refleja lo que el usuario escribe (nombre, correo, mensaje). */
export interface LetterLabels { head: string; count: string; name: string; email: string; foot: string }
export interface LetterState { name: string; email: string; message: string; caret: boolean }
export class LetterTexture {
  c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; state: LetterState; dirty = true; last = 0; bars: number[]; labels: LetterLabels; _caret = false;
  constructor(labels: LetterLabels, w = 820, h = 520) {
    this.labels = labels;
    this.c = document.createElement("canvas"); this.c.width = w; this.c.height = h;
    this.ctx = this.c.getContext("2d") as CanvasRenderingContext2D;
    this.tex = new THREE.CanvasTexture(this.c);
    this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.state = { name: "", email: "", message: "", caret: false };
    this.bars = Array.from({ length: 9 }, (_, i) => 0.42 + ((i * 37) % 53) / 100);
    this.draw();
  }
  set(s: Partial<LetterState>) { Object.assign(this.state, s); this.dirty = true; }
  tick(now: number) {
    const caret = this.state.caret && Math.floor(now / 520) % 2 === 0;
    if (caret !== this._caret) { this._caret = caret; this.dirty = true; }
    if (!this.dirty || now - this.last < 45) return;
    this.draw(); this.last = now;
  }
  draw() {
    const { ctx, c } = this, W = c.width, H = c.height, s = this.state, pad = 46;
    this.dirty = false;
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0d2230"); g.addColorStop(1, "#08141f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // rejilla técnica tenue
    ctx.strokeStyle = "rgba(120,200,220,0.05)"; ctx.lineWidth = 1;
    for (let x = pad; x < W; x += 41) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    const mono = '500 21px "Geist Mono", ui-monospace, Menlo, monospace';
    ctx.font = mono; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(45,212,191,0.95)"; ctx.fillText(this.labels.head, pad, 66);
    ctx.fillStyle = "rgba(190,215,255,0.5)"; ctx.textAlign = "right"; ctx.fillText(`${String(s.message.length).padStart(4, "0")} ${this.labels.count}`, W - pad, 66); ctx.textAlign = "left";
    ctx.fillStyle = "rgba(190,215,255,0.16)"; ctx.fillRect(pad, 86, W - pad * 2, 1.5);
    // remitente
    ctx.font = '600 31px "Geist", system-ui, sans-serif';
    ctx.fillStyle = s.name ? "#f2f4f8" : "rgba(242,244,248,0.2)"; ctx.fillText(s.name ? fit(ctx, s.name, W - pad * 2 - 30) : this.labels.name, pad, 134);
    ctx.font = '500 21px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = s.email ? "#6ee7d6" : "rgba(110,231,214,0.22)"; ctx.fillText(s.email ? fit(ctx, s.email, W - pad * 2) : this.labels.email, pad, 170);
    ctx.fillStyle = "rgba(190,215,255,0.16)"; ctx.fillRect(pad, 196, W - pad * 2, 1.5);
    // cuerpo
    const lh = 36, top = 244, maxLines = Math.floor((H - top - 54) / lh);
    ctx.font = '440 25px "Geist", system-ui, sans-serif';
    const lines = wrap(ctx, s.message, W - pad * 2, maxLines);
    ctx.fillStyle = "#dfe7f3";
    lines.forEach((ln, i) => ctx.fillText(ln, pad, top + i * lh));
    // barras "fantasma" para las líneas aún sin escribir
    for (let i = lines.length; i < maxLines; i++) {
      ctx.fillStyle = `rgba(190,215,255,${0.07 + (i % 2) * 0.02})`;
      const w = (W - pad * 2) * this.bars[i % this.bars.length];
      roundRect(ctx, pad, top + i * lh - 14, w, 12, 6); ctx.fill();
    }
    if (s.caret && this._caret) {
      const last = lines.length ? lines[lines.length - 1] : "";
      const cx = pad + ctx.measureText(last).width + 4, cy = top + Math.max(0, lines.length - 1) * lh;
      ctx.fillStyle = "#2dd4bf"; ctx.fillRect(cx, cy - 24, 3, 30);
    }
    ctx.fillStyle = "rgba(190,215,255,0.35)"; ctx.font = '500 17px "Geist Mono", monospace'; ctx.fillText(this.labels.foot, pad, H - 26);
    this.tex.needsUpdate = true;
  }
  dispose() { this.tex.dispose(); }
}
function fit(ctx: CanvasRenderingContext2D, text: string, max: number) { let t = text; while (t.length > 1 && ctx.measureText(t).width > max) t = t.slice(0, -1); return t === text ? t : t.slice(0, -1) + "…"; }
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, maxLines: number) {
  const out: string[] = []; if (!text) return out;
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/(\s+)/)) {
      if (ctx.measureText(line + word).width > max && line.trim()) { out.push(line.trimEnd()); line = word.trimStart(); } else line += word;
      while (ctx.measureText(line).width > max) { let i = line.length - 1; while (i > 1 && ctx.measureText(line.slice(0, i)).width > max) i--; out.push(line.slice(0, i)); line = line.slice(i); }
    }
    out.push(line.trimEnd());
  }
  if (out.length > maxLines) { const cut = out.slice(out.length - maxLines); cut[0] = "…" + cut[0]; return cut; } // muestra las últimas líneas (donde se escribe)
  return out;
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/** Entorno procedural (cajas de luz turquesa/blanca) para reflejos del cristal. */
export function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshBasicMaterial({ color: 0x03060c, side: THREE.BackSide })));
  const panel = (w: number, h: number, pos: [number, number, number], rgb: [number, number, number], look: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(...rgb), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(...look); s.add(m);
  };
  panel(10, 2.2, [-8, 4, 5], [1.2, 7.5, 6.5]);   // tira turquesa
  panel(12, 1.6, [0, 10, 2], [6, 6.5, 7.5]);       // luz cenital fría
  panel(3, 8, [9, 0, 4], [1.0, 3.2, 5.2]);          // lateral azul
  panel(4, 2, [3, -6, -8], [7, 4.8, 2.0]);          // acento cálido tenue
  panel(8, 3, [0, 1, -11], [0.6, 4, 3.6]);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.035);
  pm.dispose();
  s.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose(); });
  return rt;
}

/** Esquirlas orbitales: fragmentos "sin ensamblar" que el objeto absorbe mientras se completa el formulario. */
export class Shards {
  n: number; mat: THREE.MeshStandardMaterial; mesh: THREE.InstancedMesh; vis: Float32Array;
  p: { r: number; a: number; sp: number; tilt: number; y: number; s: number; rot: number[]; rs: number }[];
  m = new THREE.Matrix4(); q = new THREE.Quaternion(); e = new THREE.Euler(); v = new THREE.Vector3(); sc = new THREE.Vector3();
  constructor(n = 28) {
    this.n = n;
    const geo = new THREE.OctahedronGeometry(0.045, 0);
    this.mat = new THREE.MeshStandardMaterial({ color: 0x0d2c33, emissive: 0x2dd4bf, emissiveIntensity: 0.65, roughness: 0.25, metalness: 0.5, transparent: true, opacity: 0.95 });
    this.mesh = new THREE.InstancedMesh(geo, this.mat, n);
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 7;
    this.p = Array.from({ length: n }, (_, i) => ({
      r: 1.65 + Math.random() * 1.15, a: Math.random() * 6.28, sp: (0.12 + Math.random() * 0.28) * (i % 2 ? 1 : -1),
      tilt: (Math.random() - 0.5) * 1.3, y: (Math.random() - 0.5) * 1.5, s: 0.55 + Math.random() * 1.5,
      rot: [Math.random() * 6, Math.random() * 6, Math.random() * 6], rs: 0.4 + Math.random() * 1.2,
    }));
    this.vis = new Float32Array(n).fill(1);
  }
  /** assemble 0..1: cuanto más completo, menos esquirlas libres (las absorbe). */
  update(t: number, assemble: number, spin: number) {
    const n = this.n;
    for (let i = 0; i < n; i++) {
      const p = this.p[i];
      const thr = i / n; // las últimas se absorben primero
      const vis = 1 - Math.min(1, Math.max(0, (assemble * 1.15 - thr * 0.85) / 0.25));
      this.vis[i] = vis;
      const a = p.a + t * p.sp * (1 + spin * 3);
      const r = p.r * (0.18 + 0.82 * vis);
      this.v.set(Math.cos(a) * r, p.y * (0.4 + 0.6 * vis) + Math.sin(t * 0.7 + i) * 0.05, Math.sin(a) * r * 0.75 + 0.2);
      this.v.applyAxisAngle(THREE_X, p.tilt * 0.35);
      this.e.set(p.rot[0] + t * p.rs, p.rot[1] + t * p.rs * 0.7, p.rot[2]);
      this.q.setFromEuler(this.e);
      const s = p.s * vis * (0.6 + 0.4 * Math.sin(t * 2 + i) * 0.5 + 0.2);
      this.sc.setScalar(Math.max(0.0001, s));
      this.m.compose(this.v, this.q, this.sc);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.visible = assemble < 0.995;
  }
  dispose() { this.mesh.geometry.dispose(); this.mat.dispose(); this.mesh.dispose(); }
}
const THREE_X = new THREE.Vector3(1, 0, 0);

/** Suelo en perspectiva: la cuadrícula Z-AXIS que converge hacia el portal. */
export function makeFloor(shared: Shared) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { ...shared, uFlow: { value: 0 }, uWave: { value: -10 }, uAmp: { value: 0.0 }, uOpen: { value: 0 } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec2 vP; uniform float uTime, uFlow, uWave, uAmp, uOpen, uHot; uniform vec3 uTint;
      float grid(vec2 p, float s, float w){ vec2 g = abs(fract(p / s - 0.5) - 0.5) / fwidth(p / s); return 1.0 - min(min(g.x, g.y) / w, 1.0); }
      void main(){
        // vP.x = x, vP.y = -z (hacia el portal es +y)
        vec2 p = vec2(vP.x, vP.y);
        float d = length(p * vec2(0.8, 0.55));
        float fade = smoothstep(9.0, 1.2, abs(p.x)) * smoothstep(13.0, 1.0, -p.y + 3.0) * smoothstep(-6.0, -0.4, p.y + 5.0);
        float g1 = grid(p, 0.6, 1.1) * 0.3 + grid(p, 2.4, 1.4) * 0.6;
        // eje Z: línea central con marcas que avanzan hacia el portal
        float axis = smoothstep(0.035, 0.0, abs(p.x));
        float ticks = smoothstep(0.1, 0.0, abs(fract((p.y - uTime * (0.35 + uFlow * 4.5)) * 1.1) - 0.5) - 0.38);
        float wave = exp(-pow((p.y - uWave) * 1.6, 2.0)) * uAmp;
        float pool = exp(-d * 0.9) * (0.12 + uOpen * 0.35);
        float I = (g1 * (0.35 + wave * 2.5 + uOpen * 0.6) + axis * (0.35 + ticks * 0.9 + uFlow * 1.2) + wave * 0.25 + pool) * fade;
        vec3 c = mix(uTint, vec3(1.0), clamp(uHot * 0.5 + wave * 0.5, 0.0, 1.0));
        gl_FragColor = vec4(c * I, I);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), mat);
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(0, -1.28, -4); mesh.renderOrder = 1;
  return { mesh, mat };
}
