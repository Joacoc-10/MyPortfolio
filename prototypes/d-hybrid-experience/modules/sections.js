// Secciones informativas: Stack, Experiencia, Sobre mí, Contacto y pie. Animación contenida; la lectura manda.
import { $, $$, clamp, esc, fmtMonth, pad2 } from "../lib.js";
import { logoImg } from "./brand.js";

const head = (eyebrow, id, title, lead) => `<header class="sec-head" data-io>
  <p class="eyebrow mono">${esc(eyebrow)}</p>
  <h2 class="sec-title" id="${id}"><span class="mask-line"><span>${esc(title)}</span></span></h2>
  ${lead ? `<p class="sec-lead" data-reveal>${esc(lead)}</p>` : ""}
</header>`;

/* ================= STACK ================= */
export function stackHtml({ data, msg, T }) {
  const cats = data.stack;
  const tabs = cats.map((g, i) => `<button type="button" role="tab" class="st-tab" id="stt-${i}" data-i="${i}" aria-selected="${i === 0}" aria-controls="stp-${i}" tabindex="${i === 0 ? 0 : -1}">
    <span class="st-n mono">${pad2(i + 1)}</span><span class="st-name">${esc(msg.Stack.categories[g.category])}</span><span class="st-c mono">${g.items.length}</span></button>`).join("");
  const panels = cats.map((g, i) => `<div role="tabpanel" class="st-panel" id="stp-${i}" aria-labelledby="stt-${i}" ${i === 0 ? "" : "hidden"}>
    <ul class="st-items">${g.items.map((t) => `<li><button type="button" class="tech" data-tech="${esc(t.id)}" aria-pressed="false"${t.brandColor ? ` style="--c:${esc(t.brandColor)}"` : ""}><i aria-hidden="true"></i>${esc(t.name)}</button></li>`).join("")}</ul>
  </div>`).join("");
  const plates = cats.map((_, i) => `<i class="plate" style="--k:${i}"></i>`).join("");
  return `<section class="sec stack" id="stack" aria-labelledby="stack-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap">
    ${head(msg.Stack.eyebrow, "stack-h", msg.Stack.title, msg.Stack.description)}
    <div class="st">
      <div class="st-side">
        <div class="iso" id="iso" aria-hidden="true" data-sel="0">${plates}</div>
        <div role="tablist" class="st-tabs" aria-label="${esc(T.layers)}" aria-orientation="vertical">${tabs}</div>
      </div>
      <div class="st-main">
        ${panels}
        <div class="st-used" id="stUsed" aria-live="polite"><p class="st-hint">${esc(T.pickTech)}</p></div>
      </div>
    </div>
  </div>
</section>`;
}

export function initStack({ data, T }) {
  const tabs = $$(".st-tab"), panels = $$(".st-panel"), iso = $("#iso"), used = $("#stUsed");
  const techName = Object.fromEntries(data.stack.flatMap((g) => g.items.map((t) => [t.id, t.name])));
  const select = (i, focus = false) => {
    tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === i)); t.tabIndex = j === i ? 0 : -1; });
    panels.forEach((p, j) => (p.hidden = j !== i));
    iso.dataset.sel = i;
    iso.style.setProperty("--sel", i);
    used.innerHTML = `<p class="st-hint">${esc(T.pickTech)}</p>`;
    $$(".tech[aria-pressed='true']").forEach((b) => b.setAttribute("aria-pressed", "false"));
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  $(".st-tabs").addEventListener("keydown", (e) => {
    const cur = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const k = { ArrowDown: cur + 1, ArrowRight: cur + 1, ArrowUp: cur - 1, ArrowLeft: cur - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault();
    select((k + tabs.length) % tabs.length, true);
  });
  select(0);
  // Qué proyectos usan cada tecnología: dato real (techIds de cada proyecto).
  $$(".tech").forEach((b) => b.addEventListener("click", () => {
    $$(".tech[aria-pressed='true']").forEach((x) => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    const id = b.dataset.tech;
    const list = data.projects.filter((p) => p.techs.some((t) => t.id === id));
    used.innerHTML = list.length
      ? `<p class="st-hint"><strong>${esc(techName[id])}</strong> · ${esc(T.usedIn)}:</p><ul class="st-proj">${list.map((p) => `<li><button type="button" class="link" data-open="${esc(p.id)}">${esc(p.name)} →</button></li>`).join("")}</ul>`
      : `<p class="st-hint"><strong>${esc(techName[id])}</strong> · ${esc(T.notUsed)}</p>`;
  }));
}

/* ================= EXPERIENCIA ================= */
export function experienceHtml({ data, msg, T, L, lang, badgeFor }) {
  const jobs = data.companies.map((c) => {
    const projs = data.projects.filter((p) => p.companyId === c.id);
    const cur = c.period && c.period.end === null;
    const when = c.period ? `${fmtMonth(c.period.start, lang)} — ${c.period.end ? fmtMonth(c.period.end, lang) : msg.Experience.present}` : "";
    return `<li class="job" data-reveal>
      <div class="job-when"><p class="mono">${esc(when)}</p>${cur ? `<span class="badge">${esc(msg.Experience.current)}</span>` : ""}</div>
      <div class="job-main">
        <h3 class="job-co">${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(msg.Experience.visitCompany.replace("{company}", c.name))}">${esc(c.name)} <span aria-hidden="true">↗</span></a>` : esc(c.name)}</h3>
        <p class="job-role">${esc(L(c.role))}${c.employmentType ? `<span class="job-type"> · ${esc(L(c.employmentType))}</span>` : ""}</p>
        ${c.summary ? `<p class="job-sum">${esc(L(c.summary))}</p>` : ""}
        ${projs.length ? `<h4 class="job-ph mono">${esc(msg.Experience.projectsHeading.replace("{company}", c.name))}</h4>
        <ul class="job-projs">${projs.map((p) => {
          const b = badgeFor(p);
          return `<li><button type="button" class="jp" data-open="${esc(p.id)}" aria-label="${esc(T.open.replace("{name}", p.name))}">
            <span class="jp-top"><span class="jp-name">${esc(p.name)}</span>${b ? `<span class="badge${b.pilot ? " pilot" : ""}">${esc(b.text)}</span>` : ""}</span>
            <span class="jp-sum">${esc(L(p.summary))}</span>
            <span class="jp-techs">${p.techs.slice(0, 5).map((t) => `<span>${esc(t.name)}</span>`).join("")}</span>
            <span class="jp-go mono">${esc(T.seeProject)} →</span></button></li>`;
        }).join("")}</ul>` : ""}
      </div>
    </li>`;
  }).join("");
  return `<section class="sec exp" id="experience" aria-labelledby="exp-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap">
    ${head(msg.Experience.eyebrow, "exp-h", msg.Experience.title, msg.Experience.description)}
    <ol class="timeline" id="timeline" aria-label="${esc(msg.Experience.timeline)}"><span class="tl-line" aria-hidden="true"></span>${jobs}</ol>
  </div>
</section>`;
}

/* ================= SOBRE MÍ ================= */
export function aboutHtml({ data, msg, L }) {
  return `<section class="sec about" id="about" aria-labelledby="about-h">
  <div class="sec-rule" data-io></div>
  <div class="wrap about-grid">
    <figure class="about-photo" data-reveal>
      <img src="/assets/images/joaquin.png" alt="${esc(msg.About.photoAlt)}" width="853" height="1279" loading="lazy" decoding="async">
    </figure>
    <div class="about-text">
      ${head(msg.About.eyebrow, "about-h", msg.About.title)}
      ${L(data.about).map((p, i) => `<p data-reveal style="--d:${i}">${esc(p)}</p>`).join("")}
    </div>
  </div>
</section>`;
}

/* ================= CONTACTO ================= */
export function contactHtml({ data, msg, T, lang }) {
  const l = data.links;
  return `<section class="sec contact" id="contact" aria-labelledby="contact-h">
  <div class="sec-rule" data-io></div>
  <div class="rings" id="rings" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="wrap contact-in">
    <p class="eyebrow mono" data-io>${esc(msg.Contact.eyebrow)}</p>
    <h2 class="c-title" id="contact-h" data-io><span class="mask-line"><span>${esc(msg.Contact.title)}</span></span></h2>
    <p class="sec-lead" data-reveal>${esc(msg.Contact.description)}</p>
    <div class="c-mail" data-reveal style="--d:1">
      <a class="c-addr" href="mailto:${esc(l.email)}" aria-label="${esc(msg.Contact.sendEmail)}: ${esc(l.email)}">${esc(l.email)}</a>
      <button type="button" class="btn" id="copyMail">${esc(msg.Contact.copyEmail)}</button>
      <span class="sr-only" role="status" id="copyMsg"></span>
    </div>
    <ul class="c-links" data-reveal style="--d:2">
      <li><a class="btn" href="${esc(l.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(msg.Contact.linkedin)} ↗</a></li>
      <li><a class="btn" href="${esc(l.github)}" target="_blank" rel="noopener noreferrer">${esc(msg.Contact.github)} ↗</a></li>
      <li><a class="btn" href="${esc(l.cv.es)}" download>${esc(msg.Contact.cvEs)}</a></li>
      <li><a class="btn" href="${esc(l.cv.en)}" download>${esc(msg.Contact.cvEn)}</a></li>
    </ul>
  </div>
</section>`;
}

export function initContact({ data, msg, T, rm }) {
  const btn = $("#copyMail"), out = $("#copyMsg");
  btn.addEventListener("click", async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(data.links.email); ok = true; } catch {}
    out.textContent = ok ? msg.Contact.copied : T.copyErr;
    const keep = btn.textContent;
    btn.textContent = ok ? "✓ " + msg.Contact.copied : T.copyErr;
    setTimeout(() => { btn.textContent = keep; }, 2200);
  });
  if (rm || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const sec = $("#contact"), rings = $("#rings");
  sec.addEventListener("pointermove", (e) => {
    const r = sec.getBoundingClientRect();
    rings.style.setProperty("--rx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    rings.style.setProperty("--ry", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  }, { passive: true });
}

/* ================= PIE ================= */
export function footerHtml({ data, msg, T, nav }) {
  const l = data.links;
  return `<footer class="foot" aria-label="${esc(msg.Footer.label)}"><div class="wrap">
  <div class="foot-top">
    <a class="foot-logo" href="#top" aria-label="JCoding">${logoImg(150)}</a>
    <nav aria-label="${esc(msg.Footer.label)}"><ul>${nav.map((n) => `<li><a href="#${n.id}">${esc(n.label)}</a></li>`).join("")}</ul></nav>
    <div class="foot-social">
      <a href="${esc(l.github)}" target="_blank" rel="noopener noreferrer">${esc(msg.Hero.github)}</a>
      <a href="${esc(l.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(msg.Hero.linkedin)}</a>
      <a href="mailto:${esc(l.email)}">Email</a>
    </div>
  </div>
  <div class="foot-bot"><p>© ${new Date().getFullYear()} ${esc(data.name)}. ${esc(msg.Footer.rights)}</p><a href="#top">${esc(msg.Footer.backToTop)} ↑</a></div>
</div></footer>`;
}
