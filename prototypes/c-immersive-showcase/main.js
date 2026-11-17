import { boot, averageColor } from "/shared/content.js";
import { clamp, lerp, smooth, outExpo, outCubic, range, $, $$ } from "/shared/util.js";

const { data, lang, rm, msg, L, kindLabel, esc } = await boot();

const P = data.projects;
const N = P.length;
const pad2 = (n) => String(n).padStart(2, "0");
const host = (url) => { try { return new URL(url).host.replace(/^www\./, ""); } catch { return ""; } };
const compact = () => innerWidth < 760;

// Composición de la escena: posición (en anchos de ventana), profundidad y giro de cada ventana.
const POSES = [
  { x: 0.0, y: 0.0, z: 0, ry: -14, rx: 3 },
  { x: -0.98, y: -0.24, z: -430, ry: 20, rx: 2 },
  { x: 1.0, y: 0.36, z: -780, ry: -24, rx: -2 },
  { x: -0.58, y: 0.62, z: -1130, ry: 16, rx: 4 },
  { x: 0.22, y: -0.64, z: -1480, ry: -10, rx: 2 },
  { x: -1.2, y: 0.12, z: -1830, ry: 24, rx: 0 },
];

const [first, last] = data.name.split(" ");
const word = (w, i) => `<span class="w"><b style="--i:${i}">${esc(w)}</b></span>`;

const winHtml = (p, i) => {
  const m = p.media[0];
  return `<figure class="win" data-i="${i}" aria-hidden="true"><div class="box"><div class="chrome"><i></i><i></i><i></i><span>${esc(host(p.deploy ?? ""))}</span></div>
  <img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" decoding="async" draggable="false"></div></figure>`;
};

const panelHtml = (p, i) => {
  const m = p.media[0];
  const visitLabel = msg.Projects.visitSiteLabel.replace("{name}", p.name);
  return `<article class="panel" data-i="${i}" aria-label="${esc(p.name)}">
  <div class="spill" aria-hidden="true"></div>
  <div class="frame" aria-hidden="true"><div class="chrome"><i></i><i></i><i></i><span>${esc(host(p.deploy ?? ""))}</span></div>
    <img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" ${i < 2 ? "" : 'loading="lazy"'} decoding="async" draggable="false"></div>
  <div class="meta">
    <p class="m-idx">${pad2(i + 1)} / ${pad2(N)} — ${esc(kindLabel(p))}</p>
    <h2 class="m-name">${esc(p.name)}</h2>
    <p class="m-sum">${esc(L(p.summary))}</p>
    <ul class="m-tech" aria-label="${esc(msg.Projects.technologies)}">${p.techs.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <a class="btn primary m-visit" href="${esc(p.deploy ?? "#")}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-label="${esc(visitLabel)}">${esc(msg.Projects.visitSite)} ↗</a>
  </div>
  <img class="sr-only" src="${esc(m.src)}" alt="${esc(L(m.alt))}" width="1" height="1" loading="lazy">
</article>`;
};

$("#app").innerHTML = `
<header class="hud"><span class="brand">JCoding</span>
  <div class="hud-r" id="hudr"><output id="counter" aria-hidden="true">01 / ${pad2(N)}</output>
    <button class="pause" id="pause" type="button" aria-pressed="false" aria-label="${lang === "es" ? "Pausar recorrido" : "Pause tour"}">❚❚</button></div></header>
<div class="track" id="track">
  <section class="stage" id="stage" aria-label="${esc(data.name)}">
    <div class="hero" id="hero">
      <div class="cam"><div class="set" id="set">${P.map(winHtml).join("")}</div></div>
      <div class="hcopy" id="hcopy">
        <p class="eyebrow">${esc(L(data.headline))}</p>
        <h1 aria-label="${esc(data.name)}"><span aria-hidden="true">${word(first, 0)} ${word(last, 1)}</span></h1>
        <p class="lead">${esc(L(data.valueProposition))}</p>
        <div class="cta">
          <a class="btn primary" href="mailto:${esc(data.links.email)}">${esc(msg.Hero.ctaContact)}</a>
          <a class="btn" href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a>
          <button class="btn" id="go" type="button">${esc(msg.Nav.projects)} ↓</button>
        </div>
      </div>
      <div class="lower swap" id="lower" aria-hidden="true"><span id="lw-n"></span><b id="lw-name"></b><span id="lw-kind"></span></div>
    </div>
    <div class="reel" id="reel" role="region" aria-label="${esc(msg.Nav.projects)}">${P.map(panelHtml).join("")}</div>
    <div class="fade-edge" aria-hidden="true"></div>
    <nav class="ticks" id="ticks" aria-label="${esc(msg.Nav.projects)}">${P.map((p, i) => `<button type="button" data-i="${i}" aria-label="${esc(`${pad2(i + 1)} — ${p.name}`)}"></button>`).join("")}</nav>
  </section>
</div>`;

const track = $("#track"), set = $("#set"), hero = $("#hero"), reel = $("#reel");
const wins = $$(".win"), panels = $$(".panel"), ticks = $$("#ticks button");
const hcopy = $("#hcopy"), lower = $("#lower"), hudr = $("#hudr"), cam$ = $(".cam");
const frames = panels.map((p) => $(".frame", p));
const metas = panels.map((p) => $(".meta", p));
const metaKids = metas.map((m) => [...m.children]);
const spills = panels.map((p) => $(".spill", p));
const visits = panels.map((p) => $(".m-visit", p));
const chromes = frames.map((f) => $(".chrome", f));

/* ---------- luz ambiental: color medio de cada captura ---------- */
$$("img", set).forEach((img, i) => {
  img.decode().then(() => {
    const [r, g, b] = averageColor(img);
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    const k = lum > 170 ? 170 / lum : 1;
    const tint = `${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)}`;
    wins[i].style.setProperty("--tint", tint);
    panels[i].style.setProperty("--tint", tint);
  }).catch(() => {});
});

/* ---------- estado ---------- */
let sx = 0, sy = 0, nx = 0, ny = 0, lastMove = -1e9;
let shot = 0, playing = !rm, nextAt = 0, diving = false;
let cam = null;
const t0 = performance.now();
let geo = { fw: 0, fh: 0, cx: 0, cy: 0, sc: 1, ww: 0, diveLen: 0, seg: 0 };

addEventListener("pointermove", (e) => { nx = (e.clientX / innerWidth - 0.5) * 2; ny = (e.clientY / innerHeight - 0.5) * 2; lastMove = performance.now(); }, { passive: true });

function target(k) {
  const pz = POSES[k], ww = geo.ww;
  const shiftX = compact() ? 0 : innerWidth * 0.19;
  const shiftY = compact() ? -innerHeight * 0.14 : -innerHeight * 0.04;
  return { tx: -pz.x * ww + shiftX, ty: -pz.y * ww + shiftY, tz: -pz.z, ry: -pz.ry * 0.4, rx: -pz.rx * 0.4 };
}

function goShot(k, now) {
  shot = k;
  nextAt = now + 5600;
  $("#counter").textContent = `${pad2(k + 1)} / ${pad2(N)}`;
  $("#lw-n").textContent = `${pad2(k + 1)} / ${pad2(N)}`;
  $("#lw-name").textContent = P[k].name;
  $("#lw-kind").textContent = kindLabel(P[k]);
  wins.forEach((w, i) => w.classList.toggle("on", i === k));
  if (!rm) { lower.classList.remove("swap"); void lower.offsetWidth; lower.classList.add("swap"); }
}

function measure() {
  const vh = innerHeight;
  geo.ww = wins[0].offsetWidth;
  geo.diveLen = vh * 1.1;
  geo.seg = vh * 0.8;
  if (!rm) track.style.height = `${geo.diveLen + N * geo.seg + vh}px`;
  const f = frames[0];
  geo.fw = f.offsetWidth; geo.fh = f.offsetHeight;
  geo.cx = innerWidth / 2 - (f.offsetLeft + geo.fw / 2);
  geo.cy = vh / 2 - (f.offsetTop + geo.fh / 2);
  geo.sc = Math.max(innerWidth / geo.fw, vh / geo.fh) * 1.04;
}
addEventListener("resize", () => { measure(); });

/* ---------- hero: ventanas en el espacio ---------- */
const fw = new Array(N).fill(0.5);
function placeWindows(now, camNow, dive) {
  wins.forEach((w, i) => {
    fw[i] = rm ? 0.85 : lerp(fw[i], i === shot ? 1 : 0.5, 0.06);
    const pz = POSES[i];
    const ii = rm ? 1 : outExpo(clamp((now - t0 - 200 - i * 150) / 2500));
    const z = pz.z - (1 - ii) * (2300 + i * 260);
    w.style.transform = `translate3d(calc(-50% + ${(pz.x * geo.ww).toFixed(1)}px), calc(-50% + ${(pz.y * geo.ww).toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${pz.ry}deg) rotateX(${pz.rx}deg)`;
    const zrel = pz.z + camNow.tz + dive * 1500;
    const op = ii * fw[i] * (1 - range(zrel, 160, 720)) * (1 - range(-zrel, 2300, 3300));
    w.style.opacity = op.toFixed(3);
  });
}

/* ---------- bucle ---------- */
let prevT = performance.now();
function frame(now) {
  const dt = Math.min(64, now - prevT); prevT = now;
  const sY = scrollY, vh = innerHeight;
  const dive = smooth(range(sY, 0, geo.diveLen));
  const u = (sY - geo.diveLen) / geo.seg;

  /* recorrido automático solo mientras estamos arriba del todo */
  if (sY < 4) {
    if (diving) { diving = false; nextAt = now + 2500; }
    if (playing && now > nextAt && now - t0 > 3600) goShot((shot + 1) % N, now);
  } else if (!diving) {
    diving = true;
    if (shot !== 0) goShot(0, now);
  }

  const tg = target(shot);
  const k = 1 - Math.pow(1 - 0.045, dt / 16.7);
  for (const key of ["tx", "ty", "tz", "ry", "rx"]) cam[key] = lerp(cam[key], tg[key], k);

  const idle = now - lastMove > 2600;
  const ax = idle ? Math.sin(now / 2700) * 0.5 : nx, ay = idle ? Math.cos(now / 3500) * 0.35 : ny;
  sx = lerp(sx, ax, 0.05); sy = lerp(sy, ay, 0.05);

  const kx = 1 - dive;
  set.style.transform = `translate3d(${(cam.tx * kx - sx * 26).toFixed(1)}px, ${(cam.ty * kx - sy * 16).toFixed(1)}px, ${(cam.tz + dive * 1500).toFixed(1)}px) rotateY(${(cam.ry * kx + sx * 4).toFixed(2)}deg) rotateX(${(cam.rx * kx - sy * 2.5).toFixed(2)}deg)`;
  placeWindows(now, cam, dive);

  const heroGone = range(dive, 0.82, 0.96);
  cam$.style.opacity = (1 - heroGone).toFixed(3);
  hero.style.setProperty("--cop", (1 - range(dive, 0.15, 0.6)).toFixed(3));
  const copyOut = range(dive, 0, 0.3);
  for (const el of [hcopy, lower]) {
    el.style.opacity = (1 - copyOut).toFixed(3);
    el.style.translate = `0 ${(-copyOut * 30).toFixed(1)}px`;
    el.style.visibility = copyOut >= 1 ? "hidden" : "";
  }
  hudr.style.opacity = (1 - range(dive, 0.1, 0.4)).toFixed(3);
  hudr.style.pointerEvents = dive > 0.4 ? "none" : "";
  hero.style.visibility = heroGone >= 1 ? "hidden" : "";

  /* reel en túnel */
  reel.classList.toggle("on", dive > 0.55);
  ticks.forEach((t) => t.parentElement.classList.toggle("on", dive > 0.9));
  const act = clamp(Math.round(u), 0, N - 1);
  for (let i = 0; i < N; i++) {
    const q = u - i;
    const live = i === 0 ? dive > 0.55 && q < 1.05 : q > -0.8 && q < 1.05;
    panels[i].classList.toggle("live", live);
    if (!live) continue;
    let z = 0, ry = -9, x = 0, op = 1, blur = 0, cover = 0;
    if (i === 0) {
      cover = u <= 0 ? 1 : 1 - outCubic(range(u, 0, 0.55));
      op = u > 0 ? 1 : range(dive, 0.6, 0.88);
    } else {
      const en = outCubic(range(q, -0.75, 0));
      z = (1 - en) * -1500; ry = -9 + (1 - en) * 30; op = range(q, -0.75, -0.35); blur = (1 - en) * 10;
    }
    if (i < N - 1) {
      const ex = smooth(range(q, 0.55, 1));
      z += ex * 950; x -= ex * innerWidth * 0.07; ry -= ex * 14; op *= 1 - range(q, 0.7, 0.95); blur += ex * 6;
    }
    const fr = frames[i];
    const sc = 1 + (geo.sc - 1) * cover;
    fr.style.transform = `translate3d(${(geo.cx * cover + x).toFixed(1)}px, ${(geo.cy * cover).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${((ry + sx * 2.5) * (1 - cover)).toFixed(2)}deg) rotateX(${((3 - sy * 2) * (1 - cover)).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    fr.style.opacity = op.toFixed(3);
    fr.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "";
    fr.style.borderRadius = `${(10 * (1 - cover)).toFixed(1)}px`;
    chromes[i].style.opacity = (1 - cover).toFixed(3);
    spills[i].style.opacity = (op * (1 - cover * 0.6)).toFixed(3);

    const inE = smooth(i === 0 ? range(q, 0.25, 0.6) : range(q, -0.05, 0.3));
    const outE = i < N - 1 ? smooth(range(q, 0.5, 0.75)) : 0;
    metaKids[i].forEach((el, j) => {
      const v = clamp(inE * 1.5 - j * 0.2) * (1 - outE);
      el.style.opacity = v.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - clamp(inE * 1.5 - j * 0.2)) * 24 - outE * 18).toFixed(1)}px, 0)`;
    });
    visits[i].tabIndex = i === act && inE > 0.6 && outE < 0.3 ? 0 : -1;
  }
  ticks.forEach((t, i) => t.setAttribute("aria-current", String(i === act && dive > 0.9)));
  requestAnimationFrame(frame);
}

/* ---------- controles ---------- */
$("#pause").addEventListener("click", (e) => {
  playing = !playing;
  e.currentTarget.setAttribute("aria-pressed", String(!playing));
  e.currentTarget.textContent = playing ? "❚❚" : "▶";
  e.currentTarget.setAttribute("aria-label", lang === "es" ? (playing ? "Pausar recorrido" : "Reanudar recorrido") : (playing ? "Pause tour" : "Resume tour"));
  nextAt = performance.now() + 2000;
});
const toU = (u) => scrollTo({ top: geo.diveLen + u * geo.seg, behavior: rm ? "auto" : "smooth" });
$("#go").addEventListener("click", () => (rm ? $("#reel").scrollIntoView() : toU(0.62)));
ticks.forEach((t, i) => t.addEventListener("click", () => toU(i === 0 ? 0.62 : i + 0.2)));

/* ---------- arranque ---------- */
measure();
cam = target(0);
goShot(0, performance.now());
nextAt = performance.now() + 4200;
if (rm) {
  placeWindows(performance.now(), cam, 0);
  set.style.transform = `translate3d(${cam.tx}px, ${cam.ty}px, ${cam.tz}px) rotateY(${cam.ry}deg) rotateX(${cam.rx}deg)`;
  frames.forEach((f) => { f.style.transform = "none"; });
  metaKids.flat().forEach((el) => { el.style.opacity = "1"; });
  visits.forEach((v) => { v.tabIndex = 0; });
} else {
  document.fonts.ready.then(measure);
  requestAnimationFrame(frame);
}
