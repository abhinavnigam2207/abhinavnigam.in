# Abhinav Nigam Portfolio — Spec Index

Docs are the source of truth. Scope changes edit these first, then code.

| # | Doc | Status |
|---|-----|--------|
| 1 | [PRD](01-PRD.md) | Locked for phase 1 |
| 2 | [TRD](02-TRD.md) | Locked for phase 1, open items listed |
| 3 | [App Flow](03-APP-FLOW.md) | Locked for phase 1 |
| 4 | [UI/UX Brief](04-UI-UX-BRIEF.md) | Locked |
| 5 | [Backend Schema](05-BACKEND-SCHEMA.md) | Draft, blocked on open decisions |
| 6 | [Implementation Plan](06-IMPLEMENTATION-PLAN.md) | Phase 1 in progress |

## Decisions log

| Date | Decision | State |
|------|----------|-------|
| 2026-10-05 | Main shell is a minimal editorial site, not the VS Code IDE clone | Locked |
| 2026-10-05 | IDE shell kept at `/ide`, lazy-loaded, linked only from the footer | Locked (default taken, client can ask to remove) |
| 2026-10-05 | ~~Fonts: Instrument Serif, Geist, Geist Mono~~ — rejected as too generic | Superseded |
| 2026-10-05 | ~~Light and dark follow the OS setting~~ — client wants light only | Superseded |
| 2026-10-05 | Design system follows reinostudio.com.br, reimagined in light (see UI/UX Brief) | Locked |
| 2026-10-05 | Light theme only on the main site. No dark mode, no theme switch | Locked |
| 2026-10-05 | Fonts: Poppins (display), Inter (text) | Locked |
| 2026-10-05 | Header is brand plus a Menu button that opens a full-screen menu | Locked |
| 2026-10-05 | Public content comes only from `client/src/content/site.ts`, which mirrors the CV | Locked |
| 2026-10-05 | Phone number is not shown publicly | Locked (default taken) |
| 2026-10-11 | Referral destination: the client's Google Sheet, with resumes in his Drive, written by an Apps Script web app attached to the sheet. Setup in `docs/referral-sheet/README.md` | Locked |
| 2026-10-11 | Resume limit 4 MB (was 5): the file travels base64 inside a Netlify function request, capped at 6 MB | Locked |
| 2026-10-05 | Ask runs on Groq, model `openai/gpt-oss-120b`, key in `GROQ_API_KEY` (local `.env`, Netlify env var in production) | Locked |
| 2026-10-05 | Ask sends every source when keyword retrieval finds nothing, and lists only the sources the answer cites | Locked |
| 2026-10-11 | Everything Ask knows lives in one editable file, `shared/knowledge.md`; `pnpm knowledge` (also the first build step) generates `shared/knowledge.generated.ts` from it | Locked |
| 2026-10-11 | Ask refuses with one of 30 prepared lines (in `shared/knowledge.md`), chosen by the server, not with text the model writes | Locked |
| 2026-10-11 | Ideologies page holds the client's 20 principles (manager, senior engineer); Observe.ai and Rapido rows on Home get a fold-out with full detail; both feed the Ask knowledge set | Locked |
| 2026-10-13 | Bucket list is a scroll-driven travel page: dotted globe and maps drawn on canvas from generated land grids, no map library or tiles at run time, no borders drawn. Four tour styles (globe, map, passport, flight log) sit behind a temporary switcher for the client to choose from | Locked (style choice open) |
| 2026-10-13 | Travel has three levels: globe (`/bucket-list`), country (`/bucket-list/<country>/`) and city (`/bucket-list/<country>/<city>/`). Country and city pages are two templates filled from `content/travels.ts` and prerendered from it; no page is hand-built. Japan with Tokyo, Kyoto and Osaka is the sample story | Locked |
| 2026-10-13 | Globe pins are interactive: drag to spin, hover for a preview card, click to open the story; on touch the first tap shows the card and the card is the link. The clicked photo morphs into the next page's cover with cross-document view transitions, enabled only on travel pages | Locked |
| 2026-10-13 | No stock or borrowed photos: a photo without a file renders as a labelled placeholder block | Locked |
| — | Bucket-list content: page runs on sample places (`travelsAreSample`), noindex until the client's real list replaces them | **Open, client to supply** |
| — | OG/social image hosted on own domain | **Open, asset needed** |
| — | Client sign-off on every metric and claim shown | **Open** |
| — | Client check of employer policy for Google metrics and the referral page | **Open** |

## Validation gates

- Netlify function fix is unverified until a deploy succeeds and `/api/health` returns 200.
- Ask answer quality is unverified until an LLM key is configured.
