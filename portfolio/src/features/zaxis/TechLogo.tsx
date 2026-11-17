import type { CSSProperties } from "react";
import { getTechIcon } from "@/components/tech-icons";
import type { ZTech } from "./types";

/** Siglas neutras para tecnologías sin ícono de marca: «CSS Modules» → CM, «Yup» → Y. */
const monogram = (name: string) => {
  const words = name.replace(/[^\p{L}\p{N}\s.]/gu, "").split(/\s+/).filter(Boolean);
  const m = words.length > 1 ? words.slice(0, 2).map((w) => w[0]).join("") : (words[0] ?? "?").slice(0, 2);
  return m.toUpperCase();
};

/**
 * Logo de una tecnología: ícono de marca (react-icons) o monograma neutro.
 * Usa `currentColor`; el color de marca aparece al pasar el cursor (`--c`, ver `.tl` en extras.css).
 */
export function TechLogo({ tech, size = 16 }: { tech: Pick<ZTech, "id" | "name" | "brandColor">; size?: number }) {
  const Icon = getTechIcon(tech.id);
  const style = { "--sz": `${size}px`, ...(tech.brandColor ? { "--c": tech.brandColor } : {}) } as CSSProperties;
  return Icon ? (
    <span className="tl" style={style} aria-hidden="true">
      <Icon size={size} />
    </span>
  ) : (
    <span className="tl tl-mono" style={style} aria-hidden="true">
      <b>{monogram(tech.name)}</b>
    </span>
  );
}
