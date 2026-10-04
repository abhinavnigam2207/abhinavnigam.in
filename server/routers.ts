import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { answerAbhinavQuestion } from "./_core/abhinavRag";

const assistantRequests = new Map<string, { startedAt: number; count: number }>();
const ASSISTANT_WINDOW_MS = 5 * 60 * 1000;
const ASSISTANT_REQUEST_LIMIT = 30;

function allowAssistantRequest(ip: string) {
  const now = Date.now();
  const current = assistantRequests.get(ip);
  if (!current || now - current.startedAt >= ASSISTANT_WINDOW_MS) {
    assistantRequests.set(ip, { startedAt: now, count: 1 });
    if (assistantRequests.size > 5000) {
      for (const [key, value] of assistantRequests) if (now - value.startedAt >= ASSISTANT_WINDOW_MS) assistantRequests.delete(key);
    }
    return true;
  }
  if (current.count >= ASSISTANT_REQUEST_LIMIT) return false;
  current.count += 1;
  return true;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    ask: publicProcedure
      .input(z.object({
        question: z.string().trim().min(2).max(700),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(10).default([]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Behind Netlify the socket address is the proxy, so read the visitor address from its header.
        const forwarded = ctx.req.headers["x-nf-client-connection-ip"] ?? ctx.req.headers["x-forwarded-for"];
        const clientIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim() || ctx.req.ip || "unknown";
        if (!allowAssistantRequest(clientIp)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a few minutes before asking another question." });
        }
        try {
          return await answerAbhinavQuestion(input.question, input.history);
        } catch (error) {
          const detail = error instanceof Error ? error.message : "";
          const upstreamStatus = detail.match(/LLM invoke failed:\s*(\d{3})/)?.[1] ?? null;
          const modelError = detail.match(/^LLM response error: ([a-z_]+)(?: \(([a-zA-Z0-9_.-]+)\))?(?: — (.*))?$/);
          const emptyCompletion = detail.startsWith("Assistant returned no completion text;") ? detail.slice("Assistant returned no completion text;".length).trim() : null;
          const category = upstreamStatus ? "upstream_http_error" : modelError ? "model_api_error" : detail.startsWith("Assistant returned no completion text") ? "empty_completion" : detail.startsWith("MANUS_API_URL") ? "missing_service_url" : detail.startsWith("MANUS_API_KEY") ? "missing_service_key" : "runtime_error";
          console.error("Ask Abhinav completion failed", JSON.stringify({ category, upstreamStatus, modelErrorCategory: modelError?.[1] ?? null, modelErrorCode: modelError?.[2] ?? null, modelErrorMessage: modelError?.[3]?.slice(0, 240) ?? null, emptyCompletion }));
          throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Ask Abhinav is temporarily unavailable. Please try again shortly." });
        }
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
