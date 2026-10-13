# 03 — App Flow

## Routes

| Path | Page | Header |
|------|------|--------|
| `/` | Home | Full nav |
| `/blog` | Writing list | Full nav |
| `/ideologies` | Principles list | Full nav |
| `/bucket-list`, `/experiences` | Travel globe and bucket list | Full nav |
| `/bucket-list/<country>/` | Country story: cover, intro, facts, city cards | Full nav; back to the globe |
| `/bucket-list/<country>/<city>/` | City story: cover, intro, facts, photos, highlights, next city | Full nav; back to the country |
| `/google-refer` | Referral form | Full nav |
| `/ask` and `ask.abhinavnigam.in/` | Ask Abhinav | Compact |
| `/knowme` and `knowme.abhinavnigam.in/` | Link page | Compact |
| `/ide` | IDE shell (easter egg) | Own shell |
| anything else | 404 | Full nav |

`?site=main` on a subdomain root shows the main Home page.

## Home sections, in order

1. Hero: role line, giant statement, selected-work slider (three cards, circle-dot controls).
2. About: giant statement, two columns of copy.
3. Capabilities: four giant uppercase lines, each with a pill holding a CV figure, then a button to Experience.
4. Employers: wordmark grid.
5. Experience: one row per employer (dates, company, role, summary, outcome).
6. Skills: four plain lists.
7. Writing: all posts, link to `/blog`.
8. Contact: giant statement, button, links.

Header on every full page: brand and a Menu button. Menu opens a full-screen list of large links and closes on link click or Escape. Compact pages (Ask, Know Me) show brand and a link back to the portfolio.

## States

| Page | Empty | Loading | Success | Error |
|------|-------|---------|---------|-------|
| Blog | n/a (static) | n/a | List of posts | n/a |
| Ideologies | n/a (static) | n/a | Two numbered lists of ten principles | n/a |
| Bucket list | n/a | n/a | Hero with turning globe and counts; world tour pinned while scrolling (one stop per step, `?view=globe|map|passport|flight`); "Every stop" list; India chapter that zooms the map and lights places one by one; bucket list with done and to-do items; link to Know Me. Reduced motion: no easing or spin, frames change on scroll | Without canvas the text lists still carry every place |
| Home experience rows | Summary, outcome, stack | n/a | Observe.ai and Rapido have a closed "The full story" fold-out | n/a |
| Referral | Form beside a fold-out FAQ (stacked under 1100px) | Status check on load; button reads "Sending…" while submitting | Thank-you message, form cleared | Field errors inline; server message shown on failure. The form renders open; only if the status check answers "not connected" does it show the email fallback and disable Submit |
| Ask | Heading, search box, four suggestions | "Looking through the notes" | Answer with sources | Inline message that the service is unavailable |
| Know Me | n/a | n/a | Link list | n/a |

## Transitions

- Header nav: in-page anchors on Home, page links elsewhere.
- Ask: suggestion click or Enter submits; Shift+Enter adds a line.
- Referral: submit validates file type (PDF, DOC, DOCX) and size (4 MB) before any request. Previous companies are picked from a dropdown and shown as removable chips.

## Edge cases

- Unknown path returns HTTP 404 with the 404 page.
- Ask rate limit returns a "please wait" message.
- JavaScript disabled: all pages except Ask chat and referral submit still read correctly.
