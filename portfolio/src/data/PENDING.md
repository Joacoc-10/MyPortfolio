# Contenido pendiente de confirmar

Registro de datos que faltan o son borradores. Nada de esto se muestra como placeholder
en la web: los campos opcionales se omiten hasta que haya información confirmada.

## Auditorías de repositorios (siguiente etapa)

- **Ordera** (`projects.ts`): stack real, funcionalidades implementadas y contribuciones verificables.
- **Nexvia** (`projects.ts`): stack real (hoy `techIds: []`).
- **UES × Mercado Libre** (`projects.ts`): URL pública si existe y detalles autorizados. No usar logos de UES ni de Mercado Libre; ante la duda sobre confidencialidad, omitir.

## Experiencia

- **ZatoBox** (`companies.ts`): confirmados rol (Frontend Developer), modalidad (prácticas profesionales),
  duración (6 meses), sitio web (https://www.zatobox.io/) y qué es la plataforma (POS y gestión de inventario
  para pequeños comercios). Pendiente de confirmar:
  - Fechas exactas (inicio y fin).
  - Tecnologías que usé personalmente. El README público (https://github.com/ZatoBox/main) documenta Next.js,
    React, TypeScript, Tailwind CSS, Radix UI, Zustand y otras herramientas frontend, pero no se atribuye ninguna
    a mi trabajo hasta confirmarlo.
  - Responsabilidades y funcionalidades en las que participé (se puede auditar el historial de contribuciones del repositorio).
  - Si se agregan tecnologías, cargarlas en `technologies.ts` y referenciarlas con `techIds` (hoy las empresas no tienen `techIds`; habría que asociar un proyecto o ampliar el modelo).
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
