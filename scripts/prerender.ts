import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { pageMeta } from "../client/src/content/pageMeta";
import { ideologies } from "../client/src/content/ideologies";
import { referralFaq } from "../client/src/content/referralFaq";
import { blogPosts, experiences, featuredWork, profile, skillGroups } from "../client/src/content/site";
import { stories, storyMeta, travelsAreSample } from "../client/src/content/travels";

const SITE = "https://abhinavnigam.in";
// The ask. and knowme. subdomains serve the same pages; the main-domain paths are the canonical, indexable URLs.
const ASK = `${SITE}/ask/`;
const KNOWME = `${SITE}/knowme/`;
const PERSON_ID = `${SITE}/#person`;
const today = new Date().toISOString().slice(0, 10);

type JsonLd = Record<string, unknown>;

const person: JsonLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  url: `${SITE}/`,
  image: `${SITE}/abhinav.jpg`,
  jobTitle: profile.role,
  description: pageMeta.home.description,
  worksFor: { "@type": "Organization", name: profile.company, url: "https://www.google.com" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Guru Gobind Singh Indraprastha University" },
  knowsAbout: skillGroups.flatMap(group => group.items),
  sameAs: [profile.linkedin, profile.github, profile.devto, profile.medium],
};

const breadcrumb = (name: string, url: string): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name, item: url },
  ],
});

type RoutePage = { path: string; file: string; meta: { title: string; description: string }; canonical: string; noindex?: boolean; jsonLd?: JsonLd[] };

// The travel pages have their own stylesheet and typeface. The links go in <head> of those pages only
// (see TravelFonts in client/src/pages/TravelStory.tsx).
const travelStylesheets = ["/travel/travel.css", "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap"];
const isTravel = (route: string) => route === "/experiences" || route === "/bucket-list" || route.startsWith("/bucket-list/");

const routePages: RoutePage[] = [
  {
    path: "/", file: "home", meta: pageMeta.home, canonical: `${SITE}/`,
    jsonLd: [
      { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, name: profile.name, url: `${SITE}/`, inLanguage: "en", publisher: { "@id": PERSON_ID } },
      { "@context": "https://schema.org", "@type": "ProfilePage", "@id": `${SITE}/#profile`, url: `${SITE}/`, name: pageMeta.home.title, dateModified: today, mainEntity: person },
    ],
  },
  {
    path: "/blog", file: "blog", meta: pageMeta.blog, canonical: `${SITE}/blog/`,
    jsonLd: [
      breadcrumb("Writing", `${SITE}/blog/`),
      {
        "@context": "https://schema.org", "@type": "Blog", name: pageMeta.blog.title, url: `${SITE}/blog/`, author: { "@id": PERSON_ID },
        blogPost: blogPosts.map(post => ({ "@type": "BlogPosting", headline: post.title, description: post.description, url: post.url, datePublished: new Date(`${post.date} UTC`).toISOString().slice(0, 10), author: { "@type": "Person", "@id": PERSON_ID, name: profile.name } })),
      },
    ],
  },
  { path: "/ideologies", file: "ideologies", meta: pageMeta.ideologies, canonical: `${SITE}/ideologies/`, jsonLd: [breadcrumb("Ideologies", `${SITE}/ideologies/`)] },
  // Kept out of search while the page shows sample places instead of Abhinav's own.
  { path: "/bucket-list", file: "bucket-list", meta: pageMeta.bucketList, canonical: `${SITE}/bucket-list/`, noindex: travelsAreSample, jsonLd: [breadcrumb("Bucket list", `${SITE}/bucket-list/`)] },
  // One page per travel story and per city in it, generated from the travel data.
  ...stories.flatMap((story): RoutePage[] => {
    const base = `/bucket-list/${story.slug}`;
    const crumbs = (name: string, url: string) => breadcrumb(name, url);
    return [
      { path: base, file: `travel-${story.slug}`, meta: storyMeta(story), canonical: `${SITE}${base}/`, noindex: travelsAreSample, jsonLd: [crumbs(story.name, `${SITE}${base}/`)] },
      ...story.cities.map((city): RoutePage => ({ path: `${base}/${city.slug}`, file: `travel-${story.slug}-${city.slug}`, meta: storyMeta(story, city), canonical: `${SITE}${base}/${city.slug}/`, noindex: travelsAreSample, jsonLd: [crumbs(`${city.name}, ${story.name}`, `${SITE}${base}/${city.slug}/`)] })),
    ];
  }),
  { path: "/experiences", file: "experiences", meta: pageMeta.bucketList, canonical: `${SITE}/bucket-list/`, noindex: true },
  {
    path: "/google-refer", file: "google-refer", meta: pageMeta.googleRefer, canonical: `${SITE}/google-refer/`,
    jsonLd: [
      breadcrumb("Google referral", `${SITE}/google-refer/`),
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: referralFaq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ],
  },
  { path: "/ask", file: "ask", meta: pageMeta.ask, canonical: ASK, jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: pageMeta.ask.title, url: ASK, description: pageMeta.ask.description, about: { "@id": PERSON_ID } }] },
  { path: "/knowme", file: "knowme", meta: pageMeta.knowMe, canonical: KNOWME, jsonLd: [{ "@context": "https://schema.org", "@type": "ProfilePage", name: pageMeta.knowMe.title, url: KNOWME, mainEntity: { "@id": PERSON_ID, "@type": "Person", name: profile.name, url: `${SITE}/`, sameAs: [profile.linkedin, profile.github, profile.devto, profile.medium] } }] },
  { path: "/ide", file: "ide", meta: pageMeta.ide, canonical: `${SITE}/ide/`, noindex: true },
  { path: "/__not_found__", file: "404", meta: pageMeta.notFound, canonical: `${SITE}/`, noindex: true },
];

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
// "<" must not appear raw inside a script element.
const jsonLdTag = (data: JsonLd) => `    <script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;

// Plain-text summaries for AI assistants and answer engines (llmstxt.org).
function llmsTxt(full: boolean) {
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${pageMeta.home.description}`,
    "",
    `${profile.name} is a ${profile.role} at ${profile.company} with ${profile.experience} of experience. This is his personal website. Facts here come from his CV and published articles.`,
    "",
    "## Pages",
    `- [Portfolio](${SITE}/): role, experience, selected work, skills and contact`,
    `- [Writing](${SITE}/blog/): articles on frontend architecture and JavaScript`,
    `- [Ideologies](${SITE}/ideologies/): his principles for engineering managers and senior engineers`,
    `- [Google referral](${SITE}/google-refer/): how to request a Google referral from Abhinav`,
    `- [Ask Abhinav](${ASK}): AI assistant that answers questions about his work`,
    `- [All links](${KNOWME}): profiles and contact`,
    "",
    "## Profiles",
    `- LinkedIn: ${profile.linkedin}`,
    `- GitHub: ${profile.github}`,
    `- DEV.to: ${profile.devto}`,
    `- Medium: ${profile.medium}`,
    `- Email: ${profile.email}`,
  ];
  if (full) {
    lines.push("", "## Experience");
    for (const item of experiences) {
      lines.push("", `### ${item.company} — ${item.role} (${item.dates})`, `${item.team}. ${item.summary}`, `Outcome: ${item.outcome}`, `Technologies: ${item.technologies.join(", ")}`);
      for (const group of item.details ?? []) lines.push("", `${group.title}:`, ...group.points.map(point => `- ${point}`));
    }
    lines.push("", "## Selected work");
    for (const item of featuredWork) lines.push("", `### ${item.title} (${item.period})`, item.description, `Result: ${item.result}`);
    lines.push("", "## Skills");
    for (const group of skillGroups) lines.push(`- ${group.label}: ${group.items.join(", ")}`);
    lines.push("", "## Education", "- B.Tech, Computer Science, Guru Gobind Singh Indraprastha University, 2009–2013");
    lines.push("", "## Articles");
    for (const post of blogPosts) lines.push("", `### [${post.title}](${post.url})`, `${post.date}. ${post.description}`);
    lines.push("", "## Ideologies");
    for (const group of ideologies) lines.push("", `### ${group.title}`, group.audience, "", ...group.points.map(([lead, body], index) => `${index + 1}. ${lead} ${body}`), "", group.closing);
    lines.push("", "## Google referral FAQ");
    for (const item of referralFaq) lines.push("", `### ${item.question}`, item.answer);
  } else {
    lines.push("", "## More", `- [Full profile in plain text](${SITE}/llms-full.txt)`);
  }
  return `${lines.join("\n")}\n`;
}

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
      const { title, description } = page.meta;
      let html = builtTemplate.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
      html = html.replace(/<meta name="description"[^>]*\/?\s*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta property="og:title"[^>]*\/?\s*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta property="og:description"[^>]*\/?\s*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
      html = html.replace(/<meta name="twitter:title"[^>]*\/?\s*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
      html = html.replace(/<meta name="twitter:description"[^>]*\/?\s*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
      const headTags = [
        `    <link rel="canonical" href="${page.canonical}" />`,
        `    <meta property="og:url" content="${page.canonical}" />`,
        `    <meta name="robots" content="${page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}" />`,
        ...(page.jsonLd ?? []).map(jsonLdTag),
        ...(isTravel(page.path) ? travelStylesheets.map(href => `    <link rel="stylesheet" href="${escapeHtml(href)}" />`) : []),
      ];
      html = html.replace("</head>", `${headTags.join("\n")}\n  </head>`);
      await writeFile(path.join(destination, `${page.file}.html`), html, "utf8");
      const staticFile = page.file === "404"
        ? path.resolve("dist/public/404.html")
        : page.path === "/"
          ? path.resolve("dist/public/index.html")
          : path.resolve("dist/public", page.path.slice(1), "index.html");
      await mkdir(path.dirname(staticFile), { recursive: true });
      await writeFile(staticFile, html, "utf8");
    }

    const indexable = routePages.filter(page => !page.noindex);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(page => `  <url><loc>${page.canonical}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`;
    await writeFile(path.resolve("dist/public/sitemap.xml"), sitemap, "utf8");
    await writeFile(path.resolve("dist/public/llms.txt"), llmsTxt(false), "utf8");
    await writeFile(path.resolve("dist/public/llms-full.txt"), llmsTxt(true), "utf8");

    console.log(`Prerendered ${routePages.length - 1} routes and a 404 page; wrote sitemap.xml (${indexable.length} URLs), llms.txt and llms-full.txt`);
  } finally {
    await vite.close();
  }
}

// Exit explicitly: something loaded during SSR keeps the event loop alive, which would hang `pnpm build`.
main().then(() => process.exit(0)).catch(error => {
  console.error("Route prerender failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
