"use client";

// HERO · Superficie. Escena de ventanas de navegador con capturas reales dispuestas a lo largo del eje Z
// (un túnel que se aleja hacia un punto de fuga a la derecha), nombre con peso tipográfico que responde al
// puntero y se acopla al navbar, y un «dive» final: la cámara atraviesa las ventanas hacia la profundidad.
// Sin scroll-jacking: la sección usa position: sticky y el scroll es siempre el nativo.
// React solo pinta el marcado; la escena se anima por transformaciones desde un único bucle (sin renders por frame).
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { bindPointer, bridge, clamp, createLoop, fmtMonth, getMotionPrefs, host, inOutCubic, lerp, onPointerActivity, pointer, range, smooth, subscribeScroll, tintOf, watchVisible } from "./lib";
import type { ZContent } from "./types";
import { createWeightField } from "./weight";

// Fabio Producciones ocupa SIEMPRE la última ventana (la más profunda) del recorrido, en escritorio y en móvil.
const WIDE_IDS = ["order-a", "nexvia", "zatobox", "olibar", "florencia-biaturi", "fabio-producciones"];
const NARROW_IDS = ["order-a", "nexvia", "fabio-producciones"];
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
        const dock = document.getElementById("dock")!;
    const nav = document.getElementById("nav")!;
    const winEls = [...el.querySelectorAll<HTMLElement>(".win")];
    const rl = hero.querySelector<HTMLElement>("#hrole")!;
    // El nombre se desvanece con el scroll; el rol («Full Stack Developer») es lo que se acopla al navbar.
    const fades = [hero.querySelector<HTMLElement>(".h-name")!, ...hero.querySelectorAll<HTMLElement>("[data-fade]")];
    const deep = hero.querySelector<HTMLElement>(".h-deep")!;
    const floor = hero.querySelector<HTMLElement>(".h-floor")!;
    const tintEls = [...hero.querySelectorAll<HTMLElement>(".h-tint")];
    const letters = [...n1.querySelectorAll<HTMLElement>(".ch")];
    const field = createWeightField(letters);
    let skipIntro = false;
    try { skipIntro = !!sessionStorage.getItem("jcz-restore"); } catch {}
    if (skipIntro || calm) hero.classList.add("skip-intro");
    hero.classList.toggle("calm", calm);

    let narrow = innerWidth < 760;
    let ready = false;
    let m: { s: number; dx: number; dy: number } | null = null;
    let focus = 0, lastPick = 0, lastAuto = performance.now();
    let waveEnd = 0; // la onda tipográfica sin puntero dura solo unos segundos tras la entrada
    const tint = new Map<number, [number, number, number]>();
    const poseOf = (id: string): Pose | undefined => (narrow ? POSES_NARROW[NARROW_IDS.indexOf(id)] : POSES_WIDE[WIDE_IDS.indexOf(id)]);
    let disposed = false;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => { const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };

    /* ---------- arranque: con fuentes e imágenes listas (con tope) para que no haya saltos ---------- */
    const imgs = [...hero.querySelectorAll<HTMLImageElement>(".win img")].slice(0, 2).map((i) => i.decode?.().catch(() => {}));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([Promise.all([fonts, ...imgs]), new Promise((r) => setTimeout(r, 900))]).then(() => {
      if (disposed) return;
      hero.classList.add("go");
      // Terminada la entrada se retiran las animaciones con `fill: both` (el estado final es idéntico): así sus capas
      // de composición no quedan reservadas para siempre.
      later(() => hero.classList.add("intro-done"), 2600);
    });
    fonts.then(() => requestAnimationFrame(() => {
      if (disposed) return;
      if (!calm) field.fix();
      measure();
      ready = true;
      waveEnd = performance.now() + 6500;
      api.update(scrollY, innerHeight);
      loop.wake();
    }));

    /* ---------- luz ambiental por proyecto ----------
       Dos capas que se funden por opacidad (compositor): cambiar de proyecto ya no repinta el degradado ni recalcula
       estilos de todo el hero durante la transición. */
    let tintOn = 0;
    function setAmbient(i: number) {
      const c = tint.get(i);
      if (!c || !tintEls.length) return;
      const next = tintEls[(tintOn + 1) % tintEls.length];
      if (tintEls.length > 1 && tintEls[tintOn].dataset.k === `${c[0]},${c[1]},${c[2]}`) return;
      next.style.setProperty("--tr", String(c[0])); next.style.setProperty("--tg", String(c[1])); next.style.setProperty("--tb", String(c[2]));
      next.dataset.k = `${c[0]},${c[1]},${c[2]}`;
      next.classList.add("on");
      if (next !== tintEls[tintOn]) tintEls[tintOn].classList.remove("on");
      tintOn = tintEls.indexOf(next);
    }
    function setFocus(k: number) {
      focus = k;
      winEls.forEach((w, i) => w.classList.toggle("is-focus", i === k));
      setAmbient(k);
    }
    setFocus(0);
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
    // Se escribe solo lo que cambia: sin escrituras idénticas no hay invalidación de estilo.
    const winState = winEls.map(() => ({ t: "", o: "", pe: "", h: false }));
    function place(dive: number) {
      const W = innerWidth, H = innerHeight;
      winEls.forEach((w, i) => {
        const st = winState[i];
        const pz = poseOf(w.dataset.id!);
        if (!pz) { if (!st.h) { w.hidden = true; st.h = true; } return; }
        if (st.h) { w.hidden = false; st.h = false; }
        const zz = pz.z + dive * DIVE_DEPTH;
        // se desvanece al atravesar el plano de la cámara y también cuando queda muy lejos
        const op = (1 - range(zz, 80, 760)) * (1 - range(-zz, 2400, 3400));
        const t = `translate3d(calc(-50% + ${(pz.x * W).toFixed(1)}px), calc(-50% + ${(pz.y * H).toFixed(1)}px), ${zz.toFixed(1)}px) rotateY(${pz.ry}deg) rotateX(${pz.rx}deg)`;
        const o = op.toFixed(3);
        const pe = op < 0.4 ? "none" : "";
        if (t !== st.t) { w.style.transform = t; st.t = t; }
        if (o !== st.o) { w.style.opacity = o; st.o = o; }
        if (pe !== st.pe) { w.style.pointerEvents = pe; st.pe = pe; }
      });
    }

    function measure() {
      narrow = innerWidth < 760;
      lastE = -1;
      if (calm) { place(0); return; }
      rl.style.transform = "none";
      const h = hero.getBoundingClientRect(), a1 = rl.getBoundingClientRect();
      const b1 = dock.querySelector(".dock-role")!.getBoundingClientRect();
      // El hero está fijo (sticky) durante el acople: se mide respecto del hero y se lleva al viewport.
      m = { s: b1.width / a1.width, dx: b1.left - a1.left, dy: b1.top - (a1.top - h.top) };
    }
    const onResize = () => requestAnimationFrame(() => {
      if (disposed) return;
      if (!calm) field.fix(); // vuelve a medir las letras (caché invalidada)
      measure();
      lastDive = -1;
      api.update(scrollY, innerHeight);
      loop.wake();
    });
    addEventListener("resize", onResize);

    /* ---------- bucle BAJO DEMANDA: parallax de la escena + peso del nombre ----------
       No hay bucle permanente. Se despierta con el puntero (o con la entrada) y se duerme solo cuando todo ha convergido.
       Las lecturas (ventana bajo el puntero) van antes de las escrituras de cada frame. */
    let px = 0, py = 0, hsetKey = "", lastDive = -1, lastE = -1, lastDocked: boolean | null = null, lastGy = "";
    let visible = true;
    const dormant = () => !visible || document.hidden || calm || lastDive >= 0.999;
    const ptrActive = (now: number) => pointer.x > -999 && now - pointer.last < 2600;
    const loop = createLoop((now) => {
      const active = ptrActive(now);
      // lecturas
      if (active && now - lastPick > 140 && !narrow) {
        lastPick = now;
        const over = winAt(pointer.x, pointer.y) ? "pointer" : "";
        if (hset.style.cursor !== over) hset.style.cursor = over;
        let best = focus, bd = 1e9;
        winEls.forEach((w, i) => {
          if (w.hidden || +w.style.opacity < 0.3) return;
          const r = w.getBoundingClientRect();
          const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
          if (d < bd) { bd = d; best = i; }
        });
        if (best !== focus) setFocus(best);
        lastAuto = now;
      }
      // escrituras
      const tx = active ? pointer.nx : 0, ty = active ? pointer.ny : 0;
      px = lerp(px, tx, 0.05); py = lerp(py, ty, 0.05);
      if (Math.abs(px - tx) < 0.0004) px = tx;
      if (Math.abs(py - ty) < 0.0004) py = ty;
      const key = `${px.toFixed(3)},${py.toFixed(3)}`;
      if (key !== hsetKey) {
        hsetKey = key;
        hset.style.transform = `translate3d(${(-px * 24).toFixed(1)}px, ${(-py * 15).toFixed(1)}px, 0) rotateY(${(px * 4).toFixed(2)}deg) rotateX(${(-py * 2.5).toFixed(2)}deg)`;
      }
      const weightBusy = ready ? field.tick(now, scrollY < 24 ? 1 : 0, clamp((waveEnd - now) / 1800)) : false;
      return px !== tx || py !== ty || weightBusy || (active && now - pointer.last < 120);
    });
    // Deriva ambiente (antes un bucle JS): ahora es una animación CSS de compositor, que se pausa con `.still`.
    const sync = () => {
      const still = dormant();
      hero.classList.toggle("still", still);
      if (still) loop.pause(); else loop.resume();
    };
    // Con el hero fuera de pantalla (margen de 200 px para no ver el repoblado) la escena 3D se oculta: sin pintado ni capas de composición.
    const unwatch = watchVisible(hero, (v) => { visible = v; hero.classList.toggle("off", !v); sync(); }, "200px");
    document.addEventListener("visibilitychange", sync);
    // El puntero despierta el bucle; pasado el tiempo de inactividad se despierta una vez más para devolver todo al reposo.
    let idleT = 0;
    const offPointer = calm ? () => {} : onPointerActivity(() => {
      if (dormant()) return;
      loop.wake();
      clearTimeout(idleT);
      idleT = window.setTimeout(() => loop.wake(), 2700);
    });
    // Rotación lenta de la luz entre proyectos cuando nadie interactúa: un temporizador, no un bucle.
    const autoT = calm ? 0 : window.setInterval(() => {
      const now = performance.now();
      if (dormant() || ptrActive(now) || now - lastAuto < 5200) return;
      let k = focus;
      for (let s = 0; s < winEls.length; s++) { k = (k + 1) % winEls.length; if (poseOf(winEls[k].dataset.id!)) break; }
      setFocus(k);
      lastAuto = now;
    }, 1300);
    sync();

    /* ---------- clic en una ventana: lleva al proyecto en el explorador ----------
       El hit-test nativo solo alcanza a la ventana frontal de un grupo 3D con perspectiva, así que se resuelve por
       geometría: la ventana más cercana a la cámara (orden de la lista) cuyo recuadro contiene el puntero. */
    const winAt = (x: number, y: number) => {
      for (const w of winEls) {
        if (w.hidden || +w.style.opacity < 0.4) continue;
        const r = w.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return w;
      }
      return null;
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".h-copy > *")) return; // el texto y los botones tienen prioridad
      const w = winAt(e.clientX, e.clientY);
      if (w) bridge.goProject(w.dataset.id!);
    };
    hero.addEventListener("click", onClick);

    const api = {
      /** Lo llama el único manejador de scroll de ZAxisApp. Solo escribe cuando el valor cambia. */
      update(y: number, vh: number) {
        if (calm) {
          const d = y > vh * 0.5;
          if (d !== lastDocked) { lastDocked = d; nav.toggleAttribute("data-docked", d); }
          return;
        }
        if (!ready) return;
        const total = track.offsetHeight - vh;
        if (y > total + vh) return; // el hero ya salió de pantalla
        const e = inOutCubic(range(y, 0, vh * 0.5));
        const dive = smooth(range(y, vh * 0.3, vh * 1.2));
        if (dive !== lastDive) {
          const was = lastDive >= 0.999;
          lastDive = dive;
          deep.style.opacity = dive.toFixed(4);
          place(dive);
          if (was !== dive >= 0.999) sync(); // terminó (o se reanuda) la transición de profundidad
        }
        const gy = `${((y * 0.9) % 80).toFixed(0)}px`; // avanza por el plano; el módulo evita que se acabe la cuadrícula
        if (gy !== lastGy) { lastGy = gy; floor.style.setProperty("--gy", gy); }
        if (e !== lastE) {
          lastE = e;
          if (m) rl.style.transform = `translate3d(${(m.dx * e).toFixed(2)}px, ${(m.dy * e).toFixed(2)}px, 0) scale(${(1 + (m.s - 1) * e).toFixed(4)})`;
          fades.forEach((f, i) => {
            const out = clamp(e * 2.4 - i * 0.06);
            f.style.opacity = (1 - out).toFixed(3);
            f.style.translate = `0 ${(-out * 22).toFixed(1)}px`;
            f.style.visibility = out >= 1 ? "hidden" : "";
          });
        }
        const docked = y >= vh * 0.5;
        if (docked !== lastDocked) {
          lastDocked = docked;
          nav.toggleAttribute("data-docked", docked);
          rl.style.visibility = docked ? "hidden" : "";
        }
        // al volver al inicio el nombre vuelve a responder al puntero
        if (y < 24) loop.wake();
      },
    };
    place(0);
    const off = subscribeScroll((y, vh) => api.update(y, vh));

    return () => {
      disposed = true;
      off();
      loop.pause();
      timers.forEach(clearTimeout);
      clearTimeout(idleT);
      clearInterval(autoT);
      offPointer();
      unwatch();
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      hero.removeEventListener("click", onClick);
      nav.removeAttribute("data-docked");
    };
  }, []);

  return (
    <div className="htrack" id="top" ref={root}>
      <section className="hero" id="hero" aria-label={content.name}>
        <div className="h-bg" aria-hidden="true">
          <div className="h-aurora" />
          <div className="h-tint" />
          <div className="h-tint" />
          <div className="plane-grid h-floor"><i /></div>
          <div className="h-cam">
            <div className="h-set" id="hset">
              {wins.map((p, i) => {
                const m = p.media[0];
                return (
                  <div className="win" data-id={p.id} style={{ "--i": i } as CSSProperties} key={p.id}>
                    <div className="win-in">
                      <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{host(p.deploy)}</span></div>
                      <Image src={m.src} alt="" width={m.w} height={m.h} sizes="(max-width: 760px) 62vw, (max-width: 1100px) 42vw, 640px" draggable={false} loading={i < 3 ? "eager" : "lazy"} />
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
          <p className="h-role mono" id="hrole" data-in="up" style={{ "--at": "380ms" } as CSSProperties}>{content.headline}</p>
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
