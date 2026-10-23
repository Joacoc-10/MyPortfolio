import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { LuArrowUpRight } from "react-icons/lu";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import {
  getCompanies,
  getProjectsByCompany,
  localize,
  type Company,
} from "@/data";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { cn } from "@/lib/utils";
import { FeaturedProject } from "./FeaturedProject";

export async function Experience() {
  const locale = await getLocale();
  const t = await getTranslations("Experience");
  const common = await getTranslations("Common");
  const format = await getFormatter();

  const monthYear = (value: string) => {
    const text = format.dateTime(new Date(`${value}-01T00:00:00Z`), {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const periodLabel = (company: Company) => {
    if (company.period) {
      const end = company.period.end
        ? monthYear(company.period.end)
        : t("present");
      return `${monthYear(company.period.start)} – ${end}`;
    }
    return company.durationMonths
      ? t("months", { count: company.durationMonths })
      : null;
  };

  const companies = getCompanies();

  return (
    <Section
      id="experience"
      index="02"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <ol aria-label={t("timeline")} className="space-y-14 sm:space-y-16">
        {companies.map((company) => {
          const isCurrent = company.period?.end === null;
          const projects = getProjectsByCompany(company.id);
          const featured = projects.find((project) => project.featured);
          const others = projects.filter((project) => !project.featured);
          const period = periodLabel(company);

          return (
            <li
              key={company.id}
              className="grid gap-5 lg:grid-cols-[13rem_1fr] lg:gap-10"
            >
              <Reveal className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-start lg:gap-3 lg:pt-1.5">
                {period && (
                  <p className="font-mono text-sm text-ink-muted">{period}</p>
                )}
                <Chip tone={isCurrent ? "signal" : "neutral"}>
                  {isCurrent ? t("current") : t("previous")}
                </Chip>
              </Reveal>

              <Reveal
                delay={80}
                className="relative lg:border-l lg:border-line lg:pl-10"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-2.5 -left-[5px] hidden size-2.5 rounded-full ring-4 ring-canvas lg:block",
                    isCurrent ? "bg-brand" : "bg-line-strong",
                  )}
                />

                <h3 className="text-2xl font-semibold tracking-tight">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t("visitCompany", { company: company.name })} (${common("opensInNewTab")})`}
                      className="link-underline inline-flex items-center gap-1.5 transition-colors hover:text-brand"
                    >
                      {company.name}
                      <LuArrowUpRight size={20} aria-hidden="true" />
                    </a>
                  ) : (
                    company.name
                  )}
                </h3>
                <p className="mt-1 text-ink-muted">
                  {localize(company.role, locale)}
                  {company.employmentType &&
                    ` · ${localize(company.employmentType, locale)}`}
                </p>
                {company.summary && (
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty">
                    {localize(company.summary, locale)}
                  </p>
                )}

                {projects.length > 0 && (
                  <div className="mt-8">
                    <p className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
                      {t("projectsHeading", { company: company.name })}
                    </p>
                    <div className="mt-4 space-y-5">
                      {featured && (
                        <FeaturedProject project={featured} locale={locale} />
                      )}
                      {others.length > 0 && (
                        <div
                          className={cn(
                            "grid gap-5",
                            others.length > 1 && "xl:grid-cols-2",
                          )}
                        >
                          {others.map((project) => (
                            <ProjectCard
                              key={project.id}
                              project={project}
                              locale={locale}
                              layout={others.length === 1 ? "wide" : "default"}
                              headingAs="h4"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
