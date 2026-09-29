import { describe, expect, it } from "vitest";
import { profileRetriever } from "./abhinavRag";

describe("Abhinav profile retriever", () => {
  it("retrieves the Google CV excerpt for a Google experience question", async () => {
    const documents = await profileRetriever.invoke("What did Abhinav do at Google?");
    expect(documents[0]?.metadata.sourceId).toBe("cv-google");
    expect(documents[0]?.pageContent).toContain("78% reduction");
  });

  it("retrieves the micro-frontends article for an architecture question", async () => {
    const documents = await profileRetriever.invoke("Tell me about his Next.js micro-frontend architecture article");
    expect(documents.some(document => document.metadata.sourceId === "blog-microfrontends")).toBe(true);
  });

  it("returns no evidence for a topic absent from the source corpus", async () => {
    const documents = await profileRetriever.invoke("Which city is Abhinav's favorite holiday destination?");
    expect(documents).toHaveLength(0);
  });
});
