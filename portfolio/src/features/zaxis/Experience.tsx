"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useZ } from "./ctx";
import { fmtMonth } from "./lib";
import { TechLogo } from "./TechLogo";

/** Un único punto destacado con destellos: el proyecto marcado como destacado (ver `.sparkles` en extras.css). */
function Sparkles() {
  const dots = [["12%", "20%", "3.6s", "0s"], ["84%", "14%", "4.4s", "0.9s"], ["70%", "78%", "3.9s", "1.7s"], ["26%", "84%", "4.8s", "2.3s"]];
  return (
    <span className="sparkles" aria-hidden="true">
      {dots.map(([x, y, d, dl], i) => <i key={i} style={{ "--x": x, "--y": y, "--duration": d, "--delay": dl } as React.CSSProperties} />)}
    </span>
  );
}

export function Experience() {
  const { content, projects, openDetail } = useZ();
  const t = useTranslations("Experience");
  const c = useTranslations("Common");
  const z = useTranslations("Z");
  const lang = content.locale;

  return (
    <section className="sec exp" id="experience" aria-labelledby="exp-h">
      <div className="sec-rule" data-io />
      <div className="wrap">
        <header className="sec-head" data-io>
          <p className="eyebrow mono"><b>Z·02</b> {t("eyebrow")}</p>
          <h2 className="sec-title" id="exp-h"><span className="mask-line"><span>{t("title")}</span></span></h2>
          <p className="sec-lead" data-reveal>{t("description")}</p>
        </header>
        <ol className="timeline" id="timeline" aria-label={t("timeline")}>
          <span className="tl-line" aria-hidden="true"><i /></span>
          {content.companies.map((co) => {
            const current = !!co.period && co.period.end === null;
            const list = projects.filter((p) => p.companyId === co.id);
            return (
              <li className={`job${current ? " is-now" : ""}`} data-reveal key={co.id}>
                <div className="job-when">
                  <p className="job-year serif" aria-hidden="true">{co.period?.start.slice(0, 4)}</p>
                  {co.period && <p className="job-range mono">{fmtMonth(co.period.start, lang)} — {co.period.end ? fmtMonth(co.period.end, lang) : t("present")}</p>}
                  <span className={`badge${current ? "" : " past"}`}>{current ? t("current") : t("previous")}</span>
                </div>
                <div className="job-main">
                  <h3 className="job-co">
                    {co.website ? (
                      <a href={co.website} target="_blank" rel="noopener noreferrer" aria-label={`${t("visitCompany", { company: co.name })} (${c("opensInNewTab")})`}>{co.name}<span aria-hidden="true"> ↗</span></a>
                    ) : co.name}
                  </h3>
                  <p className="job-role">{co.role}{co.employmentType && <> <span className="job-type mono">{co.employmentType}</span></>}</p>
                  {co.summary && <p className="job-sum">{co.summary}</p>}
                  {list.length > 0 && (
                    <>
                      <h4 className="job-ph mono">{t("projectsHeading", { company: co.name })}</h4>
                      <ul className="job-projects">
                        {list.map((p, ji) => {
                          const m = p.media[0];
                          const badge = p.pilot ? c("activePilot") : p.inProduction ? c("inProduction") : null;
                          return (
                            <li key={p.id}>
                              <button type="button" className={`jp glow${p.featured ? " is-featured" : ""}`} data-spot style={{ "--ji": ji } as React.CSSProperties} aria-label={z("openProject", { name: p.name })} onClick={(e) => openDetail(p.id, e.currentTarget)}>
                                {p.featured && <Sparkles />}
                                <span className="jp-thumb" aria-hidden="true">
                                  {m ? <Image src={m.src} alt="" width={m.w} height={m.h} sizes="(max-width: 860px) 90vw, 230px" draggable={false} /> : <span className="serif">{p.name.split(" ")[0]}</span>}
                                </span>
                                <span className="jp-txt">
                                  <span className="jp-top">
                                    {p.featured && <span className="mono jp-feat">{t("featured")}</span>}
                                    {badge && <span className={`badge${p.pilot ? " pilot" : ""}`}>{badge}</span>}
                                  </span>
                                  <span className="jp-name">{p.name}</span>
                                  <span className="jp-sum">{p.summary}</span>
                                  <span className="jp-tech" aria-hidden="true">
                                    {p.techs.slice(0, 3).map((tc) => <i className="tc" key={tc.id} style={tc.brandColor ? ({ "--c": tc.brandColor } as React.CSSProperties) : undefined}><TechLogo tech={tc} size={12} />{tc.name}</i>)}
                                    {p.techs.length > 3 && <i>+{p.techs.length - 3}</i>}
                                  </span>
                                </span>
                                <span className="jp-go" aria-hidden="true">→</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
