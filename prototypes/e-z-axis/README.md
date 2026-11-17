# E · Z-AXIS

Quinto prototipo de JCoding: la página completa (Navbar → Hero → Proyectos → Experiencia → Stack → Sobre mí → Contacto → Footer).
Idea: **Full Stack es trabajar en profundidad — Interfaz, Lógica, Datos y Entrega.** El eje Z organiza la página:
cuanto más se baja, más hondo y oscuro el plano; un riel de profundidad (≥ 1360 px) y una línea de progreso en el navbar lo muestran.

Aislado en `prototypes/e-z-axis/`. No toca `portfolio/`, ni A/B/C/D, ni los archivos compartidos.

## Abrir

Con el servidor de siempre (todo funciona, **salvo las demos incrustadas**, que la CSP de `serve.mjs` bloquea fuera de D):

```bash
node --no-warnings prototypes/serve.mjs          # desde la raíz del repo
# → http://127.0.0.1:4747/e-z-axis/
```

Con las demos incrustadas (recomendado para evaluar E). Lanzador propio de E: arranca `serve.mjs` sin modificarlo
en un puerto interno y pone delante un proxy que añade `frame-src` **solo** a `/e-z-axis/`:

```bash
node --no-warnings prototypes/e-z-axis/serve-e.mjs   # desde la raíz del repo
# → http://127.0.0.1:4747/e-z-axis/   (y el comparador A–D sigue en http://127.0.0.1:4747/)
```

Si el puerto 4747 está ocupado: `PORT=4750 node --no-warnings prototypes/e-z-axis/serve-e.mjs`. Requiere Node 22.18+.
Detén antes cualquier `serve.mjs` en marcha: ambos quieren el mismo puerto público.

Parámetros de URL: `?lang=es|en` · `?rm=1` (movimiento reducido) · `?lite=1` (modo ligero: hero y coverflow estáticos).
También respeta `prefers-reduced-motion` del sistema, `saveData` y equipos de ≤ 2 núcleos (modo ligero).

## Comparador

El comparador (`harness.js` / `index.html`) tiene la lista de variantes escrita a mano, así que **no detecta E solo**.
No se modificó. Para sumarlo hace falta tocar esos dos archivos compartidos (una entrada en `variants`, un botón en el
picker y la tecla `5`): pendiente de autorización.

## Estructura

```
e-z-axis/
  index.html · main.js           arranque y orquestación (un único manejador de scroll)
  base.css hero.css projects.css detail.css sections.css
  lib.js i18n.js demos.js        utilidades · textos nuevos (REVISAR) · registro de demos
  modules/ brand nav hero weight projects detail sections
  serve-e.mjs                    lanzador opcional con demos (no modifica nada compartido)
```

Reutiliza de la infraestructura: `/api/full.json` (contenido real de `portfolio/src/data` y `portfolio/messages`),
`/assets/*` (capturas, foto, CV, logo original) y `/shared/util.js` + `/shared/base.css`.

## Contenido

Solo datos reales del portfolio: los 12 proyectos (4 profesionales, 3 personales, 5 de bootcamp), empresas, stack, `about`.
Textos de interfaz propios de E en `i18n.js` (marcados REVISAR). «Servicios e integraciones» (capa Lógica) se toma de las
tecnologías reales que figuran en los proyectos; la sección Stack del portfolio actual no las muestra. UES × Mercado Libre
se presenta de forma tipográfica: sin capturas ni enlaces (es un sistema interno).
El texto de posicionamiento (`valueProposition`) y el apellido siguen marcados como borrador en `portfolio/src/data/PENDING.md`.

## Borrar

```bash
rm -rf prototypes/e-z-axis
```
