import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { LuArrowUpRight, LuDownload } from "react-icons/lu";
import { HeroBackground } from "@/components/effects/HeroBackground";
import { contactId } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCurrentCompany, getLinks, getProfile, localize } from "@/data";

const socialButton =
  "grid size-11 place-items-center rounded-lg border border-line bg-surface/70 text-ink-muted backdrop-blur transition-colors hover:border-brand/60 hover:text-ink";

/** Retardo escalonado de la animación de entrada. */
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations("Hero");
  const common = await getTranslations("Common");
  const format = await getFormatter();

  const profile = getProfile();
  const links = getLinks();
  const company = getCurrentCompany();

  const otherLocale = locale === "es" ? "en" : "es";
  const since = company?.period
    ? format.dateTime(new Date(`${company.period.start}-01T00:00:00Z`), {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <Container className="grid items-center gap-10 pt-24 pb-14 sm:pt-28 sm:pb-16 lg:min-h-svh lg:grid-cols-12 lg:gap-8 lg:pt-24">
        <div className="lg:col-span-7">
          <p
            className="inline-flex animate-fade-up items-center gap-2.5 rounded-full border border-brand/30 bg-brand/10 py-1.5 pr-3.5 pl-3 text-xs text-brand sm:text-sm"
            style={delay(0)}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
            {localize(profile.availability, locale)}
          </p>

          <h1
            className="mt-5 animate-fade-up text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
            style={delay(100)}
          >
            {profile.name}{" "}
            <span className="mt-3 block text-3xl font-medium text-ink-muted sm:text-4xl lg:text-5xl">
              {localize(profile.headline, locale)}
            </span>
          </h1>

          <p
            className="mt-5 max-w-xl animate-fade-up text-lg leading-relaxed text-ink-muted text-pretty"
            style={delay(200)}
          >
            {localize(profile.valueProposition, locale)}
          </p>

          <div
            className="mt-7 flex animate-fade-up flex-wrap items-center gap-3"
            style={delay(300)}
          >
            <Button href={`#${contactId}`} size="lg">
              {t("ctaContact")}
            </Button>
            <Button
              href={links.cv[locale]}
              variant="secondary"
              size="lg"
              download
            >
              <LuDownload size={18} aria-hidden="true" />
              {t("ctaCv")}
            </Button>
          </div>

          <div
            className="mt-6 flex animate-fade-up flex-wrap items-center gap-x-5 gap-y-4"
            style={delay(400)}
          >
            <ul className="flex items-center gap-2">
              <li>
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("github")} (${common("opensInNewTab")})`}
                  className={socialButton}
                >
                  <FaGithub size={20} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("linkedin")} (${common("opensInNewTab")})`}
                  className={socialButton}
                >
                  <FaLinkedinIn size={20} aria-hidden="true" />
                </a>
              </li>
            </ul>
            <a
              href={links.cv[otherLocale]}
              download
              lang={otherLocale}
              aria-label={t("cvOtherLanguageLabel")}
              className="link-underline text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {t("cvOtherLanguage")}
            </a>
          </div>
        </div>

        {company && (
          <aside
            aria-label={t("factsLabel")}
            className="animate-fade-up lg:col-span-5 lg:justify-self-end"
            style={delay(350)}
          >
            <div className="w-full rounded-2xl border border-line bg-surface/70 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-7 lg:max-w-md">
              <div className="flex items-center gap-2 font-mono text-xs text-ink-subtle">
                <span
                  className="size-1.5 rounded-full bg-signal"
                  aria-hidden="true"
                />
                {t("factsLabel")}
              </div>

              <dl className="mt-4 divide-y divide-line">
                <Fact label={t("factRole")}>
                  {localize(company.role, locale)}
                </Fact>
                <Fact label={t("factCompany")}>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline inline-flex items-center gap-1 hover:text-brand"
                    >
                      {company.name}
                      <LuArrowUpRight size={15} aria-hidden="true" />
                      <span className="sr-only">
                        ({common("opensInNewTab")})
                      </span>
                    </a>
                  ) : (
                    company.name
                  )}
                </Fact>
                {since && (
                  <Fact label={t("factSince")}>
                    <span className="first-letter:uppercase">{since}</span>
                  </Fact>
                )}
              </dl>
            </div>
          </aside>
        )}
      </Container>
    </section>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
      <dt className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
        {label}
      </dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
