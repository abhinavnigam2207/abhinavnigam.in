import "dotenv/config";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
import { createServer } from "http";
import path from "node:path";
import { createApiApp } from "./apiApp";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = createApiApp();
  const server = createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    const pageFiles: Record<string, string> = {
      "/": "home",
      "/blog": "blog",
      "/ideologies": "ideologies",
      "/experiences": "experiences",
      "/bucket-list": "bucket-list",
      "/google-refer": "google-refer",
      "/ask": "ask",
      "/knowme": "knowme",
    };
    app.get(Object.keys(pageFiles), (req, res, next) => {
      let page = pageFiles[req.path];
      const host = req.hostname.toLowerCase();
      if (req.path === "/" && req.query.site !== "main" && host === "ask.abhinavnigam.in") page = "ask";
      if (req.path === "/" && req.query.site !== "main" && host === "knowme.abhinavnigam.in") page = "knowme";
      const file = page && path.resolve(process.cwd(), "dist", "prerender", `${page}.html`);
      if (!file) return next();
      res.set("Cache-Control", "public, max-age=0, must-revalidate").sendFile(file, error => { if (error) next(error); });
    });
    serveStatic(app, { fallbackToIndex: false });
    app.use("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return res.set("Cache-Control", "no-store").status(404).json({ error: "Not found" });
      const notFoundFile = path.resolve(process.cwd(), "dist", "prerender", "404.html");
      res.status(404).set("Cache-Control", "public, max-age=0, must-revalidate").sendFile(notFoundFile, error => { if (error) next(error); });
    });
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
