// Values are read at use time so tests and serverless cold starts see the current environment.
export const ENV = {
  // Ask Abhinav runs on Groq's OpenAI-compatible API.
  llmApiUrl: "https://api.groq.com/openai",
  get llmApiKey() { return process.env.GROQ_API_KEY ?? ""; },
};
