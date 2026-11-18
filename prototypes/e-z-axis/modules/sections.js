// Experiencia · Stack (las capas del desarrollo) · Sobre mí · Contacto · Pie.
// Todo el contenido sale de portfolio/src/data y portfolio/messages (vía /api/full.json). Nada inventado.
import { $, $$, clamp, esc, fmtMonth, createLoop, watchVisible, pointer } from "../lib.js";
import { createWeightField } from "./weight.js";
import { logoImg } from "./brand.js";
import { SECTIONS } from "./nav.js";

const ICON_GH = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
const ICON_IN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>`;
const hasEm = (title, em) => em && title.toLowerCase().endsWith(em.toLowerCase());
const withEm = (title, em) => (hasEm(title, em) ? `${esc(title.slice(0, title.length - em.length))}<span class="serif">${esc(title.slice(title.length - em.length))}</span>` : esc(title));

/* ============================== EXPERIENCIA ============================== */
export function experienceHtml(ctx) {
  const { data, msg, T, L, lang, projects } = ctx;
  const jobs = data.companies.map((c) => {
    const start = c.period ? fmtMonth(c.period.start, lang) : "";
    const end = c.period ? (c.period.end ? fmtMonth(c.period.end, lang) : msg.Experience.present) : "";
    const year = c.period ? c.period.start.slice(0, 4) : "";
    const current = c.period && c.period.end === null;
    const list = projects.filter((p) => p.companyId === c.id);
    const cards = list.map((p) => {
      const m = p.media[0];
      const b = ctx.badgeFor(p);
      return `<li><button type="button" class="jp" data-open="${esc(p.id)}" aria-label="${esc(T.openProject.replace("{name}", p.name))}">
        <span class="jp-thumb" aria-hidden="true">${m ? `<img src="${esc(m.src)}" alt="" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" draggable="false">` : `<span class="serif">${esc(p.name.split(" ")[0])}</span>`}</span>
        <span class="jp-txt">
          <span class="jp-top">${p.featured ? `<span class="mono jp-feat">${esc(msg.Experience.featured)}</span>` : ""}${b ? `<span class="badge${b.pilot ? " pilot" : ""}">${esc(b.text)}</span>` : ""}</span>
          <span class="jp-name">${esc(p.name)}</span>
          <span class="jp-sum">${esc(L(p.summary))}</span>
          <span class="jp-tech" aria-hidden="true">${p.techs.slice(0, 4).map((t) => `<i>${esc(t.name)}</i>`).join("")}${p.techs.length > 4 ? `<i>+${p.techs.length - 4}</i>` : ""}</span>
        </span><span class="jp-go" aria-hidden="true">→</span></button></li>`;
    }).join("");
    return `<li class="job${current ? " is-now" : ""}" data-reveal>
      <div class="job-when">
        <p class="job-year serif" aria-hidden="true">${esc(year)}</p>
        <p class="job-range mono">${esc(start)} — ${esc(end)}</p>
        <span class="badge${current ? "" : " past"}">${esc(current ? msg.Experience.current : msg.Experience.previous)}</span>
      </div>
      <div class="job-main">
        <h3 class="job-co">${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${msg.Experience.visitCompany.replace("{company}", c.name)} (${msg.Common.opensInNewTab})`)}">${esc(c.name)}<span aria-hidden="true"> ↗</span></a>` : esc(c.name)}</h3>
        <p class="job-role">${esc(L(c.role))}${c.employmentType ? ` <span class="job-type mono">${esc(L(c.employmentType))}</span>` : ""}</p>
        ${c.summary ? `<p class="job-sum">${esc(L(c.summary))}</p>` : ""}
        ${cards ? `<h4 class="job-ph mono">${esc(msg.Experience.projectsHeading.replace("{company}", c.name))}</h4><ul class="job-projects">${cards}</ul>` : ""}
      </div></li>`;
  }).join("");
  return `<section class="sec exp" id="experience" aria-labelledby="exp-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap">
    <header class="sec-head" data-io>
      <p class="eyebrow mono"><b>Z·02</b> ${esc(msg.Experience.eyebrow)}</p>
      <h2 class="sec-title" id="exp-h"><span class="mask-line"><span>${esc(msg.Experience.title)}</span></span></h2>
      <p class="sec-lead" data-reveal>${esc(msg.Experience.description)}</p>
    </header>
    <ol class="timeline" id="timeline" aria-label="${esc(msg.Experience.timeline)}"><span class="tl-line" aria-hidden="true"><i></i></span>${jobs}</ol>
  </div>
</section>`;
}

/* ============================== STACK · CAPAS ============================== */
const LAYER_MAP = { interface: ["frontend"], logic: ["backend", "services"], data: ["database"], delivery: ["devops", "tools"] };

export function stackHtml(ctx) {
  const { data, msg, T, projects } = ctx;
  const byCat = Object.fromEntries(data.stack.map((s) => [s.category, s.items]));
  // «Servicios e integraciones» no está en la sección Stack del portfolio actual: se toma de las tecnologías reales de los proyectos.
  const seen = new Map();
  projects.forEach((p) => p.techs.filter((t) => t.category === "services").forEach((t) => { if (!seen.has(t.id)) seen.set(t.id, { id: t.id, name: t.name, brandColor: t.brandColor }); }));
  byCat.services = [...seen.values()];
  const label = (c) => (c === "services" ? T.services : msg.Stack.categories[c]);
  const layers = T.layers.map((ly, n) => {
    const cats = LAYER_MAP[ly.id].filter((c) => byCat[c]?.length);
    const multi = cats.length > 1;
    const groups = cats.map((c) => `<div class="ly-group">${multi ? `<p class="ly-gl mono">${esc(label(c))}</p>` : ""}<ul class="ly-chips">${byCat[c].map((t) => `<li><button type="button" class="tech" data-tech="${esc(t.id)}" aria-pressed="false"${t.brandColor ? ` style="--c:${esc(t.brandColor)}"` : ""}><i aria-hidden="true"></i>${esc(t.name)}</button></li>`).join("")}</ul></div>`).join("");
    return `<li class="layer" data-layer="${ly.id}" style="--n:${n}" data-reveal>
      <div class="ly-head"><span class="ly-n mono" aria-hidden="true">0${n + 1}</span><h3 class="ly-name">${esc(ly.name)}</h3><p class="ly-sub mono">${esc(ly.sub)}</p></div>
      <div class="ly-body">${groups}</div></li>`;
  }).join("");
  return `<section class="sec stack" id="stack" aria-labelledby="st-h">
  <div class="sec-rule" data-io></div>
  <div class="plane-grid st-floor" aria-hidden="true"><i></i></div>
  <div class="wrap">
    <header class="sec-head" data-io>
      <p class="eyebrow mono"><b>Z·03</b> ${esc(msg.Stack.eyebrow)}</p>
      <h2 class="sec-title" id="st-h"><span class="mask-line"><span>${esc(msg.Stack.title)}</span></span></h2>
      <p class="sec-lead" data-reveal>${esc(msg.Stack.description)}</p>
    </header>
    <div class="layers-wrap" id="layersWrap">
      <ol class="layers" id="layers" aria-label="${esc(T.layerLabel)}">${layers}</ol>
    </div>
    <div class="usage" id="usage" role="status" aria-live="polite"><p class="usage-hint">${esc(T.pickTech)}</p></div>
  </div>
</section>`;
}

export function initStack(ctx) {
  const { projects, T, rm, calm, openDetail } = ctx;
  const usage = $("#usage"), wrap = $("#layersWrap"), layers = $("#layers");
  const techs = $$(".tech", layers);
  const uses = new Map();
  projects.forEach((p) => p.techs.forEach((t) => { (uses.get(t.id) ?? uses.set(t.id, []).get(t.id)).push(p); }));
  let pressed = null;
  techs.forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.tech;
    const same = pressed === b;
    techs.forEach((x) => x.setAttribute("aria-pressed", "false"));
    layers.querySelectorAll(".tech").forEach((x) => x.classList.remove("hit"));
    if (same) { pressed = null; usage.innerHTML = `<p class="usage-hint">${esc(T.pickTech)}</p>`; return; }
    pressed = b;
    b.setAttribute("aria-pressed", "true");
    const list = uses.get(id) ?? [];
    usage.innerHTML = list.length
      ? `<p class="usage-h mono">${esc(b.textContent.trim())} · ${esc(T.usedIn)}</p><ul class="usage-list">${list.map((p) => `<li><button type="button" class="btn sm" data-open="${esc(p.id)}">${esc(p.name)} <span aria-hidden="true">→</span></button></li>`).join("")}</ul>`
      : `<p class="usage-h mono">${esc(b.textContent.trim())}</p><p class="usage-hint">${esc(T.noUse)}</p>`;
  }));

  // Profundidad sutil: las capas se inclinan un par de grados con el puntero (solo ratón, sin movimiento reducido).
  if (!calm && pointer.fine) {
    let rx = 0, ry = 0, tx = 0, ty = 0, over = false;
    const loop = createLoop(() => {
      rx += (tx - rx) * 0.08; ry += (ty - ry) * 0.08;
      layers.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (!over && Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01) { layers.style.transform = ""; loop.stop(); }
    });
    wrap.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = wrap.getBoundingClientRect();
      ty = ((e.clientX - r.left) / r.width - 0.5) * 3.2;
      tx = -((e.clientY - r.top) / r.height - 0.5) * 3.2;
      over = true; loop.start();
    });
    wrap.addEventListener("pointerleave", () => { over = false; tx = ty = 0; loop.start(); });
  }
}

/* ============================== SOBRE MÍ ============================== */
export function aboutHtml(ctx) {
  const { data, msg, T, L } = ctx;
  const [lead, ...rest] = L(data.about);
  return `<section class="sec about" id="about" aria-labelledby="ab-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap about-grid">
    <figure class="portrait" data-reveal>
      <div class="pt-frame"><img src="/assets/images/joaquin.png" alt="${esc(msg.About.photoAlt)}" loading="lazy" decoding="async"></div>
      <div class="pt-axis" aria-hidden="true"><span>${esc(T.aboutAxisA)}</span><i></i><span>${esc(T.aboutAxisB)}</span></div>
    </figure>
    <div class="about-copy">
      <p class="eyebrow mono" data-io><b>Z·04</b> ${esc(msg.About.eyebrow)}</p>
      <h2 class="ab-title" id="ab-h" data-io><span class="mask-line"><span>${withEm(msg.About.title, T.aboutEm)}</span></span></h2>
      <p class="ab-lead" data-reveal>${esc(lead)}</p>
      <div class="ab-rest" data-reveal>${rest.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <ul class="traits" aria-label="${esc(L(data.headline))}" data-reveal>${T.aboutTraits.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="ab-open" data-reveal>
        <p class="mono ab-open-l"><span class="pulse" aria-hidden="true"></span>${esc(T.aboutOpen)}</p>
        <p class="ab-open-t">${esc(L(data.availability))}</p>
        <div class="ab-cta"><a class="btn primary" href="#contact">${esc(msg.Hero.ctaContact)}</a><a class="btn" href="${esc(data.links.cv[ctx.lang])}" download>${esc(msg.Hero.ctaCv)}</a></div>
      </div>
    </div>
  </div>
</section>`;
}

/* ============================== CONTACTO ============================== */
export function contactHtml(ctx) {
  const { data, msg, T, lang } = ctx;
  const email = data.links.email;
  const letters = [...email].map((c) => `<span class="ml"><span>${esc(c)}</span></span>`).join("");
  const other = lang === "es" ? "en" : "es";
  const rows = [
    { href: data.links.linkedin, label: msg.Contact.linkedin, ext: true, ic: ICON_IN },
    { href: data.links.github, label: msg.Contact.github, ext: true, ic: ICON_GH },
    { href: data.links.cv[lang], label: lang === "es" ? msg.Contact.cvEs : msg.Contact.cvEn, dl: true, lg: lang },
    { href: data.links.cv[other], label: other === "es" ? msg.Contact.cvEs : msg.Contact.cvEn, dl: true, lg: other },
  ];
  return `<section class="sec contact" id="contact" aria-labelledby="ct-h">
  <div class="sec-rule" data-io></div>
  <div class="plane-grid ct-floor" aria-hidden="true"><i></i></div>
  <div class="ct-glow" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono" data-io><b>Z·05</b> ${esc(msg.Contact.eyebrow)}</p>
    <h2 class="ct-title" id="ct-h" data-io><span class="mask-line"><span>${withEm(msg.Contact.title, T.contactEm)}</span></span></h2>
    <p class="ct-lead" data-reveal>${esc(msg.Contact.description)}</p>
    <a class="ct-mail" id="ctMail" href="mailto:${esc(email)}" aria-label="${esc(`${msg.Contact.sendEmail}: ${email}`)}" data-reveal><span aria-hidden="true" class="ct-mail-in">${letters}</span></a>
    <div class="ct-actions" data-reveal>
      <a class="btn primary" href="mailto:${esc(email)}">${esc(msg.Contact.sendEmail)}</a>
      <button class="btn" type="button" id="ctCopy">${esc(msg.Contact.copyEmail)}</button>
    </div>
    <div class="ct-links" data-reveal>
      <p class="mono ct-links-l">${esc(T.contactLinks)}</p>
      <ul>${rows.map((r) => `<li><a href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener noreferrer"' : ""}${r.dl ? " download" : ""}${r.lg ? ` hreflang="${r.lg}"` : ""}${r.ext ? ` aria-label="${esc(`${r.label} (${msg.Common.opensInNewTab})`)}"` : ""}>${r.ic ?? ""}<span>${esc(r.label)}</span><b aria-hidden="true">${r.dl ? "↓" : "↗"}</b></a></li>`).join("")}</ul>
    </div>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</section>`;
}

export function initContact(ctx) {
  const { msg, T, data, calm } = ctx;
  const copy = $("#ctCopy"), toast = $("#toast");
  let timer = 0;
  const say = (text, bad = false) => {
    toast.textContent = text;
    toast.classList.toggle("bad", bad);
    toast.classList.add("on");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("on"), 2600);
  };
  copy.addEventListener("click", async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(data.links.email);
      else throw new Error("no clipboard");
      say(msg.Contact.copied);
    } catch {
      // Respaldo: selección + execCommand (por si el iframe del comparador no concede permiso de portapapeles).
      try {
        const ta = document.createElement("textarea");
        ta.value = data.links.email; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        say(ok ? msg.Contact.copied : T.copyErr, !ok);
      } catch { say(T.copyErr, true); }
    }
  });

  if (calm) return;
  // El correo "respira": el peso de cada letra responde al puntero. Solo mientras la sección está en pantalla.
  const mail = $("#ctMail");
  const letters = $$(".ml > span", mail);
  const field = createWeightField(letters, { min: 240, rest: 320, max: 760, mid: 480, radius: 150, wave: 0.28 });
  const loop = createLoop((now) => field.tick(now, 1));
  document.fonts?.ready.then(() => field.fix());
  addEventListener("resize", () => requestAnimationFrame(() => field.fix()));
  watchVisible($("#contact"), (v) => { if (v && !document.hidden) loop.start(); else loop.stop(); });
}

/* ============================== PIE ============================== */
export function footerHtml(ctx) {
  const { data, msg, T, lang } = ctx;
  const labels = { projects: msg.Nav.projects, experience: msg.Nav.experience, stack: msg.Nav.stack, about: msg.Nav.about, contact: msg.Nav.contact };
  const ext = ` (${msg.Common.opensInNewTab})`;
  return `<footer class="foot" id="foot">
  <div class="wrap">
    <div class="foot-top">
      <a class="foot-logo" href="#top" aria-label="${esc(T.homeLabel)}">${logoImg(150)}</a>
      <nav aria-label="${esc(msg.Footer.label)}"><ul>
        ${SECTIONS.map((id) => `<li><a href="#${id}">${esc(labels[id])}</a></li>`).join("")}
        <li><a href="${esc(data.links.cv[lang])}" download>${esc(msg.Hero.ctaCv)}</a></li>
      </ul></nav>
      <div class="foot-side">
        <div class="seg" role="group" aria-label="${esc(T.langLabel)}">
          <button type="button" data-lang="es" aria-pressed="${lang === "es"}" aria-label="${esc(msg.Nav.switchToSpanish)}" lang="es">${T.es}</button>
          <button type="button" data-lang="en" aria-pressed="${lang === "en"}" aria-label="${esc(msg.Nav.switchToEnglish)}" lang="en">${T.en}</button>
        </div>
        <div class="foot-social">
          <a href="${esc(data.links.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub${esc(ext)}">${ICON_GH}</a>
          <a href="${esc(data.links.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn${esc(ext)}">${ICON_IN}</a>
        </div>
      </div>
    </div>
    <div class="foot-bot">
      <p>© ${new Date().getFullYear()} JCoding. ${esc(msg.Footer.rights)}</p>
      <a href="#top"><span aria-hidden="true">↑</span> ${esc(msg.Footer.backToTop)}</a>
    </div>
  </div>
</footer>`;
}
