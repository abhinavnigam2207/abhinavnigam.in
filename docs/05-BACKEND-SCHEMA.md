# 05 — Backend Schema

Draft. Phase 1 changes no backend behaviour.

## Entities

No database. Two data stores:

### Referral row (spreadsheet, destination open)

| Column | Type | Notes |
|--------|------|-------|
| submitted_at | ISO datetime | Server time |
| name | text | Required |
| email | text | Required |
| phone | text | Optional |
| current_company | text | From dropdown, or free text when "Other" |
| previous_companies | text | Comma-separated |
| job_link | URL | Required |
| resume_url | URL | Link to the stored file |
| status | text | `new` by default, edited by Abhinav |

Resume file: PDF, DOC, or DOCX up to 5 MB, stored in a private folder next to the sheet.

### Ask knowledge (`shared/knowledge.ts`)

`{ id, title, url, category: "CV" | "Article", date?, content }`. To grow with full CV, all articles, ideologies, and an FAQ.

## API contracts

| Method | Path | Now | Target |
|--------|------|-----|--------|
| GET | `/api/health` | `{ status: "ok" }` | same |
| GET | `/api/referrals/status` | `{ ready: false, message }` | `ready: true` once the destination is configured |
| POST | `/api/referrals` | 503 | multipart form, validates, stores file, appends row, returns `{ ok: true }` |
| POST | `/api/trpc/assistant.ask` | `{ answer, sources[] }`, 12 requests per 5 minutes per IP in memory | same shape, durable rate limit |

## Auth

None for visitors. The spreadsheet and file folder are private to Abhinav. Server credentials live in Netlify environment variables.

## Abuse controls (target)

- Referral: bot check on submit, 5 MB limit, MIME and extension check server-side.
- Ask: durable per-IP limit and a monthly spend cap.
