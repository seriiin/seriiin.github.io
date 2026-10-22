import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf"
};

const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const filename = path.resolve(root, relative);
    const isPublic = ["index.html", "styles.css", "main.js"].includes(relative) || relative.startsWith("assets/");
    if (!isPublic || !filename.startsWith(root) || relative.includes("\\") || !mimeTypes[path.extname(filename)]) {
      response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const body = await readFile(filename);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filename)],
      "Content-Length": body.length,
      "Cache-Control": "no-cache"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
});
server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? `Port ${port} is in use. Choose another PORT.` : error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
