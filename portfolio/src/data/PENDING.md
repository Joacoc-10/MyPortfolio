# Contenido pendiente de confirmar

Registro de datos que faltan o son borradores. Nada de esto se muestra como placeholder
en la web: los campos opcionales se omiten hasta que haya información confirmada.

## Auditorías de repositorios (siguiente etapa)

- **Ordera** (`projects.ts`): stack real, funcionalidades implementadas y contribuciones verificables.
- **Nexvia** (`projects.ts`): stack real (hoy `techIds: []`).
- **UES × Mercado Libre** (`projects.ts`): URL pública si existe y detalles autorizados. No usar logos de UES ni de Mercado Libre; ante la duda sobre confidencialidad, omitir.

## Experiencia

- **ZatoBox** (`companies.ts` y proyecto `zatobox` en `projects.ts`): confirmados rol (Frontend Developer),
  modalidad (prácticas profesionales), duración (6 meses), sitio web (https://www.zatobox.io/), estado
  (en producción) y qué es la plataforma (POS y gestión de inventario para pequeños comercios).
  Pendiente de validar antes de publicar (hallazgos de la auditoría de https://github.com/ZatoBox/main, 18 commits y
  11 PRs de `Joacoc-10` entre 2025-09-08 y 2025-10-09; ver informe en la conversación):
  - Fechas exactas de las prácticas (los commits solo acotan un período de actividad en ese repositorio).
  - Contribuciones propias (`contributions`): candidatas con evidencia en commits/PRs, aún sin cargar.
  - Tecnologías que usé (`techIds`): con evidencia en el código que escribí: Next.js, React, TypeScript, Tailwind CSS
    y react-icons (la dependencia fue agregada en un commit propio). Formik: evidencia parcial (extracción de un
    componente de formulario que lo usa). No hay evidencia para Radix UI, Zustand, i18next, Axios, react-hook-form,
    Recharts ni el resto del stack del proyecto, y Lucide/Yup solo aparecen en cambios de formato de comillas.
  - Nombre del proyecto en la ficha: hoy "ZatoBox POS" (nombre descriptivo para no repetir el de la empresa); confirmar.
  - Commit `5ae63fe` (2025-10-08) agrega 19 archivos ajenos (entornos virtuales, webhooks, rutas de API) y el PR #126
    quedó cerrado sin merge; no se atribuye nada de ahí. Confirmar si alguna parte es propia.
- **Coralunity** (`companies.ts`): descripción propia de la empresa (hoy solo se describe tu participación).

## Textos redactados como borrador (validar)

- `profile.ts` → `name` (apellido tomado del email/git: "Curbelo"), `valueProposition` y `about`.
  Redactados solo con hechos confirmados; revisar tono y redacción.

## Proyectos del bootcamp Henry

- Los links a repositorios de GitHub estaban comentados en la versión anterior
  (`gitHubFront` / `gitHubback`). Decidir si se publican; si es así, agregar `links.repo`.
- Las capturas siguen cargándose desde ImageKit; se migran a `public/` en la Fase 5.
- Las tecnologías de cada proyecto se unificaron en una lista plana (antes separadas en Front-end / Back-end);
  la categoría de cada tecnología sigue disponible en `technologies.ts`.

## Otros

- Imagen Open Graph propia (Fase 5).
- OliBar: captura de pantalla y descripción más detallada (opcionales).

## Verificación manual

- LinkedIn (`links.ts`) responde 999 a clientes automatizados; abrir el perfil manualmente para confirmar que el enlace funciona.
