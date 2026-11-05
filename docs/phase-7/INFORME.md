# Fase 7 — Carrusel automático sin modal

Build de producción local (127.0.0.1:4015). Herramientas fuera del proyecto (Playwright 1.64.1, Lighthouse 13.5.0,
axe-core/playwright 4.14.0); no se agregaron dependencias. Scripts: `scripts/phase-7/` (`carousel.mjs`, `axe.mjs`);
Lighthouse con `scripts/phase-5/lh.mjs`.

## Resultados
- TypeScript, ESLint y build: OK. `/[locale]` 4,11 kB (First Load 138 kB).
- `carousel.mjs`: 104/104 comprobaciones OK, 0 errores de consola (`carousel.json`).
- axe (WCAG 2.0–2.2 AA + best-practice) en #experience y #projects, ES/EN × 390/1440: 0 violaciones (`axe.json`).
  Se corrigió una violación real (2.5.3): el `aria-label` de «Visitar sitio» / «Código» no contenía el texto visible.
  «incomplete» de color-contrast: fondos con pseudo-elemento del brillo de la tarjeta (preexistente).
- Lighthouse (mediana de 3, `lighthouse-summary.json`): móvil ES/EN 92 (Fase 6: 74–89), escritorio 100;
  A11y/BP/SEO 100; CLS 0; LCP móvil ≈3,2 s (Fase 6 ≈3,5 s); peso −4 KB. Sin regresión.

## Comportamiento
- Rotan 6 proyectos (Order-A 4, Nexvia 4, ZatoBox 3, Fabio 5, Florencia 4, OliBar 3 capturas). Los 5 de bootcamp tienen
  una sola captura: quedan estáticos. UES × Mercado Libre no tiene imágenes.
- Pausa con hover y con foco en la tarjeta, reanuda al salir; fuera del viewport no rota; con reduced-motion queda
  estático con 1 imagen montada. Carga inicial: 0 capturas de proyectos; se monta una por vez.
- Imágenes inactivas con `alt=""` y `aria-hidden`; sin `aria-live`. Foco visible (outline 2 px).
- Altura de tarjetas estable y CLS 0 a 390/820/1280/1440; 13 enlaces (11 «Visitar sitio», 2 «Código») con respuesta 200.
