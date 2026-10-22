import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  /** Número mostrado junto a la etiqueta (ej. "01"). */
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

/** Contenedor de sección con encabezado consistente y ancla de navegación. */
export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  className,
  children,
}: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("scroll-mt-16 py-16 sm:py-24 lg:py-28", className)}
    >
      <Container>
        <Reveal>
          <header className="max-w-2xl">
            <p className="font-mono text-sm text-brand">
              {index && <span className="text-ink-subtle">{index} / </span>}
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-lg leading-relaxed text-ink-muted text-pretty">
                {description}
              </p>
            )}
          </header>
        </Reveal>
        <div className="mt-12 sm:mt-14">{children}</div>
      </Container>
    </section>
  );
}
