# 06 — Implementation Plan

## Phase 1 — Minimal site and working routes (this change)

| Task | Verify |
|------|--------|
| Route every brief path to its page, add 404, move IDE to `/ide` | Each path shows its own page locally |
| Scope IDE styles and fonts to `/ide` | Home has no IDE fonts or overflow lock |
| New editorial styles (`minimal.css`) and fonts | Screenshots at desktop, 375px, dark |
| Rework Home, header, footer | Matches App Flow section order |
| Ask page in a search-style layout | Suggestions and input render, error state reads well |
| Referral form: correct company dropdowns, neutral "not open yet" state | Form validates, submit disabled |
| Remove SPA catch-all, bundle Express in the function | **Unverified until deploy** |
| `robots.txt`, `sitemap.xml` | Files served |
| Prerender `/ide` | `pnpm build` steps pass |

## Phase 2 — Referral backend (blocked: destination decision)

1. Server: multipart upload, validation, file store, row append.
2. Bot check and confirmation email.
3. Tests for validation and the happy path with a mocked destination.

## Phase 3 — Ask

1. Direct LLM provider key, remove the Manus proxy.
2. Grow the knowledge set (full CV, articles, ideologies, FAQ).
3. Durable rate limit, spend cap, streaming, log of unanswered questions.
4. Small evaluation set of 20 questions with expected facts.

## Phase 4 — Content and polish

1. Blog posts on-site as Markdown with canonical links to DEV.to, RSS.
2. Ideologies and bucket-list content from the client.
3. Own OG image, Person JSON-LD, per-page social images.
4. Self-host fonts.

## Phase 5 — Cleanup

Remove unused platform code and dependencies (auth, storage, maps, voice, image generation, database, unused UI components, Manus files).

## Launch checklist

- [ ] Client sign-off on all copy and numbers
- [ ] Employer policy check done by client
- [ ] `/api/health` returns 200 on the deployed site
- [ ] Domain and both subdomains attached in Netlify
- [ ] 404 returns HTTP 404
- [ ] Lighthouse 90+ on performance and accessibility
- [ ] LinkedIn featured link points to `knowme.abhinavnigam.in`
