import type { CSSProperties } from "react";

/** Posiciones (x, y), retardo y duración de cada punto. Cerca de los bordes para no tapar texto. */
const dots = [
  ["3%", "20%", "0s", "4.2s"],
  ["96%", "14%", "1.1s", "3.6s"],
  ["98%", "58%", "2.3s", "4.8s"],
  ["92%", "94%", "0.6s", "3.9s"],
  ["2%", "82%", "1.8s", "4.4s"],
  ["55%", "3%", "2.9s", "5s"],
  ["34%", "97%", "0.3s", "4.1s"],
] as const;

type SparklesProps = {
  /** "hover": aparecen y titilan solo al pasar el cursor. "always": siempre visibles (tarjeta destacada). */
  mode: "hover" | "always";
};

/** Pequeños puntos luminosos decorativos. Solo opacidad/transform; las animaciones están pausadas cuando no se ven. */
export function Sparkles({ mode }: SparklesProps) {
  return (
    <span aria-hidden="true" className="sparkles" data-mode={mode}>
      {dots.map(([x, y, delay, duration]) => (
        <i
          key={`${x}-${y}`}
          style={
            {
              "--x": x,
              "--y": y,
              "--delay": delay,
              "--duration": duration,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
