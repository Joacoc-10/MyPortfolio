// Sistema de partículas único (Points, aditivo). Simulación en CPU (≤ ~900 partículas: coste despreciable)
// con atributos por partícula: posición, edad normalizada, tamaño y color. Sirve para estela, ráfaga, chispas
// de absorción, chispas de error y la reconstrucción del reinicio.
import * as THREE from "../vendor/three.module.min.js";
import { rand } from "./motion.js";

const VERT = /* glsl */ `
  attribute float aAge; attribute float aSize; attribute vec3 aColor; attribute float aKind;
  uniform float uPx; varying float vA; varying vec3 vC; varying float vK;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float fade = (1.0 - aAge);
    vA = fade * fade * smoothstep(0.0, 0.06, aAge + 0.02);
    vC = aColor; vK = aKind;
    gl_PointSize = aSize * uPx * (0.35 + 0.65 * fade) * (9.0 / -mv.z);
  }`;
const FRAG = /* glsl */ `
  varying float vA; varying vec3 vC; varying float vK;
  void main(){
    vec2 p = gl_PointCoord - 0.5; float d = length(p) * 2.0;
    if (d > 1.0) discard;
    float core = smoothstep(0.55, 0.0, d);
    float halo = pow(1.0 - d, 2.2);
    float a = (core * 0.9 + halo * 0.55) * vA;
    gl_FragColor = vec4(vC * (0.7 + core * 1.3), a);
  }`;

export class Particles {
  constructor(max = 900, pxScale = 1) {
    this.max = max; this.n = 0; this.cursor = 0;
    this.pos = new Float32Array(max * 3); this.vel = new Float32Array(max * 3);
    this.age = new Float32Array(max).fill(1); this.life = new Float32Array(max).fill(1);
    this.size = new Float32Array(max); this.col = new Float32Array(max * 3); this.kind = new Float32Array(max);
    this.drag = new Float32Array(max); this.grav = new Float32Array(max); this.pull = new Float32Array(max * 3);
    this.pullK = new Float32Array(max); // atracción hacia un punto (reconstrucción / absorción)
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aAge", new THREE.BufferAttribute(this.age, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aColor", new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aKind", new THREE.BufferAttribute(this.kind, 1));
    this.geo = g;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: pxScale } },
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false; this.points.renderOrder = 12;
    this.tmp = new THREE.Color();
  }
  setPx(px) { this.mat.uniforms.uPx.value = px; }
  get alive() { return this.n; }
  /** Emite una partícula. opts: {life,size,drag,grav,pull:[x,y,z],pullK,color} */
  emit(x, y, z, vx, vy, vz, o = {}) {
    this.n = this.n || 1; const i = this.cursor; this.cursor = (this.cursor + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.age[i] = 0; this.life[i] = o.life ?? rand(0.8, 1.6); this.size[i] = o.size ?? rand(5, 11);
    this.drag[i] = o.drag ?? 1.2; this.grav[i] = o.grav ?? 0;
    this.tmp.set(o.color ?? 0x2dd4bf);
    this.col[i3] = this.tmp.r; this.col[i3 + 1] = this.tmp.g; this.col[i3 + 2] = this.tmp.b;
    const p = o.pull; this.pullK[i] = p ? (o.pullK ?? 6) : 0;
    if (p) { this.pull[i3] = p[0]; this.pull[i3 + 1] = p[1]; this.pull[i3 + 2] = p[2]; }
  }
  /** Ráfaga esférica. */
  burst(n, x, y, z, speed, o = {}) {
    for (let i = 0; i < n; i++) {
      const u = rand(-1, 1), a = rand(0, Math.PI * 2), s = Math.sqrt(1 - u * u), v = speed * rand(0.35, 1);
      this.emit(x, y, z, Math.cos(a) * s * v, u * v, Math.sin(a) * s * v, o);
    }
  }
  clear() { this.age.fill(1); this.n = 0; this.geo.attributes.aAge.needsUpdate = true; }
  update(dt) {
    let n = 0;
    for (let i = 0; i < this.max; i++) {
      if (this.age[i] >= 1) continue;
      n++;
      const i3 = i * 3;
      this.age[i] += dt / this.life[i];
      const d = Math.exp(-this.drag[i] * dt);
      if (this.pullK[i]) {
        const k = this.pullK[i] * dt;
        this.vel[i3] += (this.pull[i3] - this.pos[i3]) * k; this.vel[i3 + 1] += (this.pull[i3 + 1] - this.pos[i3 + 1]) * k; this.vel[i3 + 2] += (this.pull[i3 + 2] - this.pos[i3 + 2]) * k;
      }
      this.vel[i3] *= d; this.vel[i3 + 1] = this.vel[i3 + 1] * d - this.grav[i] * dt; this.vel[i3 + 2] *= d;
      this.pos[i3] += this.vel[i3] * dt; this.pos[i3 + 1] += this.vel[i3 + 1] * dt; this.pos[i3 + 2] += this.vel[i3 + 2] * dt;
    }
    this.n = n;
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.aAge.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true; this.geo.attributes.aColor.needsUpdate = true;
  }
  dispose() { this.geo.dispose(); this.mat.dispose(); }
}
