"use client";

// Vista de detalle: un <dialog> modal accesible (Escape, foco devuelto a quien lo abrió, scroll de la página bloqueado).
// Galería de capturas reales dentro de un marco de navegador, información completa y enlaces externos.
// No hay demos incrustadas ni iframes: el sitio real se abre en una pestaña nueva.
// UES × Mercado Libre (sistema interno) usa una presentación tipográfica, sin capturas inventadas.
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { kindOf, useZ } from "./ctx";
import { getMotionPrefs, host, pad2 } from "./lib";
import { IntegrationCover } from "./IntegrationCover";
import { TechLogo } from "./TechLogo";
import type { ZProject } from "./types";
import type { TechCategory } from "@/data";

const CATS: TechCategory[] = ["frontend", "backend", "database", "devops", "tools", "services"];

export function Detail({ index, onClose, onStep }: { index: number | null; onClose: () => void; onStep: (dir: 1 | -1) => void }) {
  const { projects, content } = useZ();
  const t = useTranslations("Projects");
  const x = useTranslations("Experience");
  const s = useTranslations("Stack");
  const c = useTranslations("Common");
  const z = useTranslations("Z");
  const dlg = useRef<HTMLDialogElement>(null);
  const [shot, setShot] = useState(0);
  const [swap, setSwap] = useState(0);
  const rm = useRef(false);
  const p: ZProject | undefined = index === null ? undefined : projects[index];

  useEffect(() => { rm.current = getMotionPrefs().rm; }, []);

  // Abre/cierra el <dialog> nativo según `index`.
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (index !== null && !d.open) {
      d.showModal();
      document.documentElement.classList.add("lock");
    } else if (index === null && d.open) {
      d.close();
    }
  }, [index]);

  useEffect(() => { setShot(0); setSwap((n) => n + 1); }, [index]);

  const handleClose = useCallback(() => {
    document.documentElement.classList.remove("lock");
    onClose();
  }, [onClose]);

  const n = projects.length;
  const media = p?.media ?? [];
  const go = (i: number) => setShot((i + media.length) % media.length);
  const label = (cat: TechCategory) => (cat === "services" ? z("services") : s(`categories.${cat}` as "categories.frontend"));

  return (
    <dialog
      ref={dlg}
      className="detail"
      id="detail"
      aria-labelledby="d-title"
      onClose={handleClose}
      onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }} // clic en el fondo
      onKeyDown={(e) => {
        if (!media.length || (e.target as HTMLElement).closest("input,textarea")) return;
        if ((e.target as HTMLElement).closest("#dMedia")) {
          if (e.key === "ArrowLeft") go(shot - 1);
          if (e.key === "ArrowRight") go(shot + 1);
        }
      }}
    >
      {p && index !== null && (
        <div className="d-shell">
          <header className="d-bar">
            <button type="button" className="btn sm" onClick={() => dlg.current?.close()}><span aria-hidden="true">←</span> {z("back")}</button>
            <p className="d-crumb mono" aria-hidden="true">{pad2(index + 1)} / {pad2(n)}</p>
            <div className="d-step">
              <button type="button" className="btn sm" onClick={() => onStep(-1)}>
                <span aria-hidden="true">‹</span><span className="sr-only">{z("detailPrev")}: {projects[(index - 1 + n) % n].name}</span>
              </button>
              <button type="button" className="btn sm" onClick={() => onStep(1)}>
                <span aria-hidden="true">›</span><span className="sr-only">{z("detailNext")}: {projects[(index + 1) % n].name}</span>
              </button>
            </div>
          </header>
          <div className={`d-body${swap ? " swap" : ""}`} key={swap}>
            <div className="d-media" id="dMedia">
              {!media.length ? (
                <>
                  <div className="m-type">
                    <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{z("internal")}</span></div>
                    {p.integration ? <IntegrationCover logos={p.integration.logos} /> : <div className="m-type-in">
                      <p className="mono">{kindOf(p, content.companies, t("kindPersonal"), t("kindBootcamp"))}</p>
                      <p className="m-type-name serif">{p.name}</p>
                      <ul className="m-type-tech">{p.techs.slice(0, 9).map((tc) => <li key={tc.id}><TechLogo tech={tc} size={13} />{tc.name}</li>)}</ul>
                    </div>}
                  </div>
                  <p className="m-note">{z("internalNote")}</p>
                </>
              ) : (
                <div className="m-view" role="group" aria-roledescription="carousel" aria-label={z("gallery")}>
                  <figure className="g-main">
                    <div className="chrome" aria-hidden="true"><i /><i /><i /><span>{host(p.deploy)}</span></div>
                    <Image key={`${p.id}-${shot}`} className={shot || swap > 1 ? "fade" : undefined} src={media[shot].src} alt={media[shot].alt} width={media[shot].w} height={media[shot].h} sizes="(max-width: 900px) 100vw, 56vw" priority />
                    <figcaption className="g-cap"><span>{media[shot].caption ?? ""}</span><span className="mono" aria-hidden="true">{pad2(shot + 1)} / {pad2(media.length)}</span></figcaption>
                    {media.length > 1 && (
                      <>
                        <button type="button" className="g-arrow prev" aria-label={z("shotPrev")} onClick={() => go(shot - 1)}>‹</button>
                        <button type="button" className="g-arrow next" aria-label={z("shotNext")} onClick={() => go(shot + 1)}>›</button>
                      </>
                    )}
                  </figure>
                  {media.length > 1 && (
                    <ul className="g-thumbs">
                      {media.map((m, i) => (
                        <li key={m.src}>
                          <button type="button" aria-current={i === shot ? "true" : undefined} aria-label={z("shot", { n: String(i + 1), total: String(media.length) })} onClick={() => setShot(i)}>
                            <Image src={m.src} alt="" width={m.w} height={m.h} sizes="84px" loading="lazy" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="d-info" id="dInfo" tabIndex={-1}>
              <p className="d-kind">
                <span className="mono">{kindOf(p, content.companies, t("kindPersonal"), t("kindBootcamp"))}</span>
                {(p.pilot || p.inProduction) && <span className={`badge${p.pilot ? " pilot" : ""}`}>{p.pilot ? c("activePilot") : c("inProduction")}</span>}
              </p>
              <h2 className="d-title" id="d-title">{p.name}</h2>
              <section className="d-sec"><h3 className="d-h mono">{z("summary")}</h3><p className="d-p">{p.summary}</p></section>
              {p.problem && <section className="d-sec"><h3 className="d-h mono">{z("problem")}</h3><p className="d-p">{p.problem}</p></section>}
              {!!p.contributions?.length && (
                <section className="d-sec"><h3 className="d-h mono">{x("contributionsHeading")}</h3><ul className="d-list">{p.contributions.map((ct) => <li key={ct}>{ct}</li>)}</ul></section>
              )}
              <section className="d-sec">
                <h3 className="d-h mono">{x("technologies")}</h3>
                {CATS.map((cat) => ({ cat, items: p.techs.filter((tc) => tc.category === cat) })).filter((g) => g.items.length).map((g) => (
                  <div className="tg" key={g.cat}>
                    <h4 className="tg-h">{label(g.cat)}</h4>
                    <ul className="d-chips">{g.items.map((tc) => <li className="chip tc" key={tc.id} style={tc.brandColor ? ({ "--c": tc.brandColor } as React.CSSProperties) : undefined}><TechLogo tech={tc} size={14} />{tc.name}</li>)}</ul>
                  </div>
                ))}
              </section>
              {(p.deploy || p.repo) && (
                <section className="d-sec">
                  <h3 className="d-h mono">{z("links")}</h3>
                  <div className="d-links">
                    {p.deploy && <a className="btn primary" href={p.deploy} target="_blank" rel="noopener noreferrer" aria-label={`${t("visitSiteLabel", { name: p.name })} (${c("opensInNewTab")})`}>{t("visitSite")} ↗</a>}
                    {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`${t("viewRepoLabel", { name: p.name })} (${c("opensInNewTab")})`}>{t("viewRepo")} ↗</a>}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
