import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_RESUME_BYTES, submitReferral } from "./referrals";

const pdf = Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(200)]).toString("base64");
const valid = {
  name: "Asha Rao", email: "asha@example.com", phone: "+91 98765 43210", currentCompany: "Adobe",
  previousCompanies: ["Meta", "Uber"], jobLink: "https://careers.google.com/jobs/results/123", consent: true, website: "",
  resume: { name: "asha rao.pdf", data: pdf },
};

describe("referral submission", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv("REFERRAL_SCRIPT_URL", "https://script.example/exec");
    vi.stubEnv("REFERRAL_SCRIPT_SECRET", "test-secret");
    fetchMock.mockReset().mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("sends a valid submission to the sheet script with the secret", async () => {
    const result = await submitReferral(valid, "10.0.0.1");
    expect(result).toEqual({ status: 200, body: { ok: true } });
    const [url, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse(init.body);
    expect(url).toBe("https://script.example/exec");
    expect(sent).toMatchObject({ secret: "test-secret", name: "Asha Rao", previousCompanies: "Meta, Uber", resume: { name: "asha rao.pdf", mime: "application/pdf" } });
    expect(sent).not.toHaveProperty("website");
  });

  it("rejects missing fields, a filled honeypot and missing consent without calling the script", async () => {
    for (const bad of [{ ...valid, email: "nope" }, { ...valid, website: "spam" }, { ...valid, consent: false }, { ...valid, jobLink: "javascript:alert(1)" }]) {
      expect((await submitReferral(bad, "10.0.0.2")).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects files that are not what their extension says, and oversized files", async () => {
    const exe = Buffer.from("MZ not a pdf").toString("base64");
    expect((await submitReferral({ ...valid, resume: { name: "cv.pdf", data: exe } }, "10.0.0.3")).status).toBe(400);
    expect((await submitReferral({ ...valid, resume: { name: "cv.exe", data: pdf } }, "10.0.0.3")).status).toBe(400);
    const big = Buffer.concat([Buffer.from("%PDF"), Buffer.alloc(MAX_RESUME_BYTES)]).toString("base64");
    expect((await submitReferral({ ...valid, resume: { name: "cv.pdf", data: big } }, "10.0.0.3")).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits repeated submissions from one address", async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await submitReferral(valid, "10.0.0.4")).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it("reports a failure when the script refuses, and is closed when not configured", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 200 }));
    expect((await submitReferral(valid, "10.0.0.5")).status).toBe(502);
    vi.stubEnv("REFERRAL_SCRIPT_URL", "");
    expect((await submitReferral(valid, "10.0.0.6")).status).toBe(503);
  });
});
