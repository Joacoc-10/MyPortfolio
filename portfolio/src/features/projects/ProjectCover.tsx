import { localize, type Project } from "@/data";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "./ImageCarousel";

type ProjectCoverProps = {
  project: Project;
  locale: Locale;
  /** Atributo `sizes` de next/image: debe reflejar el ancho real de la portada en cada breakpoint. */
  sizes: string;
  className?: string;
};

/** Primera captura del proyecto (portada). Si es un video, usa su póster. */
export function getCover(project: Project) {
  const first = project.media?.[0];
  if (!first) return undefined;
  return {
    src: first.type === "video" ? first.poster : first.src,
    alt: first.alt,
    width: first.width,
    height: first.height,
  };
}

/** Retraso inicial estable (0–3,2 s) derivado del id, para desfasar los carruseles sin usar azar (hidratación). */
function staggerOffset(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (hash % 5) * 800;
}

/**
 * Portada 16:10 de un proyecto: carrusel automático de sus capturas (una sola imagen queda estática).
 * Hereda el hover de la tarjeta (`group/card`): zoom sutil.
 */
export function ProjectCover({
  project,
  locale,
  sizes,
  className,
}: ProjectCoverProps) {
  if (!project.media || project.media.length === 0) return null;

  const images = project.media.map((item) => ({
    src: item.type === "video" ? item.poster : item.src,
    alt: localize(item.alt, locale),
  }));

  return (
    <div
      className={cn(
        "relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line bg-surface-raised",
        className,
      )}
    >
      <ImageCarousel
        images={images}
        sizes={sizes}
        offsetMs={staggerOffset(project.id)}
        className="transition-transform duration-500 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
      />
    </div>
  );
}
