// Logotipo ORIGINAL de JCoding (portfolio/public/brand/logo-white.png, servido como /assets/brand/logo-white.png).
// No se redibuja ni se sustituye: se reutiliza el mismo PNG, entero (<img>) o repartido en capas de máscara.
export const LOGO_SRC = "/assets/brand/logo-white.png";
const SIZE = { w: 800, h: 182 };

/** Logo con capas (anillo · </> · wordmark · destello). `intro` activa la secuencia de entrada. */
export const logoLayers = ({ width = 200, intro = false } = {}) =>
  `<span class="jlogo${intro ? " intro" : ""}" style="--w:${width}px" role="img" aria-label="JCoding">
  <img class="jl-fallback" src="${LOGO_SRC}" alt="" width="${SIZE.w}" height="${SIZE.h}">
  <i class="jl-ring" aria-hidden="true"></i><i class="jl-code" aria-hidden="true"></i><i class="jl-word" aria-hidden="true"></i><i class="jl-sheen" aria-hidden="true"></i>
</span>`;

/** Logo plano: el archivo original tal cual (pie de página). */
export const logoImg = (width = 150) => `<img src="${LOGO_SRC}" alt="JCoding" width="${SIZE.w}" height="${SIZE.h}" style="width:${width}px;height:auto">`;
