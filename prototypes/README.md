# Prototipos del rediseño de JCoding

Entorno **aislado** para comparar direcciones visuales: tres exploraciones del hero (A, B, C) y la variante
**D · JCoding Hybrid Experience**, que representa el portfolio completo.
No toca `portfolio/` (ni código, ni estilos, ni datos, ni dependencias): solo **lee** de él.

## Ejecutar

```bash
node --no-warnings prototypes/serve.mjs     # desde la raíz del repo
```

Abrí **http://127.0.0.1:4747/** y cambiá entre A, B, C y D con el selector inferior.
Requiere Node 22.18+ (se usa Node 24). No hace falta `npm install`.
Si el puerto 4747 está ocupado (por ejemplo, un servidor anterior sin reiniciar): `PORT=4748 node --no-warnings prototypes/serve.mjs`.
**Después de actualizar, reiniciá el servidor**: D necesita el endpoint `/api/full.json`.

| Control | Qué hace |
|---|---|
| Selector inferior, teclas `1` `2` `3` `4`, `←` `→` | Cambia de prototipo (instantáneo; las teclas actúan con el foco en el comparador) |
| `R` o ↻ | Reinicia el prototipo (repite la animación de entrada) |
| Escritorio / Tablet 820 / Móvil 390 | Redimensiona el iframe: las media queries responden de verdad |
| ES / EN | Idioma (textos reales de `portfolio/messages`) |
| Movimiento / Reducido | Fuerza `prefers-reduced-motion` (`?rm=1`) para probarlo sin tocar el sistema |

Cada prototipo también se abre solo: `/a-digital-dimensions/`, `/b-experimental-type/`, `/c-immersive-showcase/`,
`/d-hybrid-experience/` (admiten `?lang=en` y `?rm=1`).

## D · JCoding Hybrid Experience

Hero cinematográfico (C) + cover flow de proyectos con vista de exploración y vista de detalle (A) + recursos
tipográficos de B (serif itálico de contraste, peso variable que responde al puntero, índices numerados) +
stack, experiencia, sobre mí, contacto, navbar y pie. ES/EN. Contenido 100 % real (sin datos inventados).

```
d-hybrid-experience/
  index.html · main.js        arranque y orquestación (un único manejador de scroll; sin scroll-jacking)
  base.css hero.css projects.css sections.css
  lib.js i18n.js demos.js     utilidades · textos de interfaz nuevos (REVISAR) · registro de demos
  modules/ brand nav hero projects detail sections
```

- **Logo**: siempre el archivo original `portfolio/public/brand/logo-white.png` (servido como `/assets/brand/logo-white.png`).
  Pie: `<img>`. Navbar y hero: el mismo PNG repartido en capas de máscara (anillo · `</>` · wordmark) para animarlo sin
  redibujarlo. Se muestra como máximo a 330 px de ancho (el archivo es de 800 px).
- **Datos**: `/api/full.json` (nuevo, aditivo; `/api/content.json` no cambió, así que A/B/C quedan idénticos).
- **Demos embebidas** (`demos.js` es la fuente de verdad). El `<iframe>` no existe hasta pulsar «Explorar demo»; solo hay
  uno a la vez; se destruye al salir, cambiar de proyecto o cerrar. El detalle es un `<dialog>` modal que bloquea el scroll
  de la página, de modo que el iframe nunca compite con el scroll principal. En móvil la demo ocupa toda la pantalla.
  `sandbox` sin `allow-top-navigation`. Siempre hay un enlace al sitio original.

  | Estado | Proyectos |
  |---|---|
  | `verified` (probado en Chrome 2026-11-17: carga, scroll interno, salida) | ZatoBox POS, Fabio Producciones, Dra. Florencia Biaturi, OliBar |
  | `blocked` (`X-Frame-Options: SAMEORIGIN`) | Order-A, Nexvia |
  | `unverified` (se renderiza la pantalla inicial; sin prueba de funcionamiento) | los 5 del bootcamp |

  Para sumar una demo: agregarla en `demos.js` **y** su origen en `D_FRAME_HOSTS` de `serve.mjs` (CSP `frame-src`).
- **Aviso de consola esperado**: Chrome informa «iframe with both allow-scripts and allow-same-origin can escape its
  sandboxing». Es una advertencia genérica; `allow-same-origin` es necesario para que los sitios incrustados usen su
  propio almacenamiento, y como son de otro origen no pueden escapar del sandbox hacia este.
- **Movimiento reducido** (`?rm=1` o preferencia del sistema): hero estático, cover flow sin 3D, sin parallax ni revelados.

## Cómo se aísla

- Todo el código nuevo vive en `prototypes/`. Es HTML, CSS y ES modules planos: sin build, sin dependencias.
- `serve.mjs` escucha **solo en 127.0.0.1:4747** (o `PORT`), rechaza cualquier `Host` que no sea ese, acepta solo `GET/HEAD`,
  resuelve rutas dentro de una raíz permitida (sin `..`, sin dotfiles, sin symlinks que escapen) y sirve únicamente
  extensiones de una lista corta. Envía CSP estricta (`script-src 'self'`). Solo la ruta de D agrega `frame-src` con
  una lista cerrada de hosts de demos verificadas; A, B y C conservan la CSP original.
- Lectura de `portfolio/` (solo lectura, nunca copia):
  - `/api/content.json` ← `portfolio/src/data/*.ts` y `portfolio/messages/*.json` (perfil, proyectos, tecnologías).
  - `/assets/*` ← `portfolio/public/` (solo `images/`, `brand/` y los CV).
- Los prototipos no se importan desde la app y la app no los conoce (el middleware de next-intl no interviene).

## Contenido

Solo se usan datos y capturas reales del portfolio. A, B y C muestran Order-A, Nexvia, ZatoBox POS, Fabio Producciones,
Dra. Florencia Biaturi y OliBar (UES × Mercado Libre queda fuera porque no tiene capturas autorizadas). D incluye además
los 5 proyectos del bootcamp y UES × Mercado Libre (en Experiencia y en el detalle, sin capturas).
El texto de posicionamiento (`valueProposition`) sigue marcado como borrador en `portfolio/src/data/PENDING.md`.

## Borrar todo

```bash
rm -rf prototypes
```
