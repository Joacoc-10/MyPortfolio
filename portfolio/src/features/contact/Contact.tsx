import { getLocale, getTranslations } from "next-intl/server";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { LuArrowUpRight, LuFileText, LuMail } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getLinks } from "@/data";
import { contactId } from "@/components/layout/nav-items";
import { CopyEmailButton } from "./CopyEmailButton";

export async function Contact() {
  const locale = await getLocale();
  const t = await getTranslations("Contact");
  const common = await getTranslations("Common");
  const links = getLinks();

  const external = ` (${common("opensInNewTab")})`;

  const rows = [
    {
      key: "linkedin",
      icon: FaLinkedinIn,
      label: t("linkedin"),
      href: links.linkedin,
      external: true,
    },
    {
      key: "github",
      icon: FaGithub,
      label: t("github"),
      href: links.github,
      external: true,
    },
    {
      key: "cv-es",
      icon: LuFileText,
      label: t("cvEs"),
      href: links.cv.es,
      lang: "es",
    },
    {
      key: "cv-en",
      icon: LuFileText,
      label: t("cvEn"),
      href: links.cv.en,
      lang: "en",
    },
  ];

  // El CV en el idioma de la página va primero.
  rows.sort((a, b) =>
    a.lang === locale ? -1 : b.lang === locale ? 1 : 0,
  );

  return (
    <section
      id={contactId}
      aria-labelledby="contact-title"
      className="scroll-mt-16 py-16 sm:py-24 lg:py-28"
    >
      <Container>
        <Reveal>
          <Card className="border-brand/25 bg-linear-to-br from-brand/[0.08] via-surface to-surface p-6 sm:p-10 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="font-mono text-sm text-brand">{t("eyebrow")}</p>
                <h2
                  id="contact-title"
                  className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                >
                  {t("title")}
                </h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted text-pretty">
                  {t("description")}
                </p>

                <p className="mt-8 font-mono text-sm break-all text-ink sm:text-base">
                  {links.email}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button href={`mailto:${links.email}`} size="lg">
                    <LuMail size={18} aria-hidden="true" />
                    {t("sendEmail")}
                  </Button>
                  <CopyEmailButton
                    email={links.email}
                    label={t("copyEmail")}
                    copiedMessage={t("copied")}
                  />
                </div>
              </div>

              <ul className="self-center divide-y divide-line rounded-xl border border-line bg-canvas/40">
                {rows.map(({ key, icon: Icon, label, href, external: isExternal, lang }) => (
                  <li key={key}>
                    <a
                      href={href}
                      lang={lang}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : { download: true })}
                      aria-label={isExternal ? `${label}${external}` : undefined}
                      className="group flex items-center gap-4 px-5 py-4 text-ink transition-colors hover:bg-surface-raised"
                    >
                      <Icon
                        size={20}
                        aria-hidden="true"
                        className="text-ink-muted transition-colors group-hover:text-brand"
                      />
                      <span className="flex-1">{label}</span>
                      <LuArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className="text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}
