// Servidor local de los prototipos. Solo escucha en 127.0.0.1:4747 y solo LEE de ../portfolio.
// Uso:  node prototypes/serve.mjs
import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 4747; // PORT=xxxx para usar otro puerto
const ROOT = dirname(fileURLToPath(import.meta.url));
const PORTFOLIO = resolve(ROOT, "..", "portfolio");
const PUBLIC = join(PORTFOLIO, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
};
// Lo que se puede servir desde la carpeta de prototipos.
const STATIC_EXT = new Set([".html", ".css", ".js", ".svg"]);
// Lo que se puede servir desde portfolio/public (solo imágenes, marca y CV).
const ASSET_RULES = [
  { re: /^images\/.+\.(webp|png|jpe?g)$/i },
  { re: /^brand\/.+\.(png|svg)$/i },
  { re: /^CV_JCoding_(ES|EN)\.pdf$/ },
];
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
const SERVER_ONLY = new Set(["serve.mjs"]);

const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "script-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

// Variante D: puede incrustar SOLO las demos verificadas (lista cerrada, ver d-hybrid-experience/demos.js).
// El resto de la CSP es idéntica. No se relaja nada para A, B y C.
const D_DIR = "d-hybrid-experience/";
const D_FRAME_HOSTS = [
  "https://www.zatobox.io",
  "https://fabioproducciones.vercel.app",
  "https://dra.florenciabiaturi.com",
  "https://oli-bar.vercel.app",
];
const CSP_D = CSP.replace("default-src 'self'", `default-src 'self'; frame-src ${D_FRAME_HOSTS.join(" ")}`);

// Variante E (Z-AXIS): las mismas cuatro demos verificadas (ver e-z-axis/demos.js), misma lista cerrada y solo en su carpeta.
const E_DIR = "e-z-axis/";
const CSP_E = CSP_D;

/** Resuelve `rel` dentro de `base` o devuelve null (traversal, dotfiles, symlinks que escapan). */
async function safeResolve(base, rel) {
  let decoded;
  try {
    decoded = decodeURIComponent(rel);
  } catch {
    return null;
  }
  if (decoded.includes("\0") || decoded.includes("\\")) return null;
  const parts = decoded.split("/").filter(Boolean);
  if (parts.some((part) => part.startsWith(".") || part === "node_modules")) return null;
  const full = resolve(base, normalize(parts.join(sep)));
  if (full !== base && !full.startsWith(base + sep)) return null;
  try {
    const [realBase, realFull] = await Promise.all([realpath(base), realpath(full)]);
    if (realFull !== realBase && !realFull.startsWith(realBase + sep)) return null;
    return realFull;
  } catch {
    return null;
  }
}

async function sendFile(req, res, file, rel) {
  const ext = extname(file).toLowerCase();
  const type = MIME[ext];
  if (!type) return notFound(res);
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return notFound(res);
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": info.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": rel.startsWith(D_DIR) ? CSP_D : rel.startsWith(E_DIR) ? CSP_E : CSP,
    "Referrer-Policy": "no-referrer",
  });
  if (req.method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end("Not found");
}

/** Contenido real del portfolio, leído (sin copiar) de portfolio/src/data y portfolio/messages. */
async function buildContent() {
  const load = (name) => import(pathToFileURL(join(PORTFOLIO, "src", "data", name)).href);
  const [{ profile }, { links }, { companies }, { projects }, { technologies }] = await Promise.all([
    load("profile.ts"),
    load("links.ts"),
    load("companies.ts"),
    load("projects.ts"),
    load("technologies.ts"),
  ]);
  const messages = {};
  for (const lang of ["es", "en"]) {
    const all = JSON.parse(await readFile(join(PORTFOLIO, "messages", `${lang}.json`), "utf8"));
    messages[lang] = { Hero: all.Hero, Nav: all.Nav, Projects: all.Projects };
  }
  const company = Object.fromEntries(companies.map((c) => [c.id, c.name]));
  const tech = Object.fromEntries(technologies.map((t) => [t.id, t.name]));
  const showcase = projects
    .filter((p) => p.kind !== "bootcamp" && p.media?.length)
    .map((p) => ({
      id: p.id,
      kind: p.kind,
      name: p.name,
      company: p.companyId ? company[p.companyId] : null,
      summary: p.summary,
      techs: p.techIds.map((id) => tech[id]).filter(Boolean),
      deploy: p.links.deploy ?? null,
      media: p.media.map((m) => ({ src: `/assets${m.src}`, alt: m.alt, w: m.width, h: m.height })),
    }));
  return {
    name: profile.name,
    headline: profile.headline,
    valueProposition: profile.valueProposition,
    availability: profile.availability,
    links: {
      email: links.email,
      github: links.github,
      linkedin: links.linkedin,
      cv: { es: `/assets${links.cv.es}`, en: `/assets${links.cv.en}` },
    },
    projects: showcase,
    messages,
  };
}

/** Contenido completo (variante D): todos los proyectos, empresas, stack y textos. Solo lectura. */
async function buildFull() {
  const load = (name) => import(pathToFileURL(join(PORTFOLIO, "src", "data", name)).href);
  const [{ profile }, { links }, { companies }, { projects }, { technologies }] = await Promise.all([
    load("profile.ts"), load("links.ts"), load("companies.ts"), load("projects.ts"), load("technologies.ts"),
  ]);
  const messages = {};
  for (const lang of ["es", "en"]) {
    messages[lang] = JSON.parse(await readFile(join(PORTFOLIO, "messages", `${lang}.json`), "utf8"));
  }
  const techById = Object.fromEntries(technologies.map((t) => [t.id, t]));
  const order = ["frontend", "backend", "database", "devops", "tools"];
  return {
    name: profile.name,
    headline: profile.headline,
    valueProposition: profile.valueProposition,
    availability: profile.availability,
    about: profile.about,
    links: { ...links, cv: { es: `/assets${links.cv.es}`, en: `/assets${links.cv.en}` } },
    companies,
    stack: order.map((category) => ({
      category,
      items: technologies.filter((t) => t.inStack && t.category === category).map((t) => ({ id: t.id, name: t.name, brandColor: t.brandColor ?? null, url: t.url ?? null })),
    })),
    projects: projects.map((p) => ({
      id: p.id, kind: p.kind, companyId: p.companyId ?? null, name: p.name,
      summary: p.summary, problem: p.problem ?? null, contributions: p.contributions ?? null,
      featured: !!p.featured, inProduction: !!p.inProduction, stage: p.stage ?? null,
      techs: p.techIds.map((id) => techById[id]).filter(Boolean).map((t) => ({ id: t.id, name: t.name, category: t.category, brandColor: t.brandColor ?? null })),
      media: (p.media ?? []).map((m) => ({ src: `/assets${m.src}`, alt: m.alt, caption: m.caption ?? null, w: m.width, h: m.height, type: m.type })),
      links: p.links,
    })),
    messages,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (!ALLOWED_HOSTS.has(req.headers.host ?? "")) {
      res.writeHead(403).end("Forbidden host");
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const { pathname } = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

    if (pathname === "/api/content.json") {
      const body = JSON.stringify(await buildContent());
      res.writeHead(200, {
        "Content-Type": MIME[".json"],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      return res.end(req.method === "HEAD" ? undefined : body);
    }

    if (pathname === "/api/full.json") {
      const body = JSON.stringify(await buildFull());
      res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      return res.end(req.method === "HEAD" ? undefined : body);
    }

    if (pathname.startsWith("/assets/")) {
      const rel = pathname.slice("/assets/".length);
      if (!ASSET_RULES.some((rule) => rule.re.test(rel))) return notFound(res);
      const file = await safeResolve(PUBLIC, rel);
      return file ? sendFile(req, res, file, rel) : notFound(res);
    }

    let rel = pathname.replace(/^\/+/, "");
    if (rel === "" || rel.endsWith("/")) rel += "index.html";
    const ext = extname(rel).toLowerCase();
    if (!STATIC_EXT.has(ext) || SERVER_ONLY.has(rel)) return notFound(res);
    const file = await safeResolve(ROOT, rel);
    return file ? sendFile(req, res, file, rel) : notFound(res);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Prototipos JCoding → http://${HOST}:${PORT}/  (Ctrl+C para detener)`);
});
