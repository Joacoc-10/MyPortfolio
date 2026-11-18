"use client";

// PROYECTOS · Interfaz. Explorador con dos vistas sobre los MISMOS 12 proyectos:
//  · Explorar: coverflow 3D en escritorio/tablet (arrastre, flechas, teclado) y mazo con scroll-snap nativo en móvil.
//  · Índice: lista editorial tipográfica con acordeón (la vista rápida y la más cómoda con teclado o lector de pantalla).
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { kindOf, useZ } from "./ctx";
import { createCoverflow, type Coverflow } from "./coverflow";
import { bridge, getMotionPrefs, host, pad2, watchVisible } from "./lib";
import { TechLogo } from "./TechLogo";
import type { ZProject } from "./types";

const GROUPS = ["professional", "personal", "bootcamp"] as const;

function Frame({ p }: { p: ZProject }) {
  const z = useTranslations("Z");
  const kind = useKindLabel();
  const m = p.media[0];
  if (m) {
    return (
      <div className={`frame${m.full ? " frame-full" : ""}`}>
        <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{host(p.deploy) || z("internal")}</span></div>
        <Image src={m.src} alt={m.alt} width={m.w} height={m.h} sizes="(max-width: 700px) 78vw, (max-width: 900px) 60vw, 46vw" draggable={false} />
      </div>
    );
  }
  return (
    <div className="frame frame-type">
      <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{z("internal")}</span></div>
      <div className="ft">
        <p className="ft-kind mono">{kind(p)}</p>
        <p className="ft-name serif">{p.name}</p>
        <ul className="ft-tech" aria-hidden="true">{p.techs.slice(0, 5).map((t) => <li key={t.id}><TechLogo tech={t} size={13} />{t.name}</li>)}</ul>
      </div>
    </div>
  );
}

function useKindLabel() {
  const { content } = useZ();
  const t = useTranslations("Projects");
  return useCallback((p: ZProject) => kindOf(p, content.companies, t("kindPersonal"), t("kindBootcamp")), [content.companies, t]);
}

export function Projects() {
  const { projects, openDetail } = useZ();
  const t = useTranslations("Projects");
  const nav = useTranslations("Nav");
  const c = useTranslations("Common");
  const z = useTranslations("Z");
  const kind = useKindLabel();
  const N = projects.length;
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cf = useRef<HTMLDivElement>(null);
  const eng = useRef<Coverflow | null>(null);
  const [view, setView] = useState<"explore" | "index">("explore");
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false); // el panel es región viva solo después de que el visitante navega
  const [openRow, setOpenRow] = useState(-1);
  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);
  const rm = useRef(false);

  const groupName = (g: (typeof GROUPS)[number]) => (g === "professional" ? z("groupProfessional") : g === "personal" ? t("personalHeading") : t("bootcampHeading"));
  const badgeFor = (p: ZProject) => (p.pilot ? { text: c("activePilot"), pilot: true } : p.inProduction ? { text: c("inProduction"), pilot: false } : null);

  /* ---------- motor del coverflow ---------- */
  useEffect(() => {
    const prefs = getMotionPrefs();
    rm.current = prefs.rm;
    try {
      if (sessionStorage.getItem("jcz-view") === "index") setView("index");
    } catch {}
    const cv = createCoverflow({
      sec: sec.current!, stage: stage.current!, cf: cf.current!, rm: prefs.rm, calm: prefs.calm, kinds: projects.map((p) => p.kind),
      onActive: (i, moved) => { setActive(i); if (moved) setLive(true); },
      onOpen: (i, from) => openDetail(projects[i].id, from),
    });
    eng.current = cv;
    const unwatch = watchVisible(sec.current!, (v) => { if (v) { cv.refresh(); cv.prefetch(); } }, "200px");
    return () => { unwatch(); cv.dispose(); eng.current = null; };
    // El motor se crea una sola vez: los proyectos y openDetail son estables durante la vida de la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lleva el explorador a un proyecto (desde el hero).
  useEffect(() => {
    bridge.goProject = (id: string) => {
      const i = projects.findIndex((p) => p.id === id);
      if (i < 0) return;
      setView("explore");
      requestAnimationFrame(() => eng.current?.goTo(i, { smoothScroll: false }));
      sec.current?.scrollIntoView({ behavior: rm.current ? "auto" : "smooth", block: "start" });
    };
    return () => { bridge.goProject = () => {}; };
  }, [projects]);

  const changeView = (v: "explore" | "index") => {
    setView(v);
    try { sessionStorage.setItem("jcz-view", v); } catch {}
  };
  // Al volver a «Explorar» (estaba oculta) se vuelve a medir y recolocar.
  useEffect(() => { if (view === "explore") requestAnimationFrame(() => eng.current?.refresh()); }, [view]);

  const goTo = (i: number) => eng.current?.goTo(i);
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("input,textarea,select")) return;
    const map: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: N - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    goTo(map[e.key]);
    const cv = eng.current;
    if (cv && document.activeElement?.classList.contains("card-hit")) requestAnimationFrame(() => cv.hit(cv.active)?.focus());
  };

  const toggleRow = (i: number) => {
    const next = openRow === i ? -1 : i;
    setOpenRow(next);
    if (next >= 0) setTimeout(() => {
      const r = rowsRef.current[next]?.getBoundingClientRect();
      if (r && (r.top < 90 || r.bottom > innerHeight)) scrollBy({ top: r.top - 100, behavior: rm.current ? "auto" : "smooth" });
    }, 160);
  };

  const cur = projects[active];
  const badge = badgeFor(cur);

  return (
    <section className="sec proj" id="projects" aria-labelledby="proj-h" ref={sec}>
      <div className="sec-rule" data-io />
      <div className="p-light" aria-hidden="true" />
      <div className="wrap p-top">
        <header className="sec-head" data-io>
          <p className="eyebrow mono"><b>Z·01</b> {t("eyebrow")}</p>
          <h2 className="sec-title" id="proj-h" tabIndex={-1}><span className="mask-line"><span>{nav("projects")}</span></span></h2>
          <p className="sec-lead" data-reveal>{z("pLead")}</p>
        </header>
        <div className="p-bar" data-reveal>
          <div className="p-groups" role="group" aria-label={z("groupsLabel")}>
            {GROUPS.map((g) => (
              <button key={g} type="button" className="p-group" aria-pressed={cur.kind === g}
                onClick={() => { const first = projects.findIndex((p) => p.kind === g); if (first >= 0) { changeView("explore"); goTo(first); } }}>
                {groupName(g)}<b>{projects.filter((p) => p.kind === g).length}</b>
              </button>
            ))}
          </div>
          <div className="p-view" role="group" aria-label={z("viewLabel")}>
            <button type="button" aria-pressed={view === "explore"} onClick={() => changeView("explore")}>{z("viewExplore")}</button>
            <button type="button" aria-pressed={view === "index"} onClick={() => changeView("index")}>{z("viewIndex")}</button>
          </div>
        </div>
      </div>

      <div className="p-explore" id="pExplore" hidden={view !== "explore"} onKeyDown={onKey}>
        <div className="cf" id="cf" ref={cf} role="group" aria-roledescription="carousel" aria-label={z("cfLabel")} tabIndex={-1}>
          <div className="cf-stage" id="cfStage" ref={stage}>
            {projects.map((p, i) => (
              <div key={p.id} className={`card${i === active ? " on" : ""}`} data-i={i} data-id={p.id} data-kind={p.kind} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${N} — ${p.name}`}>
                <div className="tilt"><Frame p={p} /><span className="glare" aria-hidden="true" /></div>
                <button className="card-hit" type="button" tabIndex={i === active ? 0 : -1} data-i={i} aria-label={(i === active ? z("open", { name: p.name }) : z("show", { name: p.name }))} />
              </div>
            ))}
          </div>
        </div>
        <div className="wrap">
          <div className="cf-nav">
            <button className="cf-arrow prev" type="button" aria-label={z("cfPrev")} onClick={() => goTo(active - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <ol className="cf-index" aria-label={nav("projects")}>
              {projects.map((p, i) => (
                <li key={p.id}>
                  <button type="button" className="cf-dot" data-kind={p.kind} aria-current={i === active ? "true" : undefined} aria-label={`${pad2(i + 1)} — ${p.name}`} onClick={() => goTo(i)}>
                    <span aria-hidden="true">{pad2(i + 1)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <button className="cf-arrow next" type="button" aria-label={z("cfNext")} onClick={() => goTo(active + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <p className="cf-hint mono" aria-hidden="true">{z("cfHint")}</p>
          <div className="panel glow" id="panel" data-spot>
            <div className={`panel-in${live ? " swap" : ""}`} key={cur.id} aria-live={live ? "polite" : undefined} aria-atomic="true">
              <div className="p-id">
                <p className="p-count mono">{pad2(active + 1)} / {pad2(N)}</p>
                <h3 className="p-name">{cur.name}</h3>
                <p className="p-kind"><span className="mono">{kind(cur)}</span>{badge && <span className={`badge${badge.pilot ? " pilot" : ""}`}>{badge.text}</span>}</p>
              </div>
              <p className="p-sum">{cur.summary}</p>
              <div className="p-side">
                <p className="p-label mono">{z("main")}</p>
                <ul className="p-techs">{cur.techs.slice(0, 5).map((tc) => <li className="chip tc" key={tc.id} style={tc.brandColor ? ({ "--c": tc.brandColor } as React.CSSProperties) : undefined}><TechLogo tech={tc} size={14} />{tc.name}</li>)}</ul>
              </div>
            </div>
            <div className="p-actions">
              <button className="btn primary" type="button" aria-label={z("open", { name: cur.name })} onClick={(e) => openDetail(cur.id, e.currentTarget)}>{z("more")} →</button>
              {cur.visitUrl && (
                <a className="btn" href={cur.visitUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t("visitSiteLabel", { name: cur.name })} (${c("opensInNewTab")})`}>{t("visitSite")} ↗</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap p-index" id="pIndex" hidden={view !== "index"}>
        <ol className="index" id="index">
          {projects.map((p, i) => {
            const prev = projects[i - 1];
            const isOpen = openRow === i;
            const m = p.media[0];
            return (
              <Fragment key={p.id}>
                {(!prev || prev.kind !== p.kind) && <li className="ix-group mono" aria-hidden="true">{groupName(p.kind)}</li>}
                <li className="row" ref={(el) => { rowsRef.current[i] = el; }} data-i={i} data-id={p.id} data-kind={p.kind} data-open={isOpen ? "" : undefined}>
                  <h3>
                    <button className="rowbtn" type="button" aria-expanded={isOpen} aria-controls={`rp-${i}`} onClick={() => toggleRow(i)}>
                      <span className="rn mono" aria-hidden="true">{pad2(i + 1)}</span><span className="rt">{p.name}</span>
                      <span className="rk mono">{kind(p)}<span className="rar" aria-hidden="true">+</span></span>
                    </button>
                  </h3>
                  <div className="rp" id={`rp-${i}`} role="region" aria-label={p.name} inert={!isOpen}>
                    <div className="rpi"><div className="rbody">
                      <div className={`rshot${m?.full ? " rshot-full" : ""}`} aria-hidden="true">
                        {m ? <Image src={m.src} alt="" width={m.w} height={m.h} sizes="(max-width: 760px) 100vw, 40vw" draggable={false} /> : <div className="rshot-t serif">{p.name}</div>}
                      </div>
                      <div className="rinfo">
                        <p>{p.summary}</p>
                        <ul className="techs" aria-label={t("technologies")}>{p.techs.slice(0, 6).map((tc) => <li className="tc" key={tc.id} style={tc.brandColor ? ({ "--c": tc.brandColor } as React.CSSProperties) : undefined}><TechLogo tech={tc} size={14} />{tc.name}</li>)}</ul>
                        <div className="ractions">
                          <button type="button" className="btn primary sm" aria-label={z("open", { name: p.name })} onClick={(e) => openDetail(p.id, e.currentTarget)}>{z("more")} →</button>
                          {p.visitUrl && <a className="btn sm" href={p.visitUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t("visitSiteLabel", { name: p.name })} (${c("opensInNewTab")})`}>{t("visitSite")} ↗</a>}
                        </div>
                      </div>
                    </div></div>
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
