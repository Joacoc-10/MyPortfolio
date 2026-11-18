// Servidor local de Z-AXIS · Message Portal. Solo escucha en 127.0.0.1 y solo LEE (nunca escribe).
// Uso (desde la raíz del repo):  node prototypes/message-portal/serve.mjs      → http://127.0.0.1:4850/
// PORT=xxxx para otro puerto. No toca serve.mjs ni ningún archivo compartido.
import http from "node:http";
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 4850;
const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(ROOT, "..", "..", "portfolio", "public"); // referencia de solo lectura (logo)
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
const STATIC_EXT = new Set([".html", ".css", ".js", ".svg"]);
const SERVER_ONLY = new Set(["serve.mjs"]);
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "script-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

async function safeResolve(base, rel) {
  let decoded;
  try { decoded = decodeURIComponent(rel); } catch { return null; }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;
  const parts = decoded.split("/").filter(Boolean);
  if (parts.some((p) => p.startsWith(".") || p === "node_modules")) return null;
  const full = resolve(base, normalize(parts.join(sep)));
  if (full !== base && !full.startsWith(base + sep)) return null;
  try {
    const [rb, rf] = await Promise.all([realpath(base), realpath(full)]);
    if (rf !== rb && !rf.startsWith(rb + sep)) return null;
    return rf;
  } catch { return null; }
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end("Not found");
}

async function sendFile(req, res, file) {
  const type = MIME[extname(file).toLowerCase()];
  const info = type ? await stat(file).catch(() => null) : null;
  if (!info?.isFile()) return notFound(res);
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": info.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": CSP,
    "Referrer-Policy": "no-referrer",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (!ALLOWED_HOSTS.has(req.headers.host ?? "")) { res.writeHead(403).end("Forbidden host"); return; }
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD" }).end(); return; }
    const { pathname } = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

    if (pathname.startsWith("/assets/")) { // solo la marca, de solo lectura
      const rel = pathname.slice("/assets/".length);
      if (!/^brand\/[\w.-]+\.(png|svg)$/i.test(rel)) return notFound(res);
      const file = await safeResolve(PUBLIC, rel);
      return file ? sendFile(req, res, file) : notFound(res);
    }

    let rel = pathname.replace(/^\/+/, "");
    if (rel === "" || rel.endsWith("/")) rel += "index.html";
    if (!STATIC_EXT.has(extname(rel).toLowerCase()) || SERVER_ONLY.has(rel)) return notFound(res);
    const file = await safeResolve(ROOT, rel);
    return file ? sendFile(req, res, file) : notFound(res);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Error");
  }
});

server.listen(PORT, HOST, () => console.log(`Message Portal → http://${HOST}:${PORT}/`));
