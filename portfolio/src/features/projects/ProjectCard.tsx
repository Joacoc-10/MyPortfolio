import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LuArrowUpRight, LuCheck } from "react-icons/lu";
import { TechChip } from "@/components/TechChip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { getTechnologies, localize, type Project } from "@/data";
import { ProductionBadge } from "./ProductionBadge";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  /** "wide" apila el contenido en una fila en escritorio (para proyectos sin captura). */
  layout?: "default" | "wide";
  imageSizes?: string;
  className?: string;
};

export async function ProjectCard({
  project,
  locale,
  layout = "default",
  imageSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
}: ProjectCardProps) {
  const t = await getTranslations("Projects");
  const tx = await getTranslations("Experience");
  const common = await getTranslations("Common");

  const techs = getTechnologies(project.techIds);
  const contributions = project.contributions && localize(project.contributions, locale);
  const wide = layout === "wide";

  const kindLabel =
    project.kind === "personal"
      ? t("kindPersonal")
      : project.kind === "bootcamp"
        ? t("kindBootcamp")
        : null;

  return (
    <Card className={cn("flex h-full flex-col", wide && "lg:flex-row", className)}>
      {project.image && (
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line">
          <Image
            src={project.image}
            alt={t("imageAlt", { name: project.name })}
            fill
            sizes={imageSizes}
            className="object-cover object-top transition-transform duration-500 group-hover/card:scale-[1.03]"
          />
        </div>
      )}

      <div className={cn("flex flex-1 flex-col p-6", wide && "lg:grid lg:grid-cols-2 lg:gap-10 lg:p-8")}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {kindLabel && (
              <Chip tone={project.kind === "personal" ? "brand" : "neutral"}>
                {kindLabel}
              </Chip>
            )}
            <ProductionBadge project={project} />
          </div>

          <h3 className="mt-4 text-xl font-semibold tracking-tight">
            {project.name}
          </h3>

          <div className="mt-3 text-sm leading-relaxed text-ink-muted">
            <ExpandableText
              text={localize(project.summary, locale)}
              moreLabel={t("readMore")}
              lessLabel={t("readLess")}
            />
          </div>

          {contributions && contributions.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {contributions.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <LuCheck
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-brand"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cn("mt-5 flex flex-1 flex-col", wide && "lg:mt-0 lg:justify-between")}>
          {techs.length > 0 && (
            <div>
              <p className="sr-only">{t("technologies")}</p>
              <ul className="flex flex-wrap gap-2">
                {techs.map((tech) => (
                  <li key={tech.id}>
                    <TechChip tech={tech} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.links.deploy && (
            <div className="mt-auto pt-6">
              <Button
                href={project.links.deploy}
                external
                variant="secondary"
                aria-label={`${tx("visitProject", { name: project.name })} (${common("opensInNewTab")})`}
              >
                {t("viewProject")}
                <LuArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
