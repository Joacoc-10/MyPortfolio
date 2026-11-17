// Vista de detalle: un <dialog> modal accesible (Escape, foco devuelto a quien lo abrió, scroll de la página bloqueado).
// Galería de capturas reales dentro de un marco de navegador, información completa y demo bajo demanda:
// el <iframe> NO existe hasta pulsar «Explorar demo»; solo hay uno a la vez y se destruye al salir, al cambiar
// de proyecto o al cerrar. UES × Mercado Libre (sistema interno) usa una presentación tipográfica, sin capturas inventadas.
import { $, $$, esc, pad2, host } from "../lib.js";
import { demoStatus } from "../demos.js";

const CATS = ["frontend", "backend", "database", "devops", "tools", "services"];
const LOAD_TIMEOUT_MS = 12000;
const SANDBOX = "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";
const chip = (t) => `<li class="chip"${t.brandColor ? ` style="--c:${esc(t.brandColor)}"` : ""}><i aria-hidden="true"></i>${esc(t.name)}</li>`;

export function createDetail(ctx) {
  const { projects: order, msg, T, L, kindLabel, badgeFor, rm } = ctx;
  const dlg = document.createElement("dialog");
  dlg.className = "detail";
  dlg.id = "detail";
  dlg.setAttribute("aria-labelledby", "d-title");
  dlg.innerHTML = `<div class="d-shell">
    <header class="d-bar">
      <button type="button" class="btn sm" id="dClose"><span aria-hidden="true">←</span> ${esc(T.back)}</button>
      <p class="d-crumb mono" id="dCrumb" aria-hidden="true"></p>
      <div class="d-step">
        <button type="button" class="btn sm" id="dPrev"><span aria-hidden="true">‹</span><span class="sr-only" id="dPrevT"></span></button>
        <button type="button" class="btn sm" id="dNext"><span aria-hidden="true">›</span><span class="sr-only" id="dNextT"></span></button>
      </div>
    </header>
    <div class="d-body" id="dBody">
      <div class="d-media" id="dMedia"></div>
      <div class="d-info" id="dInfo" tabindex="-1"></div>
    </div>
  </div>`;
  document.body.appendChild(dlg);

  const el = { media: $("#dMedia", dlg), info: $("#dInfo", dlg), crumb: $("#dCrumb", dlg), body: $("#dBody", dlg) };
  let idx = 0, shot = 0, demo = null, opener = null;
  const proj = () => order[idx];

  /* ---------- demo bajo demanda ---------- */
  function destroyDemo() {
    if (!demo) return;
    clearTimeout(demo.timer);
    document.removeEventListener("securitypolicyviolation", demo.onCsp);
    demo.iframe.src = "about:blank";
    demo.iframe.remove();
    demo = null;
  }

  function failDemo(load, url) {
    load.innerHTML = `<span>${esc(T.demoFail)}</span><a class="btn primary sm" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(T.visitOriginal)} ↗</a>`;
    load.hidden = false;
  }

  function enterDemo() {
    const p = proj();
    if (demoStatus(p) !== "verified") return;
    destroyDemo(); // nunca más de una aplicación a la vez
    const url = p.links.deploy;
    el.media.innerHTML = `<div class="demo" id="demo">
      <div class="demo-bar">
        <span class="demo-host mono" title="${esc(url)}">${esc(host(url))}</span>
        <div class="seg" role="group" aria-label="${esc(T.demoDesktop)} / ${esc(T.demoMobile)}">
          <button type="button" data-dev="desktop" aria-pressed="true">${esc(T.demoDesktop)}</button>
          <button type="button" data-dev="mobile" aria-pressed="false">${esc(T.demoMobile)}</button>
        </div>
        <a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(T.visitOriginal)} ↗</a>
        <button type="button" class="btn primary sm" id="demoExit">${esc(T.exitDemo)}</button>
      </div>
      <div class="demo-stage" id="demoStage" data-dev="desktop">
        <div class="demo-load" id="demoLoad" role="status"><span class="spin" aria-hidden="true"></span>${esc(T.demoLoading)}</div>
      </div>
      <p class="demo-hint">${esc(T.demoHint)}</p>
    </div>`;
    const stage = $("#demoStage", el.media), load = $("#demoLoad", el.media);
    const iframe = document.createElement("iframe");
    iframe.title = `Demo: ${p.name}`;
    iframe.setAttribute("sandbox", SANDBOX);  // sin allow-top-navigation: el sitio incrustado no puede redirigir el portfolio
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("allow", "");
    iframe.addEventListener("load", () => { if (demo && !demo.failed) { clearTimeout(demo.timer); load.hidden = true; } });
    // Si el servidor que sirve el prototipo no declara este host en frame-src, el navegador lo avisa: se muestra la alternativa de inmediato.
    const onCsp = (e) => { if (/frame-src|default-src/.test(e.violatedDirective) && demo) { demo.failed = true; clearTimeout(demo.timer); failDemo(load, url); } };
    document.addEventListener("securitypolicyviolation", onCsp);
    stage.appendChild(iframe);
    demo = { iframe, onCsp, failed: false, timer: setTimeout(() => { if (demo) { demo.failed = true; failDemo(load, url); } }, LOAD_TIMEOUT_MS) };
    iframe.src = url;
    $("#demoExit", el.media).addEventListener("click", exitDemo);
    $$("[data-dev]", el.media).forEach((b) => b.addEventListener("click", () => {
      stage.dataset.dev = b.dataset.dev;
      $$("[data-dev]", el.media).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
    $("#demoExit", el.media).focus();
  }

  function exitDemo() {
    if (!demo) return;
    destroyDemo();
    renderMedia();
    $("#demoBtn", el.media)?.focus();
  }

  /* ---------- galería ---------- */
  function renderMedia() {
    const p = proj(), media = p.media, st = demoStatus(p);
    if (!media.length) {
      el.media.innerHTML = `<div class="m-type"><div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span>${esc(T.internal)}</span></div>
        <div class="m-type-in"><p class="mono">${esc(kindLabel(p))}</p><p class="m-type-name serif">${esc(p.name)}</p>
        <ul class="m-type-tech">${p.techs.slice(0, 9).map((t) => `<li>${esc(t.name)}</li>`).join("")}</ul></div></div>
        <p class="m-note">${esc(T.internalNote)}</p>`;
      return;
    }
    const note = st === "blocked" ? T.demoBlocked : st === "unverified" ? T.demoPending : "";
    el.media.innerHTML = `<div class="m-view" role="group" aria-roledescription="carousel" aria-label="${esc(T.gallery)}">
      <figure class="g-main">
        <div class="chrome" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(p.links?.deploy ?? ""))}</span></div>
        <img id="gImg" width="${media[0].w}" height="${media[0].h}" alt="" decoding="async">
        <figcaption class="g-cap"><span id="gCap"></span><span class="mono" id="gCount" aria-hidden="true"></span></figcaption>
        ${media.length > 1 ? `<button type="button" class="g-arrow prev" id="gPrev" aria-label="${esc(T.shotPrev)}">‹</button><button type="button" class="g-arrow next" id="gNext" aria-label="${esc(T.shotNext)}">›</button>` : ""}
      </figure>
      ${st === "verified" ? `<button type="button" class="btn primary demo-btn" id="demoBtn">${esc(T.demo)} <span aria-hidden="true">▶</span></button>` : ""}
      ${note ? `<p class="m-note">${esc(note)}</p>` : ""}
      ${media.length > 1 ? `<ul class="g-thumbs">${media.map((m, i) => `<li><button type="button" data-s="${i}" aria-label="${esc(T.shot.replace("{n}", i + 1).replace("{total}", media.length))}"><img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></button></li>`).join("")}</ul>` : ""}
    </div>`;
    setShot(Math.min(shot, media.length - 1), true);
    $("#demoBtn", el.media)?.addEventListener("click", enterDemo);
    $("#gPrev", el.media)?.addEventListener("click", () => setShot(shot - 1));
    $("#gNext", el.media)?.addEventListener("click", () => setShot(shot + 1));
    $$(".g-thumbs button", el.media).forEach((b) => b.addEventListener("click", () => setShot(Number(b.dataset.s))));
  }

  function setShot(i, first = false) {
    const media = proj().media;
    shot = (i + media.length) % media.length;
    const m = media[shot], img = $("#gImg", el.media);
    img.src = m.src;
    img.alt = L(m.alt);
    $("#gCap", el.media).textContent = m.caption ? L(m.caption) : "";
    $("#gCount", el.media).textContent = `${pad2(shot + 1)} / ${pad2(media.length)}`;
    $$(".g-thumbs button", el.media).forEach((b, j) => { if (j === shot) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    if (!first && !rm) { img.classList.remove("fade"); void img.offsetWidth; img.classList.add("fade"); }
  }

  /* ---------- información ---------- */
  function renderInfo() {
    const p = proj(), b = badgeFor(p);
    const byCat = CATS.map((c) => ({ c, items: p.techs.filter((t) => t.category === c) })).filter((g) => g.items.length);
    const label = (c) => (c === "services" ? T.services : msg.Stack.categories[c]);
    const contribs = p.contributions ? L(p.contributions) : null;
    el.info.innerHTML = `
      <p class="d-kind"><span class="mono">${esc(kindLabel(p))}</span>${b ? `<span class="badge${b.pilot ? " pilot" : ""}">${esc(b.text)}</span>` : ""}</p>
      <h2 class="d-title" id="d-title">${esc(p.name)}</h2>
      <section class="d-sec"><h3 class="d-h mono">${esc(T.summary)}</h3><p class="d-p">${esc(L(p.summary))}</p></section>
      ${p.problem ? `<section class="d-sec"><h3 class="d-h mono">${esc(T.problem)}</h3><p class="d-p">${esc(L(p.problem))}</p></section>` : ""}
      ${contribs?.length ? `<section class="d-sec"><h3 class="d-h mono">${esc(msg.Experience.contributionsHeading)}</h3><ul class="d-list">${contribs.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></section>` : ""}
      <section class="d-sec"><h3 class="d-h mono">${esc(msg.Experience.technologies)}</h3>
        ${byCat.map((g) => `<div class="tg"><h4 class="tg-h">${esc(label(g.c))}</h4><ul class="d-chips">${g.items.map(chip).join("")}</ul></div>`).join("")}
      </section>
      ${p.links?.deploy || p.links?.repo ? `<section class="d-sec"><h3 class="d-h mono">${esc(T.links)}</h3><div class="d-links">
        ${p.links.deploy ? `<a class="btn primary" href="${esc(p.links.deploy)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${msg.Projects.visitSiteLabel.replace("{name}", p.name)} (${msg.Common.opensInNewTab})`)}">${esc(msg.Projects.visitSite)} ↗</a>` : ""}
        ${p.links.repo ? `<a class="btn" href="${esc(p.links.repo)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${msg.Projects.viewRepoLabel.replace("{name}", p.name)} (${msg.Common.opensInNewTab})`)}">${esc(msg.Projects.viewRepo)} ↗</a>` : ""}
      </div></section>` : ""}`;
    el.info.scrollTop = 0;
  }

  function render() {
    destroyDemo();
    const n = order.length;
    el.crumb.textContent = `${pad2(idx + 1)} / ${pad2(n)}`;
    $("#dPrevT", dlg).textContent = `${T.detailPrev}: ${order[(idx - 1 + n) % n].name}`;
    $("#dNextT", dlg).textContent = `${T.detailNext}: ${order[(idx + 1) % n].name}`;
    shot = 0;
    renderInfo();
    renderMedia();
    el.body.classList.remove("swap");
    if (!rm) { void el.body.offsetWidth; el.body.classList.add("swap"); }
  }

  /* ---------- abrir / cerrar ---------- */
  function open(id, from) {
    const i = order.findIndex((p) => p.id === id);
    if (i < 0) return;
    idx = i;
    opener = from instanceof HTMLElement ? from : document.activeElement;
    render();
    document.documentElement.classList.add("lock");
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg.open) dlg.close(); }

  // Escape dentro de una demo: primero se sale de la demo. Se intercepta la tecla (no solo `cancel`):
  // Chrome ignora preventDefault() en `cancel` si no hubo activación de usuario reciente.
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && demo) { e.preventDefault(); e.stopPropagation(); exitDemo(); }
  }, true);
  dlg.addEventListener("cancel", (e) => { if (demo) { e.preventDefault(); exitDemo(); } });
  dlg.addEventListener("close", () => {
    destroyDemo();
    document.documentElement.classList.remove("lock");
    const back = opener && document.contains(opener) && opener.getClientRects().length ? opener : $("#proj-h");
    back?.focus?.({ preventScroll: true });
    opener = null;
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // clic en el fondo
  $("#dClose", dlg).addEventListener("click", close);
  $("#dPrev", dlg).addEventListener("click", () => { idx = (idx - 1 + order.length) % order.length; render(); });
  $("#dNext", dlg).addEventListener("click", () => { idx = (idx + 1) % order.length; render(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.target.closest("input,textarea")) return;
    if (e.key === "ArrowLeft" && e.target.closest("#dMedia") && $("#gPrev", dlg)) setShot(shot - 1);
    if (e.key === "ArrowRight" && e.target.closest("#dMedia") && $("#gNext", dlg)) setShot(shot + 1);
  });

  return { open, close, isOpen: () => dlg.open };
}
