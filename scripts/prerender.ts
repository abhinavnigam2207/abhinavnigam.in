import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const routePages = [
  { path: "/", file: "home", title: "Abhinav Nigam — Senior Software Engineer", description: "Abhinav Nigam is a Senior Software Engineer at Google with 12+ years of experience building web products, platforms, and reliable engineering teams." },
  { path: "/blog", file: "blog", title: "Writing — Abhinav Nigam", description: "Articles by Abhinav Nigam on JavaScript, developer tools, and frontend architecture." },
  { path: "/ideologies", file: "ideologies", title: "Ideologies — Abhinav Nigam", description: "A growing list of Abhinav Nigam's principles and ideas." },
  { path: "/experiences", file: "experiences", title: "Experiences — Abhinav Nigam", description: "A list of experiences Abhinav Nigam has completed." },
  { path: "/bucket-list", file: "bucket-list", title: "Bucket list — Abhinav Nigam", description: "A list of memorable experiences Abhinav Nigam has completed." },
  { path: "/google-refer", file: "google-refer", title: "Google Referral — Abhinav Nigam", description: "Share a role and resume with Abhinav Nigam for a potential Google referral." },
  { path: "/ask", file: "ask", title: "Ask Abhinav", description: "Ask about Abhinav Nigam's experience, skills, and writing, with answers grounded in cited sources." },
  { path: "/knowme", file: "knowme", title: "Know Me — Abhinav Nigam", description: "The links and profiles of Abhinav Nigam." },
  { path: "/__not_found__", file: "404", title: "404 — Page not found", description: "The requested page could not be found. Return to Abhinav Nigam's portfolio.", noindex: true },
];

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

async function main() {
  const vite = await createServer({
    configFile: path.resolve("vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });
  try {
    const [{ default: App }, trpcModule] = await Promise.all([
      vite.ssrLoadModule("/src/App.tsx"),
      vite.ssrLoadModule("/src/lib/trpc.ts"),
    ]);
    const { trpc } = trpcModule as { trpc: { Provider: unknown; createClient: (options: unknown) => unknown } };
    const builtTemplate = await readFile(path.resolve("dist/public/index.html"), "utf8");
    if (!builtTemplate.includes('<div id="root"></div>')) throw new Error("Built HTML root marker is missing");
    const destination = path.resolve("dist/prerender");
    await mkdir(destination, { recursive: true });

    for (const page of routePages) {
      const queryClient = new QueryClient();
      const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "http://localhost/api/trpc", transformer: superjson })] });
      const app = createElement(
        trpc.Provider as Parameters<typeof createElement>[0],
        { client: trpcClient, queryClient } as never,
        createElement(QueryClientProvider, { client: queryClient }, createElement(App as ComponentType<{ ssrPath?: string }>, { ssrPath: page.path })),
      );
      const markup = renderToString(app);
      let html = builtTemplate.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
      html = html.replace(/<meta name="description"[^>]*\/?\s*>/, `<meta name="description" content="${escapeHtml(page.description)}" />`);
      html = html.replace(/<meta property="og:title"[^>]*\/?\s*>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`);
      html = html.replace(/<meta property="og:description"[^>]*\/?\s*>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);
      html = html.replace(/<meta name="twitter:title"[^>]*\/?\s*>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`);
      html = html.replace(/<meta name="twitter:description"[^>]*\/?\s*>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
      if (page.noindex) html = html.replace("</head>", "    <meta name=\"robots\" content=\"noindex\" />\n  </head>");
      await writeFile(path.join(destination, `${page.file}.html`), html, "utf8");
      const staticFile = page.file === "404"
        ? path.resolve("dist/public/404.html")
        : page.path === "/"
          ? path.resolve("dist/public/index.html")
          : path.resolve("dist/public", page.path.slice(1), "index.html");
      await mkdir(path.dirname(staticFile), { recursive: true });
      await writeFile(staticFile, html, "utf8");
    }
    console.log(`Prerendered ${routePages.length - 1} public routes and one noindex 404 page for the container and Netlify static output`);
  } finally {
    await vite.close();
  }
}

main().catch(error => {
  console.error("Route prerender failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
