# Referral form → Google Sheet

How a submission travels:

```
Form (/google-refer) → POST /api/referrals (Netlify function: validates, rate-limits)
                     → Apps Script web app attached to the sheet (checks the secret)
                     → resume saved in Drive folder "Google referral resumes"
                     → one row appended to the sheet
```

The sheet and the Drive folder stay private. The script runs as the sheet owner, so no Google Cloud
project, API key or service account is needed. The website never holds Google credentials, only the
script's URL and a shared secret.

## Sheet columns

Written by the script on the first submission if the sheet is empty:

`Submitted at | Name | Email | Phone | Current company | Previous companies | Job link | Resume | Status`

- **Submitted at**: date and time of the submission, in the spreadsheet's time zone (File ▸ Settings).
- **Resume**: link to the file in Drive.
- **Status**: starts as `New`. Abhinav edits it by hand.

New rows always go to the **first tab**. Keep the header names or clear the tab entirely; do not
reorder columns.

## One-time setup (done by the sheet owner, about 10 minutes)

1. Open the sheet. If the first tab has any old content, clear it so row 1 is empty.
2. **Extensions ▸ Apps Script**. Delete the sample code, paste all of `Code.gs` from this folder, save.
3. In the toolbar choose the function `setup` and press **Run**. Approve the Sheets and Drive permissions
   Google asks for (on the "Google hasn't verified this app" screen: Advanced ▸ Go to project).
4. The **Execution log** at the bottom prints `REFERRAL_SCRIPT_SECRET = …`. The script created this secret
   itself and stored it as the `SECRET` script property. Copy the value; it is needed in step 6.
5. **Deploy ▸ New deployment ▸ type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, then copy the **Web app URL** (ends in `/exec`).
6. In Netlify: **Site configuration ▸ Environment variables**, add both with the **Functions** scope:
   - `REFERRAL_SCRIPT_URL` = the web app URL
   - `REFERRAL_SCRIPT_SECRET` = the value printed by `setup`
7. **Deploys ▸ Trigger deploy**. The "opens soon" banner disappears and the Submit button is enabled.
8. Send one test submission and check the new row and the file in Drive.

"Anyone" access is required so the website's server can reach the script. Requests without the secret
are refused before anything is written.

## Changing the script later

After editing `Code.gs` in the Apps Script editor use **Deploy ▸ Manage deployments ▸ Edit ▸ Version:
New version**. That keeps the same URL. "New deployment" creates a different URL, which would then have
to be updated in Netlify.

## Turning the form off

Remove either Netlify variable and redeploy. The form goes back to the "opens soon" state with the
email fallback.

## Limits

- Resume: PDF, DOC or DOCX up to 4 MB (a Netlify function request is capped at 6 MB).
- 5 submissions per hour per visitor address.
- Hidden honeypot field and server-side file-type check (extension and file signature).
