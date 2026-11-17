// Vista de exploración de proyectos: cover flow 3D (concepto de Digital Dimensions) + panel de información.
// Capturas y descripción cambian en la MISMA función (setActive): no hay líneas de tiempo independientes,
// por lo que no puede haber desfase entre una captura y su texto.
import { $, $$, clamp, esc, pad2 } from "../lib.js";

const techChip = (t) => `<li class="chip"${t.brandColor ? ` style="--c:${esc(t.brandColor)}"` : ""}><i aria-hidden="true"></i>${esc(t.name)}</li>`;

export function projectsHtml(ctx) {
  const { showcase, bootcamp, msg, T, L, kindLabel } = ctx;
  const cards = showcase.map((p, i) => {
    const m = p.media[0];
    return `<article class="card" data-i="${i}">
      <div class="tilt">
        <div class="slab" aria-hidden="true"></div>
        <div class="shot"><img src="${esc(m.src)}" alt="${esc(L(m.alt))}" width="${m.w}" height="${m.h}" draggable="false" ${i < 3 ? "" : 'loading="lazy"'} decoding="async"><span class="glare" aria-hidden="true"></span></div>
        <ul class="chips" aria-hidden="true">${p.techs.slice(0, 3).map((t) => `<li>${esc(t.name)}</li>`).join("")}</ul>
      </div>
      <button class="card-hit" type="button" tabindex="-1" data-i="${i}" aria-label="${esc(T.show.replace("{name}", p.name))}"></button>
    </article>`;
  }).join("");

  const index = showcase.map((p, i) => `<li><button type="button" class="cf-dot" data-i="${i}" aria-label="${esc(p.name)}"><span class="mono">${pad2(i + 1)}</span><span class="cf-dot-name">${esc(p.name)}</span></button></li>`).join("");

  const boot = bootcamp.map((p) => {
    const m = p.media[0];
    return `<li class="bc" data-reveal>
      <button type="button" class="bc-open" data-open="${esc(p.id)}" aria-label="${esc(T.open.replace("{name}", p.name))}">
        <span class="bc-img"><img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></span>
        <span class="bc-name">${esc(p.name)}</span>
      </button>
      <ul class="bc-techs">${p.techs.slice(0, 4).map((t) => `<li>${esc(t.name)}</li>`).join("")}${p.techs.length > 4 ? `<li>+${p.techs.length - 4}</li>` : ""}</ul>
      <a class="bc-visit mono" href="${esc(p.links.deploy)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(msg.Projects.visitSiteLabel.replace("{name}", p.name))}">${esc(msg.Projects.visitSite)} ↗</a>
    </li>`;
  }).join("");

  return `<section class="sec proj" id="projects" aria-labelledby="proj-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap proj-top">
    <header class="sec-head" data-io>
      <p class="eyebrow mono">${esc(msg.Projects.eyebrow)}</p>
      <h2 class="sec-title" id="proj-h"><span class="mask-line"><span>${esc(msg.Nav.projects)}</span></span></h2>
      <p class="sec-lead" data-reveal>${esc(T.projLead)}</p>
    </header>
  </div>
  <div class="cf" id="cf" role="group" aria-roledescription="carousel" aria-label="${esc(T.cfLabel)}">
    <div class="cf-enter" id="cfEnter">
      <div class="cf-stage" id="cfStage">${cards}</div>
      <button class="cf-arrow prev" type="button" id="cfPrev" aria-label="${esc(T.cfPrev)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="cf-arrow next" type="button" id="cfNext" aria-label="${esc(T.cfNext)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
    <div class="wrap">
      <ol class="cf-index" aria-label="${esc(T.allProjects)}">${index}</ol>
      <div class="panel" id="panel">
        <div class="panel-in" id="panelIn" aria-live="polite" aria-atomic="true">
          <div class="p-id">
            <p class="p-count mono" id="pCount"></p>
            <h3 class="p-name" id="pName"></h3>
            <p class="p-kind"><span class="mono" id="pKind"></span><span class="badge" id="pBadge"></span></p>
          </div>
          <p class="p-sum" id="pSum"></p>
          <div class="p-side">
            <p class="p-label mono">${esc(T.main)}</p>
            <ul class="p-techs" id="pTechs"></ul>
          </div>
        </div>
        <div class="p-actions">
          <button class="btn primary" type="button" id="pMore">${esc(T.more)} →</button>
          <a class="btn" id="pVisit" target="_blank" rel="noopener noreferrer">${esc(T.visit)} ↗</a>
        </div>
      </div>
    </div>
  </div>
  <div class="wrap bc-wrap">
    <div class="bc-head" data-io>
      <h3 class="bc-title">${esc(msg.Projects.bootcampHeading)}</h3>
      <p class="sec-lead">${esc(T.bootcampLead)}</p>
    </div>
    <ul class="bc-grid">${boot}</ul>
  </div>
</section>`;
}

export function initProjects(ctx) {
  const { showcase, rm, msg, T, L, kindLabel, badgeFor, openDetail } = ctx;
  const stage = $("#cfStage"), cf = $("#cf");
  const cards = $$(".card", stage), tilts = cards.map((c) => $(".tilt", c)), hits = $$(".card-hit", stage);
  const dots = $$(".cf-dot", cf), N = cards.length;
  const el = { count: $("#pCount"), name: $("#pName"), kind: $("#pKind"), badge: $("#pBadge"), sum: $("#pSum"), techs: $("#pTechs"), more: $("#pMore"), visit: $("#pVisit"), panelIn: $("#panelIn") };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let c = 0, cT = 0, active = -1, cw = 600, off1 = 400, off2 = 120, raf = 0, last = 0, drag = null, suppress = false;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  function measure() {
    const w = stage.clientWidth;
    const narrow = w < 700;
    cw = rm ? Math.min(w * 0.86, 900) : narrow ? w * 0.74 : Math.min(w * 0.5, 780);
    off1 = cw * (narrow ? 0.7 : 0.8);
    off2 = cw * (narrow ? 0.16 : 0.2);
    stage.style.setProperty("--cw", `${cw}px`);
    stage.style.height = `${cw * 0.625 + (narrow ? 36 : 84)}px`;
  }

  function layout() {
    for (let i = 0; i < N; i++) {
      const d = i - c, a = Math.abs(d), s = Math.sign(d), k = Math.min(a, 1), k2 = Math.max(a - 1, 0);
      const card = cards[i];
      if (rm) {
        const on = i === active;
        card.style.transform = "none";
        card.style.opacity = on ? 1 : 0;
        card.style.visibility = on ? "visible" : "hidden";
        card.style.zIndex = on ? 2 : 0;
        continue;
      }
      const x = s * (k * off1 + k2 * off2);
      const z = -(k * 240 + k2 * 150);
      const ry = -s * (k * 46 + k2 * 6);
      const sc = 1 - k * 0.12 - k2 * 0.05;
      const op = clamp(1 - k * 0.45 - k2 * 0.5);
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      card.style.opacity = op.toFixed(3);
      card.style.visibility = op < 0.02 ? "hidden" : "visible";
      card.style.zIndex = String(100 - Math.round(a * 10));
    }
    const t = tilts[active];
    if (t) t.style.transform = rm ? "" : `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
  }

  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const k = 1 - Math.exp(-dt * (rm ? 80 : 8));
    c += (cT - c) * k;
    if (Math.abs(cT - c) < 0.0006) c = cT;
    const kt = 1 - Math.exp(-dt * 10);
    tilt.x += (tilt.tx - tilt.x) * kt; tilt.y += (tilt.ty - tilt.y) * kt;
    if (Math.abs(tilt.tx - tilt.x) < 0.01) tilt.x = tilt.tx;
    if (Math.abs(tilt.ty - tilt.y) < 0.01) tilt.y = tilt.ty;
    layout();
    if (c !== cT || tilt.x !== tilt.tx || tilt.y !== tilt.ty) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  function renderPanel(i) {
    const p = showcase[i];
    el.count.textContent = `${pad2(i + 1)} / ${pad2(N)}`;
    el.name.textContent = p.name;
    el.kind.textContent = kindLabel(p);
    const b = badgeFor(p);
    el.badge.textContent = b?.text ?? "";
    el.badge.hidden = !b;
    el.badge.className = `badge${b?.pilot ? " pilot" : ""}`;
    el.sum.textContent = L(p.summary);
    el.techs.innerHTML = p.techs.slice(0, 5).map(techChip).join("");
    el.visit.href = p.links.deploy;
    el.visit.setAttribute("aria-label", msg.Projects.visitSiteLabel.replace("{name}", p.name));
    el.more.setAttribute("aria-label", `${T.more}: ${p.name}`);
    if (!rm) { el.panelIn.classList.remove("swap"); void el.panelIn.offsetWidth; el.panelIn.classList.add("swap"); }
  }

  function setActive(i) {
    i = clamp(i, 0, N - 1);
    if (i === active) return;
    active = i;
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    cards.forEach((card, j) => {
      card.classList.toggle("on", j === i);
      tilts[j].style.transform = "";
      hits[j].tabIndex = j === i ? 0 : -1;
      hits[j].setAttribute("aria-label", (j === i ? T.open : T.show).replace("{name}", showcase[j].name));
    });
    dots.forEach((d, j) => { if (j === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    renderPanel(i);
    kick();
  }
  const goTo = (i) => { cT = clamp(i, 0, N - 1); setActive(Math.round(cT)); kick(); };

  hits.forEach((h) => h.addEventListener("click", () => {
    if (suppress) return;
    const i = Number(h.dataset.i);
    if (i === active) openDetail(showcase[i].id, h); else goTo(i);
  }));
  dots.forEach((d) => d.addEventListener("click", () => goTo(Number(d.dataset.i))));
  $("#cfPrev").addEventListener("click", () => goTo(active - 1));
  $("#cfNext").addEventListener("click", () => goTo(active + 1));
  el.more.addEventListener("click", () => openDetail(showcase[active].id, el.more));
  cf.addEventListener("keydown", (e) => {
    const map = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: N - 1 };
    if (e.key in map && !e.target.closest("[data-lang]")) { e.preventDefault(); goTo(map[e.key]); const h = hits[active]; if (document.activeElement?.classList.contains("card-hit")) h.focus(); }
  });

  // Arrastre (ratón o táctil). touch-action: pan-y deja libre el scroll vertical de la página.
  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    drag = { x: e.clientX, c0: cT, moved: 0, id: e.pointerId };
  });
  stage.addEventListener("pointermove", (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      if (drag.moved > 6) { cT = clamp(drag.c0 - dx / (off1 * 0.85), 0, N - 1); setActive(Math.round(cT)); kick(); }
      return;
    }
    if (!fine || rm || e.pointerType !== "mouse") return;
    const r = tilts[active]?.getBoundingClientRect();
    if (!r) return;
    const nx = clamp((e.clientX - r.left) / r.width, 0, 1) - 0.5, ny = clamp((e.clientY - r.top) / r.height, 0, 1) - 0.5;
    tilt.ty = nx * 9; tilt.tx = -ny * 7;
    cards[active].style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
    cards[active].style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
    kick();
  });
  const end = () => {
    if (!drag) return;
    suppress = drag.moved > 6;
    drag = null;
    if (suppress) { cT = Math.round(cT); setTimeout(() => (suppress = false), 0); kick(); }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("pointerleave", () => { tilt.tx = tilt.ty = 0; kick(); });

  measure();
  setActive(0);
  layout();
  addEventListener("resize", () => { measure(); layout(); });
  new ResizeObserver(() => { measure(); layout(); }).observe(stage);
  return { goTo, active: () => active };
}
