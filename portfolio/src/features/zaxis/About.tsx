import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ZContent } from "./types";

const hasEm = (title: string, em: string) => !!em && title.toLowerCase().endsWith(em.toLowerCase());
export const withEm = (title: string, em: string) =>
  hasEm(title, em) ? (<>{title.slice(0, title.length - em.length)}<span className="serif">{title.slice(title.length - em.length)}</span></>) : title;

export function About({ content }: { content: ZContent }) {
  const t = useTranslations("About");
  const h = useTranslations("Hero");
  const z = useTranslations("Z");
  const [lead, ...rest] = content.about;
  const traits = z.raw("aboutTraits") as string[];
  return (
    <section className="sec about" id="about" aria-labelledby="ab-h">
      <div className="sec-rule" data-io />
      <div className="wrap about-grid">
        <figure className="portrait" data-reveal>
          <div className="pt-frame"><Image src="/images/joaquin.png" alt={t("photoAlt")} width={853} height={1279} sizes="(max-width: 900px) 340px, 440px" /></div>
          <div className="pt-axis" aria-hidden="true"><span>{z("aboutAxisA")}</span><i /><span>{z("aboutAxisB")}</span></div>
        </figure>
        <div className="about-copy">
          <p className="eyebrow mono" data-io><b>Z·04</b> {t("eyebrow")}</p>
          <h2 className="ab-title" id="ab-h" data-io><span className="mask-line"><span>{withEm(t("title"), z("aboutEm"))}</span></span></h2>
          <p className="ab-lead" data-reveal>{lead}</p>
          <div className="ab-rest" data-reveal>{rest.map((p) => <p key={p}>{p}</p>)}</div>
          <ul className="traits" aria-label={content.headline} data-reveal>{traits.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="ab-open" data-reveal>
            <p className="mono ab-open-l"><span className="pulse" aria-hidden="true" />{z("aboutOpen")}</p>
            <p className="ab-open-t">{content.availability}</p>
            <div className="ab-cta">
              <a className="btn primary" href="#contact">{h("ctaContact")}</a>
              <a className="btn" href={content.links.cv} download>{h("ctaCv")}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
