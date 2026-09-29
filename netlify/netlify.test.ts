import { describe, expect, it } from "vitest";
import { subdomainRootPath } from "./edge-functions/host-root";
import { handler } from "./functions/api";

type FunctionResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

async function callApi(method: string, path: string): Promise<FunctionResponse> {
  const result = await handler({
    httpMethod: method,
    path,
    rawUrl: `http://localhost${path}`,
    headers: { host: "localhost" },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    rawQuery: "",
  }, {});
  return result as unknown as FunctionResponse;
}

describe("Netlify subdomain root rewrite", () => {
  it("maps the Ask and Know Me roots to their pre-rendered routes", () => {
    expect(subdomainRootPath("ask.abhinavnigam.in", "/")).toBe("/ask/");
    expect(subdomainRootPath("knowme.abhinavnigam.in", "/")).toBe("/knowme/");
  });

  it("does not rewrite the main site, non-root paths, or an explicit main-site opt-out", () => {
    expect(subdomainRootPath("www.abhinavnigam.in", "/")).toBeUndefined();
    expect(subdomainRootPath("ask.abhinavnigam.in", "/blog")).toBeUndefined();
    expect(subdomainRootPath("ask.abhinavnigam.in", "/", "?site=main")).toBeUndefined();
  });
});

describe("Netlify Express function", () => {
  it("serves the health route with a no-store response", async () => {
    const response = await callApi("GET", "/api/health");
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: "ok" });
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("does not accept referrals until Microsoft storage is authorized", async () => {
    const status = await callApi("GET", "/api/referrals/status");
    expect(status.statusCode).toBe(200);
    expect(JSON.parse(status.body).ready).toBe(false);
    expect(status.headers["cache-control"]).toBe("no-store");

    const submission = await callApi("POST", "/api/referrals");
    expect(submission.statusCode).toBe(503);
    expect(JSON.parse(submission.body).error).toContain("authorized Microsoft");
    expect(submission.headers["cache-control"]).toBe("no-store");
  });
});
