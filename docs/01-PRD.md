# 01 — Product Requirements

## Problem

Abhinav Nigam is a Senior Software Engineer at Google who wants to be a leading voice on LinkedIn. He needs one personal home on the web that matches that standing: people who land on it should be impressed within seconds, and should be able to read his work, ask about him, find all his links, and request a Google referral.

The previous build was a VS Code look-alike. It was visually busy, used very small monospace text, and several required routes did not render. The client asked for a minimal look.

## Persona

- **Recruiter or hiring manager** — 30 seconds, wants role, employers, outcomes, contact.
- **LinkedIn follower** — arrives from a post or the featured link, wants writing and links.
- **Referral seeker** — wants to submit a role and resume for a Google referral.
- **Peer engineer** — wants writing, principles, and to poke at the Ask assistant.

## Goals

1. A minimal, classic-yet-modern site that reads as senior and confident.
2. Every route in the client brief renders its own page.
3. All copy is traceable to the CV or to published articles.
4. Fast: text visible without waiting on JavaScript (prerendered HTML).

## Non-goals

- No CMS, no login, no user accounts.
- No theme picker, terminal, or command palette on the main site.
- No on-site analytics dashboard.
- No invented metrics or testimonials.

## User stories

| # | Story | Route |
|---|-------|-------|
| 1 | As a visitor I see who Abhinav is, where he has worked, and what he achieved | `/` |
| 2 | As a reader I see all past blog posts | `/blog` |
| 3 | As a reader I see a list of his principles | `/ideologies` |
| 4 | As a reader I see things he has done (low priority) | `/bucket-list`, `/experiences` |
| 5 | As a candidate I submit basic details, current company, previous companies, resume, and job link, and it lands in a spreadsheet | `/google-refer` |
| 6 | As a follower I get one page with all his links | `knowme.abhinavnigam.in` |
| 7 | As a visitor I ask questions and get answers grounded in his material, in a Google-like search UI with suggestions | `ask.abhinavnigam.in` |

## Success metrics

- All seven stories pass a manual check on desktop and at 375px.
- Lighthouse performance and accessibility at 90 or above on `/`.
- Zero console errors.
- Body text at 16px or larger.

## Risks

- Employer policy: internal metrics and a referral page on a personal site. Client must confirm.
- Thin content: three blog posts from 2020, empty bucket list.
- Ask assistant cost and abuse without a durable rate limit.
