import { $, $$, esc } from "../lib.js";
import { logoLayers } from "./brand.js";

export const SECTIONS = ["projects", "experience", "stack", "about", "contact"];

export function navHtml({ msg, T, lang, data, skipIntro }) {
  const labels = { projects: msg.Nav.projects, experience: msg.Nav.experience, stack: msg.Nav.stack, about: msg.Nav.about, contact: msg.Nav.contact };
  const [first, ...rest] = data.name.split(" ");
  const seg = `<div class="seg" role="group" aria-label="${esc(msg.Nav.language)}">
      <button type="button" data-lang="es" aria-pressed="${lang === "es"}" aria-label="${esc(msg.Nav.switchToSpanish)}" lang="es">${T.es}</button>
      <button type="button" data-lang="en" aria-pressed="${lang === "en"}" aria-label="${esc(msg.Nav.switchToEnglish)}" lang="en">${T.en}</button>
    </div>`;
  return `<a class="skip" href="#projects">${esc(msg.Common.skipToContent)}</a>
<header class="nav" id="nav">
  <div class="nav-in">
    <a class="nav-logo" href="#top" aria-label="${esc(T.homeLabel)}">${logoLayers({ width: 124, intro: !skipIntro })}</a>
    <a class="dock" id="dock" href="#top" aria-label="${esc(T.dockLabel)}"><span class="d1">${esc(first)}</span><span class="d2 serif">${esc(rest.join(" "))}</span></a>
    <nav aria-label="${esc(msg.Nav.label)}" id="navlinks" class="nav-links">
      ${SECTIONS.slice(0, 4).map((id) => `<a href="#${id}" data-sec="${id}">${esc(labels[id])}</a>`).join("")}
      <a class="btn primary nav-cta-m" href="#contact" data-sec="contact">${esc(labels.contact)}</a>
      ${seg}
    </nav>
    <div class="nav-tools">
      ${seg}
      <a class="btn primary sm nav-cta" href="#contact" data-sec="contact">${esc(labels.contact)}</a>
      <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="navlinks" aria-label="${esc(msg.Nav.openMenu)}"><span></span></button>
    </div>
  </div>
</header>`;
}

export function initNav({ msg, lang }) {
  const nav = $("#nav"), burger = $("#burger");
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? msg.Nav.closeMenu : msg.Nav.openMenu);
    document.documentElement.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  $("#navlinks").addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); burger.focus(); } });
  matchMedia("(min-width: 1061px)").addEventListener("change", () => setOpen(false));
}

/** Cambio de idioma real: recarga con ?lang= conservando la posición (se omite la intro). Sirve a nav y pie. */
export function bindLanguage({ lang }) {
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (!b) return;
    const next = b.dataset.lang;
    if (next === lang) return;
    try { sessionStorage.setItem("jcz-restore", JSON.stringify({ y: scrollY })); } catch {}
    try { if (parent !== window) parent.postMessage({ jcLang: next }, location.origin); } catch {}
    const q = new URLSearchParams(location.search);
    q.set("lang", next);
    location.search = q.toString();
  });
}

export function setActiveLink(id) {
  $$("#navlinks a[data-sec]").forEach((a) => { if (a.dataset.sec === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
}
