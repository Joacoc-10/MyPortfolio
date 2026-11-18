# JCoding Portfolio

Portfolio de Joaquín (Full Stack Developer) con el diseño **Z-AXIS** (rediseño 2026).
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · next-intl (ES/EN).

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # ESLint
```

El README principal del repositorio está en `../README.md`.

## Idea de diseño

Full Stack es trabajar en profundidad: Interfaz, Lógica, Datos y Entrega. Cuanto más se baja, más hondo y oscuro es el plano
(riel de profundidad ≥ 1360 px y línea de progreso en el navbar). La referencia visual es `../prototypes/e-z-axis/` (intacto).

## Estructura

```
src/app/[locale]/           layout (fuentes, prefs. de movimiento antes del primer pintado) y página
src/data/                   contenido real (proyectos, empresas, tecnologías, perfil) — fuente única
src/features/zaxis/
  content.ts                modelo serializable por idioma (servidor)
  ZAxisApp.tsx              orquestador: UN manejador de scroll, riel, spotlight, detalle bajo demanda
  Hero · Projects · Experience · Stack · About · Contact · Footer · Navbar · Detail
  coverflow.ts              motor 3D del coverflow / mazo móvil (rAF, sin renders de React por frame)
  weight.ts                 campo de peso tipográfico (nombre del hero y correo)
  TechLogo.tsx              logo de marca (react-icons) o monograma neutro
  MessagePortal.tsx · email.ts  formulario «Message Portal» + envío con EmailJS
  portal/                       escena 3D (Three.js, carga diferida): scene · parts · portal · particles · motion · driver
src/styles/zaxis/           CSS del sistema visual (base, hero, projects, detail, sections, extras)
messages/{es,en}.json       textos; los de la interfaz Z-AXIS están en «Z» y «ContactForm»
```

Las animaciones usan transformaciones y opacidad escritas desde un único `requestAnimationFrame`/manejador de scroll
(las secciones no se re-renderizan por frame). Preferencias: `prefers-reduced-motion`, `?rm=1`, `?lite=1`, `saveData` y
equipos de ≤ 2 núcleos (hero y coverflow estáticos).

## Formulario de contacto (EmailJS)

Copiá `.env.example` a `.env.local` y completá `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` y
`NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` (cuenta propia en emailjs.com). La plantilla recibe `{{from_name}}`, `{{reply_to}}` y
`{{message}}`. Sin esas variables el formulario valida y, al enviar, avisa y ofrece el correo directo. En el panel de
EmailJS limitá los dominios permitidos y el volumen de envíos.
