import type { CSSProperties } from "react";
import Image from "next/image";

// Logotipo ORIGINAL de JCoding: public/brand/logo-white.png. No se redibuja: se reutiliza el mismo PNG,
// entero (<img>) o repartido en capas de máscara (anillo · </> · wordmark · destello).
export const LOGO_SRC = "/brand/logo-white.png";
const SIZE = { w: 800, h: 182 };

export function LogoLayers({ width = 124, intro = false, label = "JCoding", onIntroEnd }: { width?: number; intro?: boolean; label?: string; onIntroEnd?: () => void }) {
  return (
    <span className={`jlogo${intro ? " intro" : ""}`} style={{ "--w": `${width}px` } as CSSProperties} role="img" aria-label={label} onAnimationEnd={intro ? (e) => { if ((e.target as HTMLElement).classList.contains("jl-sheen")) onIntroEnd?.(); } : undefined}>
      <Image className="jl-fallback" src={LOGO_SRC} alt="" width={SIZE.w} height={SIZE.h} unoptimized />
      <i className="jl-ring" aria-hidden="true" />
      <i className="jl-code" aria-hidden="true" />
      <i className="jl-word" aria-hidden="true" />
      <i className="jl-sheen" aria-hidden="true" />
    </span>
  );
}

/** Logo plano: el archivo original tal cual (pie de página). */
export function LogoImg({ width = 150 }: { width?: number }) {
  return <Image src={LOGO_SRC} alt="JCoding" width={SIZE.w} height={SIZE.h} style={{ width, height: "auto" }} unoptimized />;
}
