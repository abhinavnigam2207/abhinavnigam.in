// Turns shared/knowledge.md (the one editable file for everything Ask Abhinav knows) into
// shared/knowledge.generated.ts. Run with `pnpm knowledge`; `pnpm build` runs it first.
import { readFileSync, writeFileSync } from "node:fs";

const CATEGORIES = ["CV", "Article", "Site"];

export function parseKnowledge(markdown: string) {
  const text = markdown.replace(/\r\n/g, "\n");
  const part = (heading: string) => text.split(new RegExp(`^# ${heading}\\s*$`, "m"))[1]?.split(/^# /m)[0] ?? "";

  const sources = part("Knowledge").split(/^## /m).slice(1).map(block => {
    const [title, ...rest] = block.split("\n");
    const meta: Record<string, string> = {};
    const body: string[] = [];
    for (const line of rest) {
      const field = body.length === 0 ? line.match(/^- (id|url|category|date): (.+)$/) : null;
      if (field) meta[field[1]] = field[2].trim();
      else if (line.trim()) body.push(line.trim());
    }
    const source = { id: meta.id, title: title.trim(), url: meta.url, category: meta.category, ...(meta.date ? { date: meta.date } : {}), content: body.join(" ") };
    if (!source.id || !source.url || !source.content || !CATEGORIES.includes(source.category)) throw new Error(`knowledge.md: "${source.title}" needs an id, a url, a category (${CATEGORIES.join(", ")}) and text`);
    return source;
  });
  const ids = sources.map(source => source.id);
  const repeated = ids.find((id, index) => ids.indexOf(id) !== index);
  if (repeated) throw new Error(`knowledge.md: id "${repeated}" is used twice`);

  const offTopicReplies = part("Off-topic replies").split("\n").filter(line => line.startsWith("- ")).map(line => line.slice(2).trim());
  if (sources.length === 0 || offTopicReplies.length === 0) throw new Error("knowledge.md: needs a '# Knowledge' section and a '# Off-topic replies' section");
  return { sources, offTopicReplies };
}

export function renderKnowledge(markdown: string) {
  const { sources, offTopicReplies } = parseKnowledge(markdown);
  return `// Generated from shared/knowledge.md by scripts/build-knowledge.ts. Do not edit; edit the Markdown and run \`pnpm knowledge\`.
import type { KnowledgeSource } from "./knowledge";

export const knowledgeSources: KnowledgeSource[] = ${JSON.stringify(sources, null, 2)};

export const offTopicReplies: string[] = ${JSON.stringify(offTopicReplies, null, 2)};
`;
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/build-knowledge.ts")) {
  const output = renderKnowledge(readFileSync("shared/knowledge.md", "utf8"));
  writeFileSync("shared/knowledge.generated.ts", output, "utf8");
  console.log("Wrote shared/knowledge.generated.ts");
}
