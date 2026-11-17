import { boot } from "/shared/content.js";
import { clamp, lerp, range, inOutCubic, $, $$ } from "/shared/util.js";

const { data, lang, rm, msg, L, kindLabel, esc } = await boot();

const projects = data.projects;
const [first, last] = data.name.split(" ");
const compact = () => innerWidth < 760;

const letters = (word, cls = "") =>
  [...word].map((c, i) => `<span class="mk"><span class="lt ${i === 0 && cls ? cls : ""}" style="--i:${i}">${esc(c)}</span></span>`).join("");
const plain = (word) => [...word].map((c) => `<span class="dl">${esc(c)}</span>`).join("");
const pad2 = (n) => String(n).padStart(2, "0");
const badgeText = `${L(data.headline)} · `.toUpperCase().repeat(2);

const rowHtml = (p, i) => {
  const media = p.media[0];
  return `<li class="row" data-i="${i}">
  <h3><button class="rowbtn" type="button" aria-expanded="false" aria-controls="rp-${i}" data-ring-hover>
    <span class="rn">${pad2(i + 1)}</span><span class="rt" data-chars="${p.name.length}">${esc(p.name)}</span>
    <span class="rm2">${esc(kindLabel(p))}<span class="rar" aria-hidden="true">+</span></span>
  </button></h3>
  <div class="rp" id="rp-${i}" role="region" aria-label="${esc(p.name)}"><div class="rpi"><div class="rbody">
    <a class="rshot" href="${esc(p.deploy ?? "#")}" target="_blank" rel="noopener noreferrer" data-ring="${esc(msg.Projects.visitSite)} ↗" tabindex="-1" aria-label="${esc(msg.Projects.visitSiteLabel.replace("{name}", p.name))}">
      <img src="${esc(media.src)}" alt="${esc(L(media.alt))}" width="${media.w}" height="${media.h}" ${i < 2 ? "" : 'loading="lazy"'} decoding="async" draggable="false">
    </a>
    <div class="rinfo">
      <p>${esc(L(p.summary))}</p>
      <ul class="techs" aria-label="${esc(msg.Projects.technologies)}">${p.techs.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <a class="visit" href="${esc(p.deploy ?? "#")}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-label="${esc(msg.Projects.visitSiteLabel.replace("{name}", p.name))}">${esc(msg.Projects.visitSite)} ↗</a>
    </div>
  </div></div></div>
</li>`;
};

$("#app").innerHTML = `
<header class="dock" id="dock">
  <a class="dnm" href="#" aria-label="${esc(data.name)}" id="dnm"><span class="d1" id="d1" aria-hidden="true">${plain(first.toUpperCase())}</span><span class="d2" id="d2" aria-hidden="true">${esc(last)}</span></a>
  <a class="dcta" href="mailto:${esc(data.links.email)}">${esc(msg.Hero.ctaContact)}</a>
</header>
<div class="htrack" id="htrack">
  <section class="hero" id="hero" aria-label="${esc(data.name)}">
    <div class="top"><b>JCoding</b><span>${esc(L(data.availability))}</span></div>
    <h1 class="nm" aria-label="${esc(data.name)} — ${esc(L(data.headline))}">
      <span class="n1" id="n1" aria-hidden="true">${letters(first.toUpperCase())}</span>
      <span class="n2" id="n2" aria-hidden="true">${letters(last, "acid")}</span>
    </h1>
    <p class="role" id="role">${esc(L(data.headline))}</p>
    <p class="lead" id="lead">${esc(L(data.valueProposition))}</p>
    <div class="ctas" id="ctas">
      <a class="big" href="mailto:${esc(data.links.email)}" data-mag>${esc(msg.Hero.ctaContact)}<span aria-hidden="true">↗</span></a>
      <a class="cv" href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a>
    </div>
    <svg class="badge" id="badge" viewBox="0 0 120 120" aria-hidden="true">
      <defs><path id="bc" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>
      <circle cx="60" cy="60" r="5"/><text><textPath href="#bc" textLength="276" lengthAdjust="spacing">${esc(badgeText)}</textPath></text>
    </svg>
  </section>
</div>
<section class="work" id="work" aria-labelledby="work-h">
  <div class="wh"><h2 class="bigword" id="work-h">${esc(msg.Nav.projects)}</h2><span class="wcount" aria-hidden="true">${pad2(projects.length)}</span></div>
  <ol class="index" id="index">${projects.map(rowHtml).join("")}</ol>
</section>`;

const hero = $("#hero"), n1 = $("#n1"), n2 = $("#n2"), dock = $("#dock"), d1 = $("#d1"), d2 = $("#d2");
const fades = ["#role", "#lead", "#ctas", "#badge", ".top"].map((s) => $(s));
const lts1 = $$(".lt", n1), lts2 = $$(".lt", n2);
const rows = $$(".row");
const ring = $("#ring");

/* ================= acople del nombre en la cabecera ================= */
let m = null;
function measure() {
  [n1, n2].forEach((el) => { el.style.transform = "none"; });
  const w1 = n1.offsetWidth;
  const fs1 = parseFloat(getComputedStyle(n1).fontSize);
  const fs2 = parseFloat(getComputedStyle(n2).fontSize);
  const target = Math.min(190, innerWidth * (compact() ? 0.34 : 0.42));
  const s = target / w1;
  const fd2 = fs1 * s * 1.55; // el apellido acoplado mantiene siempre la misma proporción con el nombre
  const s2 = fd2 / fs2;
  d1.style.width = target + "px";
  d1.style.fontSize = fs1 * s + "px";
  d2.style.fontSize = fd2 + "px";
  const a1 = n1.getBoundingClientRect(), a2 = n2.getBoundingClientRect();
  const b1 = d1.getBoundingClientRect(), b2 = d2.getBoundingClientRect();
  m = { s, s2, dx1: b1.left - a1.left, dy1: b1.top - a1.top, dx2: b2.left - a2.left, dy2: b2.top - a2.top };
  cacheCenters();
}
let centers1 = [], centers2 = [];
function cacheCenters() {
  const c = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; };
  centers1 = lts1.map(c);
  centers2 = lts2.map(c);
}

/* ================= puntero, letras variables y anillo ================= */
let px = -999, py = -999, lastMove = -1e9, ready = false;
const amp1 = new Array(lts1.length).fill(0), amp2 = new Array(lts2.length).fill(0);
addEventListener("pointermove", (e) => {
  px = e.clientX; py = e.clientY; lastMove = performance.now();
  if (ring) { ring.classList.add("on"); }
}, { passive: true });

let rx = 0, ry = 0;
if (matchMedia("(hover: hover) and (pointer: fine)").matches && !rm) {
  const tick = () => {
    rx = lerp(rx, px, 0.2); ry = lerp(ry, py, 0.2);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(tick);
  };
  tick();
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest?.("[data-ring]");
    ring.classList.toggle("big", Boolean(t));
    if (t) ring.firstElementChild.textContent = t.dataset.ring;
  });
}

/* magnético en el CTA grande */
const mag = $("[data-mag]");
if (mag && !rm && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  mag.addEventListener("pointermove", (e) => {
    const r = mag.getBoundingClientRect();
    mag.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1)}px)`;
  });
  mag.addEventListener("pointerleave", () => { mag.style.transform = ""; });
}

/* ================= bucle ================= */
let p = 0;
const fill = $("#work-h");
function frame(now) {
  const sy = scrollY;
  const pt = clamp(sy / (innerHeight * 0.9));
  p = lerp(p, pt, 0.2);
  if (Math.abs(p - pt) < 0.0005) p = pt;
  const e = inOutCubic(range(p, 0.04, 0.96));

  if (m) {
    n1.style.transform = `translate3d(${(m.dx1 * e).toFixed(2)}px, ${(m.dy1 * e).toFixed(2)}px, 0) scale(${(1 + (m.s - 1) * e).toFixed(4)})`;
    n2.style.transform = `translate3d(${(m.dx2 * e).toFixed(2)}px, ${(m.dy2 * e).toFixed(2)}px, 0) scale(${(1 + (m.s2 - 1) * e).toFixed(4)})`;
  }
  const rest = clamp(1 - e * 4);
  fades.forEach((el, i) => {
    const out = clamp(e * 2.2 - i * 0.05);
    el.style.opacity = (1 - out).toFixed(3);
    if (!el.classList.contains("top")) el.style.translate = `0 ${(-out * 26).toFixed(1)}px`;
    el.style.pointerEvents = out > 0.6 ? "none" : "";
  });
  const docked = p >= 0.998;
  dock.classList.toggle("on", docked);
  hero.classList.toggle("docked", docked);
  n1.style.visibility = n2.style.visibility = docked ? "hidden" : "";

  /* letras: ancho y peso responden a la cercanía del puntero (u ola automática si no hay puntero) */
  if (ready && rest > 0) {
    const idle = now - lastMove > 2200;
    const radius = Math.max(120, innerWidth * 0.1);
    lts1.forEach((el, i) => {
      const c = centers1[i];
      let target = 0;
      if (idle) target = 0.5 + 0.5 * Math.sin(now / 950 - i * 0.9);
      else target = Math.exp(-(((px - c.x) / radius) ** 2 + ((py - c.y) / (c.h * 0.9)) ** 2));
      amp1[i] = lerp(amp1[i], target * (idle ? 0.55 : 1) * rest, 0.14);
      const a = amp1[i];
      el.style.fontVariationSettings = `"wght" ${(700 + 200 * a).toFixed(0)}, "wdth" ${(112 + 38 * a).toFixed(0)}`;
    });
    lts2.forEach((el, i) => {
      const c = centers2[i];
      let target = 0;
      if (idle) target = 0.5 + 0.5 * Math.sin(now / 1100 - i * 0.7 + 1.2);
      else target = Math.exp(-(((px - c.x) / (radius * 1.4)) ** 2 + ((py - c.y) / (c.h * 0.9)) ** 2));
      amp2[i] = lerp(amp2[i], target * (idle ? 0.5 : 1) * rest, 0.14);
      el.style.transform = `translateY(${(-amp2[i] * 0.07).toFixed(3)}em) rotate(${(amp2[i] * -3).toFixed(2)}deg)`;
    });
  }

  /* palabra de la sección: se rellena con el scroll */
  const top = fill.getBoundingClientRect().top;
  fill.style.setProperty("--fill", `${(range(top, innerHeight * 0.85, innerHeight * 0.2) * 100).toFixed(1)}%`);
  requestAnimationFrame(frame);
}

/* ================= índice de proyectos ================= */
let openIdx = -1, lastOpen = 0, hoverPt = { x: -1, y: -1 };
function fitWord() {
  const word = $("#work-h"), box = word.parentElement;
  const avail = box.clientWidth - $(".wcount", box).offsetWidth - 24;
  word.style.fontSize = "100px";
  word.style.fontSize = `${(100 * avail / word.scrollWidth).toFixed(2)}px`;
}
function setFit() {
  fitWord();
  const vw = compact() ? 150 : 128, cap = compact() ? 13.2 : 9.4;
  $$(".rt").forEach((el) => {
    el.style.setProperty("--fs", `min(${cap}vw, ${(vw / Number(el.dataset.chars)).toFixed(2)}vw)`);
  });
}
function open(i, { scroll = false } = {}) {
  if (i === openIdx) return;
  openIdx = i;
  lastOpen = performance.now();
  rows.forEach((row, j) => {
    const on = j === i;
    row.toggleAttribute("data-open", on);
    $(".rowbtn", row).setAttribute("aria-expanded", String(on));
    $(".rar", row).textContent = on ? "+" : "+";
    $$("a", row).forEach((a) => { a.tabIndex = on ? 0 : -1; });
  });
  if (scroll) {
    setTimeout(() => {
      const r = rows[i].getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight) scrollBy({ top: r.top - 90, behavior: rm ? "auto" : "smooth" });
    }, 120);
  }
}
rows.forEach((row, i) => {
  const btn = $(".rowbtn", row);
  btn.addEventListener("click", () => open(i, { scroll: true }));
  // Abrir por hover solo si el puntero se movió de verdad (un reflujo del layout no cuenta).
  btn.addEventListener("pointermove", (e) => {
    const moved = Math.hypot(e.clientX - hoverPt.x, e.clientY - hoverPt.y) >= 3;
    hoverPt = { x: e.clientX, y: e.clientY };
    if (rm || e.pointerType !== "mouse" || !moved) return;
    if (performance.now() - lastOpen > 550) open(i);
  });
});

/* ================= arranque ================= */
setFit();
open(0);
const start = () => {
  measure();
  if (!rm) requestAnimationFrame(frame);
};
document.fonts.ready.then(() => { setFit(); start(); setTimeout(() => { cacheCenters(); ready = true; }, rm ? 0 : 2600); });
let rz;
addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { setFit(); if (!rm) measure(); }, 120); });
