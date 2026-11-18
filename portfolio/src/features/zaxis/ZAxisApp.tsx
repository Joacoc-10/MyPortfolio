"use client";

// Orquestador de Z-AXIS: provee el contenido, abre el detalle y mantiene UN solo manejador de scroll
// (un frame, lecturas baratas) que alimenta al hero, al riel de profundidad, al navbar y a la línea de tiempo.
// Idea: Full Stack es trabajar en profundidad. Cuanto más se baja, más hondo y oscuro el plano.
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { About } from "./About";
import { Contact } from "./Contact";
import { ZProvider } from "./ctx";
import { Experience } from "./Experience";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { bindPointer, clamp, frameThrottle, getMotionPrefs, runScrollSubs, watchFrames } from "./lib";
import { Navbar } from "./Navbar";
import { Projects } from "./Projects";
import { Stack } from "./Stack";
import { SECTIONS, sectionStore } from "./store";
import type { ZContent } from "./types";

// El diálogo de detalle no hace falta hasta que alguien abre un proyecto: se carga bajo demanda.
const Detail = dynamic(() => import("./Detail").then((m) => m.Detail), { ssr: false });

export function ZAxisApp({ content }: { content: ZContent }) {
  const nav = useTranslations("Nav");
  const z = useTranslations("Z");
  const [detail, setDetail] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  
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
    html.classList.toggle("mid", prefs.mid);
    // Calidad adaptativa: si los frames reales no llegan a ~38 fps durante el primer scroll, se pasa al nivel medio (solo CSS).
    const stopFrames = prefs.calm || prefs.mid ? () => {} : watchFrames(() => html.classList.add("mid"));
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

    // Animaciones infinitas decorativas: solo corren mientras se ven (un observador para todas).
    let ioAnim: IntersectionObserver | null = null;
    if (!prefs.rm && "IntersectionObserver" in window) {
      ioAnim = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("off-screen", !e.isIntersecting)), { rootMargin: "80px" });
      document.querySelectorAll(".pulse, .sparkles, .marquee").forEach((n) => ioAnim!.observe(n));
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
    const depthBg = document.querySelector<HTMLElement>(".depth-bg");
    // Geometría cacheada (posición en página de cada sección y de la línea de tiempo): se vuelve a medir solo cuando algo
    // cambia de tamaño (ResizeObserver / resize / carga de fuentes), no en cada frame de scroll.
    const geo = { dirty: true, tops: [] as number[], hs: [] as number[], tlTop: 0, tlH: 1, max: 1 };
    const measureGeo = () => {
      const sy = scrollY;
      geo.tops = secEls.map((s) => s.getBoundingClientRect().top + sy);
      geo.hs = secEls.map((s) => s.getBoundingClientRect().height);
      if (timeline) { const r = timeline.getBoundingClientRect(); geo.tlTop = r.top + sy; geo.tlH = r.height || 1; }
      geo.max = Math.max(1, root.scrollHeight - innerHeight);
      geo.dirty = false;
    };
    const dirtyGeo = () => { geo.dirty = true; };
    const ro = new ResizeObserver(dirtyGeo);
    ro.observe(document.body);
    document.fonts?.ready.then(dirtyGeo);
    let lastSolid: boolean | null = null, lastOn: boolean | null = null, lastRot = "", lastZ = "", lastZp = "", lastTl = "";
    const onScroll = frameThrottle(() => {
      // 1) LECTURAS (una sola vez, antes de escribir nada: sin layouts forzados)
      const y = scrollY, vh = innerHeight;
      if (geo.dirty) measureGeo();
      // 2) CÁLCULO
      const solid = y > 40;
      let cur = 0;
      geo.tops.forEach((t, i) => { if (t - y <= vh * 0.4) cur = i; });
      const prog = clamp((vh * 0.4 - (geo.tops[cur] - y)) / Math.max(1, geo.hs[cur]));
      const z = clamp(y / geo.max).toFixed(3);
      const zp = ((cur + prog * (cur === secEls.length - 1 ? 0 : 1)) / (secEls.length - 1)).toFixed(3);
      const on = y > 80;
      const tl = timeline ? clamp((vh * 0.65 - (geo.tlTop - y)) / geo.tlH).toFixed(3) : "";
      const rot = !prefs.calm && navLogo ? (y * 0.06).toFixed(1) : "";
      // 3) ESCRITURAS (solo si el valor cambió)
      if (solid !== lastSolid) { lastSolid = solid; navEl.toggleAttribute("data-solid", solid); }
      runScrollSubs(y, vh);
      if (rot !== lastRot && navLogo) { lastRot = rot; navLogo.style.setProperty("--rot", `${rot}deg`); }
      // `--z` se escribe en quienes lo usan (no en <html>, lo que invalidaba el estilo de TODO el documento en cada frame)
      if (z !== lastZ) { lastZ = z; navEl.style.setProperty("--z", z); depthBg?.style.setProperty("--z", z); }
      if (cur !== lastCur) {
        lastCur = cur;
        sectionStore.set(cur);
        zrZ.textContent = `Z·0${cur}`;
        zrN.textContent = stops[cur];
        ticks.forEach((t, i) => t.classList.toggle("on", i === cur));
      }
      if (zp !== lastZp) { lastZp = zp; zrail.style.setProperty("--zp", zp); }
      if (on !== lastOn) { lastOn = on; zrail.classList.toggle("on", on); }
      if (timeline && tl !== lastTl) { lastTl = tl; timeline.style.setProperty("--tl", tl); }
    });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    addEventListener("resize", dirtyGeo);

    // Spotlight y borde brillante: UN listener delegado escribe --mx/--my en la tarjeta bajo el cursor (solo ratón).
    let spotRaf = 0;
    let spot: { el: HTMLElement; x: number; y: number } | null = null;
    const onSpot = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || prefs.calm) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-spot]");
      if (!el) return;
      spot = { el, x: e.clientX, y: e.clientY };
      if (!spotRaf) spotRaf = requestAnimationFrame(() => {
        spotRaf = 0;
        if (!spot) return;
        const r = spot.el.getBoundingClientRect();
        spot.el.style.setProperty("--mx", `${(spot.x - r.left).toFixed(0)}px`);
        spot.el.style.setProperty("--my", `${(spot.y - r.top).toFixed(0)}px`);
      });
    };
    document.addEventListener("pointermove", onSpot, { passive: true });

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
      ro.disconnect();
      stopFrames();
      document.removeEventListener("pointermove", onSpot);
      if (spotRaf) cancelAnimationFrame(spotRaf);
      mq.removeEventListener("change", onMq);
      io?.disconnect();
      ioAnim?.disconnect();
      delete root.dataset.ready;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ZProvider value={ctx}>
      <div className="depth-bg" aria-hidden="true" />
      <Navbar role={content.headline} />
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
      {detail !== null && <Detail index={detail} onClose={closeDetail} onStep={step} />}
    </ZProvider>
  );
}
