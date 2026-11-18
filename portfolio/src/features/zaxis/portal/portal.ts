// Portal: núcleo de remolino (shader), anillos segmentados contrarrotantes en distintas profundidades, halo de lente
// y partículas de entrada (en GPU). Todo se controla con unos pocos uniforms: apertura, energía, destello, tinte.
import * as THREE from "three";
import type { Shared } from "./parts";

const QUAD_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const NOISE = `
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<4;i++){ s += a*vn(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
`;

/** Anillo fino con arcos: progreso de dibujo, guiones, cabeza luminosa y giro. */
export interface RingOpts { radius: number; width?: number; dashes?: number; dashDuty?: number; z?: number; softness?: number }
export function makeRing(shared: Shared, { radius, width = 0.02, dashes = 0, dashDuty = 0.6, z = 0, softness = 1 }: RingOpts) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: {
      ...shared, uProg: { value: 1 }, uAlpha: { value: 1 }, uRot: { value: 0 }, uWidth: { value: width }, uDash: { value: dashes },
      uDuty: { value: dashDuty }, uSoft: { value: softness }, uHead: { value: 1 }, uAmber: { value: 0 }, uGain: { value: 1 },
    },
    vertexShader: QUAD_VERT,
    fragmentShader: `
      varying vec2 vUv; uniform float uProg, uAlpha, uRot, uWidth, uDash, uDuty, uSoft, uHead, uAmber, uGain, uHot, uTime; uniform vec3 uTint;
      void main(){
        vec2 p = (vUv - 0.5) * 2.0; float r = length(p);
        float d = abs(r - 1.0 / 1.0);
        float w = uWidth;
        float line = smoothstep(w, w * 0.15, d);
        float halo = exp(-d / (w * 4.0 * uSoft)) * 0.35;
        float a = fract(atan(p.y, p.x) / 6.2831853 + 0.5 + uRot);
        float lit = 1.0 - smoothstep(uProg - 0.02, uProg, a); if (uProg >= 1.0) lit = 1.0;
        float head = exp(-pow((a - uProg) * 14.0, 2.0)) * uHead * step(uProg, 0.999);
        float dash = 1.0;
        if (uDash > 0.5) { float f = fract(a * uDash); dash = smoothstep(0.0, 0.08, f) * (1.0 - smoothstep(uDuty - 0.08, uDuty, f)); }
        float I = (line * 1.4 + halo) * lit * dash + head * (line * 2.0 + halo * 2.0);
        vec3 amber = vec3(1.0, 0.62, 0.3);
        vec3 col = mix(uTint, amber, uAmber);
        col = mix(col, vec3(1.0), clamp(uHot * 0.55 + head * 0.4, 0.0, 1.0));
        gl_FragColor = vec4(col * I * uAlpha * uGain, I * uAlpha);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.2, radius * 2.2), mat);
  // el shader asume el anillo en r=1 → escalamos el uv: radio relativo = radius / (radius*1.1)
  mat.vertexShader = `varying vec2 vUv; void main(){ vUv = (uv - 0.5) * 1.1 + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
  mesh.position.z = z; mesh.renderOrder = 8;
  return { mesh, mat };
}

export interface PortalValues { open: number; scale: number; energy: number; spin: number; flash: number; amber: number; unstable: number; flow: number }
export class Portal {
  shared: Shared; group = new THREE.Group(); R = 1.72; body = new THREE.Group();
  glow: THREE.Mesh; void: THREE.Mesh; disc: THREE.Mesh; flow: THREE.Points;
  voidMat: THREE.ShaderMaterial; discMat: THREE.ShaderMaterial; flowMat: THREE.ShaderMaterial;
  rings: Record<"main" | "dash" | "thin" | "inner", { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }>;
  constructor(shared: Shared, { particleCount = 260 } = {}) {
    this.shared = shared;
    this.group.position.set(0, 0.1, -2.7);
    this.group.visible = false;
    const R = this.R;
    this.group.add(this.body);

    // halo de lente (grande, suave)
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(R * 5.2, R * 5.2), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...shared, uOpen: { value: 0 }, uAmber: { value: 0 }, uFlash: { value: 0 }, uEnergy: { value: 0 } },
      vertexShader: QUAD_VERT,
      fragmentShader: `varying vec2 vUv; uniform float uOpen, uAmber, uFlash, uEnergy, uTime, uHot; uniform vec3 uTint;
        void main(){ vec2 p=(vUv-.5)*2.; float r=length(p);
          float g = exp(-r*r*3.2) * (0.25 + 0.3*uEnergy) + exp(-r*r*14.0) * (0.3 + uFlash*0.95);
          vec3 c = mix(uTint, vec3(1.0,0.6,0.3), uAmber); c = mix(c, vec3(1.0), clamp(uFlash*0.7 + uHot*0.4, 0., 1.));
          float I = g * uOpen; gl_FragColor = vec4(c * I, I); }`,
    }));
    this.glow.position.z = -0.25; this.glow.renderOrder = 2; this.body.add(this.glow);

    // vacío oscuro (mezcla normal) para dar contraste al remolino
    this.voidMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uOpen: { value: 0 } }, vertexShader: QUAD_VERT,
      fragmentShader: `varying vec2 vUv; uniform float uOpen; void main(){ vec2 p=(vUv-.5)*2.; float r=length(p);
        float m = smoothstep(uOpen, uOpen-0.05, r) ; float a = m * (0.9 - 0.25*r); gl_FragColor = vec4(0.008,0.02,0.035, a); }`,
    });
    this.void = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, R * 2), this.voidMat);
    this.void.position.z = -0.12; this.void.renderOrder = 3; this.body.add(this.void);

    // remolino
    this.discMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...shared, uOpen: { value: 0 }, uEnergy: { value: 0 }, uSpin: { value: 0 }, uFlash: { value: 0 }, uAmber: { value: 0 }, uUnstable: { value: 0 }, uPx: { value: new THREE.Vector2() } },
      vertexShader: QUAD_VERT,
      fragmentShader: `${NOISE}
        varying vec2 vUv; uniform float uOpen, uEnergy, uSpin, uFlash, uAmber, uUnstable, uTime, uHot; uniform vec3 uTint;
        void main(){
          vec2 p = (vUv - .5) * 2.; float r = length(p); float a = atan(p.y, p.x);
          if (r > uOpen + 0.02) discard;
          float edge = smoothstep(uOpen, uOpen - 0.07, r);
          float tw = uSpin + uTime * 0.25;
          float s = a + tw * 2.0 + (1.0 - r) * (4.0 + uEnergy * 3.0);
          vec2 q = vec2(cos(s), sin(s)) * (0.7 + r * 1.6);
          float n = fbm(q * 1.7 + vec2(0.0, -uTime * 0.35));
          float arms = pow(0.5 + 0.5 * sin(s * 3.0 + r * 7.0 - uTime * 1.8), 1.6);
          float wob = uUnstable * (vn(vec2(a * 3.0 + uTime * 7.0, r * 5.0)) - 0.5) * 0.9;
          float body = (0.25 + 0.75 * arms) * (0.35 + 0.9 * n) * (0.5 + r * 0.9) + wob;
          float rim = smoothstep(0.62, 1.0, r / max(uOpen, 0.001)) * (0.55 + 0.45 * sin(a * 6.0 - uTime * 3.0 + r * 4.0));
          float core = exp(-r * r * 9.0) * (0.35 + uFlash * 2.2 + uEnergy * 0.5);
          float I = (body * (0.38 + uEnergy * 0.5) + rim * 0.55 + core) * edge;
          vec3 base = mix(uTint, vec3(1.0, 0.58, 0.28), uAmber);
          vec3 deep = mix(vec3(0.02, 0.2, 0.34), vec3(0.4, 0.1, 0.06), uAmber);
          vec3 c = mix(deep * 2.0, base, clamp(n * 1.3 + rim * 0.5, 0.0, 1.0));
          c = mix(c, vec3(1.0), clamp(core * 0.8 + uFlash * 0.5 + uHot * 0.3, 0.0, 1.0));
          gl_FragColor = vec4(c * I, I);
        }`,
    });
    this.disc = new THREE.Mesh(new THREE.PlaneGeometry(R * 2, R * 2), this.discMat);
    this.disc.renderOrder = 4; this.body.add(this.disc);

    // anillos a distintas profundidades (paralaje al inclinar el portal)
    this.rings = {
      main: makeRing(shared, { radius: R * 1.04, width: 0.034, z: 0.0, softness: 1.4 }),
      dash: makeRing(shared, { radius: R * 1.2, width: 0.014, dashes: 28, dashDuty: 0.55, z: 0.22, softness: 0.8 }),
      thin: makeRing(shared, { radius: R * 1.42, width: 0.008, dashes: 5, dashDuty: 0.7, z: -0.3, softness: 0.6 }),
      inner: makeRing(shared, { radius: R * 0.8, width: 0.012, dashes: 14, dashDuty: 0.4, z: 0.12, softness: 0.7 }),
    };
    for (const r of Object.values(this.rings)) { r.mesh.renderOrder = 5; this.body.add(r.mesh); }

    // partículas de entrada (espiral hacia el centro; todo en GPU)
    const n = particleCount, seed = new Float32Array(n * 3), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { seed[i * 3] = Math.random(); seed[i * 3 + 1] = Math.random(); seed[i * 3 + 2] = Math.random(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    this.flowMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { ...shared, uFlow: { value: 0 }, uPx: { value: 1 }, uAmber: { value: 0 }, uR: { value: R } },
      vertexShader: `attribute vec3 aSeed; uniform float uTime, uFlow, uPx, uR; varying float vA; varying float vT;
        void main(){
          float t = fract(aSeed.x + uTime * (0.12 + aSeed.y * 0.22) * (0.4 + uFlow));
          float rr = mix(uR * (1.5 + aSeed.z * 1.7), 0.02, pow(t, 1.35));
          float ang = aSeed.y * 6.2831 + t * (2.6 + aSeed.z * 2.6) * (1.0 + uFlow);
          vec3 p = vec3(cos(ang) * rr, sin(ang) * rr, (1.0 - t) * (aSeed.z - 0.4) * 1.6 );
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          vA = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.78, 1.0, t)) * uFlow; vT = t;
          gl_PointSize = (3.0 + aSeed.z * 5.0) * uPx * (9.0 / -mv.z);
        }`,
      fragmentShader: `varying float vA; varying float vT; uniform vec3 uTint; uniform float uAmber;
        void main(){ vec2 p = gl_PointCoord - .5; float d = length(p) * 2.; if (d > 1.) discard;
          vec3 c = mix(uTint, vec3(1.0,0.62,0.3), uAmber); c = mix(c, vec3(1.0), vT * 0.5);
          float a = pow(1.0 - d, 1.8) * vA; gl_FragColor = vec4(c * (0.8 + (1.0 - d)), a); }`,
    });
    this.flow = new THREE.Points(g, this.flowMat); this.flow.frustumCulled = false; this.flow.renderOrder = 6;
    this.body.add(this.flow);

  }
  setPx(px: number) { this.flowMat.uniforms.uPx.value = px; }
  /** v: valores de los canales; spinPhase: ángulo acumulado. */
  apply(v: PortalValues) {
    const open = Math.max(0, v.open), vis = open > 0.003 || v.flash > 0.01;
    this.group.visible = vis;
    if (!vis) return;
    const sc = Math.max(0.0001, v.scale);
    this.body.scale.setScalar(sc);
    const o = Math.min(1.08, open), du = this.discMat.uniforms;
    du.uOpen.value = o; du.uEnergy.value = v.energy; du.uSpin.value = v.spin; du.uFlash.value = v.flash; du.uAmber.value = v.amber; du.uUnstable.value = v.unstable;
    this.voidMat.uniforms.uOpen.value = o;
    const gu = (this.glow.material as THREE.ShaderMaterial).uniforms; gu.uOpen.value = Math.min(1, open) * (0.4 + 0.6 * Math.min(1, v.scale)); gu.uAmber.value = v.amber; gu.uFlash.value = v.flash; gu.uEnergy.value = v.energy;
    const r = this.rings, ang = v.spin;
    const set = (k: keyof Portal["rings"], rot: number, prog: number, alpha: number) => { const u = r[k].mat.uniforms; u.uRot.value = rot; u.uProg.value = prog; u.uAlpha.value = alpha; u.uAmber.value = v.amber; };
    const draw = Math.min(1, Math.max(0, open * 1.25));
    set("main", ang * 0.16, draw >= 0.995 ? 1 : draw, Math.min(1, open * 3));
    set("dash", -ang * 0.34, 1, Math.min(1, open * 2.2) * (0.55 + 0.45 * v.energy));
    set("thin", ang * 0.1 + 0.3, draw, Math.min(1, open * 2) * 0.7);
    set("inner", ang * 0.5, 1, Math.min(1, open * 2) * (0.5 + 0.5 * v.energy));
    r.main.mat.uniforms.uGain.value = 1 + v.flash * 2.2 + v.energy * 0.4;
    r.dash.mat.uniforms.uGain.value = 1 + v.flash * 1.2;
    const fu = this.flowMat.uniforms; fu.uFlow.value = v.flow * Math.min(1, sc); fu.uAmber.value = v.amber;
  }
  dispose() {
    this.group.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose(); });
  }
}
