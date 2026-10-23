import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getIndependentProjects } from "@/data";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

export async function Projects() {
  const locale = await getLocale();
  const t = await getTranslations("Projects");

  const all = getIndependentProjects();
  const personal = all.filter((project) => project.kind === "personal");
  const bootcamp = all.filter((project) => project.kind === "bootcamp");

  return (
    <Section
      id="projects"
      index="04"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-14">
        {personal.length > 0 && (
          <div>
            <h3 className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
              {t("personalHeading")}
            </h3>
            <div className="mt-4 space-y-5">
              {personal.map((project) => (
                <Reveal key={project.id}>
                  <ProjectCard
                    project={project}
                    locale={locale}
                    layout="wide"
                    headingAs="h4"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {bootcamp.length > 0 && (
          <div>
            <h3 className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
              {t("bootcampHeading")}
            </h3>
            <p className="mt-2 max-w-2xl text-ink-muted">
              {t("bootcampDescription")}
            </p>
            {/* 6 columnas: 3 tarjetas en la primera fila y 2 más anchas en la segunda */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              {bootcamp.map((project, index) => (
                <Reveal
                  key={project.id}
                  delay={(index % 3) * 70}
                  className={cn(
                    "md:col-span-1",
                    index < 3 ? "lg:col-span-2" : "lg:col-span-3",
                    // 5 tarjetas en 2 columnas: la última ocupa todo el ancho
                    index === bootcamp.length - 1 && index % 2 === 0 && "md:col-span-2 lg:col-span-3",
                  )}
                >
                  <ProjectCard
                    project={project}
                    locale={locale}
                    headingAs="h4"
                    imageSizes={
                      index < 3
                        ? "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        : "(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
                    }
                  />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
