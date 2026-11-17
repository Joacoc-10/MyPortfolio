# Contenido pendiente de confirmar

Registro de datos que faltan o son borradores. Nada de esto se muestra como placeholder
en la web: los campos opcionales se omiten hasta que haya información confirmada.

## Experiencia

- **ZatoBox** (`companies.ts` y proyecto `zatobox` en `projects.ts`): confirmados rol, modalidad, período
  (ago–dic 2025), sitio web, estado de producción, las 5 contribuciones y las tecnologías Next.js, React, TypeScript,
  Tailwind CSS y React Icons. La duración de "6 meses" se omitió para no contradecir el período; reincorporarla solo si se
  define de forma consistente. Pendiente:
  - Formik: no confirmado, no se muestra.
  - Nombre del proyecto en la ficha: hoy "ZatoBox POS" (nombre descriptivo para no repetir el de la empresa); confirmar.
  - Commit `5ae63fe` del repositorio (19 archivos ajenos): no se atribuye nada; confirmar si alguna parte es propia.
- **Coralunity** (`companies.ts`): descripción propia de la empresa (hoy solo se describe tu participación).

## Textos redactados como borrador (validar)

- `profile.ts` → `name` (apellido tomado del email/git: "Curbelo") y `valueProposition`.
  Redactados solo con hechos confirmados; revisar tono y redacción. (`about` ya fue redactado y confirmado.)

## Proyectos del bootcamp Henry

- Los links a repositorios de GitHub estaban comentados en la versión anterior
  (`gitHubFront` / `gitHubback`). Decidir si se publican; si es así, agregar `links.repo`.
- Fase 5: las cinco capturas se migraron a `public/images/projects/` con bytes originales y SHA-256 documentados en `docs/phase-5/images.json` (los originales se retiraron en la Fase 6; ver más abajo).
- Previsualizaciones: versiones WebP en `public/images/projects/<id>/` (registro en `images.json`, campo `optimized`). Fase 6: los originales `bootcamp-1…5` (23.312.446 bytes) se eliminaron del árbol de trabajo; siguen disponibles en el historial de git (commit d4cca42) y sus hashes SHA-256 se conservan en `images.json`.
- Las tecnologías de cada proyecto se unificaron en una lista plana (antes separadas en Front-end / Back-end);
  la categoría de cada tecnología sigue disponible en `technologies.ts`.

## Otros

- Fase 5: imagen Open Graph propia implementada en `public/share.png`; preview real de plataformas pendiente del lanzamiento autorizado.
- OliBar: descripción más detallada (opcional). Capturas incorporadas.
- UES × Mercado Libre: sin capturas (sistema interno; pendiente de material autorizado).
- Capturas de Florencia y Fabio omiten a propósito las secciones de contacto/formulario (teléfonos y correos visibles). Las imágenes de Fabio son ilustraciones de IA marcadas «ilustrativa» en el sitio.

## Verificación manual

- LinkedIn (`links.ts`) responde 999 a clientes automatizados; abrir el perfil manualmente para confirmar que el enlace funciona.

## Rediseño Z-AXIS (2026)

- **EmailJS**: el formulario de «Trabajemos juntos» está implementado y probado con mocks; falta crear la cuenta/servicio/plantilla
  y cargar `NEXT_PUBLIC_EMAILJS_*` (local en `.env.local` y en Vercel). Hasta entonces el formulario avisa y ofrece el correo directo.
- **Textos de interfaz nuevos** (namespaces `Z` y `ContactForm` en `messages/*.json`): redactados para el rediseño; revisar tono y redacción.
  Incluyen los rasgos de «Sobre mí» (Curioso · Autodidacta · Aprendo mientras construyo) y las etiquetas de las capas (Interfaz · Lógica · Datos · Entrega).
- «Servicios e integraciones» (capa Lógica del Stack) se toma de las tecnologías reales de los proyectos; la sección Stack original no las mostraba.
- Se eliminó la opción «Explorar demo»/iframes del portfolio definitivo (siguen intactas en `prototypes/`).
