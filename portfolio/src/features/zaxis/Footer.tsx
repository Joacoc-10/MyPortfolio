import { useTranslations } from "next-intl";
import { LogoImg } from "./Brand";
import { IconGitHub, IconLinkedIn } from "./icons";
import { CurrentYear } from "@/components/layout/CurrentYear";
import { LangSwitch } from "./LangSwitch";
import { SECTIONS } from "./store";
import type { ZContent } from "./types";

export function Footer({ content }: { content: ZContent }) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const h = useTranslations("Hero");
  const z = useTranslations("Z");
  const c = useTranslations("Common");
  const ext = ` (${c("opensInNewTab")})`;
  return (
    <footer className="foot" id="foot">
      <div className="wrap">
        <div className="foot-top">
          <a className="foot-logo" href="#top" aria-label={z("homeLabel")}><LogoImg width={150} /></a>
          <nav aria-label={t("label")}>
            <ul>
              {SECTIONS.map((id) => <li key={id}><a href={`#${id}`}>{nav(id)}</a></li>)}
              <li><a href={content.links.cv} download>{h("ctaCv")}</a></li>
            </ul>
          </nav>
          <div className="foot-side">
            <LangSwitch idPrefix="lf" />
            <div className="foot-social">
              <a href={content.links.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub${ext}`}><IconGitHub /></a>
              <a href={content.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn${ext}`}><IconLinkedIn /></a>
            </div>
          </div>
        </div>
        <div className="foot-bot">
          <p>© <CurrentYear /> JCoding. {t("rights")}</p>
          <a href="#top"><span aria-hidden="true">↑</span> {t("backToTop")}</a>
        </div>
      </div>
    </footer>
  );
}
