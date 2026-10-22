import { getTranslations } from "next-intl/server";
import { LuArrowUpRight, LuCheck } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { localize, type Project } from "@/data";
import { ProductionBadge } from "@/features/projects/ProductionBadge";
import type { Locale } from "@/i18n/routing";

/** Proyecto destacado de una empresa (Ordera): más espacio y protagonismo que el resto. */
export async function FeaturedProject({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const t = await getTranslations("Experience");
  const stack = await getTranslations("Stack.categories");
  const common = await getTranslations("Common");
  const contributions = project.contributions ? localize(project.contributions, locale) : [];

  return (
    <Card className="border-brand/25 bg-linear-to-br from-brand/[0.07] via-surface to-surface p-6 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="brand">{t("featured")}</Chip>
        <Chip>{stack("frontend")}</Chip>
        <Chip>{stack("backend")}</Chip>
        <ProductionBadge project={project} />
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h4 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.name}
          </h4>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-muted text-pretty">
            {localize(project.summary, locale)}
          </p>
          {project.links.deploy && (
            <Button
              href={project.links.deploy}
              external
              size="lg"
              className="mt-7"
              aria-label={`${t("visitProject", { name: project.name })} (${common("opensInNewTab")})`}
            >
              {t("visitSite")}
              <LuArrowUpRight size={18} aria-hidden="true" />
            </Button>
          )}
        </div>

        {contributions.length > 0 && (
          <ul className="space-y-4 lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
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
        )}
      </div>
    </Card>
  );
}
