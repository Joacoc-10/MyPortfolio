# Fase 6 — QA final, optimización y preparación para producción

> **Nota (fase 7):** el sistema de vista previa con modal descrito en este informe fue reemplazado por un carrusel automático sin modal. Las secciones 1, 2 y 5 siguen vigentes; las comprobaciones y métricas del modal (§3, §4) quedan como registro histórico. Ver `docs/phase-7/INFORME.md`.

Build de producción local (`next build` + `next start`, 127.0.0.1:4015). Herramientas fuera del proyecto
(Playwright 1.64.1, Lighthouse 13.5.0, axe-core/playwright 4.14.0), sin agregar dependencias a `portfolio/`.
Scripts reutilizables en `scripts/phase-6/`; resultados en `docs/phase-6/`.

## 1. Limpieza de imágenes
- Referencias a `bootcamp-1…5` en código, CSS, mensajes, `next.config.ts` y scripts: **ninguna**. Solo aparecían en
  documentación histórica (INFORME fase 5, images.json, PENDING.md).
- Los 5 WebP de reemplazo existen y están en uso (`projects.ts`).
- Eliminados: `bootcamp-1.png`, `bootcamp-2.jpg`, `bootcamp-3.jpg`, `bootcamp-4.png`, `bootcamp-5.png`
  (23.312.446 bytes). Siguen disponibles en git (commit `d4cca42`).
- `public/images`: 26.032 KB → 3.260 KB (**−22.772 KB, ≈ −22,2 MiB**).
- `docs/phase-5/images.json` conserva URL, bytes y SHA-256 y suma `removedFromRepo`; `PENDING.md` actualizado.
  `INFORME.md` de la fase 5 queda como registro histórico.

## 2. OliBar
La dirección del local aparecía en `shot-01-inicio` y `shot-03-movil`. Se recapturaron desde el sitio público
ocultando esa línea únicamente en el navegador de captura (sitio original intacto), con el mismo formato
(1920×1200, WebP q80) y el mismo montaje de dos móviles. Sin pérdida de calidad visual. `captures.json` actualizado.

## 3. Resultados
| Comprobación | Resultado |
|---|---|
| TypeScript / ESLint / build | OK, sin errores ni avisos |
| Previsualizaciones, 11 proyectos × ES/EN × 390/820/1280/1440 y reduced-motion | 2.296 comprobaciones OK, 0 errores de consola |
| UES × Mercado Libre | sin botón de vista previa ni imagen |
| QA fase 5 (teclado, menú, idioma, descargas, imágenes, 8 casos responsive) | OK, sin desbordamientos |
| axe página completa (WCAG 2.0–2.2 AA, ES/EN, 390/1440) | 0 violaciones |
| axe con modal abierto (4 proyectos × ES/EN × 390/1440) | 0 violaciones |
| Enlaces externos | 13 × 200; LinkedIn 999 (bloquea bots, verificar a mano) |

## 4. Lighthouse (mediana de 3 corridas adicionales en móvil)
| | Fase 5 antes | Fase 5 después | Fase 6 |
|---|---|---|---|
| ES móvil perf | 90 | 92 | 89–90 |
| EN móvil perf | 92 | 94 | 90–92 |
| Desktop perf (ES/EN) | 100 | 100 | 100 |
| A11y / Best Practices / SEO (todas) | 100/100/92 | 100/100/100 | 100/100/100 |
| LCP móvil (ES) | 3.363 ms | 3.289 ms | ≈3.450 ms |
| TBT móvil | 128 / 3 ms | 4 / 1 ms | 3–6 ms |
| CLS | 0 | 0 | 0 |

La primera corrida ES móvil dio TBT 614 ms (perf 74); no se reprodujo en 6 repeticiones: ruido de laboratorio.
Regresión real y pequeña (−2 a −4 puntos en móvil, +≈150 ms de LCP): +14 KB de HTML (11 lanzadores de vista previa con
sus textos), +1,3 KB de CSS, +4 KB de JS; las imágenes bajaron 13 KB. No requiere acción. Opcional: reducir el HTML
pasando los textos del modal una sola vez en lugar de por proyecto.

## 5. Pendientes
- LinkedIn: confirmar el enlace manualmente.
- `remotePatterns` de ik.imagekit.io en `next.config.ts` ya no tiene uso (no hay imágenes remotas); se puede quitar.
- "Leer más" mide 20 px de alto: cumple WCAG 2.2 AA según axe, no el objetivo cómodo de 44 px (mejora opcional).
- Peso de `docs/`: `previews` 51 MB y `phase-6/qa` 21 MB (PNG de página completa).
