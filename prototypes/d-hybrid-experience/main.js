// D · JCoding Hybrid Experience — orquestador. Sin dependencias, sin build.
import { boot, $, $$, clamp, frameThrottle } from "./lib.js";
import { UI } from "./i18n.js";
import { navHtml, initNav, SECTIONS } from "./modules/nav.js";
import { heroHtml, initHero } from "./modules/hero.js";
import { projectsHtml, initProjects } from "./modules/projects.js";
import { createDetail } from "./modules/detail.js";
import { stackHtml, initStack, experienceHtml, aboutHtml, contactHtml, initContact, footerHtml } from "./modules/sections.js";

try {
  const base = await boot();
  const { data, lang, rm, msg } = base;
  const T = UI[lang];

  // Al cambiar de idioma se restaura la posición y se omite la intro del hero.
  let restoreY = null;
  try {
    const r = sessionStorage.getItem("jcd-restore");
    if (r) { restoreY = JSON.parse(r).y; sessionStorage.removeItem("jcd-restore"); }
  } catch {}
  const skipIntro = restoreY !== null;

  const company = Object.fromEntries(data.companies.map((c) => [c.id, c.name]));
  const showcase = data.projects.filter((p) => p.kind !== "bootcamp" && p.media.length);
  const bootcamp = data.projects.filter((p) => p.kind === "bootcamp" && p.media.length);
  // Orden del detalle: destacados → profesionales sin capturas (UES × Mercado Libre) → bootcamp
  const order = [...showcase, ...data.projects.filter((p) => p.kind !== "bootcamp" && !p.media.length), ...bootcamp];
  const kindLabel = (p) => (p.kind === "personal" ? msg.Projects.kindPersonal : p.kind === "bootcamp" ? msg.Projects.kindBootcamp : company[p.companyId] ?? "");
  const badgeFor = (p) => (p.stage === "pilot" ? { text: msg.Common.activePilot, pilot: true } : p.inProduction ? { text: msg.Common.inProduction } : null);

  const ctx = { ...base, T, skipIntro, showcase, bootcamp, order, kindLabel, badgeFor };
  const nav = SECTIONS.map((id) => ({ id, label: msg.Nav[id] }));

  $("#app").innerHTML = navHtml(ctx)
    + `<main id="main">${heroHtml(ctx)}${projectsHtml(ctx)}${stackHtml(ctx)}${experienceHtml(ctx)}${aboutHtml(ctx)}${contactHtml(ctx)}</main>`
    + footerHtml({ ...ctx, nav });

  const detail = createDetail(ctx);
  ctx.openDetail = (id) => detail.open(id);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) detail.open(b.dataset.open);
  });

  initNav(ctx);
  initHero(ctx);
  initProjects(ctx);
  initStack(ctx);
  initContact(ctx);

  /* ---- revelado al entrar en pantalla (solo observa; no captura el scroll) ---- */
  const targets = $$("[data-io],[data-reveal]");
  if (rm || !("IntersectionObserver" in window)) targets.forEach((t) => t.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((t) => io.observe(t));
  }

  /* ---- scroll: un único manejador, un frame, solo lecturas baratas ---- */
  const hero = $("#hero"), track = $("#top"), navEl = $("#nav"), heroLogo = $("#heroLogo"), navLogo = $(".nav-logo .jlogo");
  const cf = $("#cf"), cfEnter = $("#cfEnter"), timeline = $("#timeline"), links = $$(".nav-links a");
  const secs = SECTIONS.map((id) => $(`#${id}`));
  const onScroll = frameThrottle(() => {
    const y = scrollY, vh = innerHeight;
    navEl.classList.toggle("solid", y > 40);
    let p = 0;
    if (!rm) {
      p = clamp(-track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - vh));
      hero.style.setProperty("--p", p.toFixed(4));
      heroLogo.style.setProperty("--rot", `${(p * 220).toFixed(1)}deg`);
      cfEnter.style.setProperty("--enter", clamp((vh - cf.getBoundingClientRect().top) / (vh * 0.8)).toFixed(3));
      navLogo.style.setProperty("--rot", `${(y * 0.06).toFixed(1)}deg`);
    }
    navEl.classList.toggle("logo-on", rm ? y > 200 : p > 0.18);
    const tl = timeline.getBoundingClientRect();
    timeline.style.setProperty("--tl", clamp((vh * 0.65 - tl.top) / tl.height).toFixed(3));
    let cur = -1;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * 0.4) cur = i; });
    links.forEach((a, i) => { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  if (restoreY !== null) requestAnimationFrame(() => { scrollTo({ top: restoreY, behavior: "instant" }); onScroll(); });
  onScroll();
  document.documentElement.dataset.ready = "1";
} catch (err) {
  console.error(err);
  document.getElementById("app").innerHTML = `<p style="padding:40px;font-family:system-ui;color:#f2f4f8">No se pudo cargar el prototipo. ${String(err.message ?? err)}</p>`;
}
