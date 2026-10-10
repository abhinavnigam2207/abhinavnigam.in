import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { referralsReady, submitReferral } from "./referrals";

export function createApiApp(): Express {
  const app = express();

  app.use((req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-store");
    }
    next();
  });
  // The referral request carries the resume as base64, so it alone gets a larger body limit.
  app.use("/api/referrals", express.json({ limit: "6mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/referrals/status", (_req, res) => {
    res.json({ ready: referralsReady(), message: "" });
  });
  app.post("/api/referrals", async (req, res) => {
    // Behind Netlify the socket address is the proxy, so read the visitor address from its header.
    const forwarded = req.headers["x-nf-client-connection-ip"] ?? req.headers["x-forwarded-for"];
    const clientIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim() || req.ip || "unknown";
    const result = await submitReferral(req.body, clientIp);
    res.status(result.status).json(result.body);
  });

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
