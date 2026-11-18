// Hero cinematográfico: escena de ventanas con capturas reales en profundidad (idea de C),
// nombre con peso tipográfico que responde al puntero y serif itálico de contraste (recursos de B)
// y el logo original animado. La intensidad se concentra aquí; el texto siempre queda legible.
import { $, $$, clamp, esc, fmtMonth } from "../lib.js";
import { logoLayers } from "./brand.js";

// Posición de cada ventana: x/y (% del escenario), z (px), giro, ancho. Se reparten por los bordes
// para dejar libre el centro-izquierda, donde vive el texto.
const SLOTS = [
  { x: 60, y: 5, z: -420, ry: -22, rx: 3, w: "24vw" },
  { x: 75, y: 31, z: -200, ry: -24, rx: 2, w: "24vw" },
  { x: 58, y: 60, z: -320, ry: -20, rx: -3, w: "21vw" },
  { x: 82, y: 70, z: -520, ry: -26, rx: -4, w: "17vw" },
  { x: -7, y: 7, z: -720, ry: 24, rx: 3, w: "15vw" },
  { x: 1, y: 76, z: -820, ry: 18, rx: -4, w: "14vw" },
];

export function heroHtml({ data, msg, L, T, lang, showcase, skipIntro }) {
  const current = data.companies.find((c) => c.period && c.period.end === null);
  const [first, ...rest] = data.name.split(" ");
  const last = rest.join(" ");
  const letters = [...first].map((c, i) => `<span class="ch" style="--i:${i}">${esc(c)}</span>`).join("");
  const wins = showcase.slice(0, SLOTS.length).map((p, i) => {
    const s = SLOTS[i], m = p.media[0];
    return `<div class="win" style="--x:${s.x};--y:${s.y};--z:${s.z}px;--par:${Math.round(-s.z / 18)};--ry:${s.ry}deg;--rx:${s.rx}deg;--w:${s.w};--i:${i}">
      <div class="win-in"><img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" decoding="async" draggable="false"></div></div>`;
  }).join("");
  const role = current ? msg.Hero.currentRole.replace("{role}", L(current.role)).replace("{company}", current.name) : "";
  return `<div class="htrack" id="top"><section class="hero${skipIntro ? " skip-intro" : ""}" id="hero" aria-label="${esc(data.name)}">
  <div class="hero-bg" aria-hidden="true">
    <div class="aurora"></div><div class="floor"></div>
    <div class="scene" id="scene">${wins}</div>
    <div class="veil"></div>
  </div>
  <div class="wrap hero-copy">
    <div class="hero-logo" id="heroLogo">${logoLayers({ width: 330, intro: !skipIntro })}</div>
    <h1 class="hero-name" aria-label="${esc(data.name)} — ${esc(L(data.headline))}">
      <span class="nm1" aria-hidden="true" id="nm1">${letters}</span>
      <span class="nm2 serif" aria-hidden="true"><span>${esc(last)}</span></span>
    </h1>
    <p class="hero-lead fx" style="--k:1">${esc(L(data.valueProposition))}</p>
    <div class="hero-meta fx" style="--k:2">
      ${current ? `<p class="hero-fact"><span class="mono">${esc(role)}</span><span class="sep" aria-hidden="true">·</span><span class="mono">${esc(T.since)} ${esc(fmtMonth(current.period.start, lang))}</span></p>` : ""}
      <p class="hero-avail"><span class="pulse" aria-hidden="true"></span>${esc(L(data.availability))}</p>
    </div>
    <div class="hero-cta fx" style="--k:3">
      <a class="btn primary" href="#contact">${esc(msg.Hero.ctaContact)}</a>
      <a class="btn" href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a>
      <a class="btn" href="#projects">${esc(msg.Nav.projects)} ↓</a>
    </div>
  </div>
  <div class="scroll-hint mono fx" style="--k:5" aria-hidden="true"><span>${esc(T.scroll)}</span><i></i></div>
</section></div>`;
}

export function initHero({ rm, skipIntro }) {
  const hero = $("#hero");
  const letters = $$(".ch", hero);
  const coarse = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  let visible = true, raf = 0, tx = 0, ty = 0, mx = 0, my = 0, px = null, py = null;

  // Cada letra mide siempre lo que ocupa en su peso máximo: así el nombre no "salta" al cambiar de peso.
  const fix = () => {
    letters.forEach((l) => { l.style.width = ""; l.style.fontWeight = "600"; });
    const w = letters.map((l) => l.getBoundingClientRect().width);
    letters.forEach((l, i) => { l.style.width = `${w[i]}px`; l.style.fontWeight = ""; });
  };
  const ready = (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(fix));
  addEventListener("resize", () => requestAnimationFrame(fix));

  // Secuencia de entrada: se inicia con fuentes e imágenes listas (con tope), para que no haya saltos.
  const imgs = $$(".win img", hero).slice(0, 3).map((i) => i.decode?.().catch(() => {}));
  Promise.race([Promise.all([ready, ...imgs]), new Promise((r) => setTimeout(r, 1400))]).then(() => hero.classList.add("go"));

  // Fin de la intro del logo: se retira la máscara cónica (ver base.css) para poder rotar el anillo sin artefactos.
  const intro = $(".jlogo.intro", hero);
  intro?.querySelector(".jl-sheen")?.addEventListener("animationend", () => intro.classList.remove("intro"), { once: true });

  if (rm) { letters.forEach((l) => (l.style.fontWeight = "500")); return; }

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    px = e.clientX; py = e.clientY;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { px = null; tx = ty = 0; });

  const frame = (t) => {
    raf = 0;
    if (!visible) return;
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
    hero.style.setProperty("--mx", mx.toFixed(3));
    hero.style.setProperty("--my", my.toFixed(3));
    letters.forEach((l, i) => {
      let w;
      if (px !== null) {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        w = 650 - clamp(d / 340) * 360; // más cerca del puntero → más grueso
      } else {
        w = 450 + Math.sin(t / 1100 + i * 0.75) * 110; // en reposo (y en táctiles): respiración suave
      }
      l.style.fontWeight = Math.round(w);
    });
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  start();
  void coarse; void skipIntro;
}
