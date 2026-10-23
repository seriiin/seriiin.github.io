import http from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
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
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
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
    const file = await stat(filename);
    if (!file.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const headers = {
      "Content-Type": mimeTypes[path.extname(filename)],
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache"
    };
    let start = 0;
    let end = file.size - 1;
    let status = 200;
    if (request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      const rejectRange = () => response.writeHead(416, {
        ...headers, "Content-Range": `bytes */${file.size}`, "Content-Length": 0
      }).end();
      if (!range || (!range[1] && !range[2]) || !file.size) {
        rejectRange();
        return;
      }
      const first = Number(range[1]);
      const last = Number(range[2]);
      if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) {
        rejectRange();
        return;
      }
      if (!range[1]) {
        start = Math.max(0, file.size - last);
      } else {
        start = first;
        if (range[2]) end = Math.min(last, end);
      }
      if (start > end || start >= file.size) {
        rejectRange();
        return;
      }
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${file.size}`;
    }
    headers["Content-Length"] = file.size ? end - start + 1 : 0;
    response.writeHead(status, headers);
    if (request.method === "HEAD" || !file.size) {
      response.end();
      return;
    }
    const stream = createReadStream(filename, { start, end });
    stream.on("error", () => response.destroy());
    response.on("close", () => stream.destroy());
    stream.pipe(response);
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
