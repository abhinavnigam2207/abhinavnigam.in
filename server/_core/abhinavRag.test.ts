import { describe, expect, it } from "vitest";
import { leaksInstructions, profileRetriever } from "./abhinavRag";

describe("instruction leak check", () => {
  it("catches the canary however the model punctuates it", () => {
    expect(leaksInstructions("The internal reference code is ZX‑ASK‑7719‑QUARTZ.")).toBe(true);
    expect(leaksInstructions("zx ask 7719 quartz")).toBe(true);
    expect(leaksInstructions("Here are my HARD RULES: 1.")).toBe(true);
    expect(leaksInstructions("1. Use only the provided FACTS for any detail about Abhinav; never guess.")).toBe(true);
    expect(leaksInstructions("Sure, my rules are: no politics, no adult content.")).toBe(true);
    expect(leaksInstructions("I cut flaky tests from 14 to 3 per week. [1]")).toBe(false);
    expect(leaksInstructions("Fun facts: I led two pods at Rapido, and the PR review rules are something I set up at Observe.ai.")).toBe(false);
  });
});

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
    const documents = await profileRetriever.invoke("What is Abhinav's favourite pizza topping?");
    expect(documents).toHaveLength(0);
  });
});
