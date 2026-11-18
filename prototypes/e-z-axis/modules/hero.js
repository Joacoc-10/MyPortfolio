// HERO · Superficie. Escena de ventanas de navegador con capturas reales dispuestas a lo largo del eje Z
// (un túnel que se aleja hacia un punto de fuga a la derecha), nombre con peso tipográfico que responde al
// puntero y se acopla al navbar, y un "dive" final: la cámara atraviesa las ventanas hacia la profundidad.
// Sin scroll-jacking: la sección usa position: sticky y el scroll es siempre el nativo.
import { $, $$, clamp, lerp, range, smooth, inOutCubic, esc, host, fmtMonth, createLoop, watchVisible, tintOf, pointer } from "../lib.js";
import { createWeightField } from "./weight.js";

const HERO_IDS = ["order-a", "zatobox", "nexvia", "fabio-producciones", "florencia-biaturi", "olibar"];
// x, y: fracción del viewport desde el centro · z: profundidad (px) · ry, rx: giro (°)
const POSES_WIDE = [
  { x: 0.27, y: 0.03, z: 0, ry: -16, rx: 2 },
  { x: 0.43, y: -0.3, z: -430, ry: -25, rx: 1 },
  { x: 0.18, y: 0.31, z: -720, ry: -15, rx: -2 },
  { x: 0.46, y: 0.27, z: -1020, ry: -27, rx: -2 },
  { x: 0.3, y: -0.4, z: -1340, ry: -20, rx: 2 },
  { x: 0.2, y: -0.04, z: -1680, ry: -12, rx: 0 },
];
const POSES_NARROW = [
  { x: 0.1, y: -0.31, z: 0, ry: -14, rx: 3 },
  { x: -0.34, y: -0.4, z: -330, ry: 17, rx: 2 },
  { x: 0.36, y: -0.36, z: -600, ry: -19, rx: -2 },
];
const DIVE_DEPTH = 1900;

export function heroHtml(ctx) {
  const { data, msg, L, T, lang, byId, calm, skipIntro } = ctx;
  const current = data.companies.find((c) => c.period && c.period.end === null);
  const [first, ...rest] = data.name.split(" ");
  const last = rest.join(" ");
  const letters = [...first].map((c, i) => `<span class="mk"><span class="ch" style="--i:${i}">${esc(c)}</span></span>`).join("");
  const wins = HERO_IDS.map((id) => byId[id]).filter(Boolean).map((p, i) => {
    const m = p.media[0];
    return `<div class="win" data-id="${esc(p.id)}" style="--i:${i}"><div class="win-in">
      <div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(p.links?.deploy ?? ""))}</span></div>
      <img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" decoding="async" draggable="false" ${i < 3 ? "" : 'loading="lazy"'}>
      <b class="win-dim" aria-hidden="true"></b></div></div>`;
  }).join("");
  const role = current ? msg.Hero.currentRole.replace("{role}", L(current.role)).replace("{company}", current.name) : "";
  return `<div class="htrack" id="top"><section class="hero${skipIntro || calm ? " skip-intro" : ""}${calm ? " calm" : ""}" id="hero" aria-label="${esc(data.name)}">
  <div class="h-bg" aria-hidden="true">
    <div class="h-aurora"></div>
    <div class="plane-grid h-floor"><i></i></div>
    <div class="h-cam"><div class="h-set" id="hset">${wins}</div></div>
    <div class="h-veil"></div>
    <div class="h-deep"></div>
  </div>
  <div class="wrap h-copy" id="hcopy">
    <p class="h-pill" data-fade data-in="fade" style="--at:560ms"><span class="pulse" aria-hidden="true"></span>${esc(L(data.availability))}</p>
    <h1 class="h-name" aria-label="${esc(data.name)} — ${esc(L(data.headline))}">
      <span class="n1" id="n1" aria-hidden="true">${letters}</span>
      <span class="n2 serif" id="n2" aria-hidden="true"><span class="mk"><span class="ch2">${esc(last)}</span></span></span>
    </h1>
    <p class="h-role mono" data-fade data-in="up" style="--at:380ms">${esc(L(data.headline))}</p>
    <p class="h-lead" data-fade data-in="up" style="--at:480ms">${esc(L(data.valueProposition))}</p>
    ${role ? `<p class="h-now mono" data-fade data-in="fade" style="--at:620ms">${esc(role)}${current.period ? ` <span aria-hidden="true">·</span> ${esc(T.since)} ${esc(fmtMonth(current.period.start, lang))}` : ""}</p>` : ""}
    <div class="h-cta" data-fade data-in="up" style="--at:680ms">
      <a class="btn primary" href="#contact">${esc(msg.Hero.ctaContact)}</a>
      <a class="btn" href="#projects">${esc(T.heroProjects)} <span aria-hidden="true">↓</span></a>
      <a class="btn" href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a>
    </div>
  </div>
  <div class="h-hint mono" data-fade aria-hidden="true"><span>${esc(T.scroll)}</span><i></i></div>
</section></div>`;
}

export function initHero(ctx) {
  const { calm, rm, goProject } = ctx;
  const hero = $("#hero"), track = $("#top"), hset = $("#hset"), n1 = $("#n1"), n2 = $("#n2");
  const dock = $("#dock"), nav = $("#nav");
  const wins = $$(".win", hero);
  const fades = $$("[data-fade]", hero);
  const letters = $$(".ch", n1);
  const field = createWeightField(letters);
  let narrow = innerWidth < 760;
  let poses = narrow ? POSES_NARROW : POSES_WIDE;
  let m = null, ready = false, introDone = false;
  const focusW = wins.map(() => 0.5);
  let focus = 0, lastPick = 0, lastAuto = performance.now();
  const tint = new Map();

  /* ---------- arranque: con fuentes e imágenes listas (con tope) para que no haya saltos ---------- */
  const imgs = $$(".win img", hero).slice(0, 3).map((i) => i.decode?.().catch(() => {}));
  const fonts = (document.fonts?.ready ?? Promise.resolve());
  Promise.race([Promise.all([fonts, ...imgs]), new Promise((r) => setTimeout(r, 1500))]).then(() => {
    hero.classList.add("go");
    hero.dispatchEvent(new CustomEvent("hero-go"));
  });
  fonts.then(() => requestAnimationFrame(() => { if (!calm) field.fix(); measure(); ready = true; api.update(scrollY, innerHeight); }));

  /* ---------- luz ambiental por proyecto ---------- */
  $$(".win img", hero).forEach((img, i) => {
    const apply = () => {
      const t = tintOf(img);
      tint.set(i, t);
      wins[i].style.setProperty("--tr", t[0]); wins[i].style.setProperty("--tg", t[1]); wins[i].style.setProperty("--tb", t[2]);
      if (i === focus) setAmbient(i);
    };
    img.decode?.().then(apply).catch(() => {});
  });
  function setAmbient(i) {
    const t = tint.get(i);
    if (!t) return;
    hero.style.setProperty("--tr", t[0]); hero.style.setProperty("--tg", t[1]); hero.style.setProperty("--tb", t[2]);
  }

  /* ---------- geometría ---------- */
  function place(dive) {
    const W = innerWidth, H = innerHeight;
    wins.forEach((w, i) => {
      const pz = poses[i];
      if (!pz) { w.hidden = true; return; }
      w.hidden = false;
      const z = pz.z + dive * DIVE_DEPTH;
      // se desvanece al atravesar el plano de la cámara y también cuando queda muy lejos
      const op = (1 - range(z, 80, 760)) * (1 - range(-z, 2400, 3400));
      w.style.transform = `translate3d(calc(-50% + ${(pz.x * W).toFixed(1)}px), calc(-50% + ${(pz.y * H).toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${pz.ry}deg) rotateX(${pz.rx}deg)`;
      w.style.opacity = op.toFixed(3);
      w.style.pointerEvents = op < 0.4 ? "none" : "";
    });
  }

  function measure() {
    narrow = innerWidth < 760;
    poses = narrow ? POSES_NARROW : POSES_WIDE;
    if (calm) { place(0); return; }
    n1.style.transform = n2.style.transform = "none";
    const h = hero.getBoundingClientRect(), a1 = n1.getBoundingClientRect(), a2 = n2.getBoundingClientRect();
    const b1 = $(".d1", dock).getBoundingClientRect(), b2 = $(".d2", dock).getBoundingClientRect();
    // El hero está fijo (sticky) durante el acople: se mide respecto del hero y se lleva al viewport.
    m = {
      s1: b1.width / a1.width, s2: b2.width / a2.width,
      dx1: b1.left - a1.left, dy1: b1.top - (a1.top - h.top),
      dx2: b2.left - a2.left, dy2: b2.top - (a2.top - h.top),
    };
  }
  addEventListener("resize", () => { requestAnimationFrame(() => { if (!calm) { field.fix(); } measure(); api.update(scrollY, innerHeight); }); });

  /* ---------- bucle del puntero: parallax de la escena + peso del nombre + foco de luz ---------- */
  let px = 0, py = 0;
  const loop = createLoop((now) => {
    const active = pointer.x > -999 && now - pointer.last < 2600;
    const tx = active ? pointer.nx : Math.sin(now / 2900) * 0.45;
    const ty = active ? pointer.ny : Math.cos(now / 3700) * 0.3;
    px = lerp(px, tx, 0.05); py = lerp(py, ty, 0.05);
    hset.style.transform = `translate3d(${(-px * 24).toFixed(1)}px, ${(-py * 15).toFixed(1)}px, 0) rotateY(${(px * 4).toFixed(2)}deg) rotateX(${(-py * 2.5).toFixed(2)}deg)`;
    if (ready && scrollY < 24) field.tick(now, 1); else if (ready) field.tick(now, 0);

    // foco: la ventana más cercana al puntero; sin puntero, la luz recorre los proyectos despacio
    if (active && now - lastPick > 140 && !narrow) {
      lastPick = now;
      let best = focus, bd = 1e9;
      wins.forEach((w, i) => {
        if (w.hidden || +w.style.opacity < 0.3) return;
        const r = w.getBoundingClientRect();
        const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== focus) { focus = best; setAmbient(focus); }
      lastAuto = now;
    } else if (!active && now - lastAuto > 5200) {
      focus = (focus + 1) % Math.min(wins.length, poses.length);
      setAmbient(focus);
      lastAuto = now;
    }
    wins.forEach((w, i) => {
      focusW[i] = lerp(focusW[i], i === focus ? 1 : 0.42, 0.07);
      w.style.setProperty("--f", focusW[i].toFixed(3));
    });
  });
  let visible = true;
  const sync = () => { if (visible && !document.hidden && !calm) loop.start(); else loop.stop(); };
  watchVisible(hero, (v) => { visible = v; sync(); });
  document.addEventListener("visibilitychange", sync);
  sync();

  /* ---------- clic en una ventana: lleva al proyecto en el explorador ---------- */
  hset.addEventListener("click", (e) => {
    const w = e.target.closest(".win");
    if (!w || +w.style.opacity < 0.4) return;
    goProject(w.dataset.id);
  });

  const api = {
    /** Un único manejador de scroll (en main.js) llama a esta función. */
    update(y, vh) {
      if (calm) {
        nav.classList.toggle("docked", y > vh * 0.5);
        return;
      }
      if (!ready) return;
      const total = track.offsetHeight - vh;
      if (y > total + vh) return; // el hero ya salió de pantalla
      const e = inOutCubic(range(y, 0, vh * 0.5));
      const dive = smooth(range(y, vh * 0.3, vh * 1.2));
      hero.style.setProperty("--dive", dive.toFixed(4));
      hero.style.setProperty("--gy", `${((y * 0.9) % 80).toFixed(1)}px`); // avanza por el plano; el módulo evita que se acabe la cuadrícula
      if (m) {
        n1.style.transform = `translate3d(${(m.dx1 * e).toFixed(2)}px, ${(m.dy1 * e).toFixed(2)}px, 0) scale(${(1 + (m.s1 - 1) * e).toFixed(4)})`;
        n2.style.transform = `translate3d(${(m.dx2 * e).toFixed(2)}px, ${(m.dy2 * e).toFixed(2)}px, 0) scale(${(1 + (m.s2 - 1) * e).toFixed(4)})`;
      }
      fades.forEach((el, i) => {
        const out = clamp(e * 2.4 - i * 0.06);
        el.style.opacity = (1 - out).toFixed(3);
        el.style.translate = `0 ${(-out * 22).toFixed(1)}px`;
        el.style.visibility = out >= 1 ? "hidden" : "";
      });
      const docked = y >= vh * 0.5;
      nav.classList.toggle("docked", docked);
      n1.style.visibility = n2.style.visibility = docked ? "hidden" : "";
      place(dive);
    },
    measure,
  };
  return api;
}
