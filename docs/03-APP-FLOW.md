# 03 — App Flow

## Routes

| Path | Page | Header |
|------|------|--------|
| `/` | Home | Full nav |
| `/blog` | Writing list | Full nav |
| `/ideologies` | Principles list | Full nav |
| `/bucket-list`, `/experiences` | Things done | Full nav |
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
| Ideologies, Bucket list | "List is taking shape" message | n/a | List | n/a |
| Referral | Form | Status check on load | Confirmation message | Field errors inline; form disabled with email fallback when the destination is not connected |
| Ask | Heading, search box, four suggestions | "Looking through the notes" | Answer with sources | Inline message that the service is unavailable |
| Know Me | n/a | n/a | Link list | n/a |

## Transitions

- Header nav: in-page anchors on Home, page links elsewhere.
- Ask: suggestion click or Enter submits; Shift+Enter adds a line.
- Referral: submit validates file type (PDF, DOC, DOCX) and size (5 MB) before any request.

## Edge cases

- Unknown path returns HTTP 404 with the 404 page.
- Ask rate limit returns a "please wait" message.
- JavaScript disabled: all pages except Ask chat and referral submit still read correctly.
