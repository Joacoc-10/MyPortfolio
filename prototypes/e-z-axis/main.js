// E · Z-AXIS — orquestador. Sin dependencias, sin build. Un único manejador de scroll (un frame, lecturas baratas).
import { boot, $, $$, clamp, range, frameThrottle, esc } from "./lib.js";
import { UI } from "./i18n.js";
import { navHtml, initNav, bindLanguage, setActiveLink, SECTIONS } from "./modules/nav.js";
import { heroHtml, initHero } from "./modules/hero.js";
import { projectsHtml, initProjects } from "./modules/projects.js";
import { createDetail } from "./modules/detail.js";
import { experienceHtml, stackHtml, initStack, aboutHtml, contactHtml, initContact, footerHtml } from "./modules/sections.js";

try {
  const base = await boot();
  const { data, lang, rm, calm, msg } = base;
  const T = UI[lang];

  // Al cambiar de idioma se restaura la posición y se omite la intro del hero.
  let restoreY = null;
  try {
    const r = sessionStorage.getItem("jcz-restore");
    if (r) { restoreY = JSON.parse(r).y; sessionStorage.removeItem("jcz-restore"); }
  } catch {}
  const skipIntro = restoreY !== null;

  const projects = data.projects; // los 12, en el orden del portfolio: profesionales → personales → bootcamp
  const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
  const company = Object.fromEntries(data.companies.map((c) => [c.id, c.name]));
  const kindLabel = (p) => (p.kind === "personal" ? msg.Projects.kindPersonal : p.kind === "bootcamp" ? msg.Projects.kindBootcamp : company[p.companyId] ?? "");
  const badgeFor = (p) => (p.stage === "pilot" ? { text: msg.Common.activePilot, pilot: true } : p.inProduction ? { text: msg.Common.inProduction } : null);
  const ctx = { ...base, T, projects, byId, company, kindLabel, badgeFor, skipIntro, openDetail: () => {}, goProject: () => {} };

  /* ---- riel de profundidad (decorativo; la navegación real es el menú) ---- */
  const stops = [T.surface, msg.Nav.projects, msg.Nav.experience, msg.Nav.stack, msg.Nav.about, msg.Nav.contact];
  const rail = `<div class="zrail" id="zrail" aria-hidden="true"><i class="zrail-fill"></i>
    ${stops.map((_, i) => `<i class="zrail-tick" style="top:${(i / (stops.length - 1)) * 100}%"></i>`).join("")}
    <i class="zrail-mark"></i><p class="zrail-read mono"><b id="zrZ">Z·00</b><span id="zrN">${esc(stops[0])}</span></p></div>`;

  $("#app").innerHTML = `<div class="depth-bg" aria-hidden="true"></div>${navHtml(ctx)}${rail}
<main id="main">${heroHtml(ctx)}${projectsHtml(ctx)}${experienceHtml(ctx)}${stackHtml(ctx)}${aboutHtml(ctx)}${contactHtml(ctx)}</main>${footerHtml(ctx)}`;

  const detail = createDetail(ctx);
  ctx.openDetail = (id, from) => detail.open(id, from);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) detail.open(b.dataset.open, b);
  });

  initNav(ctx);
  bindLanguage(ctx);
  const hero = initHero(ctx);
  const explorer = initProjects(ctx);
  ctx.goProject = (id) => explorer.goToId(id);
  initStack(ctx);
  initContact(ctx);

  // La intro del logo termina con su destello: se retira la máscara cónica para poder rotar el anillo sin artefactos.
  const intro = $(".jlogo.intro");
  intro?.querySelector(".jl-sheen")?.addEventListener("animationend", () => intro.classList.remove("intro"), { once: true });

  /* ---- revelado al entrar en pantalla (solo observa; no captura el scroll) ---- */
  const targets = $$("[data-io],[data-reveal]");
  if (rm || !("IntersectionObserver" in window)) targets.forEach((t) => t.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((t) => io.observe(t));
  }

  /* ---- scroll: un único manejador ---- */
  const root = document.documentElement;
  const navEl = $("#nav"), navLogo = $(".nav-logo .jlogo"), zrail = $("#zrail"), zrZ = $("#zrZ"), zrN = $("#zrN");
  const timeline = $("#timeline");
  const ticks = $$(".zrail-tick", zrail);
  const secEls = [$("#top"), ...SECTIONS.map((id) => $(`#${id}`))];
  let lastCur = -2;
  const onScroll = frameThrottle(() => {
    const y = scrollY, vh = innerHeight;
    navEl.classList.toggle("solid", y > 40);
    hero.update(y, vh);
    if (!calm) navLogo.style.setProperty("--rot", `${(y * 0.06).toFixed(1)}deg`);

    const max = Math.max(1, root.scrollHeight - vh);
    root.style.setProperty("--z", clamp(y / max).toFixed(4));

    // sección actual + progreso dentro de ella (para el riel y el menú)
    let cur = 0, prog = 0;
    secEls.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * 0.4) cur = i; });
    const r = secEls[cur].getBoundingClientRect();
    prog = clamp((vh * 0.4 - r.top) / Math.max(1, r.height));
    if (cur !== lastCur) {
      lastCur = cur;
      setActiveLink(cur > 0 ? SECTIONS[cur - 1] : null);
      zrZ.textContent = `Z·0${cur}`;
      zrN.textContent = stops[cur];
      ticks.forEach((t, i) => t.classList.toggle("on", i === cur));
    }
    zrail.style.setProperty("--zp", ((cur + prog * (cur === secEls.length - 1 ? 0 : 1)) / (secEls.length - 1)).toFixed(4));
    zrail.classList.toggle("on", y > 80);

    if (timeline) {
      const tl = timeline.getBoundingClientRect();
      timeline.style.setProperty("--tl", clamp((vh * 0.65 - tl.top) / tl.height).toFixed(3));
    }
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  if (restoreY !== null) requestAnimationFrame(() => { scrollTo({ top: restoreY, behavior: "instant" }); onScroll(); });
  onScroll();
  root.dataset.ready = "1";
} catch (err) {
  console.error(err);
  document.getElementById("app").innerHTML = `<p style="padding:40px;font-family:system-ui;color:#f2f4f8">No se pudo cargar el prototipo. ${String(err.message ?? err)}</p>`;
}
