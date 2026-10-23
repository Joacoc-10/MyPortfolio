# Repetir las comprobaciones

Estas herramientas no son dependencias de la aplicación. Requieren Node, Chrome instalado y build de producción local escuchando en 127.0.0.1:4015.

1. En portfolio/: `npm ci`, `npm run build`, `npm start -- --hostname 127.0.0.1 --port 4015`.
2. Desde la raíz del repositorio:

```sh
npm install --prefix /tmp/jcoding-phase5-tools lighthouse@13.5.0 playwright@1.64.1 @axe-core/playwright@4.14.0
cp scripts/phase-5/*.mjs /tmp/jcoding-phase5-tools/
node /tmp/jcoding-phase5-tools/qa.mjs "$PWD/docs/phase-5/qa"
node /tmp/jcoding-phase5-tools/extra.mjs
node /tmp/jcoding-phase5-tools/metadata.mjs
node /tmp/jcoding-phase5-tools/external.mjs
node /tmp/jcoding-phase5-tools/lh.mjs "$PWD/docs/phase-5/after"
```

Ejecutar Lighthouse solo, sin otras auditorías corriendo. El script lanza un Chrome separado por idioma/viewport. Móvil usa configuración predeterminada Lighthouse; desktop usa viewport 1440×900, RTT 40 ms, throughput 10240 Kbps, CPU ×1. Chrome path en lh.mjs corresponde a macOS; adaptar ese path/channel en otros sistemas. JSON incluye versión exacta de Chrome y configuración de cada corrida.

Las capturas full-page conservan la posición del header fijo en el viewport desde donde se capturaron: no implican un header intermedio en la página real.
