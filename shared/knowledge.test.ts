import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ideologies } from "../client/src/content/ideologies";
import { parseKnowledge, renderKnowledge } from "../scripts/build-knowledge";
import { knowledgeSources, offTopicReplies } from "./knowledge";

const markdown = readFileSync("shared/knowledge.md", "utf8");

describe("Ask Abhinav knowledge file", () => {
  it("is in step with the generated file (run `pnpm knowledge` after editing knowledge.md)", () => {
    expect(readFileSync("shared/knowledge.generated.ts", "utf8").replace(/\r\n/g, "\n")).toBe(renderKnowledge(markdown));
    expect(parseKnowledge(markdown).sources).toEqual(knowledgeSources);
  });

  it("has thirty short off-topic replies with no repeats", () => {
    expect(offTopicReplies).toHaveLength(30);
    expect(new Set(offTopicReplies).size).toBe(30);
    for (const reply of offTopicReplies) expect(reply.length).toBeLessThan(140);
  });

  it("carries every principle shown on the Ideologies page", () => {
    const text = knowledgeSources.map(source => source.content).join(" ");
    for (const group of ideologies) for (const [lead] of group.points) expect(text).toContain(lead);
  });

  it("rejects a source with a missing field or a repeated id", () => {
    const tail = "\n# Off-topic replies\n- Nope.\n";
    expect(() => parseKnowledge(`# Knowledge\n## A\n- id: a\n- category: CV\ntext${tail}`)).toThrow(/needs an id/);
    expect(() => parseKnowledge(`# Knowledge\n## A\n- id: a\n- url: /\n- category: CV\ntext\n## B\n- id: a\n- url: /\n- category: CV\ntext${tail}`)).toThrow(/used twice/);
  });
});
