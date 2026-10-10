import { z } from "zod";
import { ENV } from "./env";

// Shared with the form: Netlify caps a function request at 6 MB, and a 4 MB file is about 5.4 MB once base64-encoded.
export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

const text = (max: number) => z.string().trim().min(1).max(max);
const submissionSchema = z.object({
  name: text(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(""),
  currentCompany: text(80),
  previousCompanies: z.array(text(80)).max(30).default([]),
  jobLink: z.string().trim().url().max(500).refine(value => /^https?:\/\//i.test(value)),
  consent: z.literal(true),
  // Hidden field no person fills in. Bots do.
  website: z.string().max(0).default(""),
  resume: z.object({ name: text(160), data: z.string().min(1).max(Math.ceil(MAX_RESUME_BYTES / 3) * 4 + 4) }),
});

// The file must be what its extension says: PDF, legacy Word (OLE) or DOCX (zip).
const SIGNATURES: Record<string, { bytes: number[]; mime: string }> = {
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf" },
  doc: { bytes: [0xd0, 0xcf, 0x11, 0xe0], mime: "application/msword" },
  docx: { bytes: [0x50, 0x4b, 0x03, 0x04], mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
};

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();
function allowSubmission(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter(time => now - time < WINDOW_MS);
  if (times.length >= MAX_PER_WINDOW) return false;
  recent.set(ip, [...times, now]);
  return true;
}

export const referralsReady = () => Boolean(ENV.referralScriptUrl && ENV.referralScriptSecret);

export type ReferralResult = { status: number; body: { ok: true } | { error: string } };

// Validates a submission and hands it to the Apps Script attached to Abhinav's sheet, which stores the resume
// in his Drive and appends the row. Nothing is kept on this server.
export async function submitReferral(input: unknown, ip: string): Promise<ReferralResult> {
  if (!referralsReady()) return { status: 503, body: { error: "The referral form is not open yet." } };

  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { status: 400, body: { error: "Please check the form and try again." } };
  const { resume, website: _website, consent: _consent, ...fields } = parsed.data;

  const extension = resume.name.split(".").pop()?.toLowerCase() ?? "";
  const signature = SIGNATURES[extension];
  const file = Buffer.from(resume.data, "base64");
  if (!signature || file.length > MAX_RESUME_BYTES || !signature.bytes.every((byte, index) => file[index] === byte)) {
    return { status: 400, body: { error: "Upload a PDF or Word document up to 4 MB." } };
  }
  if (!allowSubmission(ip)) return { status: 429, body: { error: "Too many requests. Please try again later." } };

  try {
    const response = await fetch(ENV.referralScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: ENV.referralScriptSecret,
        ...fields,
        previousCompanies: fields.previousCompanies.join(", "),
        resume: { name: resume.name.replace(/[^\w. -]/g, "_"), mime: signature.mime, data: file.toString("base64") },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json() as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) throw new Error(result.error ?? `status ${response.status}`);
    return { status: 200, body: { ok: true } };
  } catch (error) {
    console.error("Referral could not be saved:", error instanceof Error ? error.message : error);
    return { status: 502, body: { error: "We could not save your request. Please email it instead." } };
  }
}
