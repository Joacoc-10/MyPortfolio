import { $, $$, esc } from "../lib.js";
import { logoLayers } from "./brand.js";

export const SECTIONS = ["projects", "stack", "experience", "about", "contact"];

export function navHtml({ msg, T, lang, data }) {
  const labels = { projects: msg.Nav.projects, stack: msg.Nav.stack, experience: msg.Nav.experience, about: msg.Nav.about, contact: msg.Nav.contact };
  return `<a class="skip" href="#projects">${esc(msg.Common.skipToContent)}</a>
<header class="nav" id="nav">
  <div class="nav-in">
    <a class="nav-logo" href="#top" aria-label="JCoding">${logoLayers({ width: 124 })}</a>
    <nav aria-label="${esc(msg.Nav.label)}" id="navlinks" class="nav-links">
      ${SECTIONS.map((id) => `<a href="#${id}" data-sec="${id}">${esc(labels[id])}</a>`).join("")}
    </nav>
    <div class="nav-tools">
      <div class="seg" role="group" aria-label="${esc(msg.Nav.language)}">
        <button type="button" data-lang="es" aria-pressed="${lang === "es"}" aria-label="${esc(msg.Nav.switchToSpanish)}">${T.es}</button>
        <button type="button" data-lang="en" aria-pressed="${lang === "en"}" aria-label="${esc(msg.Nav.switchToEnglish)}">${T.en}</button>
      </div>
      <a class="btn nav-cv" href="${esc(data.links.cv[lang])}" download>${esc(T.cvShort)}</a>
      <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="navlinks" aria-label="${esc(T.openMenu)}"><span></span></button>
    </div>
  </div>
</header>`;
}

export function initNav({ T, lang }) {
  const nav = $("#nav"), burger = $("#burger");
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
  };
  burger.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  $("#navlinks").addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); burger.focus(); } });
  matchMedia("(min-width: 961px)").addEventListener("change", () => setOpen(false));

  // Cambio de idioma: se conserva la posición y se omite la intro del hero.
  $$("[data-lang]", nav).forEach((b) => b.addEventListener("click", () => {
    const next = b.dataset.lang;
    if (next === lang) return;
    try { sessionStorage.setItem("jcd-restore", JSON.stringify({ y: scrollY })); } catch {}
    try { if (parent !== window) parent.postMessage({ jcLang: next }, location.origin); } catch {}
    const q = new URLSearchParams(location.search);
    q.set("lang", next);
    location.search = q.toString();
  }));
}
