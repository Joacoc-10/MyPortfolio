# Z-AXIS · informe de implementación (rama `redesign-2026`)

Port fiel del prototipo E (`prototypes/e-z-axis/`, intacto) a `portfolio/` (Next 15 · React 19 · TS · Tailwind 4 · next-intl).
Herramientas de prueba fuera del repo (Playwright 1.65, axe-core 4, Lighthouse); no se agregaron dependencias de desarrollo.

## Los seis ajustes
1. **Fabio Producciones = última ventana** del túnel (escritorio y móvil): `Hero.tsx` (`WIDE_IDS` / `NARROW_IDS`).
2. **Logos de tecnologías** en tarjetas de proyecto, panel, índice, detalle, experiencia y capas del Stack: `TechLogo.tsx`
   (`tech-icons.ts` + react-icons; monograma neutro si no hay ícono; color de marca al pasar el cursor).
3. **Carrusel original** adaptado al cierre de Stack (transición hacia Sobre mí): pausa en hover, grilla estática con reduced-motion.
4. **Formulario EmailJS** en Contacto (nombre, correo, mensaje; validación, ARIA, estados, errores); correo, copiar y redes se mantienen.
5. **Efectos selectivos**: borde brillante + spotlight (un listener delegado), luz ambiental por proyecto, sparkles solo en el proyecto destacado, hover de marca en logos. Sin DarkVeil ni partículas.
6. **Sin demos/iframes**: se retiró «Explorar demo»; quedan galería, información, tecnologías, contribuciones y enlaces externos.

## Resultados (build de producción, `next start`)
| Prueba | Resultado |
|---|---|
| `tsc --noEmit`, ESLint, `next build` | OK, 0 avisos |
| Lighthouse (ES/EN × móvil/escritorio) | Performance 100/100/100/100 · Accesibilidad 100 · SEO 100 · Buenas prácticas 96 (solo por los 404 de los scripts `/_vercel/*`, que existen únicamente en Vercel). Móvil: FCP/LCP 1,2 s, TBT ≈ 10 ms, CLS 0 (versión anterior: 92) |
| axe (WCAG 2.0–2.2 AA + best-practice), ES/EN × 390/820/1440 | 0 violaciones (se corrigieron roles ARIA y nombres accesibles 2.5.3) |
| Scroll horizontal | 0 px en 390/820/1440, ES/EN, normal / `?rm=1` / `?lite=1` |
| Consola | Sin errores propios (solo 404 de `/_vercel/*` fuera de Vercel) |
| Funcional (Chrome, ES y EN) | 26/26: coverflow (flechas, teclado, arrastre), grupos, índice (`inert` en filas cerradas), detalle (`<dialog>`: foco, Esc, devuelve foco, siguiente), Stack → proyectos, formulario (validación, foco al primer error, éxito, error de red, datos conservados, payload EmailJS con mock), copiar email, cambio de idioma conservando scroll |
| Mazo móvil / hero → proyecto | OK (deslizar cambia proyecto; clic en una ventana del hero lleva al proyecto) |
| Reduced-motion y modo ligero | Hero y coverflow estáticos, carrusel como grilla, sin animaciones |
| WebKit (Playwright) | Sin errores ni scroll horizontal; ver limitaciones |

## Fidelidad con el prototipo E
Capturas a 1440/820/390 en las mismas posiciones de scroll (hero 0/0,3/0,6/1/1,4 vh y cada sección). Composición, tipografía, espaciado,
colores, profundidad y jerarquía coinciden; las diferencias son las de los seis ajustes (orden de ventanas del hero, logos, carrusel,
formulario con rejilla propia en Contacto, sin demos) y que el idioma cambia de ruta (`/es` ↔ `/en`) en vez de recargar con `?lang=`.

## Cambios técnicos relevantes
- Next/React: React solo pinta marcado y estado de UI; el túnel del hero, el coverflow y el campo de peso se animan con un único
  `requestAnimationFrame`/manejador de scroll (sin renders por frame). Preferencias de movimiento se fijan antes del primer pintado.
- La entrada del hero depende de CSS (no de la hidratación): LCP 4,2 s → 1,2 s en móvil. El detalle se carga bajo demanda.
- El clic en ventanas profundas del hero se resuelve por geometría (el hit-test 3D nativo solo alcanza a la frontal; ocurre también en el prototipo).
- Dependencias: **+** `@emailjs/browser`; **−** `ogl` (DarkVeil) y `motion` (sin uso: las animaciones son CSS/rAF).
- Eliminado el UI anterior (`features/{hero,about,experience,stack,projects,contact}`, `components/{ui,effects,layout}`) por reemplazo completo.

## Problemas conocidos / limitaciones
- **WebKit (build de Playwright)**: las capturas del túnel 3D salen sin la reducción de escala por profundidad (la geometría del DOM sí es correcta);
  el prototipo se ve igual. Conviene mirarlo en Safari real antes del deploy.
- **EmailJS**: falta tu cuenta/servicio/plantilla y las variables `NEXT_PUBLIC_EMAILJS_*`. Hasta entonces el formulario valida y, al enviar, avisa y ofrece el correo.
- Los textos nuevos de interfaz (`Z`, `ContactForm`) son borradores para revisar; `valueProposition` y el apellido siguen marcados en `src/data/PENDING.md`.
- No hay skills `ui-ux-pro-max`, `design-taste-frontend`, `animate`, `choreograph`, `animation-performance` ni `prototype` instaladas en esta sesión: el trabajo se guió por el prototipo E y por mediciones (Lighthouse/axe/Playwright).
- `npm audit` (prod): 2 avisos altos de `picomatch` (dependencia transitiva de next-intl, preexistente).

## Antes del merge y deploy
1. Crear la cuenta EmailJS, cargar `NEXT_PUBLIC_EMAILJS_*` (local y en Vercel), limitar dominios/volumen y probar un envío real.
2. Revisar en Safari/iOS real el hero 3D y el mazo móvil.
3. Revisar textos nuevos (ES/EN) y los marcados en `PENDING.md`.
4. `npm run build` en Vercel preview y repetir Lighthouse allí (los scripts `/_vercel/*` existirán).
