// Values are read at use time so tests and serverless cold starts see the current environment.
export const ENV = {
  // Ask Abhinav runs on Groq's OpenAI-compatible API.
  llmApiUrl: "https://api.groq.com/openai",
  get llmApiKey() { return process.env.GROQ_API_KEY ?? ""; },
  // Google Apps Script web app attached to the referral sheet, and the secret it expects.
  // Trimmed: a pasted value often carries a stray space or line break. The secret is also taken from after
  // any "=", in case the whole "REFERRAL_SCRIPT_SECRET = …" log line was pasted (the secret itself has no "=").
  get referralScriptUrl() { return (process.env.REFERRAL_SCRIPT_URL ?? "").trim(); },
  get referralScriptSecret() { return (process.env.REFERRAL_SCRIPT_SECRET ?? "").split("=").pop()!.trim(); },
};
