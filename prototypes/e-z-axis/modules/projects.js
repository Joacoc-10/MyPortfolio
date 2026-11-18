// PROYECTOS · Interfaz. Explorador con dos vistas sobre los MISMOS 12 proyectos:
//  · Explorar: coverflow 3D en escritorio/tablet (arrastre, flechas, teclado) y mazo con scroll-snap nativo en móvil.
//  · Índice: lista editorial tipográfica con acordeón (la vista rápida y la más cómoda con teclado o lector de pantalla).
// Imagen y panel cambian en la MISMA función (setActive): no hay líneas de tiempo independientes.
import { $, $$, clamp, esc, pad2, host, frameThrottle, tintOf, watchVisible } from "../lib.js";

const GROUPS = ["professional", "personal", "bootcamp"];

export function projectsHtml(ctx) {
  const { projects, msg, T, L, kindLabel } = ctx;
  const groupName = (g) => (g === "professional" ? T.groupProfessional : g === "personal" ? msg.Projects.personalHeading : msg.Projects.bootcampHeading);
  const counts = Object.fromEntries(GROUPS.map((g) => [g, projects.filter((p) => p.kind === g).length]));

  const frame = (p, i) => {
    const m = p.media[0];
    if (m) {
      return `<div class="frame"><div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(p.links?.deploy ?? ""))}</span></div>
        <img src="${esc(m.src)}" alt="${esc(L(m.alt))}" width="${m.w}" height="${m.h}" draggable="false" ${i < 3 ? "" : 'loading="lazy"'} decoding="async"></div>`;
    }
    return `<div class="frame frame-type"><div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span>${esc(T.internal)}</span></div>
      <div class="ft"><p class="ft-kind mono">${esc(kindLabel(p))}</p><p class="ft-name serif">${esc(p.name)}</p>
      <ul class="ft-tech" aria-hidden="true">${p.techs.slice(0, 5).map((t) => `<li>${esc(t.name)}</li>`).join("")}</ul></div></div>`;
  };

  const cards = projects.map((p, i) => `<article class="card" data-i="${i}" data-id="${esc(p.id)}" data-kind="${p.kind}" role="group" aria-roledescription="slide" aria-label="${esc(`${i + 1} / ${projects.length} — ${p.name}`)}">
      <div class="tilt">${frame(p, i)}<span class="glare" aria-hidden="true"></span></div>
      <button class="card-hit" type="button" tabindex="-1" data-i="${i}" aria-label="${esc(T.show.replace("{name}", p.name))}"></button>
    </article>`).join("");

  const dots = projects.map((p, i) => `<li><button type="button" class="cf-dot" data-i="${i}" data-kind="${p.kind}" aria-label="${esc(`${pad2(i + 1)} — ${p.name}`)}"><span aria-hidden="true">${pad2(i + 1)}</span></button></li>`).join("");

  const groups = GROUPS.map((g) => `<button type="button" class="p-group" data-g="${g}" aria-pressed="false">${esc(groupName(g))}<b>${counts[g]}</b></button>`).join("");

  const rows = projects.map((p, i) => {
    const m = p.media[0];
    const prev = projects[i - 1];
    const head = !prev || prev.kind !== p.kind ? `<li class="ix-group mono" aria-hidden="true">${esc(groupName(p.kind))}</li>` : "";
    return `${head}<li class="row" data-i="${i}" data-id="${esc(p.id)}" data-kind="${p.kind}">
      <h3><button class="rowbtn" type="button" aria-expanded="false" aria-controls="rp-${i}" aria-label="${esc(T.rowOpen.replace("{name}", p.name))}">
        <span class="rn mono">${pad2(i + 1)}</span><span class="rt">${esc(p.name)}</span><span class="rk mono">${esc(kindLabel(p))}<span class="rar" aria-hidden="true">+</span></span>
      </button></h3>
      <div class="rp" id="rp-${i}" role="region" aria-label="${esc(p.name)}"><div class="rpi"><div class="rbody">
        <div class="rshot" aria-hidden="true">${m ? `<img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" draggable="false">` : `<div class="rshot-t serif">${esc(p.name)}</div>`}</div>
        <div class="rinfo">
          <p>${esc(L(p.summary))}</p>
          <ul class="techs" aria-label="${esc(msg.Projects.technologies)}">${p.techs.slice(0, 6).map((t) => `<li>${esc(t.name)}</li>`).join("")}</ul>
          <div class="ractions"><button type="button" class="btn primary sm" data-open="${esc(p.id)}" tabindex="-1" aria-label="${esc(T.open.replace("{name}", p.name))}">${esc(T.more)} →</button>
          ${p.links?.deploy ? `<a class="btn sm" href="${esc(p.links.deploy)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-label="${esc(msg.Projects.visitSiteLabel.replace("{name}", p.name))}">${esc(msg.Projects.visitSite)} ↗</a>` : ""}</div>
        </div>
      </div></div></div>
    </li>`;
  }).join("");

  return `<section class="sec proj" id="projects" aria-labelledby="proj-h">
  <div class="sec-rule" data-io></div>
  <div class="p-light" aria-hidden="true"></div>
  <div class="wrap p-top">
    <header class="sec-head" data-io>
      <p class="eyebrow mono"><b>Z·01</b> ${esc(msg.Projects.eyebrow)}</p>
      <h2 class="sec-title" id="proj-h"><span class="mask-line"><span>${esc(msg.Nav.projects)}</span></span></h2>
      <p class="sec-lead" data-reveal>${esc(T.pLead)}</p>
    </header>
    <div class="p-bar" data-reveal>
      <div class="p-groups" role="group" aria-label="${esc(T.groupsLabel)}">${groups}</div>
      <div class="p-view" role="group" aria-label="${esc(T.viewLabel)}">
        <button type="button" data-view="explore" aria-pressed="true">${esc(T.viewExplore)}</button>
        <button type="button" data-view="index" aria-pressed="false">${esc(T.viewIndex)}</button>
      </div>
    </div>
  </div>

  <div class="p-explore" id="pExplore">
    <div class="cf" id="cf" role="group" aria-roledescription="carousel" aria-label="${esc(T.cfLabel)}" tabindex="-1">
      <div class="cf-stage" id="cfStage">${cards}</div>
    </div>
    <div class="wrap">
      <div class="cf-nav">
        <button class="cf-arrow prev" type="button" id="cfPrev" aria-label="${esc(T.cfPrev)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <ol class="cf-index" aria-label="${esc(msg.Nav.projects)}">${dots}</ol>
        <button class="cf-arrow next" type="button" id="cfNext" aria-label="${esc(T.cfNext)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
      <p class="cf-hint mono" aria-hidden="true">${esc(T.cfHint)}</p>
      <div class="panel" id="panel">
        <div class="panel-in" id="panelIn" aria-live="polite" aria-atomic="true">
          <div class="p-id">
            <p class="p-count mono" id="pCount"></p>
            <h3 class="p-name" id="pName"></h3>
            <p class="p-kind"><span class="mono" id="pKind"></span><span class="badge" id="pBadge" hidden></span></p>
          </div>
          <p class="p-sum" id="pSum"></p>
          <div class="p-side"><p class="p-label mono">${esc(T.main)}</p><ul class="p-techs" id="pTechs"></ul></div>
        </div>
        <div class="p-actions">
          <button class="btn primary" type="button" id="pMore">${esc(T.more)} →</button>
          <a class="btn" id="pVisit" target="_blank" rel="noopener noreferrer">${esc(msg.Projects.visitSite)} ↗</a>
        </div>
      </div>
    </div>
  </div>

  <div class="wrap p-index" id="pIndex" hidden>
    <ol class="index" id="index">${rows}</ol>
  </div>
</section>`;
}

const techChip = (t) => `<li class="chip"${t.brandColor ? ` style="--c:${esc(t.brandColor)}"` : ""}><i aria-hidden="true"></i>${esc(t.name)}</li>`;

export function initProjects(ctx) {
  const { projects, rm, calm, msg, T, L, kindLabel, badgeFor, openDetail } = ctx;
  const sec = $("#projects");
  const stage = $("#cfStage"), cf = $("#cf");
  const cards = $$(".card", stage), tilts = cards.map((c) => $(".tilt", c)), hits = $$(".card-hit", stage);
  const dots = $$(".cf-dot", cf.parentElement), N = cards.length;
  const el = { count: $("#pCount"), name: $("#pName"), kind: $("#pKind"), badge: $("#pBadge"), sum: $("#pSum"), techs: $("#pTechs"), more: $("#pMore"), visit: $("#pVisit"), panelIn: $("#panelIn") };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const deckMq = matchMedia("(max-width: 700px)");
  const rows = $$(".row", $("#index"));
  const tints = new Array(N).fill(null);
  let deck = deckMq.matches && !rm;
  let c = 0, cT = 0, active = -1, cw = 600, off1 = 400, off2 = 120, raf = 0, last = 0, drag = null, suppress = false, openRow = -1, userMoved = false;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  /* ---------- luz ambiental: el color medio de la captura activa tiñe el entorno ---------- */
  $$("img", stage).forEach((img) => {
    const i = Number(img.closest(".card").dataset.i);
    const go = () => { tints[i] = tintOf(img); if (i === active) applyTint(i); };
    img.decode?.().then(go).catch(() => {});
  });
  function applyTint(i) {
    const t = tints[i] ?? [45, 212, 191];
    sec.style.setProperty("--tr", t[0]); sec.style.setProperty("--tg", t[1]); sec.style.setProperty("--tb", t[2]);
  }

  /* ---------- geometría ---------- */
  function measure() {
    const w = stage.clientWidth;
    if (!w) return;
    if (deck) {
      stage.style.height = "";
      return;
    }
    const narrow = w < 900;
    cw = calm ? Math.min(w * 0.86, 900) : narrow ? w * 0.6 : Math.min(w * 0.46, 760);
    off1 = cw * (narrow ? 0.74 : 0.8);
    off2 = cw * 0.2;
    stage.style.setProperty("--cw", `${cw}px`);
    stage.style.height = `${Math.round(cw * 0.625 + (narrow ? 58 : 96))}px`;
  }

  function layout() {
    for (let i = 0; i < N; i++) {
      const d = i - c, a = Math.abs(d), s = Math.sign(d), k = Math.min(a, 1), k2 = Math.max(a - 1, 0);
      const card = cards[i];
      if (calm) {
        const on = i === active;
        card.style.transform = "none";
        card.style.opacity = on ? 1 : 0;
        card.style.visibility = on ? "visible" : "hidden";
        card.style.zIndex = on ? 2 : 0;
        continue;
      }
      const tier = card.dataset.kind === "bootcamp" ? 0.93 : 1; // el bootcamp pesa un poco menos que el trabajo profesional
      const x = s * (k * off1 + k2 * off2);
      const z = -(k * 250 + k2 * 160);
      const ry = -s * (k * 46 + k2 * 6);
      const sc = (1 - k * 0.12 - k2 * 0.05) * tier;
      const op = clamp(1 - k * 0.42 - k2 * 0.55);
      card.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      card.style.opacity = op.toFixed(3);
      card.style.visibility = op < 0.03 ? "hidden" : "visible";
      card.style.zIndex = String(100 - Math.round(a * 10));
    }
    const t = tilts[active];
    if (t && !calm) t.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
  }

  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    c += (cT - c) * (1 - Math.exp(-dt * (calm ? 80 : 8)));
    if (Math.abs(cT - c) < 0.0006) c = cT;
    const kt = 1 - Math.exp(-dt * 10);
    tilt.x += (tilt.tx - tilt.x) * kt; tilt.y += (tilt.ty - tilt.y) * kt;
    if (Math.abs(tilt.tx - tilt.x) < 0.01) tilt.x = tilt.tx;
    if (Math.abs(tilt.ty - tilt.y) < 0.01) tilt.y = tilt.ty;
    layout();
    if (c !== cT || tilt.x !== tilt.tx || tilt.y !== tilt.ty) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (deck || raf) return; last = performance.now(); raf = requestAnimationFrame(tick); };

  /* ---------- panel sincronizado ---------- */
  function renderPanel(i) {
    const p = projects[i];
    el.count.textContent = `${pad2(i + 1)} / ${pad2(N)}`;
    el.name.textContent = p.name;
    el.kind.textContent = kindLabel(p);
    const b = badgeFor(p);
    el.badge.textContent = b?.text ?? "";
    el.badge.hidden = !b;
    el.badge.className = `badge${b?.pilot ? " pilot" : ""}`;
    el.sum.textContent = L(p.summary);
    el.techs.innerHTML = p.techs.slice(0, 5).map(techChip).join("");
    if (p.links?.deploy) {
      el.visit.hidden = false;
      el.visit.href = p.links.deploy;
      el.visit.setAttribute("aria-label", `${msg.Projects.visitSiteLabel.replace("{name}", p.name)} (${msg.Common.opensInNewTab})`);
    } else {
      el.visit.hidden = true;
      el.visit.removeAttribute("href");
    }
    el.more.setAttribute("aria-label", T.open.replace("{name}", p.name));
    if (!rm) { el.panelIn.classList.remove("swap"); void el.panelIn.offsetWidth; el.panelIn.classList.add("swap"); }
  }
  // El panel es una región viva solo después de que el visitante navega: al cargar no se anuncia nada.
  el.panelIn.removeAttribute("aria-live");

  function setActive(i) {
    i = clamp(i, 0, N - 1);
    if (i === active) return;
    active = i;
    tilt.x = tilt.y = tilt.tx = tilt.ty = 0;
    cards.forEach((card, j) => {
      card.classList.toggle("on", j === i);
      tilts[j].style.transform = "";
      hits[j].tabIndex = j === i ? 0 : -1;
      hits[j].setAttribute("aria-label", (j === i ? T.open : T.show).replace("{name}", projects[j].name));
    });
    dots.forEach((d, j) => { if (j === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    $$(".p-group").forEach((g) => g.setAttribute("aria-pressed", String(g.dataset.g === projects[i].kind)));
    if (userMoved) el.panelIn.setAttribute("aria-live", "polite");
    renderPanel(i);
    applyTint(i);
    kick();
  }

  function goTo(i, { smoothScroll = true } = {}) {
    i = clamp(i, 0, N - 1);
    userMoved = true;
    cT = i;
    if (deck) {
      const card = cards[i];
      const left = card.offsetLeft - (stage.clientWidth - card.offsetWidth) / 2;
      stage.scrollTo({ left, behavior: rm || !smoothScroll ? "auto" : "smooth" });
      setActive(i);
    } else {
      setActive(i);
      kick();
    }
  }

  /* ---------- eventos del explorador ---------- */
  hits.forEach((h) => h.addEventListener("click", () => {
    if (suppress) return;
    const i = Number(h.dataset.i);
    if (i === active) openDetail(projects[i].id, h); else goTo(i);
  }));
  // Un toque o clic sobre una tarjeta que NO está activa la centra (el botón de esa tarjeta aún no es tabulable).
  cards.forEach((card, i) => card.addEventListener("click", (e) => {
    if (suppress || e.target.closest(".card-hit") && i === active) return;
    if (i !== active) goTo(i);
  }));
  dots.forEach((d) => d.addEventListener("click", () => goTo(Number(d.dataset.i))));
  $("#cfPrev").addEventListener("click", () => goTo(active - 1));
  $("#cfNext").addEventListener("click", () => goTo(active + 1));
  el.more.addEventListener("click", () => openDetail(projects[active].id, el.more));
  $$(".p-group").forEach((g) => g.addEventListener("click", () => {
    const first = projects.findIndex((p) => p.kind === g.dataset.g);
    if (first >= 0) { setView("explore"); goTo(first); }
  }));
  $("#pExplore").addEventListener("keydown", (e) => {
    if (e.target.closest("input,textarea,select")) return;
    const map = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: N - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    goTo(map[e.key]);
    if (document.activeElement?.classList.contains("card-hit")) hits[active].focus();
  });

  // Arrastre con ratón o lápiz (el táctil usa el scroll nativo del mazo o touch-action: pan-y en tablet).
  stage.addEventListener("pointerdown", (e) => {
    if (deck || e.button > 0) return;
    drag = { x: e.clientX, c0: cT, moved: 0, id: e.pointerId };
  });
  stage.addEventListener("pointermove", (e) => {
    if (deck) return;
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved > 6 && !stage.hasPointerCapture(e.pointerId)) stage.setPointerCapture(e.pointerId);
      if (drag.moved > 6) { userMoved = true; cT = clamp(drag.c0 - dx / (off1 * 0.85), 0, N - 1); setActive(Math.round(cT)); kick(); }
      return;
    }
    if (!fine || calm || e.pointerType !== "mouse") return;
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
    cT = Math.round(cT);
    setActive(cT);
    kick();
    setTimeout(() => { suppress = false; }, 0);
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("pointerleave", () => { tilt.tx = tilt.ty = 0; kick(); });

  /* ---------- mazo móvil: scroll-snap nativo; la rotación 3D se deriva de la posición de scroll ---------- */
  const deckUpdate = frameThrottle(() => {
    if (!deck) return;
    const sc = stage.getBoundingClientRect(), mid = sc.left + sc.width / 2;
    let best = 0, bd = 1e9;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const o = clamp((r.left + r.width / 2 - mid) / r.width, -1.6, 1.6);
      const ao = Math.abs(o);
      tilts[i].style.transform = `rotateY(${(-o * 24).toFixed(2)}deg) scale(${(1 - Math.min(ao, 1) * 0.09).toFixed(3)})`;
      card.style.opacity = (1 - Math.min(ao, 1.6) * 0.38).toFixed(3);
      if (ao < bd) { bd = ao; best = i; }
    });
    if (best !== active) { userMoved = true; cT = best; setActive(best); }
  });
  stage.addEventListener("scroll", deckUpdate, { passive: true });

  function applyMode() {
    const wasDeck = deck;
    deck = deckMq.matches && !rm;
    stage.classList.toggle("is-deck", deck);
    cf.classList.toggle("is-deck", deck);
    sec.classList.toggle("is-deck", deck);
    if (!deck) {
      stage.scrollLeft = 0;
      cards.forEach((card) => { card.style.opacity = ""; });
      tilts.forEach((t) => { t.style.transform = ""; });
    } else {
      cards.forEach((card) => { card.style.transform = ""; card.style.visibility = ""; card.style.zIndex = ""; card.style.opacity = ""; });
    }
    measure();
    if (deck) {
      requestAnimationFrame(() => { goTo(Math.max(0, active), { smoothScroll: false }); deckUpdate(); });
    } else {
      if (wasDeck || active < 0) c = cT = Math.max(0, active);
      layout(); kick();
    }
  }
  deckMq.addEventListener("change", applyMode);
  addEventListener("resize", frameThrottle(() => { measure(); layout(); }));

  /* ---------- vista índice ---------- */
  function openRowAt(i, { scroll = false } = {}) {
    if (i === openRow) { i = -1; }
    openRow = i;
    rows.forEach((row, j) => {
      const on = j === i;
      row.toggleAttribute("data-open", on);
      $(".rowbtn", row).setAttribute("aria-expanded", String(on));
      $$(".rp a, .rp button", row).forEach((x) => { x.tabIndex = on ? 0 : -1; });
    });
    if (scroll && i >= 0) setTimeout(() => {
      const r = rows[i].getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight) scrollBy({ top: r.top - 100, behavior: rm ? "auto" : "smooth" });
    }, 160);
  }
  rows.forEach((row, i) => {
    $(".rowbtn", row).addEventListener("click", () => openRowAt(i, { scroll: true }));
  });

  function setView(v, { store = true } = {}) {
    const idx = v === "index";
    $("#pExplore").hidden = idx;
    $("#pIndex").hidden = !idx;
    $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
    sec.classList.toggle("view-index", idx);
    if (store) { try { sessionStorage.setItem("jcz-view", v); } catch {} }
    if (!idx) { measure(); layout(); if (deck) goTo(Math.max(0, active), { smoothScroll: false }); }
  }
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  /* ---------- arranque ---------- */
  stage.classList.toggle("is-deck", deck);
  cf.classList.toggle("is-deck", deck);
  sec.classList.toggle("is-deck", deck);
  measure();
  setActive(0);
  c = cT = 0;
  layout();
  if (deck) goTo(0, { smoothScroll: false });
  let startView = "explore";
  try { startView = sessionStorage.getItem("jcz-view") === "index" ? "index" : "explore"; } catch {}
  setView(startView, { store: false });
  watchVisible(sec, (v) => { if (v) { measure(); layout(); } }, "200px");
  // Las fuentes cambian el alto del panel; se vuelve a medir cuando están listas.
  document.fonts?.ready.then(() => { measure(); layout(); });

  return {
    /** Lleva el explorador a un proyecto (desde el hero o desde otras secciones). */
    goToId(id, { reveal = true } = {}) {
      const i = projects.findIndex((p) => p.id === id);
      if (i < 0) return;
      setView("explore");
      goTo(i, { smoothScroll: false });
      if (reveal) $("#projects").scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "start" });
    },
  };
}
