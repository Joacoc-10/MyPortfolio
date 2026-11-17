"use client";

// HERO · Superficie. Escena de ventanas de navegador con capturas reales dispuestas a lo largo del eje Z
// (un túnel que se aleja hacia un punto de fuga a la derecha), nombre con peso tipográfico que responde al
// puntero y se acopla al navbar, y un «dive» final: la cámara atraviesa las ventanas hacia la profundidad.
// Sin scroll-jacking: la sección usa position: sticky y el scroll es siempre el nativo.
// React solo pinta el marcado; la escena se anima por transformaciones desde un único bucle (sin renders por frame).
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { bindPointer, bridge, clamp, createLoop, fmtMonth, getMotionPrefs, host, inOutCubic, lerp, pointer, range, smooth, subscribeScroll, tintOf, watchVisible } from "./lib";
import type { ZContent } from "./types";
import { createWeightField } from "./weight";

// Fabio Producciones ocupa SIEMPRE la última ventana (la más profunda) del recorrido, en escritorio y en móvil.
const WIDE_IDS = ["order-a", "zatobox", "nexvia", "florencia-biaturi", "olibar", "fabio-producciones"];
const NARROW_IDS = ["order-a", "zatobox", "fabio-producciones"];
interface Pose { x: number; y: number; z: number; ry: number; rx: number }
// x, y: fracción del viewport desde el centro · z: profundidad (px) · ry, rx: giro (°)
const POSES_WIDE: Pose[] = [
  { x: 0.27, y: 0.03, z: 0, ry: -16, rx: 2 },
  { x: 0.43, y: -0.3, z: -430, ry: -25, rx: 1 },
  { x: 0.18, y: 0.31, z: -720, ry: -15, rx: -2 },
  { x: 0.46, y: 0.27, z: -1020, ry: -27, rx: -2 },
  { x: 0.3, y: -0.4, z: -1340, ry: -20, rx: 2 },
  { x: 0.2, y: -0.04, z: -1680, ry: -12, rx: 0 },
];
const POSES_NARROW: Pose[] = [
  { x: 0.1, y: -0.31, z: 0, ry: -14, rx: 3 },
  { x: -0.34, y: -0.4, z: -330, ry: 17, rx: 2 },
  { x: 0.36, y: -0.36, z: -600, ry: -19, rx: -2 },
];
const DIVE_DEPTH = 1900;

export function Hero({ content }: { content: ZContent }) {
  const t = useTranslations("Hero");
  const z = useTranslations("Z");
  const root = useRef<HTMLDivElement>(null);
  const [first, ...rest] = content.name.split(" ");
  const last = rest.join(" ");
  const current = content.companies.find((c) => c.period && c.period.end === null);
  const role = current ? t("currentRole", { role: current.role, company: current.name }) : "";
  const wins = useMemo(() => WIDE_IDS.map((id) => content.projects.find((p) => p.id === id)).filter((p) => p?.media[0]) as ZContent["projects"], [content.projects]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    bindPointer();
    const { calm } = getMotionPrefs();
    const hero = el.querySelector<HTMLElement>("#hero")!;
    const track = el;
    const hset = el.querySelector<HTMLElement>("#hset")!;
    const n1 = el.querySelector<HTMLElement>("#n1")!;
    const n2 = el.querySelector<HTMLElement>("#n2")!;
    const dock = document.getElementById("dock")!;
    const nav = document.getElementById("nav")!;
    const winEls = [...el.querySelectorAll<HTMLElement>(".win")];
    const fades = [...hero.querySelectorAll<HTMLElement>("[data-fade]")];
    const letters = [...n1.querySelectorAll<HTMLElement>(".ch")];
    const field = createWeightField(letters);
    let skipIntro = false;
    try { skipIntro = !!sessionStorage.getItem("jcz-restore"); } catch {}
    if (skipIntro || calm) hero.classList.add("skip-intro");
    hero.classList.toggle("calm", calm);

    let narrow = innerWidth < 760;
    let ready = false;
    let m: { s1: number; s2: number; dx1: number; dy1: number; dx2: number; dy2: number } | null = null;
    const focusW = winEls.map(() => 0.5);
    let focus = 0, lastPick = 0, lastAuto = performance.now();
    const tint = new Map<number, [number, number, number]>();
    const poseOf = (id: string): Pose | undefined => (narrow ? POSES_NARROW[NARROW_IDS.indexOf(id)] : POSES_WIDE[WIDE_IDS.indexOf(id)]);
    let disposed = false;

    /* ---------- arranque: con fuentes e imágenes listas (con tope) para que no haya saltos ---------- */
    const imgs = [...hero.querySelectorAll<HTMLImageElement>(".win img")].slice(0, 2).map((i) => i.decode?.().catch(() => {}));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([Promise.all([fonts, ...imgs]), new Promise((r) => setTimeout(r, 900))]).then(() => {
      if (!disposed) hero.classList.add("go");
    });
    fonts.then(() => requestAnimationFrame(() => {
      if (disposed) return;
      if (!calm) field.fix();
      measure();
      ready = true;
      api.update(scrollY, innerHeight);
    }));

    /* ---------- luz ambiental por proyecto ---------- */
    function setAmbient(i: number) {
      const c = tint.get(i);
      if (!c) return;
      hero.style.setProperty("--tr", String(c[0])); hero.style.setProperty("--tg", String(c[1])); hero.style.setProperty("--tb", String(c[2]));
    }
    hero.querySelectorAll<HTMLImageElement>(".win img").forEach((img, i) => {
      const apply = () => {
        if (disposed) return;
        const c = tintOf(img);
        tint.set(i, c);
        winEls[i].style.setProperty("--tr", String(c[0])); winEls[i].style.setProperty("--tg", String(c[1])); winEls[i].style.setProperty("--tb", String(c[2]));
        if (i === focus) setAmbient(i);
      };
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener("load", apply, { once: true });
    });

    /* ---------- geometría ---------- */
    function place(dive: number) {
      const W = innerWidth, H = innerHeight;
      winEls.forEach((w) => {
        const pz = poseOf(w.dataset.id!);
        if (!pz) { w.hidden = true; return; }
        w.hidden = false;
        const zz = pz.z + dive * DIVE_DEPTH;
        // se desvanece al atravesar el plano de la cámara y también cuando queda muy lejos
        const op = (1 - range(zz, 80, 760)) * (1 - range(-zz, 2400, 3400));
        w.style.transform = `translate3d(calc(-50% + ${(pz.x * W).toFixed(1)}px), calc(-50% + ${(pz.y * H).toFixed(1)}px), ${zz.toFixed(1)}px) rotateY(${pz.ry}deg) rotateX(${pz.rx}deg)`;
        w.style.opacity = op.toFixed(3);
        w.style.pointerEvents = op < 0.4 ? "none" : "";
      });
    }

    function measure() {
      narrow = innerWidth < 760;
      if (calm) { place(0); return; }
      n1.style.transform = n2.style.transform = "none";
      const h = hero.getBoundingClientRect(), a1 = n1.getBoundingClientRect(), a2 = n2.getBoundingClientRect();
      const b1 = dock.querySelector(".d1")!.getBoundingClientRect(), b2 = dock.querySelector(".d2")!.getBoundingClientRect();
      // El hero está fijo (sticky) durante el acople: se mide respecto del hero y se lleva al viewport.
      m = {
        s1: b1.width / a1.width, s2: b2.width / a2.width,
        dx1: b1.left - a1.left, dy1: b1.top - (a1.top - h.top),
        dx2: b2.left - a2.left, dy2: b2.top - (a2.top - h.top),
      };
    }
    const onResize = () => requestAnimationFrame(() => {
      if (disposed) return;
      if (!calm) field.fix();
      measure();
      api.update(scrollY, innerHeight);
    });
    addEventListener("resize", onResize);

    /* ---------- bucle del puntero: parallax de la escena + peso del nombre + foco de luz ---------- */
    let px = 0, py = 0;
    const loop = createLoop((now) => {
      const active = pointer.x > -999 && now - pointer.last < 2600;
      const tx = active ? pointer.nx : Math.sin(now / 2900) * 0.45;
      const ty = active ? pointer.ny : Math.cos(now / 3700) * 0.3;
      px = lerp(px, tx, 0.05); py = lerp(py, ty, 0.05);
      hset.style.transform = `translate3d(${(-px * 24).toFixed(1)}px, ${(-py * 15).toFixed(1)}px, 0) rotateY(${(px * 4).toFixed(2)}deg) rotateX(${(-py * 2.5).toFixed(2)}deg)`;
      if (ready && scrollY < 24) field.tick(now, 1); else if (ready) field.tick(now, 0);

      // foco: la ventana más cercana al puntero; sin puntero, la luz recorre los proyectos despacio
      if (active && now - lastPick > 140 && !narrow) {
        lastPick = now;
        let best = focus, bd = 1e9;
        winEls.forEach((w, i) => {
          if (w.hidden || +w.style.opacity < 0.3) return;
          const r = w.getBoundingClientRect();
          const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
          if (d < bd) { bd = d; best = i; }
        });
        if (best !== focus) { focus = best; setAmbient(focus); }
        lastAuto = now;
      } else if (!active && now - lastAuto > 5200) {
        // en móvil solo rotan las ventanas visibles
        let k = focus;
        for (let s = 0; s < winEls.length; s++) { k = (k + 1) % winEls.length; if (poseOf(winEls[k].dataset.id!)) break; }
        focus = k;
        setAmbient(focus);
        lastAuto = now;
      }
      winEls.forEach((w, i) => {
        focusW[i] = lerp(focusW[i], i === focus ? 1 : 0.42, 0.07);
        w.style.setProperty("--f", focusW[i].toFixed(3));
      });
    });
    let visible = true;
    const sync = () => { if (visible && !document.hidden && !calm) loop.start(); else loop.stop(); };
    const unwatch = watchVisible(hero, (v) => { visible = v; sync(); });
    document.addEventListener("visibilitychange", sync);
    sync();

    /* ---------- clic en una ventana: lleva al proyecto en el explorador ---------- */
    const onClick = (e: Event) => {
      const w = (e.target as HTMLElement).closest<HTMLElement>(".win");
      if (!w || +w.style.opacity < 0.4) return;
      bridge.goProject(w.dataset.id!);
    };
    hset.addEventListener("click", onClick);

    const api = {
      /** Lo llama el único manejador de scroll de ZAxisApp. */
      update(y: number, vh: number) {
        if (calm) {
          nav.toggleAttribute("data-docked", y > vh * 0.5);
          return;
        }
        if (!ready) return;
        const total = track.offsetHeight - vh;
        if (y > total + vh) return; // el hero ya salió de pantalla
        const e = inOutCubic(range(y, 0, vh * 0.5));
        const dive = smooth(range(y, vh * 0.3, vh * 1.2));
        hero.style.setProperty("--dive", dive.toFixed(4));
        hero.style.setProperty("--gy", `${((y * 0.9) % 80).toFixed(1)}px`); // avanza por el plano; el módulo evita que se acabe la cuadrícula
        if (m) {
          n1.style.transform = `translate3d(${(m.dx1 * e).toFixed(2)}px, ${(m.dy1 * e).toFixed(2)}px, 0) scale(${(1 + (m.s1 - 1) * e).toFixed(4)})`;
          n2.style.transform = `translate3d(${(m.dx2 * e).toFixed(2)}px, ${(m.dy2 * e).toFixed(2)}px, 0) scale(${(1 + (m.s2 - 1) * e).toFixed(4)})`;
        }
        fades.forEach((f, i) => {
          const out = clamp(e * 2.4 - i * 0.06);
          f.style.opacity = (1 - out).toFixed(3);
          f.style.translate = `0 ${(-out * 22).toFixed(1)}px`;
          f.style.visibility = out >= 1 ? "hidden" : "";
        });
        const docked = y >= vh * 0.5;
        nav.toggleAttribute("data-docked", docked);
        n1.style.visibility = n2.style.visibility = docked ? "hidden" : "";
        place(dive);
      },
    };
    place(0);
    const off = subscribeScroll((y, vh) => api.update(y, vh));

    return () => {
      disposed = true;
      off();
      loop.stop();
      unwatch();
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      hset.removeEventListener("click", onClick);
      nav.removeAttribute("data-docked");
    };
  }, []);

  return (
    <div className="htrack" id="top" ref={root}>
      <section className="hero" id="hero" aria-label={content.name}>
        <div className="h-bg" aria-hidden="true">
          <div className="h-aurora" />
          <div className="plane-grid h-floor"><i /></div>
          <div className="h-cam">
            <div className="h-set" id="hset">
              {wins.map((p, i) => {
                const m = p.media[0];
                return (
                  <div className="win" data-id={p.id} style={{ "--i": i } as CSSProperties} key={p.id}>
                    <div className="win-in">
                      <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{host(p.deploy)}</span></div>
                      <Image src={m.src} alt="" width={m.w} height={m.h} sizes="(max-width: 760px) 62vw, (max-width: 1100px) 42vw, 640px" draggable={false} priority={i < 2} />
                      <b className="win-dim" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-veil" />
          <div className="h-deep" />
        </div>
        <div className="wrap h-copy" id="hcopy">
          <p className="h-pill" data-fade data-in="fade" style={{ "--at": "560ms" } as CSSProperties}><span className="pulse" aria-hidden="true" />{content.availability}</p>
          <h1 className="h-name" aria-label={`${content.name} — ${content.headline}`}>
            <span className="n1" id="n1" aria-hidden="true">
              {[...first].map((c, i) => <span className="mk" key={i}><span className="ch" style={{ "--i": i } as CSSProperties}>{c}</span></span>)}
            </span>
            <span className="n2 serif" id="n2" aria-hidden="true"><span className="mk"><span className="ch2">{last}</span></span></span>
          </h1>
          <p className="h-role mono" data-fade data-in="up" style={{ "--at": "380ms" } as CSSProperties}>{content.headline}</p>
          <p className="h-lead" data-fade data-in="up" style={{ "--at": "480ms" } as CSSProperties}>{content.valueProposition}</p>
          {role && (
            <p className="h-now mono" data-fade data-in="fade" style={{ "--at": "620ms" } as CSSProperties}>
              {role}{current?.period && <> <span aria-hidden="true">·</span> {z("since")} {fmtMonth(current.period.start, content.locale)}</>}
            </p>
          )}
          <div className="h-cta" data-fade data-in="up" style={{ "--at": "680ms" } as CSSProperties}>
            <a className="btn primary" href="#contact">{t("ctaContact")}</a>
            <a className="btn" href="#projects">{z("heroProjects")} <span aria-hidden="true">↓</span></a>
            <a className="btn" href={content.links.cv} download>{t("ctaCv")}</a>
          </div>
        </div>
        <div className="h-hint mono" data-fade aria-hidden="true"><span>{z("scroll")}</span><i /></div>
      </section>
    </div>
  );
}
