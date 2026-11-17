import Image from "next/image";
import type { ZProject } from "./types";

/**
 * Portada de integración (p. ej. UES × Mercado Libre) para proyectos sin capturas: los logos REALES de ambas plataformas,
 * sin redibujar ni alterar, sobre el fondo oscuro de Z-AXIS, unidos por un conector sutil. No simula una captura del software.
 */
export function IntegrationCover({ logos }: { logos: NonNullable<ZProject["integration"]>["logos"] }) {
  const [a, b] = logos;
  return (
    <div className="ic" role="img" aria-label={`${a.alt} × ${b.alt}`}>
      <span className="ic-logo"><Image src={a.src} alt="" width={a.width} height={a.height} sizes="(max-width: 700px) 30vw, 220px" draggable={false} /></span>
      <svg className="ic-link" viewBox="0 0 120 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <path className="ic-line" d="M2 12h116" />
        <circle className="ic-dot" cx="2" cy="12" r="2.5" /><circle className="ic-dot" cx="118" cy="12" r="2.5" />
        <path className="ic-chev" d="M54 6l6 6-6 6M66 6l6 6-6 6" />
      </svg>
      <span className="ic-logo"><Image src={b.src} alt="" width={b.width} height={b.height} sizes="(max-width: 700px) 30vw, 220px" draggable={false} /></span>
    </div>
  );
}
