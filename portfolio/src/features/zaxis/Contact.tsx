"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { withEm } from "./About";
import { MessagePortal } from "./MessagePortal";
import { IconGitHub, IconLinkedIn } from "./icons";
import { bindPointer, createLoop, getMotionPrefs, watchVisible } from "./lib";
import type { ZContent } from "./types";
import { createWeightField } from "./weight";

export function Contact({ content }: { content: ZContent }) {
  const t = useTranslations("Contact");
  const c = useTranslations("Common");
  const z = useTranslations("Z");
  const { email, linkedin, github, cv, cvOther, otherLocale } = content.links;
  const lang = content.locale;
  const [toast, setToast] = useState<{ text: string; bad: boolean } | null>(null);
  const timer = useRef(0);
  const mail = useRef<HTMLAnchorElement>(null);
  const sec = useRef<HTMLElement>(null);

  const say = (text: string, bad = false) => {
    setToast({ text, bad });
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  };
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
      else throw new Error("no clipboard");
      say(t("copied"));
    } catch {
      // Respaldo: selección + execCommand (por si el navegador no concede permiso de portapapeles).
      try {
        const ta = document.createElement("textarea");
        ta.value = email; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;top:0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        say(ok ? t("copied") : z("copyErr"), !ok);
      } catch { say(z("copyErr"), true); }
    }
  };

  // El correo «respira»: el peso de cada letra responde al puntero. Solo mientras la sección está en pantalla.
  useEffect(() => {
    bindPointer();
    const { calm } = getMotionPrefs();
    const a = mail.current, s = sec.current;
    if (calm || !a || !s) return;
    const letters = [...a.querySelectorAll<HTMLElement>(".ml > span")];
    const field = createWeightField(letters, { min: 240, rest: 320, max: 760, mid: 480, radius: 150, wave: 0.28 });
    const loop = createLoop((now) => field.tick(now, 1));
    document.fonts?.ready.then(() => field.fix());
    const onResize = () => requestAnimationFrame(() => field.fix());
    addEventListener("resize", onResize);
    const unwatch = watchVisible(s, (v) => { if (v && !document.hidden) loop.start(); else loop.stop(); });
    return () => { loop.stop(); unwatch(); removeEventListener("resize", onResize); clearTimeout(timer.current); };
  }, []);

  const rows = [
    { href: linkedin, label: t("linkedin"), ext: true, ic: <IconLinkedIn /> },
    { href: github, label: t("github"), ext: true, ic: <IconGitHub /> },
    { href: cv, label: lang === "es" ? t("cvEs") : t("cvEn"), dl: true, lg: lang },
    { href: cvOther, label: otherLocale === "es" ? t("cvEs") : t("cvEn"), dl: true, lg: otherLocale },
  ];

  return (
    <section className="sec contact" id="contact" aria-labelledby="ct-h" ref={sec}>
      <div className="sec-rule" data-io />
      <div className="plane-grid ct-floor" aria-hidden="true"><i /></div>
      <div className="ct-glow" aria-hidden="true" />
      <div className="wrap">
        <p className="eyebrow mono" data-io><b>Z·05</b> {t("eyebrow")}</p>
        <h2 className="ct-title" id="ct-h" data-io><span className="mask-line"><span>{withEm(t("title"), z("contactEm"))}</span></span></h2>
        <p className="ct-lead" data-reveal>{t("description")}</p>
        <a className="ct-mail" id="ctMail" ref={mail} href={`mailto:${email}`} aria-label={`${t("sendEmail")}: ${email}`} data-reveal>
          <span aria-hidden="true" className="ct-mail-in">{[...email].map((ch, i) => <span className="ml" key={i}><span>{ch}</span></span>)}</span>
        </a>
        <div className="ct-actions" data-reveal>
          <a className="btn primary" href={`mailto:${email}`}>{t("sendEmail")}</a>
          <button className="btn" type="button" id="ctCopy" onClick={copy}>{t("copyEmail")}</button>
        </div>
        <MessagePortal email={email} />
        <div className="ct-links" data-reveal>
          <p className="mono ct-links-l">{z("contactLinks")}</p>
          <ul>
            {rows.map((r) => (
              <li key={r.href}>
                <a href={r.href} {...(r.ext ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${r.label} (${c("opensInNewTab")})` } : {})} {...(r.dl ? { download: true, hrefLang: r.lg } : {})}>
                  {r.ic}<span>{r.label}</span><b aria-hidden="true">{r.dl ? "↓" : "↗"}</b>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`toast${toast ? " on" : ""}${toast?.bad ? " bad" : ""}`} id="toast" role="status" aria-live="polite">{toast?.text}</div>
    </section>
  );
}
