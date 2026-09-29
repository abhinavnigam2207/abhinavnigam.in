export type FileId =
  | "home"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "google-refer"
  | "blog"
  | "contact"
  | "readme"
  | "resume";

export interface FileItem {
  id: FileId;
  name: string;
  folder: "src" | "data" | "root";
  lang: string;
  icon: string;
  color?: string;
  badge?: string;
  download?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
  type: "light" | "dark";
  accent: string;
  bgPreview: string;
}

export interface TerminalLine {
  id: string;
  type: "input" | "ok" | "err" | "dim" | "out" | "info";
  text: string;
}

export interface CareerItem {
  company: string;
  role: string;
  period: string;
  team: string;
  summary: string;
  outcome: string;
  technologies: string[];
  link?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: "cloud" | "platform" | "architecture" | "all";
  period: string;
  description: string;
  result: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  accent?: string;
}

export interface SkillCategory {
  group: string;
  color: string;
  items: {
    name: string;
    level: string;
    icon?: string;
    badge?: string;
  }[];
}

export interface BlogPostItem {
  title: string;
  date: string;
  updated?: string;
  readTime: string;
  description: string;
  tags: string[];
  url: string;
}
