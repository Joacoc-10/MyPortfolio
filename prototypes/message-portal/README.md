# Z-AXIS · Message Portal (prototipo)

Prototipo independiente de la sección de contacto: el mensaje cobra vida mientras se escribe y, al enviarlo, se pliega,
cruza un portal y se entrega. **No toca `portfolio/`, ni los prototipos A–E, ni el comparador, ni `prototypes/serve.mjs`.**
No usa EmailJS ni hace ninguna solicitud de red: el resultado del envío se simula desde el «Panel de pruebas».

## Ejecutar

```bash
node prototypes/message-portal/serve.mjs      # desde la raíz del repo
# → http://127.0.0.1:4850/                    (PORT=xxxx para otro puerto)
```

Solo escucha en `127.0.0.1`, solo sirve archivos de esta carpeta y, de `portfolio/public/brand/`, el logo (solo lectura).
Three.js r170 va incluido en `vendor/` (MIT, sin `npm install`). Las tipografías (Geist, Geist Mono, Instrument Serif)
se piden a Google Fonts como en el prototipo E; sin conexión se usan tipografías del sistema.

## Probarlo

Abrí el **Panel de pruebas** (abajo a la derecha; arriba en móvil):

| Control | Qué hace |
|---|---|
| Resultado simulado | Éxito / Fallo |
| Latencia | Rápida 0,9 s · Lenta 7 s · Muy lenta 16 s (el portal espera en tránsito; nunca confirma antes) |
| Calidad | Auto / Alta / Media / Baja |
| Forzar movimiento reducido | Equivale a `prefers-reduced-motion: reduce` |
| Rellenar ejemplo / Vaciar | Rellena los campos disparando los rayos de luz campo → objeto |
| Desmontar / montar | Libera la escena (`dispose`) y la vuelve a crear, para comprobar la limpieza |

Hooks para pruebas automáticas (consola): `__mp.scene.freeze()`, `__mp.scene.advance(segundos)`, `__mp.scene.debug()`.

## Estados

| Estado | Qué ocurre |
|---|---|
| **A · Reposo** | Sobre de cristal holográfico *sin ensamblar*: piezas dispersas, esquirlas orbitales, suelo en perspectiva. Flota y se inclina con el cursor (con el dedo en táctil; si no hay puntero, oscila solo). La luz principal sigue al cursor y desliza reflejos por el cristal. |
| **B · Escribiendo** | Nombre → anillos orbitales; correo → los tres bolsillos del sobre; mensaje → la carta y la solapa. La carta muestra el texto real (textura de canvas viva). Al completar un campo (blur) sale un **rayo de luz desde el campo hasta su pieza** y un barrido de trazo la recorre. Un LED junto a cada etiqueta indica el enlace. Cada tecla solo da un pulso mínimo. |
| **C · Enviando** | 1 *Componer*: todo encaja, las esquirlas se absorben. 2 *Sellar*: la carta entra, la solapa cae con rebote y se enciende el sello. 3 *Portal*: se abre detrás (anillos contrarrotantes a distinta profundidad, remolino GPU), el sobre se pliega en flecha, gira una vuelta y se eleva, y cabecea hacia el portal. 4 *En tránsito*: queda suspendido, el portal «carga» (partículas en espiral). Aquí espera la respuesta. |
| **D · Éxito** | Retroceso (carga) → aceleración *ease-in* → cruza el plano del portal (destello, anillo de choque, ráfaga, estela, onda en el suelo; el sobre pasa detrás del disco) → el portal se contrae → queda un sello giratorio y los anillos. La tarjeta se pliega y aparece la confirmación integrada (líneas que suben, foco en el título). |
| **E · Error** | El portal se vuelve ámbar e inestable; el sobre llega y **rebota** (impulso, alabeo, chispas ámbar); el portal colapsa; el sobre se despliega y vuelve abierto, con la carta fuera. Aparece un `role="alert"` con enlace al correo, los datos siguen intactos y el botón pasa a «Reintentar envío». |
| **F · Reinicio** | «Enviar otro mensaje»: la confirmación se pliega, el formulario se despliega, y el sobre resurge de partículas que convergen. |

## Archivos

```
prototypes/message-portal/
├─ index.html · styles.css · serve.mjs · README.md
├─ vendor/three.module.min.js (+ LICENSE-three)
└─ js/
   ├─ main.js      formulario, validación, panel de pruebas, HUD, a11y, fallback sin WebGL
   ├─ scene.js     escena, canales de movimiento y coreografía de cada estado
   ├─ parts.js     losas de cristal (SDF + trazos), textura de la carta, esquirlas, suelo, entorno
   ├─ portal.js    remolino, anillos, halo, partículas de entrada
   ├─ particles.js sistema único de partículas (estela, ráfagas, chispas)
   └─ motion.js    resortes amortiguados, tweens, línea de tiempo
```

## Decisiones técnicas

- **Three.js (WebGL2) puro, sin R3F/GSAP/Motion.** El proyecto real no trae Three; R3F añadiría React al prototipo sin
  beneficio. El movimiento lo hace un motor propio de ~100 líneas (resortes + línea de tiempo en un único `requestAnimationFrame`):
  da peso, es interrumpible sin saltos y no deja temporizadores sueltos al desmontar.
- **Sin postprocesado**: el brillo se resuelve en shaders (trazos aditivos, halos, discos), lo que evita ~10 archivos de
  `examples/jsm` y un pase extra.
- El plegado del sobre es un deformador en el vertex shader (mismo en todas las piezas), no huesos ni *morph targets*.

## Accesibilidad, rendimiento, límites

Escena `aria-hidden`; anuncios por región en vivo; errores en línea con `aria-invalid`/`aria-describedby`; campos
`readOnly` (no `disabled`) mientras se envía; foco gestionado en éxito/error/reinicio; `inert` en la parte oculta de la tarjeta.
`prefers-reduced-motion` (o el interruptor): sin trayectorias, giros ni partículas; transiciones de ≤0,3 s y render solo
cuando algo cambia. Calidad adaptativa (DPR, partículas y esquirlas) por hardware y por tiempo de fotograma; la escena se
pausa fuera de pantalla o con la pestaña oculta. Sin WebGL2 cae a un sobre/portal CSS con las mismas fases.
