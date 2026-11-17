// Comparador: un prototipo a la vez, a tamaño completo, dentro de un iframe (así las media queries
// responden al viewport elegido). Contrato del picker según la skill `prototype`:
// teclas 1–5 y ←/→ cambian, R reinicia, ?v= persiste, el cambio de variante es instantáneo.
const variants = [
  { name: "Digital Dimensions", path: "/a-digital-dimensions/" },
  { name: "Experimental Type", path: "/b-experimental-type/" },
  { name: "Immersive Showcase", path: "/c-immersive-showcase/" },
  { name: "JCoding Hybrid Experience", path: "/d-hybrid-experience/" },
  { name: "Z-AXIS", path: "/e-z-axis/" },
];

const frame = document.getElementById("stage");
const wrap = document.getElementById("wrap");
const picker = document.querySelector(".proto-picker");
const highlight = picker.querySelector(".proto-picker-highlight");
const items = [...picker.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")];
const replay = picker.querySelector(".proto-picker-replay");
const tools = document.querySelector(".tools");

const params = new URLSearchParams(location.search);
const state = {
  current: 0,
  w: ["820", "390"].includes(params.get("w")) ? params.get("w") : "desktop",
  lang: params.get("lang") === "en" ? "en" : "es",
  rm: params.get("rm") === "1" ? "1" : "0",
};

function moveHighlight() {
  const el = items[state.current];
  highlight.style.width = el.offsetWidth + "px";
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}

function mount() {
  const v = variants[state.current];
  const url = `${v.path}?lang=${state.lang}&rm=${state.rm}`;
  frame.title = `Prototipo: ${v.name}`;
  // Se vacía primero para que las animaciones de entrada se repitan.
  frame.src = "about:blank";
  requestAnimationFrame(() => {
    frame.src = url;
  });
}

function syncUrl() {
  const url = new URL(location);
  url.searchParams.set("v", state.current + 1);
  url.searchParams.set("w", state.w);
  url.searchParams.set("lang", state.lang);
  url.searchParams.set("rm", state.rm);
  history.replaceState(null, "", url);
}

function setActive(i, { remount = true } = {}) {
  if (i < 0 || i >= variants.length) return;
  state.current = i;
  items.forEach((el, j) => {
    el.toggleAttribute("data-active", j === i);
    if (j === i) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  });
  moveHighlight();
  syncUrl();
  if (remount) mount();
}

function syncTools() {
  wrap.dataset.w = state.w;
  tools.querySelectorAll("[data-w]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === state.w)));
  tools.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  tools.querySelectorAll("[data-rm]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rm === state.rm)));
}

tools.addEventListener("click", (event) => {
  const button = event.target.closest(".tool");
  if (!button) return;
  const before = `${state.lang}|${state.rm}`;
  if (button.dataset.w) state.w = button.dataset.w;
  if (button.dataset.lang) state.lang = button.dataset.lang;
  if (button.dataset.rm) state.rm = button.dataset.rm;
  syncTools();
  syncUrl();
  // El viewport solo redimensiona el iframe; idioma y movimiento recargan el prototipo.
  if (before !== `${state.lang}|${state.rm}`) mount();
});

items.forEach((el, i) => el.addEventListener("click", () => setActive(i)));
replay.addEventListener("click", mount);
window.addEventListener("resize", moveHighlight);

// Variante D: el cambio de idioma hecho dentro de la página se refleja en el comparador sin remontar el iframe.
window.addEventListener("message", (e) => {
  if (e.origin !== location.origin || !e.data || (e.data.jcLang !== "es" && e.data.jcLang !== "en")) return;
  state.lang = e.data.jcLang;
  syncTools();
  syncUrl();
});

document.addEventListener("keydown", (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === "ArrowRight") setActive((state.current + 1) % variants.length);
  else if (e.key === "ArrowLeft") setActive((state.current - 1 + variants.length) % variants.length);
  else if (e.key === "r" || e.key === "R") mount();
});

const requested = parseInt(params.get("v"), 10);
syncTools();
setActive(requested >= 1 && requested <= variants.length ? requested - 1 : 0);
// Enable the slide only after first paint, so load doesn't animate.
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute("data-ready", "")));
