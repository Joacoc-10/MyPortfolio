import { getTranslations } from "next-intl/server";
import { LuArrowUpRight, LuCheck } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TechChip } from "@/components/TechChip";
import { Chip } from "@/components/ui/Chip";
import { getTechnologies, localize, type Project } from "@/data";
import { ProductionBadge, StageBadge } from "@/features/projects/ProductionBadge";
import type { Locale } from "@/i18n/routing";

/** Proyecto destacado de una empresa (Order-A): más espacio y protagonismo que el resto. */
export async function FeaturedProject({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = await getTranslations("Experience");
  const common = await getTranslations("Common");
  const contributions = project.contributions ? localize(project.contributions, locale) : [];
  const techs = getTechnologies(project.techIds);

  return (
    <Card glow="featured" sparkles="always" className="border-brand/25 bg-linear-to-br from-brand/[0.07] via-surface to-surface p-6 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="brand">{t("featured")}</Chip>
        <ProductionBadge project={project} />
        <StageBadge project={project} />
      </div>

      <div className="mt-5 grid gap-8 xl:grid-cols-12 xl:gap-12">
        <div className="flex flex-col xl:col-span-6">
          <h4 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.name}
          </h4>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-muted text-pretty">
            {localize(project.summary, locale)}
          </p>
          {project.problem && (
            <p className="mt-4 max-w-xl leading-relaxed text-ink text-pretty">
              {localize(project.problem, locale)}
            </p>
          )}
          {project.links.deploy && (
            <div className="mt-7 xl:mt-auto xl:pt-7">
              <Button
                href={project.links.deploy}
                external
                size="lg"
                aria-label={`${t("visitSite")}: ${t("visitProject", { name: project.name })} (${common("opensInNewTab")})`}
              >
                {t("visitSite")}
                <LuArrowUpRight size={18} aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {contributions.length > 0 && (
          <div className="xl:col-span-6 xl:border-l xl:border-line xl:pl-10">
            <p className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
              {t("contributionsHeading")}
            </p>
            <ul className="mt-4 space-y-3.5">
              {contributions.map((item) => (
                <li key={item} className="flex gap-3 text-ink">
                  <LuCheck
                    size={18}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-brand"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {techs.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
            {t("technologies")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {techs.map((tech) => (
              <li key={tech.id}>
                <TechChip tech={tech} size="md" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
