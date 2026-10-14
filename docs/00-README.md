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
| 2026-10-13 | Travel is "The Expedition Map": one antique chart that is the whole page. Real coastlines (Natural Earth, public domain) drawn in ink on canvas over CSS parchment; no image files, no borders, no map library at run time. Click an X to fly into the country, a city to fly in again and open its journal. Replaces the earlier dotted globe and scroll tour | Locked |
| 2026-10-14 | Travel is read in one of two eras, **1826** (parchment chart, red X, wax seals) or **2026** (dotted globe, flight paths, pins, passport). Same URLs, same content, same engine; only the paint differs. A door asks once, the choice is kept in the visitor's browser (`localStorage`, or `?era=`), and a switch flips it at any time with a circular reveal | Locked |
| 2026-10-14 | Each era opens on its own map (1826 flat, 2026 globe); a globe in either era turns slowly on its own, pausing only while held, while a mark is pointed at, or while zoomed in (it resumes after); either can be switched to the other projection (`?view=flat|globe`) | Locked |
| 2026-10-14 | Travel styles and the map engine are loaded by travel pages only: `public/travel/travel.css` is linked from `<head>` by the prerender (not rendered by React, which would discard it when the app replaces the pre-rendered markup), and the engine is a lazy chunk | Locked |
| 2026-10-14 | Globe land is clipped to the near side along the rim, with a correction when the far side is land; checked against the coastline data at 37 angles. Zoomed-in globe frames cost 3 to 5 ms on a desktop | Locked |
| 2026-10-14 | The era is applied before first paint: `/travel/era.js` (in `<head>` of travel pages, a file because the CSP allows only same-origin scripts) sets `<html data-era>`, and every era rule in `travel.css` keys off that attribute, never off anything React renders. Pages are pre-built in 2026; without this an 1826 visitor saw each page in 2026 for a moment. The same script marks a first visit so a stand-in for the door covers the page at once | Locked |
| 2026-10-14 | The 1826 typeface (IM Fell English, OFL) is served from the site and preloaded when the page will open in 1826; no Google Fonts request on travel pages. Page-to-page transition rules live in `travel.css` so they are known before the new page's first frame | Locked |
| 2026-10-14 | Phone: pinch to zoom and two-finger move, double tap to zoom, one row of controls, country panel as a bottom sheet with the map nudged up, back button top left, and the dive and stamp book on the browser history (`#jpn`) so back and swipe-back step out of them. The door half swells while pressed and fills the screen when chosen | Locked |
| 2026-10-14 | Map motion: page-ordered moves are one timed ease-in-out flight (zoom blended as a ratio); while anything moves the map draws a thinned coastline and one shoreline band, and full detail on the frame after it stops. Fine coastline is fetched after the opening animation and prepared in slices | Locked |
| 2026-10-14 | The visitor's stamps live in a stamp book with turning pages: a passport in 2026, a book of seals in 1826 | Locked |
| 2026-10-14 | The travel journal is Abhinav's and his wife's, written as "we"; photos and videos are to be added per place later (`Photo.src`, `Photo.video`) | Locked |
| 2026-10-14 | Nothing on a travel page is corrected after its first frame. Words that differ by era are both in the pre-built page and chosen by the stylesheet (`EraText`); controls that depend on the visitor (stamps, era, map or globe) stay hidden until the page knows them; the map draws nothing until its coastline has arrived, then fades in whole. The map page preloads the coastline and the map's code | Locked |
| 2026-10-14 | The map engine draws a frame as `advance` (camera and measurements) followed by one painter per layer: sea, land, sea names, routes, rim, compass, marks | Locked |
| 2026-10-14 | Travel has browser tests (`pnpm test:e2e`, Playwright, run against the built site at phone and desktop size) and screenshot tools in `.qa/` for before-and-after pixel comparison | Locked |
| 2026-10-14 | Speed: Inter and Poppins are self-hosted (@fontsource, latin) and preloaded, no Google Fonts request on the main site; the main and travel stylesheets are written into each pre-built page; logos and the photo are WebP at twice their shown size; the map door is part of the pre-built page; the know-me aurora runs in a worker (OffscreenCanvas) and is skipped where WebGL is software-rendered | Locked |
| 2026-10-14 | Travel countries and cities are Abhinav's real list (18 countries, 36 cities, his order; Scotland listed on its own as he gave it). Every country has a journal and every city a page, with placeholder words and photos; India places and the still-to-find list remain samples, so the travel pages stay noindex. A dive zooms to fit the country's cities (between 4.5 and 12; one-city countries 6.2) | Locked |
| 2026-10-13 | The 1826 era uses a parchment theme (`data-theme="parchment"`) and the IM Fell English face; the 2026 era uses the site's own tokens. Both light; the rest of the site is unchanged | Locked |
| 2026-10-13 | Visitors collect a stamp for each country they open; kept in their browser only (`localStorage`). A hidden chest on the map can be found | Locked |
| 2026-10-13 | Travel has three levels: globe (`/bucket-list`), country (`/bucket-list/<country>/`) and city (`/bucket-list/<country>/<city>/`). Country and city pages are two templates filled from `content/travels.ts` and prerendered from it; no page is hand-built. Japan with Tokyo, Kyoto and Osaka is the sample story | Locked |
| 2026-10-13 | Marks are interactive: drag to pan or turn, hover for a preview card, click to dive. The clicked photo morphs into the next page's cover with cross-document view transitions, enabled only on travel pages | Locked |
| 2026-10-13 | No stock or borrowed photos: a photo without a file renders as a labelled placeholder block | Locked |
| — | Bucket-list content: page runs on sample places (`travelsAreSample`), noindex until the client's real list replaces them | **Open, client to supply** |
| — | OG/social image hosted on own domain | **Open, asset needed** |
| — | Client sign-off on every metric and claim shown | **Open** |
| — | Client check of employer policy for Google metrics and the referral page | **Open** |

## Validation gates

- Netlify function fix is unverified until a deploy succeeds and `/api/health` returns 200.
- Ask answer quality is unverified until an LLM key is configured.
