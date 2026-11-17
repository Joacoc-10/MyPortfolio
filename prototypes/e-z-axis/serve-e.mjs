// Lanzador opcional de E · Z-AXIS. NO modifica serve.mjs ni ningún archivo compartido.
//
// Por qué existe: serve.mjs envía una CSP que bloquea todos los <iframe> salvo en /d-hybrid-experience/.
// Para que las demos incrustadas de E (ZatoBox, Fabio Producciones, Dra. Biaturi y OliBar) funcionen hace falta
// declarar esos hosts en `frame-src` SOLO para /e-z-axis/. Este archivo arranca serve.mjs en un puerto interno y
// pone delante un proxy local que añade esa directiva únicamente a las respuestas de /e-z-axis/.
// A, B, C y D reciben exactamente los mismos encabezados que con serve.mjs.
//
// Uso (desde la raíz del repo):   node --no-warnings prototypes/e-z-axis/serve-e.mjs
// Puerto público: 4747 (o PORT=xxxx). Puerto interno: público + 1 (o INNER_PORT=xxxx).
import http from "node:http";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 4747;
const INNER = Number(process.env.INNER_PORT) || PORT + 1;
// Misma lista cerrada que el registro de demos verificadas (e-z-axis/demos.js).
const E_FRAME_HOSTS = [
  "https://www.zatobox.io",
  "https://fabioproducciones.vercel.app",
  "https://dra.florenciabiaturi.com",
  "https://oli-bar.vercel.app",
];

process.env.PORT = String(INNER); // serve.mjs lee PORT al importarse
await import("../serve.mjs");

const allowed = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
http.createServer((req, res) => {
  if (!allowed.has(req.headers.host ?? "")) { res.writeHead(403).end("Forbidden host"); return; }
  const up = http.request({ host: HOST, port: INNER, path: req.url, method: req.method, headers: { ...req.headers, host: `${HOST}:${INNER}` } }, (r) => {
    const headers = { ...r.headers };
    const csp = headers["content-security-policy"];
    if (csp && req.url.split("?")[0].startsWith("/e-z-axis/")) {
      headers["content-security-policy"] = String(csp).replace("default-src 'self'", `default-src 'self'; frame-src ${E_FRAME_HOSTS.join(" ")}`);
    }
    res.writeHead(r.statusCode ?? 502, headers);
    r.pipe(res);
  });
  up.on("error", () => { res.writeHead(502).end("Bad gateway"); });
  req.pipe(up);
}).listen(PORT, HOST, () => {
  console.log(`E · Z-AXIS (con demos) → http://${HOST}:${PORT}/e-z-axis/   ·   comparador A–D → http://${HOST}:${PORT}/`);
});
