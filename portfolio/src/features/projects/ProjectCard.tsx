import { getTranslations } from "next-intl/server";
import { LuArrowUpRight, LuCheck, LuGithub } from "react-icons/lu";
import { TechChip } from "@/components/TechChip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ExpandableText } from "@/components/ui/ExpandableText";
import { getTechnologies, localize, type Project } from "@/data";
import { ProductionBadge } from "./ProductionBadge";
import { getCover, ProjectCover } from "./ProjectCover";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  /** "wide" apila el contenido en una fila en escritorio (para proyectos sin captura). */
  layout?: "default" | "wide";
  imageSizes?: string;
  /** Clases extra para la portada (p. ej. formato más panorámico cuando la tarjeta ocupa todo el ancho). */
  coverClassName?: string;
  /** Nivel del encabezado: h4 cuando la tarjeta cuelga de un h3 (empresa o grupo). */
  headingAs?: "h3" | "h4";
  className?: string;
};

export async function ProjectCard({
  project,
  locale,
  layout = "default",
  imageSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  coverClassName,
  headingAs: Heading = "h3",
  className,
}: ProjectCardProps) {
  const t = await getTranslations("Projects");
  const tx = await getTranslations("Experience");
  const common = await getTranslations("Common");

  const techs = getTechnologies(project.techIds);
  const hasCover = Boolean(getCover(project));
  const contributions = project.contributions && localize(project.contributions, locale);
  const wide = layout === "wide";
  const hasAside = wide && Boolean(contributions && contributions.length > 0);
  // Tarjeta ancha con lista lateral: la portada va enmarcada dentro de la columna de texto (16:10), sin recortarla.
  const coverInline = hasCover && hasAside;

  const newTab = common("opensInNewTab");
  // Acciones siempre visibles: «Visitar sitio» (principal) y, si hay repositorio público, «Código».
  const link =
    project.links.deploy || project.links.repo ? (
      <div className="flex flex-wrap gap-3">
        {project.links.deploy && (
          <Button
            href={project.links.deploy}
            external
            aria-label={`${t("visitSiteLabel", { name: project.name })} (${newTab})`}
          >
            {t("visitSite")}
            <LuArrowUpRight size={16} aria-hidden="true" />
          </Button>
        )}
        {project.links.repo && (
          <Button
            href={project.links.repo}
            external
            variant="secondary"
            aria-label={`${t("viewRepoLabel", { name: project.name })} (${newTab})`}
          >
            <LuGithub size={16} aria-hidden="true" />
            {t("viewRepo")}
          </Button>
        )}
      </div>
    ) : null;

  const kindLabel =
    project.kind === "personal"
      ? t("kindPersonal")
      : project.kind === "bootcamp"
        ? t("kindBootcamp")
        : null;

  return (
    <Card
      data-carousel-scope
      // Proyectos independientes: detalle luminoso discreto; los profesionales mantienen solo el borde brillante.
      sparkles={project.kind === "professional" ? undefined : "hover"}
      className={cn("flex h-full flex-col", wide && "lg:flex-row", className)}
    >
      {hasCover && !coverInline && (
        <ProjectCover
          project={project}
          locale={locale}
          sizes={imageSizes}
          className={coverClassName}
        />
      )}

      <div
        className={cn(
          "flex flex-1 flex-col p-6",
          hasAside && "lg:grid lg:grid-cols-12 lg:gap-10 lg:p-8",
        )}
      >
        <div className={cn("flex flex-1 flex-col", hasAside && "lg:col-span-7")}>
          {coverInline && (
            <ProjectCover
              project={project}
              locale={locale}
              sizes={imageSizes}
              className="mb-5 rounded-lg border border-line"
                />
          )}

          <div className="flex flex-wrap items-center gap-2">
            {kindLabel && (
              <Chip tone={project.kind === "personal" ? "brand" : "neutral"}>
                {kindLabel}
              </Chip>
            )}
            <ProductionBadge project={project} />
          </div>

          <Heading className="mt-4 text-xl font-semibold tracking-tight">
            {project.name}
          </Heading>

          <div className="mt-3 text-sm leading-relaxed text-ink-muted">
            <ExpandableText
              text={localize(project.summary, locale)}
              moreLabel={t("readMore")}
              lessLabel={t("readLess")}
            />
          </div>

          {project.problem && (
            <p className="mt-3 text-sm leading-relaxed text-ink text-pretty">
              {localize(project.problem, locale)}
            </p>
          )}

          {/* En tarjetas anchas con contribuciones, la lista va en la columna lateral */}
          {contributions && !hasAside && (
            <ContributionList
              items={contributions}
              heading={project.problem ? tx("contributionsHeading") : undefined}
            />
          )}

          {techs.length > 0 && (
            <div className="mt-5">
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

          {link && !hasAside && <div className="mt-auto pt-6">{link}</div>}
        </div>

        {hasAside && contributions && (
          <div className="mt-6 flex flex-col lg:col-span-5 lg:mt-0 lg:border-l lg:border-line lg:pl-10">
            <ContributionList items={contributions} className="mt-0" />
            {link && <div className="mt-auto pt-6">{link}</div>}
          </div>
        )}
      </div>
    </Card>
  );
}

function ContributionList({
  items,
  heading,
  className,
}: {
  items: string[];
  /** Encabezado opcional (solo en fichas ampliadas, las que incluyen `problem`). */
  heading?: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-4", className)}>
      {heading && (
        <p className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
          {heading}
        </p>
      )}
      <ul className={cn("space-y-2 text-sm text-ink-muted", heading && "mt-3")}>
        {items.map((item) => (
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
    </div>
  );
}
