import type { CSSProperties } from "react";
import { getTechIcon } from "@/components/tech-icons";
import { getStackTechnologies, type Technology } from "@/data";

/**
 * Carrusel horizontal de logos, solo con CSS: sin JavaScript ni dependencias.
 * Es decorativo (la lista completa ya está en las categorías de arriba), por eso se oculta a
 * lectores de pantalla. Los estilos viven en `.marquee*` de globals.css; con "reducir movimiento"
 * se convierte en una grilla estática.
 */
export function TechMarquee() {
  const technologies = getStackTechnologies();

  return (
    <div aria-hidden="true" className="marquee mt-10 sm:mt-12">
      <div className="marquee-track">
        <MarqueeSet technologies={technologies} />
        {/* Copia idéntica: permite el loop sin saltos (la pista se desplaza -50 %) */}
        <MarqueeSet technologies={technologies} duplicate />
      </div>
    </div>
  );
}

function MarqueeSet({
  technologies,
  duplicate,
}: {
  technologies: Technology[];
  duplicate?: boolean;
}) {
  return (
    <ul className="marquee-set" data-duplicate={duplicate ? "" : undefined}>
      {technologies.map((tech) => {
        const Icon = getTechIcon(tech.id);
        return (
          <li
            key={tech.id}
            className="marquee-item"
            style={
              tech.brandColor
                ? ({ "--tech-color": tech.brandColor } as CSSProperties)
                : undefined
            }
          >
            {Icon && <Icon size={34} />}
            <span>{tech.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
