# Fase 5 de JCoding — informe final

23–24 de octubre de 2026. Rama exclusiva: `redesign-2026`. Base limpia comprobada: `908c9f8`.

## A. SEO

Páginas HTML públicas indexables del portfolio: `https://jcoding.vercel.app/es` y `https://jcoding.vercel.app/en`. `/` negocia idioma con next-intl (cookie, Accept-Language, fallback español) y responde 307; no aparece en sitemap. Rutas inexistentes: 404 con noindex, sin canonical ni alternates falsos. Las rutas internas y assets no aparecen en sitemap.

Título ES/EN: **Joaquín Curbelo | Full Stack Developer** (rol profesional ya publicado en inglés).

- ES: Full Stack Developer. Desarrollo aplicaciones web, plataformas e integraciones de punta a punta. Abierto a oportunidades laborales y proyectos freelance.
- EN: Full Stack Developer. I build web applications, platforms and integrations end to end. Open to job opportunities and freelance projects.

Un title, description y canonical por home. `html lang` es/en; canonical /es o /en. Hreflang es/en y x-default=/es en HTML y sitemap. Desactivada la generación duplicada de Link HTTP de next-intl. Robots index/follow solo en home; robots.txt permite crawling y referencia sitemap.xml, que enumera únicamente esos dos homes.

Open Graph website, título/descripción traducidos, es_ES/en_US y locale alternativo. Twitter summary_large_image explícito. Imagen propia PNG 1200×630 en `/share.png`, con marca/nombre/rol y colores existentes, sin logos de clientes; se verificó su aspecto y respuesta HTTP. Icono ICO válido y Apple PNG. JSON-LD Person y WebSite con nombre y perfiles GitHub/LinkedIn ya publicados, sin agregar estudios, empresas ni credenciales. Los metadatos y JSON-LD fueron inspeccionados en ambos idiomas.

La previsualización real en LinkedIn/WhatsApp y sus cachés no puede certificarse desde localhost. Queda para el lanzamiento autorizado. No se envió ninguna modificación a servicios externos.

## B. Rendimiento

Lighthouse **13.5.0**, Chrome headless, build de producción local (`next start`). Cada celda corresponde a una corrida, no a una mediana. Móvil: configuración predeterminada Lighthouse; escritorio: viewport 1440×900, RTT 40 ms, 10240 Kbps y CPU ×1. Perfiles Chrome nuevos por corrida; caché de optimización de imágenes de Next compartida. Estos resultados no son garantías y pueden variar por carga del equipo/caché/red. JSON completos en before/, after-performance/ y after/.

Baseline previo a cambios: Next 15.5.2, commit 908c9f8. Después final: Next 15.5.28 y correcciones de toda la fase. after-performance/ conserva la medición intermedia de la etapa 5.2 (93 ES/94 EN móvil).

### Lighthouse ES

| Métrica | Móvil antes | Móvil después | Escritorio antes | Escritorio después |
|---|---:|---:|---:|---:|
| Performance | 90 | 92 | 100 | 100 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 92 | 100 | 92 | 100 |

### Lighthouse EN

| Métrica | Móvil antes | Móvil después | Escritorio antes | Escritorio después |
|---|---:|---:|---:|---:|
| Performance | 92 | 94 | 100 | 100 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 92 | 100 | 92 | 100 |

SEO inicial 92: la auditoría canonical explicaba «Points to another hreflang location (http://127.0.0.1:4015/es)» (equivalente EN). El conflicto era entre canonical público y alternates HTTP generados con el host local. Después de desactivar alternateLinks y conservar los alternates de HTML/sitemap, SEO final alcanza 100 sin cambiar el dominio canónico. Es una puntuación local medida; no se extrapola a producción.

### Métricas de laboratorio

| Idioma/dispositivo | FCP antes → después | LCP antes → después | TBT antes → después | CLS antes → después |
|---|---:|---:|---:|---:|
| ES mobile | 1.812 → 1.654 s | 3.363 → 3.289 s | 128.4 → 4.0 ms | 0.000 → 0.000 |
| ES desktop | 0.404 → 0.364 s | 0.700 → 0.656 s | 0.0 → 0.0 ms | 0.000 → 0.000 |
| EN mobile | 1.655 → 1.654 s | 3.286 → 3.004 s | 3.0 → 1.0 ms | 0.000 → 0.000 |
| EN desktop | 0.364 → 0.364 s | 0.659 → 0.660 s | 0.0 → 0.0 ms | 0.000 → 0.000 |

No hay INP ni datos de campo CrUX/RUM disponibles en esta auditoría local. TBT mide bloqueo en laboratorio y no equivale a INP. LCP móvil final sigue por encima de 2,5 s (3,289 s ES y 3,004 s EN); se informa el valor final sin afirmar que los Core Web Vitals de usuarios reales estén aprobados.

Cambios: logo con sizes=123px y fetchPriority high, conservando prioridad y aspecto; cinco capturas migradas desde ImageKit con bytes originales verificados (23.312.446 bytes en disco; detalle y SHA-256 en images.json), lazy loading, fill/aspect-ratio y variantes Next/Image. Dos archivos eran JPEG bajo URL .png: se usa extensión correcta. Imagen de retrato local optimizada por Next/Image. Originales grandes no equivalen al peso transferido al visitante.

Geist/Geist Mono mediante next/font, WOFF2 alojados por Next, display swap y dimensiones de imágenes estables. Shader conservado con carga dinámica idle, 30 FPS, escala 0.5, pausa por viewport/visibilidad y liberación de GPU al desmontar. Sparkles CSS, carrusel CSS y Reveal conservados. No se agregan librerías visuales ni se eliminan efectos. JS inicial pasó de 136 a 137 kB al incluir el parche de seguridad; compartido de 102 a 103 kB. No se presenta como reducción de bundle.

## C. Accesibilidad

- Nombres accesibles corregidos para incluir texto visible del CV alternativo, botones de proyectos/sitio destacado y selector ES/EN (WCAG 2.5.3).
- Relación aria-controls móvil solo cuando existe el panel; iconos decorativos ocultos; Escape devuelve el foco.
- Reveal se muestra al activar movimiento reducido durante navegación, incluso si quedó oculto fuera del viewport; se anula opacidad y desplazamiento con prioridad sobre utilidades Tailwind. El callback idle del Hero vuelve a comprobar la preferencia.
- Carrusel estático con reduced-motion y sin copia duplicada; Sparkles sin animación; scroll automático y transiciones reducidos. Fallback estático del Hero sin canvas.
- `ink-subtle` cambió de #808c91 a #869297: contraste canvas/surface/raised = 6,096 / 5,738 / **5,366:1**. Antes el mínimo real era 4,963:1 sobre raised (AA, pero inferior a 5,31). Foco con outline esmeralda visible, semántica main/header/nav/footer, un h1 y jerarquía sin saltos, alt e iconos revisados.

Axe con WCAG 2 A/AA y 2.1 A/AA en ES/EN móvil/escritorio, además de revisión de código y capturas e interacción de teclado guiada mediante Playwright. Ver qa/results.json y extra.json para los resultados efectivos; Lighthouse por sí solo no se utilizó como garantía. Las pruebas de interacción incluyen Tab/Enter/Escape, skip link, foco visible/devuelto, navegación de anclas, CTA, hover y cambios de preferencia en sesión.

Límites: Chrome con viewports emulados, no dispositivos físicos ni Safari/iOS/Firefox. No se hizo una sesión humana con NVDA/VoiceOver ni una certificación WCAG completa. Las comprobaciones de teclado se ejecutaron con automatización de navegador, complementadas por inspección visual; no se las presenta como prueba de usuario real.

## D. Testing

ES/EN × 390×900, 820×900, 1280×900 y 1440×900. Se verificaron traducciones con paridad de claves, idioma de HTML, cambio de idioma y persistencia al recargar, menú móvil, navegación, CTAs, PDF correspondiente por descarga, copiar email y anuncio accesible, enlaces internos/anclas, imágenes completas, ausencia de overflow horizontal y de errores de consola/red/hidratación. Casos adicionales a 390×844 y 1440×900: cerrar menú fuera y al redimensionar, hover/focus, reduced-motion dinámico y contenido sin JavaScript.

HTTP: /es y /en 200; robots/sitemap/OG/iconos/CVs 200 con content-types correctos; / 307 por idioma; rutas inexistentes localizadas y recursos inexistentes 404. /fr negocia idioma y acaba en 404, no aparece como página pública. Los alternates de cabeceras se eliminaron para no anunciar rutas que no existen.

Enlaces externos existentes: once respuestas 200 y LinkedIn 999 por restricción del sitio a clientes automatizados. No se atribuye ese 999 a un enlace roto, pero no se lo marca como verificado manualmente.

La matriz completa de ocho casos pasó y las regresiones focalizadas posteriores al último ajuste CSS/metadata también pasaron (extra.json y metadata-final.json, incluyendo axe con menú móvil abierto). TypeScript (`npx tsc --noEmit`), ESLint y build de producción: pasan. No hay tests preexistentes configurados. Los escenarios nuevos se guardaron en scripts/phase-5 y no añaden herramientas al package.json de la app. Un build posterior al parche necesitó permiso de red para next/font; compilación final exitosa. Durante builds intermedios se registraron advertencias de caché Webpack y duplicados de tipos generados en .next. Se apartó la salida generada y el build limpio final y TypeScript pasaron.

## E. Cambios y commits

No se agregaron dependencias de aplicación. Actualizaciones necesarias: next y eslint-config-next **15.5.28**, PostCSS **8.5.31** fijado y override consistente; lockfile con parches transitivos compatibles, incluido sharp **0.35.5**. `npm audit` completo final: **0 vulnerabilidades conocidas** (security-after.json). Antes había un aviso crítico de Next y dos dependencias de producción con severidad alta; se conserva la evidencia. No se usó audit fix --force ni se migró a Next 16.

La recomendación de parche procede del [aviso oficial de Next del 14/10/2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026). Una auditoría sin avisos no garantiza ausencia de vulnerabilidades desconocidas.

Archivos de aplicación modificados/agregados:

- `portfolio/package-lock.json`
- `portfolio/package.json`
- `portfolio/public/apple-touch-icon.png`
- `portfolio/public/images/projects/bootcamp-1.png`
- `portfolio/public/images/projects/bootcamp-2.jpg`
- `portfolio/public/images/projects/bootcamp-3.jpg`
- `portfolio/public/images/projects/bootcamp-4.png`
- `portfolio/public/images/projects/bootcamp-5.png`
- `portfolio/public/share.png`
- `portfolio/src/app/[locale]/[...rest]/page.tsx`
- `portfolio/src/app/[locale]/layout.tsx`
- `portfolio/src/app/[locale]/page.tsx`
- `portfolio/src/app/favicon.ico`
- `portfolio/src/app/robots.ts`
- `portfolio/src/app/sitemap.ts`
- `portfolio/src/components/effects/DarkVeil.tsx`
- `portfolio/src/components/effects/HeroBackground.tsx`
- `portfolio/src/components/layout/LocaleSwitcher.tsx`
- `portfolio/src/components/layout/Navbar.tsx`
- `portfolio/src/components/ui/Reveal.tsx`
- `portfolio/src/data/PENDING.md`
- `portfolio/src/data/projects.ts`
- `portfolio/src/features/experience/FeaturedProject.tsx`
- `portfolio/src/features/hero/Hero.tsx`
- `portfolio/src/features/projects/ProjectCard.tsx`
- `portfolio/src/i18n/routing.ts`
- `portfolio/src/styles/globals.css`

Evidencia y herramientas: `docs/phase-5/` (informes por etapa, imágenes verificadas, JSON Lighthouse/axe/HTTP, auditorías, capturas y logs) y `scripts/phase-5/` (escenarios y guía de reproducción).

Commits de implementación por etapa:

- `ca6458f` feat(seo): completar metadata bilingüe, sitemap y tarjetas sociales
- `d4cca42` perf: ajustar carga del logo y alojar capturas verificadas localmente
- `18e9080` fix(a11y): nombres accesibles, contraste y movimiento reducido
- `e971f8f` test: validar ES/EN responsive y parchear dependencias para producción

El commit final de documentación de la etapa 5.5 se identifica en `git log`; se mantiene separado para no incluir su propio hash circularmente en el documento.

## F. Pendientes

| Clasificación | Pendiente |
|---|---|
| Bloqueante para producción | Ninguno detectado en la auditoría local final, con todos los escenarios finales registrados aprobados. El bloqueo de seguridad inicial quedó corregido. |
| Recomendado | Confirmar LinkedIn con sesión humana; probar VoiceOver/NVDA y Safari/iOS/dispositivos físicos antes del lanzamiento. |
| Recomendado | Tras lanzamiento autorizado: comprobar canonical/robots/sitemap/OG en el dominio real y cachés de plataformas; medir datos de campo cuando existan. No se pueden validar ahora sin publicar. |
| Opcional | Repetir Lighthouse varias veces y usar mediana; investigar LCP móvil adicional conservando los efectos, sin usar TBT como sustituto de INP. |
| Opcional | Mantener los originales de capturas para fidelidad; una compresión adicional requiere verificación visual, sin necesidad funcional actual porque Next/Image sirve variantes. |

## G. Recomendación

El portfolio queda técnicamente preparado para revisión de lanzamiento dentro del alcance local auditado: build y tipos correctos, dependencias parcheadas, rutas/metadata verificadas y pruebas funcionales/accesibles documentadas. La auditoría no certifica el comportamiento de producción ni sustituye pruebas con usuarios o tecnologías asistivas reales.

No se hizo deploy, push, merge a main, cambios de dominio/Vercel ni modificaciones en servicios externos. Se conservan las secciones, proyectos y contenido profesional; los únicos ajustes visuales son el mínimo necesario de contraste y los assets de compartir/iconos. El lanzamiento requiere tu revisión y autorización posterior.
