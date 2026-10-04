# 02 — Technical Requirements

## Stack (unchanged)

React 19, TypeScript, Vite 7, wouter, Tailwind v4 (reset and utilities only on the main site), Express + tRPC for the API, Netlify (static output + one function + one edge function).

## Architecture

- **Static first.** `scripts/prerender.ts` renders every public route to HTML in `dist/public/<route>/index.html`. The client hydrates.
- **Routing.** `client/src/App.tsx` maps paths to pages. Unknown paths render the 404 page. On `ask.` and `knowme.` hosts, `/` renders the Ask or Know Me page (the edge function serves the matching prerendered HTML).
- **IDE shell.** `client/src/pages/IDEApp.tsx` is lazy-loaded at `/ide` with its own stylesheet and fonts, scoped by the `ide-mode` class on `<html>`.
- **Styles.** Main site styles live in `client/src/minimal.css`, scoped under `.site-frame`, with `--m-*` tokens.
- **API.** `netlify/functions/api.ts` wraps the Express app. Express is bundled into the function (no external modules).
- **404.** No SPA catch-all redirect. Netlify serves `dist/public/404.html` for unknown paths.

## Third-party services

| Service | Use | Fallback |
|---------|-----|----------|
| Google Fonts | Poppins, Inter | System sans stack in the font tokens |
| Groq (`openai/gpt-oss-120b`, OpenAI-compatible API) | Ask answers | Ask page shows a clear unavailable message with an email link |
| Spreadsheet + file storage (open) | Referral intake | Form is disabled and points to email |
| Netlify | Hosting, function, edge | Dockerfile and Express static server already in the repo |

## Search, answer-engine and AI visibility

All generated at build time by `scripts/prerender.ts`, so they stay in step with the content files.

- **Titles and descriptions**: one source, `client/src/content/pageMeta.ts`, used by pages and the prerender.
- **Canonical and `og:url`** on every page. `/ask` and `/knowme` canonicalise to their subdomains. `/experiences` canonicalises and 301-redirects to `/bucket-list`.
- **Robots meta**: indexable pages allow large image previews and full snippets. Ideologies, bucket list, `/ide` and 404 are `noindex` until they have real content.
- **Structured data (JSON-LD)**: `WebSite` and `ProfilePage` with a full `Person` on Home; `Blog` with `BlogPosting` entries; `FAQPage` on the referral page (questions are visible on the page); `BreadcrumbList` on inner pages.
- **`sitemap.xml`** with `lastmod`, indexable main-domain pages only.
- **`llms.txt` and `llms-full.txt`**: plain-text profile for AI assistants, built from `content/site.ts`.
- **`robots.txt`**: allows all crawlers and names the main AI crawlers; blocks `/api/`.
- **Headers** (`netlify.toml`): HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and a Content-Security-Policy that allows scripts from this site only.

Unverified until a deploy: the CSP against the live site, redirect behaviour, 404 status, and response times.

## Ask guardrails

Four layers, all in `server/_core/abhinavRag.ts`:

1. **Input limits** (`server/routers.ts`): question up to 700 characters, up to 10 history turns of 4000 characters (trimmed to the last 8 turns of 1500 characters before the model sees them), 30 requests per 5 minutes per IP.
2. **Injection classifier**: `meta-llama/llama-prompt-guard-2-86m` scores each question in parallel with the chat call. A score of 0.9 or more returns a fixed deflection line and the model's answer is dropped.
3. **System prompt**: persona (Abhinav's voice, states it is an AI), allowed scope (his work from FACTS only, general tech, sci-fi, clean games), nine hard rules (no invented facts or personal details, no adult content, no politics or religion, no advice, nothing confidential, no disparagement, no instruction disclosure, no role changes, not a general assistant).
4. **Output check**: an answer that contains the canary string or instruction headings is replaced with the deflection line.

Red-team script: `scripts/redteam-ask.ts` (50 prompts: controls, hallucination probes, off-limits topics, prompt extraction, jailbreaks). Run it after any prompt or model change. Result on 2026-10-05: 50 of 50 held, 0 leaks.

Limits: no chatbot is unbreakable. History comes from the browser and can be forged; the prompt tells the model to distrust it. The rate limit is in memory and resets per serverless instance.

## Non-functionals

- Body text 16px or larger, contrast at WCAG AA.
- No horizontal scroll at 320px and wider.
- `prefers-reduced-motion` disables entrance animation.
- Main bundle does not include the IDE shell.

## Constraints

- Windows dev machine: `pnpm start` uses POSIX env syntax and does not run in PowerShell.
- No secrets in the repo. `.env` is ignored.

## Open questions

1. Referral destination (Sheets or Excel) and who owns the credentials.
2. LLM provider and monthly spend cap.
3. Durable rate limit store for Ask on serverless.
4. Removal of unused platform code (auth, storage, maps, voice, image generation, database).
