// Everything Ask Abhinav knows is written in shared/knowledge.md. `pnpm knowledge` turns it into the generated file.
export type KnowledgeSource = {
  id: string;
  title: string;
  url: string;
  category: "CV" | "Article" | "Site";
  date?: string;
  content: string;
};

export { knowledgeSources, offTopicReplies } from "./knowledge.generated";
