#!/usr/bin/env node
/* Tiny static server for local preview:  node serve.js [port] */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 4321;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2"
};

http
  .createServer((req, res) => {
    // Reject anything that isn't a read. A static server has no business
    // answering POST — and answering 200 to one made the booking form's
    // "did the submission land?" check report success locally when nothing
    // had been recorded anywhere. Netlify Forms only exists on the real host.
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain" })
         .end("405 — this local preview server only serves files.\n" +
              "Form submissions are handled by Netlify Forms once deployed.");
      return;
    }

    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));

    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found: " + rel);
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      res.end(data);
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
  });
