"use client";

// Contacto: Message Portal es el protagonista. Título + descripción lo encabezan (misma columna que el formulario)
// y los canales secundarios lo cierran como una barra compacta. El correo vive solo en los estados de error del formulario.
import { useTranslations } from "next-intl";
import { withEm } from "./About";
import { MessagePortal } from "./MessagePortal";
import { IconGitHub, IconLinkedIn } from "./icons";
import type { ZContent } from "./types";

export function Contact({ content }: { content: ZContent }) {
  const t = useTranslations("Contact");
  const c = useTranslations("Common");
  const z = useTranslations("Z");
  const { email, linkedin, github, cv, cvOther, otherLocale } = content.links;
  const lang = content.locale;

  const rows = [
    { href: linkedin, label: t("linkedin"), ext: true, ic: <IconLinkedIn /> },
    { href: github, label: t("github"), ext: true, ic: <IconGitHub /> },
    { href: cv, label: lang === "es" ? t("cvEs") : t("cvEn"), dl: true, lg: lang },
    { href: cvOther, label: otherLocale === "es" ? t("cvEs") : t("cvEn"), dl: true, lg: otherLocale },
  ];

  const head = (
    <>
      <p className="eyebrow mono" data-io><b>Z·05</b> {t("eyebrow")}</p>
      <h2 className="ct-title" id="ct-h" data-io><span className="mask-line"><span>{withEm(t("title"), z("contactEm"))}</span></span></h2>
      <p className="ct-lead" data-reveal>{t("description")}</p>
    </>
  );

  const foot = (
    <nav className="ct-links" aria-label={z("contactLinks")} data-reveal>
      <p className="mono ct-links-l" aria-hidden="true">{z("contactLinks")}</p>
      <ul>
        {rows.map((r) => (
          <li key={r.href}>
            <a href={r.href} {...(r.ext ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${r.label} (${c("opensInNewTab")})` } : {})} {...(r.dl ? { download: true, hrefLang: r.lg } : {})}>
              {r.ic}<span>{r.label}</span><b aria-hidden="true">{r.dl ? "↓" : "↗"}</b>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <section className="sec contact" id="contact" aria-labelledby="ct-h">
      <div className="sec-rule" data-io />
      <div className="plane-grid ct-floor" aria-hidden="true"><i /></div>
      <div className="ct-glow" aria-hidden="true" />
      <div className="wrap">
        <MessagePortal email={email} head={head} foot={foot} />
      </div>
    </section>
  );
}
