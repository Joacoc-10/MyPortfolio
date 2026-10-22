import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import type { Project } from "@/data";

/** Etiqueta "En producción" / "Live". Única fuente visual del estado; se oculta si el proyecto no está en producción. */
export async function ProductionBadge({ project }: { project: Project }) {
  if (!project.inProduction) return null;
  const t = await getTranslations("Common");

  return (
    <Chip tone="live">
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-live" />
        <span className="relative size-1.5 rounded-full bg-live" />
      </span>
      {t("inProduction")}
    </Chip>
  );
}
