"use client";

// Orquestador de Z-AXIS: provee el contenido, abre el detalle y mantiene UN solo manejador de scroll
// (un frame, lecturas baratas) que alimenta al hero, al riel de profundidad, al navbar y a la línea de tiempo.
// Idea: Full Stack es trabajar en profundidad. Cuanto más se baja, más hondo y oscuro el plano.
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { About } from "./About";
import { Contact } from "./Contact";
import { ZProvider } from "./ctx";
import { Detail } from "./Detail";
import { Experience } from "./Experience";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { bindPointer, clamp, frameThrottle, getMotionPrefs, runScrollSubs } from "./lib";
import { Navbar } from "./Navbar";
import { Projects } from "./Projects";
import { Stack } from "./Stack";
import { SECTIONS, sectionStore } from "./store";
import type { ZContent } from "./types";

export function ZAxisApp({ content }: { content: ZContent }) {
  const nav = useTranslations("Nav");
  const z = useTranslations("Z");
  const [detail, setDetail] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [first, ...rest] = content.name.split(" ");

  const openDetail = useCallback((id: string, from?: HTMLElement | null) => {
    const i = content.projects.findIndex((p) => p.id === id);
    if (i < 0) return;
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setDetail(i);
  }, [content.projects]);
  const closeDetail = useCallback(() => {
    setDetail(null);
    const back = opener.current && document.contains(opener.current) && opener.current.getClientRects().length ? opener.current : document.getElementById("proj-h");
    back?.focus?.({ preventScroll: true });
    opener.current = null;
  }, []);
  const step = useCallback((dir: 1 | -1) => setDetail((i) => (i === null ? i : (i + dir + content.projects.length) % content.projects.length)), [content.projects.length]);
  const ctx = useMemo(() => ({ content, projects: content.projects, openDetail }), [content, openDetail]);

  const stops = [z("surface"), nav("projects"), nav("experience"), nav("stack"), nav("about"), nav("contact")];

  useEffect(() => {
    bindPointer();
    const prefs = getMotionPrefs();
    const html = document.documentElement;
    html.classList.toggle("rm", prefs.rm);
    html.classList.toggle("lite", prefs.lite);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => location.reload();
    mq.addEventListener("change", onMq);

    // Revelado al entrar en pantalla (solo observa; no captura el scroll)
    const targets = [...document.querySelectorAll("[data-io],[data-reveal]")];
    let io: IntersectionObserver | null = null;
    if (prefs.rm || !("IntersectionObserver" in window)) targets.forEach((t) => t.classList.add("in"));
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io?.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      targets.forEach((t) => io!.observe(t));
    }

    /* ---- scroll: un único manejador ---- */
    const root = document.documentElement;
    const navEl = document.getElementById("nav")!;
    const navLogo = navEl.querySelector<HTMLElement>(".nav-logo .jlogo");
    const zrail = document.getElementById("zrail")!;
    const zrZ = document.getElementById("zrZ")!;
    const zrN = document.getElementById("zrN")!;
    const timeline = document.getElementById("timeline");
    const ticks = [...zrail.querySelectorAll(".zrail-tick")];
    const secEls = [document.getElementById("top")!, ...SECTIONS.map((id) => document.getElementById(id)!)];
    let lastCur = -2;
    const onScroll = frameThrottle(() => {
      const y = scrollY, vh = innerHeight;
      navEl.toggleAttribute("data-solid", y > 40);
      runScrollSubs(y, vh);
      if (!prefs.calm && navLogo) navLogo.style.setProperty("--rot", `${(y * 0.06).toFixed(1)}deg`);

      const max = Math.max(1, root.scrollHeight - vh);
      root.style.setProperty("--z", clamp(y / max).toFixed(4));

      // sección actual + progreso dentro de ella (para el riel y el menú)
      let cur = 0;
      secEls.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * 0.4) cur = i; });
      const r = secEls[cur].getBoundingClientRect();
      const prog = clamp((vh * 0.4 - r.top) / Math.max(1, r.height));
      if (cur !== lastCur) {
        lastCur = cur;
        sectionStore.set(cur);
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

    // Al cambiar de idioma se restaura la posición (el hero omite la intro).
    let restoreY: number | null = null;
    try {
      const raw = sessionStorage.getItem("jcz-restore");
      if (raw) { restoreY = JSON.parse(raw).y; sessionStorage.removeItem("jcz-restore"); }
    } catch {}
    if (restoreY !== null) requestAnimationFrame(() => { scrollTo({ top: restoreY!, behavior: "instant" }); onScroll(); });
    onScroll();
    root.dataset.ready = "1";

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onMq);
      io?.disconnect();
      delete root.dataset.ready;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ZProvider value={ctx}>
      <div className="depth-bg" aria-hidden="true" />
      <Navbar first={first} last={rest.join(" ")} />
      <div className="zrail" id="zrail" aria-hidden="true">
        <i className="zrail-fill" />
        {stops.map((_, i) => <i className="zrail-tick" key={i} style={{ top: `${(i / (stops.length - 1)) * 100}%` }} />)}
        <i className="zrail-mark" />
        <p className="zrail-read mono"><b id="zrZ">Z·00</b><span id="zrN">{stops[0]}</span></p>
      </div>
      <main id="main">
        <Hero content={content} />
        <Projects />
        <Experience />
        <Stack />
        <About content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
      <Detail index={detail} onClose={closeDetail} onStep={step} />
    </ZProvider>
  );
}
