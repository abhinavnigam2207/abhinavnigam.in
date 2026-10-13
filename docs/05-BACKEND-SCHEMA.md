# 05 — Backend Schema

Draft. Phase 1 changes no backend behaviour.

## Entities

No database. Two data stores:

### Referral row (Google Sheet, first tab)

| Column | Type | Notes |
|--------|------|-------|
| Submitted at | date and time | Set by the script, spreadsheet time zone |
| name | text | Required |
| email | text | Required |
| phone | text | Optional |
| Current company | text | From dropdown |
| previous_companies | text | Comma-separated |
| job_link | URL | Required |
| resume_url | URL | Link to the stored file |
| Status | text | `New` by default, edited by Abhinav |

Resume file: PDF, DOC, or DOCX up to 4 MB, stored in the private Drive folder "Google referral resumes". Script and setup: `docs/referral-sheet/`.

### Travel content (`client/src/content/travels.ts`)

No backend. `countries` and `indiaPlaces` are `Place { name, spot, code, lon, lat, note, story? }`; `story` is the slug of a country page. `stories` holds `Story { slug, code, name, lon, lat, tagline, intro, cover, facts[], cities[] }` and `City { slug, name, lon, lat, tagline, intro, cover, photos[], highlights[], facts[] }`. `Photo { caption, tone, src?, tall? }`: without `src` it renders as a placeholder. `travelsAreSample` keeps every travel page `noindex` and out of the sitemap. Photo files, when supplied, go under `client/public/travel/<country>/`.

### Ask knowledge (`shared/knowledge.md`)

One Markdown file is the source of truth. Under `# Knowledge`, each `##` heading is a source with `- id`, `- url`, `- category` (`CV`, `Article` or `Site`), optional `- date`, then its text. Under `# Off-topic replies`, a bullet list of the 30 prepared refusal lines. `scripts/build-knowledge.ts` validates it and writes `shared/knowledge.generated.ts`; a test fails if the two are out of step or if a principle on the Ideologies page is missing from the file. Holds CV summaries, detailed Observe.ai and Rapido entries, articles, site pages and the ideologies. Every source goes into each prompt; retrieval sets the order.

## API contracts

| Method | Path | Now | Target |
|--------|------|-----|--------|
| GET | `/api/health` | `{ status: "ok" }` | same |
| GET | `/api/referrals/status` | `{ ready, message }`; `ready` is true when both referral env vars are set | same |
| POST | `/api/referrals` | JSON `{ name, email, phone, currentCompany, previousCompanies[], jobLink, consent, website, resume: { name, data(base64) } }` → `{ ok: true }`, or `{ error }` with 400 (invalid), 429 (rate limit), 502 (sheet script failed), 503 (not configured) | same |
| POST | `/api/trpc/assistant.ask` | `{ answer, sources[] }`, 12 requests per 5 minutes per IP in memory | same shape, durable rate limit |

## Auth

None for visitors. The spreadsheet and file folder are private to Abhinav. Server credentials live in Netlify environment variables.

## Abuse controls (target)

- Referral (built): honeypot field, 5 submissions per hour per IP in memory, 4 MB limit, extension and file-signature check server-side, shared secret between server and script, leading `= + - @` neutralised before writing to the sheet.
- Ask: durable per-IP limit and a monthly spend cap.
