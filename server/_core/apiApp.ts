import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";

export function createApiApp(): Express {
  const app = express();

  app.use((req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-store");
    }
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.get("/api/referrals/status", (_req, res) => {
    res.set("Cache-Control", "no-store").json({
      ready: false,
      message: "Microsoft Excel / OneDrive authorization is not configured; no referral details or resumes are being collected.",
    });
  });
  app.post("/api/referrals", (_req, res) => {
    res.set("Cache-Control", "no-store").status(503).json({
      error: "Referral submissions are disabled until an authorized Microsoft Excel / OneDrive destination is configured.",
    });
  });

  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    (_req, res, next) => {
      res.set("Cache-Control", "no-store");
      next();
    },
    createExpressMiddleware({ router: appRouter, createContext }),
  );
  app.use("/api", (_req, res) => res.set("Cache-Control", "no-store").status(404).json({ error: "Not found" }));

  return app;
}
