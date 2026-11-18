// Controlador de la página: formulario real (validación idéntica a ContactForm.tsx), panel de pruebas con envío SIMULADO
// (no hay EmailJS ni red), accesibilidad y puente con la escena 3D. Todos los textos están en `T` para migrarlos a next-intl.
import { PortalScene, webglSupported } from "./scene.js";

const $ = (s, r = document) => r.querySelector(s);
const T = {
  errName: "Ingresá tu nombre (al menos 2 caracteres).", errEmail: "Ingresá un correo electrónico válido.", errMessage: "Escribí un mensaje de al menos 10 caracteres.",
  errTooLong: (max) => `El mensaje es demasiado largo (máximo ${max} caracteres).`,
  errSend: (mail) => `No se pudo enviar el mensaje. Tus datos siguen acá: probá de nuevo o escribime directo a ${mail}.`,
  send: "Enviar mensaje", sending: "Enviando…", retry: "Reintentar envío", mail: "joacoc-10@hotmail.com",
  hud: { idle: "Esperando mensaje", compose: "Componiendo tu mensaje…", seal: "Sellando el sobre…", portal: "Abriendo el portal…", ready: "En tránsito…", slow: "Sigue en tránsito · la conexión está lenta",
    launch: "Cruzando el portal…", cross: "Cruzando el portal…", sent: "Entregado", reject: "El portal rechazó el envío", bounce: "El portal rechazó el envío", error: "El portal rechazó el envío", recovered: "Listo para reintentar" },
  live: { sending: "Enviando tu mensaje.", slow: "El envío sigue en curso; la conexión está lenta.", sent: (n) => `Mensaje enviado. Gracias, ${n}.`, error: "No se pudo enviar el mensaje. Tus datos siguen en el formulario." },
};
const LANG = document.documentElement.lang?.startsWith("en") ? "en" : "es";
T.done = { es: (n) => (n ? `Gracias, ${n}. Te responderé a la brevedad.` : "Gracias. Te responderé a la brevedad."), en: (n) => (n ? `Thanks, ${n}. I'll get back to you shortly.` : "Thanks. I'll get back to you shortly.") };
const MAX = 2000, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = ["name", "email", "message"];

const el = {
  section: $("#contact"), stage: $("#stage"), canvas: $("#gl"), anchor: $("#anchor"), hud: $("#hud"), hudL: $("#hud-l"), card: $("#card"), form: $("#form"), fields: $("#fields"),
  summary: $("#summary"), sendErr: $("#send-error"), send: $("#send"), done: $("#done"), doneTitle: $("#done-title"), doneP: $("#done-p"), doneTime: $("#done-time"),
  again: $("#again"), live: $("#live"), count: $("#count"), fallback: $("#fallback"),
  inputs: { name: $("#f-name"), email: $("#f-email"), message: $("#f-message") },
  errs: { name: $("#e-name"), email: $("#e-email"), message: $("#e-message") },
  hp: $("input[name=website]"),
  dock: { t: $("#dock-t"), b: $("#dock-b"), r: $("#dock-r"), tier: $("#tier"), rm: $("#rm") },
};

/* ---------- movimiento reducido (sistema o forzado desde el panel) ---------- */
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
let forceReduce = false;
const reduced = () => mqReduce.matches || forceReduce;
function applyMotion() { document.documentElement.dataset.motion = reduced() ? "reduce" : "full"; driver?.setReducedMotion?.(reduced()); }

/* ---------- estado ---------- */
let state = "idle"; // idle | sending | success | error | resetting
let driver = null, timers = new Set(), sendToken = 0, submitted = false, slowTimer = 0;
const touched = {}, celebrated = {};
const values = () => ({ name: el.inputs.name.value, email: el.inputs.email.value, message: el.inputs.message.value });
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); clearTimeout(slowTimer); };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = T.errName;
  if (!EMAIL_RE.test(v.email.trim())) e.email = T.errEmail;
  if (v.message.trim().length < 10) e.message = T.errMessage; else if (v.message.length > MAX) e.message = T.errTooLong(MAX);
  return e;
}
/** Cuánto "completa" cada campo a su pieza 3D (0..1): gradual al escribir, 1 al ser válido. */
function progress(v) {
  const n = v.name.trim().length, m = v.message.length, em = v.email.trim();
  return {
    name: n >= 2 ? 1 : n / 2 * 0.55,
    email: EMAIL_RE.test(em) ? 1 : Math.min(0.62, em.length / 22) * (em.includes("@") ? 1 : 0.7),
    message: m >= 10 ? Math.min(1, 0.4 + ((m - 10) / 110) * 0.6) : (m / 10) * 0.32,
  };
}

function showErrors() {
  const errs = validate(values());
  for (const k of FIELDS) {
    const msg = (touched[k] || submitted) && errs[k];
    const p = el.errs[k], inp = el.inputs[k];
    p.hidden = !msg; p.textContent = msg || ""; inp.setAttribute("aria-invalid", msg ? "true" : "false");
    const desc = [msg ? p.id : "", k === "message" ? "count" : ""].filter(Boolean).join(" ");
    desc ? inp.setAttribute("aria-describedby", desc) : inp.removeAttribute("aria-describedby");
  }
  el.summary.hidden = !(submitted && Object.keys(errs).length);
  return errs;
}

function syncScene(focus) {
  const v = values(), p = progress(v);
  for (const k of FIELDS) el.inputs[k].closest(".field").style.setProperty("--p", p[k].toFixed(2));
  driver?.setFields(p, v, focus ?? document.activeElement?.name ?? null);
}

/* ---------- eventos del formulario ---------- */
for (const k of FIELDS) {
  const inp = el.inputs[k];
  inp.addEventListener("input", () => {
    if (state === "success") return;
    if (k === "message") el.count.textContent = `${inp.value.length} / ${MAX}`, el.count.classList.toggle("over", inp.value.length > MAX);
    showErrors(); syncScene(k); driver?.typed(k);
    const ok = !validate(values())[k];
    if (!ok) celebrated[k] = false;
    else if (k === "message" && !celebrated[k] && inp.value.length >= 60) celebrate(k);
  });
  inp.addEventListener("focus", () => syncScene(k));
  inp.addEventListener("blur", () => {
    touched[k] = true; showErrors(); syncScene(null);
    if (!validate(values())[k] && !celebrated[k]) celebrate(k);
  });
}
function celebrate(k) { celebrated[k] = true; driver?.fieldDone(k, el.inputs[k].getBoundingClientRect()); }

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state === "sending" || state === "success" || state === "resetting") return;
  submitted = true;
  const errs = showErrors(), first = FIELDS.find((k) => errs[k]);
  if (first) { el.inputs[first].focus(); driver?.invalid?.(); return; }
  if (el.hp.value) return; // honeypot (en el real: éxito simulado sin enviar)
  startSend();
});

function readSim() {
  const res = document.querySelector("input[name=res]:checked")?.value || "success";
  const lat = Number(document.querySelector("input[name=lat]:checked")?.value || 900);
  return { res, lat };
}
function startSend() {
  const { res, lat } = readSim(), token = ++sendToken;
  state = "sending"; el.section.dataset.s = "sending"; el.section.dataset.bad = "0";
  lock(true); el.sendErr.hidden = true; el.summary.hidden = true;
  setLabel(T.sending); announce(T.live.sending);
  setSteps(1, 0); setHud("compose");
  if (!driver) return;
  driver.beginSend();
  // "red" simulada: ningún correo real, ninguna solicitud
  later(() => { if (token === sendToken) driver?.resolve(res === "success" ? "success" : "error"); }, lat);
}

function lock(on) {
  for (const k of FIELDS) { el.inputs[k].readOnly = on; el.inputs[k].toggleAttribute("aria-readonly", on); }
  el.form.setAttribute("aria-busy", String(on));
  el.send.setAttribute("aria-disabled", String(on));
}
el.send.addEventListener("click", (e) => { if (el.send.getAttribute("aria-disabled") === "true") e.preventDefault(); });
const setLabel = (txt) => { $(".lbl", el.send).textContent = txt; };
function announce(msg) { el.live.textContent = ""; requestAnimationFrame(() => { el.live.textContent = msg; }); }

/* ---------- HUD ---------- */
function setSteps(on, ok) { [...el.hud.querySelectorAll(".steps li")].forEach((li, i) => { const n = i + 1; li.classList.toggle("ok", n <= ok); li.classList.toggle("on", n === on); }); }
function setHud(key) { el.hudL.textContent = T.hud[key] ?? ""; }

/* ---------- fases que llegan desde la escena ---------- */
function onPhase(p) {
  el.section.dataset.phase = p; setHud(p);
  clearTimeout(slowTimer);
  switch (p) {
    case "compose": setSteps(1, 0); break;
    case "seal": setSteps(2, 1); break;
    case "portal": setSteps(3, 2); break;
    case "ready": setSteps(4, 3);
      slowTimer = setTimeout(() => { if (state === "sending") { setHud("slow"); announce(T.live.slow); } }, 5500); break;
    case "launch": case "cross": setSteps(4, 3); break;
    case "sent": setSteps(0, 4); showSuccess(); break;
    case "reject": case "bounce": el.section.dataset.bad = "1"; setSteps(4, 3); break;
    case "error": el.section.dataset.bad = "1"; setSteps(4, 3); showError(); break;
    case "recovered": unlockAfterError(); break;
    case "idle": if (state === "resetting") { state = "idle"; } break;
  }
}

function showSuccess() {
  state = "success"; clearTimers();
  const v = values(), first = v.name.trim().split(/\s+/)[0] || "";
  el.doneP.textContent = T.done[LANG](first); // sin mostrar el correo del visitante
  el.doneTime.textContent = `Entregado · ${new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
  el.section.dataset.s = "success"; el.section.dataset.bad = "0";
  el.fields.inert = true; el.done.inert = false; el.done.setAttribute("aria-hidden", "false");
  lock(false); el.send.setAttribute("aria-disabled", "false");
  announce(T.live.sent(first || "")); // región en vivo: el foco se mueve al título
  el.doneTitle.focus({ preventScroll: true });
  el.card.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
}
function showError() {
  state = "error"; el.section.dataset.s = "error";
  // texto + enlace seguro (sin innerHTML)
  const [a, b] = T.errSend("\u0000").split("\u0000"), link = document.createElement("a");
  link.href = `mailto:${T.mail}`; link.textContent = T.mail;
  el.sendErr.replaceChildren(a, link, b); el.sendErr.hidden = false;
  setLabel(T.retry); el.send.setAttribute("aria-disabled", "true"); // sigue bloqueado hasta que la escena se recupere
}
function unlockAfterError() {
  if (state !== "error") return;
  lock(false); setLabel(T.retry); setHud("recovered"); setSteps(0, 0);
  const a = document.activeElement; if (!a || a === document.body) el.send.focus({ preventScroll: true });
}

el.again.addEventListener("click", () => {
  if (state !== "success") return;
  state = "resetting"; sendToken++; clearTimers();
  for (const k of FIELDS) { el.inputs[k].value = ""; touched[k] = false; celebrated[k] = false; }
  submitted = false; showErrors(); el.count.textContent = `0 / ${MAX}`;
  el.section.dataset.s = "idle"; el.section.dataset.bad = "0"; el.done.inert = true; el.done.setAttribute("aria-hidden", "true"); el.fields.inert = false;
  setLabel(T.send); el.sendErr.hidden = true; setSteps(0, 0); setHud("idle");
  syncScene(null); driver?.reset();
  later(() => { if (state === "resetting" || state === "idle") el.inputs.name.focus({ preventScroll: true }); }, reduced() ? 50 : 700);
  if (!driver) state = "idle";
});

/* ---------- fallback sin WebGL: misma API, fases con temporizadores ---------- */
class Fallback {
  constructor(cb) { this.cb = cb; this.t = []; this.phase = "idle"; el.fallback.hidden = false; }
  at(ms, fn) { const id = setTimeout(fn, ms); this.t.push(id); }
  set(p) { this.phase = p; this.cb(p); }
  setFields() {} typed() {} fieldDone() {} setReducedMotion() {}
  beginSend() { this.set("compose"); this.at(500, () => this.set("seal")); this.at(1000, () => this.set("portal")); this.at(1700, () => { this.set("ready"); if (this.q) this.run(this.q); }); }
  resolve(k) { if (this.phase === "ready") this.run(k); else this.q = k; }
  run(k) { this.q = null; if (k === "success") { this.set("launch"); this.at(900, () => this.set("sent")); } else { this.set("reject"); this.at(500, () => this.set("error")); this.at(1200, () => this.set("recovered")); } }
  reset() { this.set("resetting"); this.at(500, () => this.set("idle")); }
  debug() { return { phase: this.phase, fallback: true }; }
  dispose() { this.t.forEach(clearTimeout); el.fallback.hidden = true; }
}

/* ---------- montaje / desmontaje de la escena ---------- */
const mqMobile = matchMedia("(max-width: 960px)");
const detectTier = () => {
  const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8, coarse = matchMedia("(pointer: coarse)").matches;
  if (mem <= 2 || cores <= 2) return "low";
  if (coarse || mem <= 4 || cores <= 4 || innerWidth < 700) return "mid";
  return "high";
};
function placeHud() { (mqMobile.matches ? el.stage : el.anchor).append(el.hud); }
function currentAnchor() { return mqMobile.matches ? el.stage : el.anchor; }
function syncFlashCenter() {
  const s = el.stage.getBoundingClientRect(), a = currentAnchor().getBoundingClientRect();
  el.stage.style.setProperty("--fx", `${a.left + a.width / 2 - s.left}px`); el.stage.style.setProperty("--fy", `${a.top + a.height / 2 - s.top}px`);
}
function mountScene() {
  const sel = el.dock.tier.value, tier = sel === "auto" ? detectTier() : sel;
  placeHud();
  try {
    if (!webglSupported()) throw new Error("WebGL 2 no disponible");
    driver = new PortalScene({ canvas: el.canvas, stage: el.stage, anchor: currentAnchor(), tier, reduced: reduced(), onPhase });
    el.stage.dataset.tier = driver.tierName; el.stage.dataset.mode = "webgl";
  } catch (err) {
    console.warn("[message-portal] escena 3D desactivada:", err.message);
    driver = new Fallback(onPhase); el.stage.dataset.mode = "fallback";
  }
  syncFlashCenter(); syncScene(null);
}
function unmountScene() {
  clearTimers(); sendToken++;
  driver?.dispose(); driver = null;
  const fresh = el.canvas.cloneNode(false); el.canvas.replaceWith(fresh); el.canvas = fresh; // un canvas con contexto perdido no se reutiliza
}
function remount() {
  const wasBusy = state === "sending" || state === "error";
  unmountScene();
  if (wasBusy) { state = "idle"; el.section.dataset.s = "idle"; el.section.dataset.bad = "0"; lock(false); setLabel(T.send); el.sendErr.hidden = true; setSteps(0, 0); setHud("idle"); }
  mountScene(); applyMotion();
}
const ro = new ResizeObserver(() => { syncFlashCenter(); }); ro.observe(el.stage); ro.observe(el.anchor);
mqMobile.addEventListener("change", () => { placeHud(); if (driver && "anchor" in driver) { driver.anchor = currentAnchor(); driver.layoutDirty = true; driver.wake?.(); } syncFlashCenter(); });
mqReduce.addEventListener("change", applyMotion);

// teclado virtual: la escena se compacta para no quitar espacio a los campos
if (window.visualViewport) {
  const vv = window.visualViewport, kb = () => { document.documentElement.dataset.kb = vv.height < window.innerHeight * 0.74 ? "1" : "0"; };
  vv.addEventListener("resize", kb); kb();
}
// toque sobre la escena: pulso táctil (el scroll vertical sigue libre: touch-action: pan-y)
el.stage.addEventListener("pointerdown", (e) => { if (mqMobile.matches && e.pointerType !== "mouse") driver?.poke?.(); });

/* ---------- panel de pruebas ---------- */
el.dock.t.addEventListener("click", () => {
  const open = el.dock.b.hidden; el.dock.b.hidden = !open; el.dock.t.setAttribute("aria-expanded", String(open));
  if (open) tickReadout();
});
function setValues(v) {
  for (const k of FIELDS) { el.inputs[k].value = v[k]; el.inputs[k].dispatchEvent(new Event("input", { bubbles: true })); }
}
$("#fill").addEventListener("click", () => {
  if (state === "success" || state === "sending") return;
  setValues({ name: "Lucía Fernández", email: "lucia@estudio.com", message: "Hola Joaco, vi tu portfolio y me encantó cómo trabajás la interfaz y el detrás de escena. Estamos armando un producto nuevo y buscamos a alguien full stack. ¿Hablamos esta semana?" });
  FIELDS.forEach((k, i) => later(() => { touched[k] = true; celebrated[k] = false; showErrors(); celebrate(k); }, 150 + i * 380));
});
$("#clear").addEventListener("click", () => {
  if (state === "success" || state === "sending") return;
  setValues({ name: "", email: "", message: "" }); for (const k of FIELDS) { touched[k] = false; celebrated[k] = false; } submitted = false; showErrors();
});
$("#remount").addEventListener("click", remount);
el.dock.tier.addEventListener("change", remount);
el.dock.rm.addEventListener("change", () => { forceReduce = el.dock.rm.checked; applyMotion(); });
let readoutRaf = 0;
function tickReadout() {
  if (el.dock.b.hidden) return;
  const d = driver?.debug?.() ?? {};
  el.dock.r.textContent = [`fase  ${d.phase ?? "—"}  ·  estado ${state}`, `fps ${driver?.fps ? driver.fps.toFixed(0) : "—"}  ·  calidad ${d.tier ?? "—"}  ·  mov. reducido ${reduced() ? "sí" : "no"}`, `partículas ${d.particles ?? 0}  ·  draw calls ${d.calls ?? "—"}  ·  tris ${d.tris ?? "—"}`, `geometrías ${d.geometries ?? "—"}  ·  texturas ${d.textures ?? "—"}`].join("\n");
  clearTimeout(readoutRaf); readoutRaf = setTimeout(tickReadout, 500);
}

/* ---------- arranque ---------- */
applyMotion(); el.section.dataset.s = "idle"; el.section.dataset.phase = "idle"; el.done.inert = true;
mountScene(); applyMotion(); setHud("idle");
addEventListener("pagehide", () => { unmountScene(); });
addEventListener("pageshow", (e) => { if (e.persisted && !driver) { mountScene(); applyMotion(); } }); // restaurado desde bfcache
Object.defineProperty(window, "__mp", { value: { get scene() { return driver; }, get state() { return state; }, mount: mountScene, unmount: unmountScene, remount, T }, configurable: true });
