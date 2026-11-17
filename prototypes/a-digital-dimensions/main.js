import { boot } from "/shared/content.js";
import { clamp, lerp, smooth, range, $, $$ } from "/shared/util.js";

const { data, lang, rm, msg, L, kindLabel, esc } = await boot();

const S = {
  es: {
    layers: [["Interfaz", "Interfaces con React y Next.js"], ["Lógica", "APIs e integraciones"], ["Datos", "Bases de datos"]],
    explore: "Ver proyectos", prev: "Proyecto anterior", next: "Proyecto siguiente", layersLabel: "Capas de una aplicación Full Stack",
  },
  en: {
    layers: [["Interface", "React and Next.js interfaces"], ["Logic", "APIs and integrations"], ["Data", "Databases"]],
    explore: "View projects", prev: "Previous project", next: "Next project", layersLabel: "Layers of a Full Stack application",
  },
}[lang];

const projects = data.projects;
const N = projects.length;
const [first, last] = data.name.toUpperCase().split(" ");
const chars = (word, offset = 0) => [...word].map((c, i) => `<span class="ch" style="--i:${i + offset}">${esc(c)}</span>`).join("");
const pillars = [[-0.38, -0.3], [-0.14, 0.3], [0.08, -0.12], [0.33, 0.3], [0.4, -0.34], [-0.3, 0.06]]
  .map(([x, y], i) => `<i class="pillar" style="--px:${x};--py:${y};--d:${(i * 0.43).toFixed(2)}s"></i>`).join("");

const nodes = [[14, 28], [36, 62], [52, 24], [70, 58], [86, 30], [28, 84], [62, 86]];
const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4], [1, 5], [3, 6], [5, 6]];
const net = `<svg class="net" viewBox="0 0 100 62.5" preserveAspectRatio="none" aria-hidden="true">
  ${edges.map(([a, b], i) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1] * 0.625}" x2="${nodes[b][0]}" y2="${nodes[b][1] * 0.625}"/><line class="hot" pathLength="100" style="--d:${(i * 0.37).toFixed(2)}s" x1="${nodes[a][0]}" y1="${nodes[a][1] * 0.625}" x2="${nodes[b][0]}" y2="${nodes[b][1] * 0.625}"/>`).join("")}
  ${nodes.map(([x, y]) => `<circle cx="${x}" cy="${y * 0.625}" r="1.1"/>`).join("")}
</svg>`;

const planeHtml = (n, body) => `<div class="plane p${n}" data-n="${n}" aria-hidden="true">
  <div class="tag"><b>0${n} — ${esc(S.layers[n - 1][0])}</b><small>${esc(S.layers[n - 1][1])}</small></div>${body}</div>`;

const cardHtml = (p, i) => {
  const media = p.media[0];
  return `<article class="card" data-i="${i}">
  <a href="${esc(p.deploy ?? "#")}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-label="${esc(msg.Projects.visitSiteLabel.replace("{name}", p.name))}">
    <div class="tilt">
      <div class="slab" aria-hidden="true"></div>
      <div class="shot"><img src="${esc(media.src)}" alt="${esc(L(media.alt))}" width="${media.w}" height="${media.h}" draggable="false" ${i < 3 ? "" : 'loading="lazy"'} decoding="async"></div>
      <ul class="chips" aria-hidden="true">${p.techs.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </div>
  </a>
  <div class="cap"><b>${esc(p.name)}</b><span>${esc(kindLabel(p))}</span></div>
</article>`;
};

$("#app").innerHTML = `
<header class="bar"><span class="mark">JCoding</span><span class="avail"><i aria-hidden="true"></i>${esc(L(data.availability))}</span></header>
<div class="track" id="track">
  <section class="stage" id="stage" aria-label="${esc(data.name)}">
    <div class="glow" aria-hidden="true"></div>
    <div class="world" id="world">
      ${planeHtml(3, `<div class="lattice"></div><div class="rows">${[70, 90, 55, 80, 40, 65].map((w) => `<i style="--w:${w}%"></i>`).join("")}</div>`)}
      ${planeHtml(2, net)}
      ${planeHtml(1, `<div class="shotbg" style="background-image:url('${esc(projects[0].media[0].src)}')"></div>`)}
      ${pillars}
      <h1 class="name" aria-label="${esc(data.name)} — ${esc(L(data.headline))}"><span class="ln l1" aria-hidden="true">${chars(first)}</span><span class="ln l2" aria-hidden="true">${chars(last, first.length)}</span></h1>
    </div>

    <div class="copy">
      <p class="eyebrow">${esc(L(data.headline))}</p>
      <p class="lead">${esc(L(data.valueProposition))}</p>
      <div class="cta">
        <a class="btn primary" href="mailto:${esc(data.links.email)}">${esc(msg.Hero.ctaContact)}</a>
        <a class="btn ghost" href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a>
      </div>
    </div>

    <div class="legend" role="group" aria-label="${esc(S.layersLabel)}">
      ${S.layers.map(([name, desc], i) => `<button type="button" data-n="${i + 1}" aria-pressed="false"><b>0${i + 1}</b><span>${esc(name)}</span><small>${esc(desc)}</small></button>`).join("")}
    </div>
    <button class="hint btn-hint" type="button" id="hint">${esc(S.explore)}</button>

    <div class="rail" id="rail" role="group" aria-roledescription="carousel" aria-label="${esc(msg.Nav.projects)}">${projects.map(cardHtml).join("")}</div>
    <div class="info" id="info" aria-live="polite">
      <p class="kind" id="i-kind"></p><h2 id="i-name"></h2><p class="sum" id="i-sum"></p>
      <a class="btn primary visit" id="i-visit" target="_blank" rel="noopener noreferrer"></a>
    </div>
    <div class="railnav">
      <button type="button" id="prev" aria-label="${esc(S.prev)}">←</button>
      <output id="count" aria-hidden="true"></output>
      <button type="button" id="next" aria-label="${esc(S.next)}">→</button>
    </div>
  </section>
</div>`;

const stage = $("#stage"), world = $("#world"), track = $("#track"), rail = $("#rail");
const cards = $$(".card", rail);
const links = cards.map((c) => $("a", c));
const tilts = cards.map((c) => $(".tilt", c));
const legend = $$(".legend button");
const planes = $$(".plane", world);

/* ---------- estado ---------- */
let p = 0, h = 0, r = 0;
let nx = 0, ny = 0, sx = 0, sy = 0; // puntero objetivo / suavizado (-1..1)
let sep = 1, sepT = 1, focus = 0;
let c = 0, cT = 0, active = -1;
let cw = 500, gap = 300;
let lastMove = -1e9, suppressClick = false, workMode = false;

const info = { box: $("#info"), kind: $("#i-kind"), name: $("#i-name"), sum: $("#i-sum"), visit: $("#i-visit"), count: $("#count") };

function setActive(i, { jump = false } = {}) {
  i = clamp(i, 0, N - 1);
  cT = i;
  if (jump) c = i;
  if (active === i) return;
  active = i;
  const pr = projects[i];
  info.kind.textContent = kindLabel(pr);
  info.name.textContent = pr.name;
  info.sum.textContent = L(pr.summary);
  info.visit.textContent = msg.Projects.visitSite + " ↗";
  info.visit.href = pr.deploy ?? "#";
  info.visit.setAttribute("aria-label", msg.Projects.visitSiteLabel.replace("{name}", pr.name));
  info.count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
  cards.forEach((card, j) => {
    card.classList.toggle("on", j === i);
    links[j].tabIndex = j === i && workMode ? 0 : -1;
    if (j !== i) tilts[j].style.transform = "";
  });
  if (!rm) {
    info.box.classList.remove("swap");
    void info.box.offsetWidth;
    info.box.classList.add("swap");
  }
}

/* ---------- capas: enfoque desde la leyenda ---------- */
function setFocus(n) {
  focus = n;
  sepT = n ? 1.55 : 1;
  planes.forEach((pl) => {
    const on = Number(pl.dataset.n) === n;
    if (on) pl.setAttribute("data-on", ""); else pl.removeAttribute("data-on");
    pl.style.setProperty("--fo", n && !on ? "0.32" : "1");
  });
  legend.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.n) === n)));
}
legend.forEach((b) => {
  const n = Number(b.dataset.n);
  b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setFocus(n); });
  b.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") setFocus(0); });
  b.addEventListener("focus", () => setFocus(n));
  b.addEventListener("blur", () => setFocus(0));
  b.addEventListener("click", () => setFocus(focus === n ? 0 : n));
});

/* ---------- puntero ---------- */
addEventListener("pointermove", (e) => {
  nx = (e.clientX / innerWidth - 0.5) * 2;
  ny = (e.clientY / innerHeight - 0.5) * 2;
  lastMove = performance.now();
}, { passive: true });

/* ---------- galería: arrastre, clic y teclado ---------- */
let drag = null;
rail.addEventListener("pointerdown", (e) => {
  if (!workMode || e.button > 0) return;
  drag = { x: e.clientX, c0: cT, moved: 0, id: e.pointerId };
});
rail.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  drag.moved = Math.max(drag.moved, Math.abs(dx));
  if (drag.moved > 6 && !rail.hasPointerCapture(e.pointerId)) rail.setPointerCapture(e.pointerId);
  if (drag.moved > 6) { cT = clamp(drag.c0 - dx / gap, 0, N - 1); setActive(Math.round(cT)); cT = clamp(drag.c0 - dx / gap, 0, N - 1); }
});
const endDrag = () => {
  if (!drag) return;
  suppressClick = drag.moved > 6;
  drag = null;
  setActive(Math.round(cT));
  setTimeout(() => { suppressClick = false; }, 0);
};
rail.addEventListener("pointerup", endDrag);
rail.addEventListener("pointercancel", endDrag);
rail.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card || rm) return;
  const i = Number(card.dataset.i);
  if (suppressClick || i !== active) { e.preventDefault(); if (!suppressClick) setActive(i); }
});
$("#prev").addEventListener("click", () => setActive(active - 1));
$("#next").addEventListener("click", () => setActive(active + 1));
addEventListener("keydown", (e) => {
  if (!workMode || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "ArrowRight") setActive(active + 1);
  if (e.key === "ArrowLeft") setActive(active - 1);
});
$("#hint").addEventListener("click", () => scrollTo({ top: track.offsetHeight - innerHeight, behavior: rm ? "auto" : "smooth" }));

function measure() {
  cw = cards[0].offsetWidth;
  gap = cw * (innerWidth < 700 ? 0.64 : 0.6);
}
addEventListener("resize", measure);
measure();
setActive(0, { jump: true });

/* ---------- bucle ---------- */
function frame(now) {
  const max = Math.max(1, track.offsetHeight - innerHeight);
  p = lerp(p, clamp(scrollY / max), 0.14);
  h = smooth(range(p, 0.02, 0.5));
  r = smooth(range(p, 0.36, 0.86));

  const idle = now - lastMove > 2600;
  const ax = idle ? Math.sin(now / 2300) * 0.5 : nx;
  const ay = idle ? Math.cos(now / 3100) * 0.35 : ny;
  sx = lerp(sx, ax, 0.06);
  sy = lerp(sy, ay, 0.06);
  sep = lerp(sep, sepT + (focus ? 0 : Math.sin(now / 1800) * 0.03), 0.08);

  const infl = 1 - r * 0.75;
  const rotY = -9 + sx * 13 * infl;
  const rotX = 8 - sy * 8 * infl + r * 56;
  world.style.transform = `translate3d(${(-sx * 14 * infl).toFixed(2)}px, ${(r * 30).toFixed(2)}vh, ${(-r * 240).toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${(rotY * (1 - r * 0.7)).toFixed(2)}deg) scale(${(1 - r * 0.12).toFixed(3)})`;
  world.style.setProperty("--sep", sep.toFixed(3));
  stage.style.setProperty("--h", h.toFixed(3));
  stage.style.setProperty("--r", r.toFixed(3));

  const work = r > 0.18;
  if (work !== workMode) {
    workMode = work;
    stage.classList.toggle("is-work", work);
    links.forEach((a, j) => { a.tabIndex = work && j === active ? 0 : -1; });
  }

  c = lerp(c, cT, drag ? 0.3 : 0.12);
  const compact = innerWidth < 700;
  for (let i = 0; i < N; i++) {
    const d = i - c, ad = Math.abs(d);
    const e = smooth(clamp(r * 1.7 - i * 0.14));
    const x = d * gap + Math.sign(d) * Math.min(ad, 1) * cw * 0.1;
    const z = -ad * (compact ? 150 : 230) - (1 - e) * 700;
    const y = (1 - e) * 55 + (ad > 0.5 ? 0 : 0);
    const ry = -clamp(d, -1, 1) * 50;
    cards[i].style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}vh), ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
    cards[i].style.opacity = (e * clamp(1.15 - Math.max(0, ad - 1) * 0.42)).toFixed(3);
    cards[i].style.zIndex = String(10 - Math.round(ad));
  }
  if (active >= 0 && r > 0.5) {
    tilts[active].style.transform = `rotateY(${(sx * 7).toFixed(2)}deg) rotateX(${(-sy * 5).toFixed(2)}deg)`;
  }
  requestAnimationFrame(frame);
}

if (!rm) {
  requestAnimationFrame(frame);
} else {
  // Movimiento reducido: composición estática; la galería es una cuadrícula normal.
  stage.classList.add("is-work");
  links.forEach((a) => { a.tabIndex = 0; });
}
