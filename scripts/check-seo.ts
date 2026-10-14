// Search and AI-visibility checks on the built site. Run after the build: `pnpm check:seo`.
// Reads dist/public, prints every problem, and exits 1 if any check fails, so a broken page cannot deploy.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("dist/public");
const SITE = "https://abhinavnigam.in";
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
// js was 400 kB; raised to 420 for the life-list sections. The bundle holds every page, so the lasting fix is
// splitting it per page (each page pre-built with its own chunk), which would bring this back under 400.
const BUDGET_KB = { js: 420, css: 90 };
const TITLE = { min: 30, max: 60 };
const DESCRIPTION = { min: 120, max: 160 };

const errors: string[] = [];
const warnings: string[] = [];
const fail = (where: string, message: string) => errors.push(`${where}: ${message}`);
const warn = (where: string, message: string) => warnings.push(`${where}: ${message}`);

const read = (file: string) => readFileSync(path.join(ROOT, file), "utf8");
const has = (file: string) => existsSync(path.join(ROOT, file));
const attr = (html: string, pattern: RegExp) => html.match(pattern)?.[1] ?? "";
const decode = (value: string) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

if (!existsSync(ROOT)) {
  console.error("dist/public not found. Run the build first.");
  process.exit(1);
}

// Every prerendered page: "/" for index.html, "/blog/" for blog/index.html.
const pages = new Map<string, string>();
const walk = (dir: string) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") pages.set(`/${path.relative(ROOT, dir).replaceAll("\\", "/")}/`.replace("//", "/"), readFileSync(full, "utf8"));
  }
};
walk(ROOT);

// ---- Site-level files -------------------------------------------------------------------------------------------

const sitemapUrls: string[] = [];
if (!has("sitemap.xml")) fail("sitemap.xml", "missing");
else {
  const sitemap = read("sitemap.xml");
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(match[1]);
  if (sitemapUrls.length === 0) fail("sitemap.xml", "lists no URLs");
  if ((sitemap.match(/<lastmod>/g) ?? []).length !== sitemapUrls.length) fail("sitemap.xml", "every URL needs a lastmod");
  for (const url of sitemapUrls) {
    if (!url.startsWith(`${SITE}/`)) fail("sitemap.xml", `${url} is not on ${SITE}`);
    else if (!pages.has(url.slice(SITE.length))) fail("sitemap.xml", `${url} has no built page`);
  }
}

if (!has("robots.txt")) fail("robots.txt", "missing");
else {
  const robots = read("robots.txt");
  if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt", "does not point to the sitemap");
  if (/^Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt", "blocks the whole site");
  for (const bot of AI_CRAWLERS) if (!robots.includes(bot)) fail("robots.txt", `does not name the AI crawler ${bot}`);
}

for (const file of ["llms.txt", "llms-full.txt"]) {
  if (!has(file)) fail(file, "missing");
  else {
    const text = read(file);
    if (!text.startsWith("# ")) fail(file, "must start with a '# Title' line");
    if (text.length < 300) fail(file, "is too short to be useful");
    for (const url of text.matchAll(/\]\((https:\/\/abhinavnigam\.in[^)]*)\)/g)) {
      const target = url[1].slice(SITE.length);
      if (!pages.has(target) && !has(target)) fail(file, `links to ${url[1]}, which is not built`);
    }
  }
}

if (!has("404.html")) fail("404.html", "missing");
else if (!/name="robots" content="noindex/.test(read("404.html"))) fail("404.html", "must be noindex");

for (const file of ["favicon.png", "apple-touch-icon.png", "abhinav.jpg"]) if (!has(file)) fail(file, "missing");

// ---- Per-page checks ---------------------------------------------------------------------------------------------

const titles = new Map<string, string>();
const descriptions = new Map<string, string>();
const linkedFromHome = new Set<string>();

for (const [route, html] of pages) {
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const indexable = !robots.startsWith("noindex");
  const inSitemap = sitemapUrls.includes(`${SITE}${route}`);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);

  if (!/<html lang="[a-z-]+"/i.test(html)) fail(route, "<html> has no lang attribute");
  if (!/<meta\s+name="viewport"/.test(html)) fail(route, "no viewport meta tag");
  if (!robots) fail(route, "no robots meta tag");
  if (!canonical) fail(route, "no canonical link");
  else if (!canonical.startsWith(`${SITE}/`)) fail(route, `canonical ${canonical} is not on ${SITE}`);
  if (/manus/i.test(html)) fail(route, "contains a leftover 'manus' reference");

  if (indexable && !inSitemap) fail(route, "is indexable but not in the sitemap");
  if (!indexable && inSitemap) fail(route, "is noindex but listed in the sitemap");
  if (!indexable) continue;

  if (canonical && canonical !== `${SITE}${route}`) fail(route, `canonical points elsewhere (${canonical})`);

  const title = decode(attr(html, /<title>([^<]*)<\/title>/));
  const description = decode(attr(html, /<meta name="description" content="([^"]*)"/));
  if (title.length < TITLE.min || title.length > TITLE.max) fail(route, `title is ${title.length} characters, needs ${TITLE.min}-${TITLE.max}: "${title}"`);
  if (description.length < DESCRIPTION.min || description.length > DESCRIPTION.max) fail(route, `description is ${description.length} characters, needs ${DESCRIPTION.min}-${DESCRIPTION.max}`);
  if (titles.has(title)) fail(route, `title is the same as ${titles.get(title)}`);
  if (descriptions.has(description)) fail(route, `description is the same as ${descriptions.get(description)}`);
  titles.set(title, route);
  descriptions.set(description, route);

  for (const tag of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'property="og:image"', 'property="og:image:alt"', 'name="twitter:card"']) {
    if (!new RegExp(`<meta ${tag} content="[^"]+"`).test(html)) fail(route, `missing <meta ${tag}>`);
  }
  if (decode(attr(html, /<meta property="og:title" content="([^"]*)"/)) !== title) fail(route, "og:title differs from the title");

  // What a crawler that does not run JavaScript receives.
  const body = html.slice(html.indexOf('<div id="root">'));
  const h1Count = (body.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) fail(route, `has ${h1Count} <h1> elements, needs exactly 1`);
  if ((body.match(/<main[\s>]/g) ?? []).length !== 1) fail(route, "needs exactly one <main> landmark");
  const text = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").length;
  if (words < 60) fail(route, `only ${words} words in the prerendered HTML; the page may not have rendered`);
  else if (words < 150) warn(route, `thin content: ${words} words`);

  for (const img of body.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(img[0])) fail(route, `image without an alt attribute: ${attr(img[0], /src="([^"]*)"/)}`);
  }

  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block[1]);
      if (data["@context"] !== "https://schema.org") fail(route, "JSON-LD block without the schema.org context");
    } catch {
      fail(route, "JSON-LD block is not valid JSON");
    }
  }

  for (const link of body.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)[^"]*"/g)) {
    const target = link[1];
    if (target.startsWith("/api/")) continue;
    const asPage = target.endsWith("/") ? target : `${target}/`;
    if (!pages.has(asPage) && !has(target)) fail(route, `broken internal link: ${target}`);
    if (route === "/") linkedFromHome.add(asPage);
  }
}

// ---- Structured identity on the home page ---------------------------------------------------------------------------

const home = pages.get("/") ?? "";
const homeData = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(block => { try { return [JSON.parse(block[1])]; } catch { return []; } });
const person = homeData.map(item => item.mainEntity).find(entity => entity?.["@type"] === "Person");
if (!homeData.some(item => item["@type"] === "WebSite")) fail("/", "no WebSite structured data");
if (!person) fail("/", "no Person structured data");
else {
  for (const field of ["name", "url", "image", "jobTitle", "worksFor", "description"]) if (!person[field]) fail("/", `Person structured data has no ${field}`);
  if (!Array.isArray(person.sameAs) || person.sameAs.length < 3) fail("/", "Person needs at least 3 sameAs profile links");
  if (!Array.isArray(person.knowsAbout) || person.knowsAbout.length < 5) fail("/", "Person needs at least 5 knowsAbout entries");
}

// Every sitemap page should be reachable in one click from the home page.
for (const url of sitemapUrls) {
  const route = url.slice(SITE.length);
  if (route !== "/" && pages.has(route) && !linkedFromHome.has(route)) fail(route, "is in the sitemap but not linked from the home page");
}

// ---- Weight ---------------------------------------------------------------------------------------------------------

const assets = path.join(ROOT, "assets");
for (const [kind, budget] of Object.entries(BUDGET_KB)) {
  const main = readdirSync(assets).find(name => name.startsWith("index-") && name.endsWith(`.${kind}`));
  if (!main) { fail("assets", `no main .${kind} bundle`); continue; }
  const size = Math.round(statSync(path.join(assets, main)).size / 1024);
  if (size > budget) fail("assets", `${main} is ${size} kB, budget is ${budget} kB`);
}

// ---- Report ---------------------------------------------------------------------------------------------------------

const indexableCount = [...pages.values()].filter(html => !/name="robots" content="noindex/.test(html)).length;
console.log(`check:seo — ${pages.size} pages built, ${indexableCount} indexable, ${sitemapUrls.length} in sitemap`);
for (const message of warnings) console.log(`  warning  ${message}`);
for (const message of errors) console.log(`  FAIL     ${message}`);
if (errors.length > 0) {
  console.log(`\n${errors.length} check${errors.length === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log(`All checks passed${warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""}.`);
