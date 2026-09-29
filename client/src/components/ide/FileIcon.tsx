import { Code2, FileCode, FileText, Hash, Info, Layers, Sparkles, Terminal } from "lucide-react";

export function FileIcon({ name, className = "w-3.5 h-3.5" }: { name: string; className?: string }) {
  if (name.endsWith(".tsx") || name.endsWith(".jsx")) {
    return <span className={`text-[#3178c6] font-bold ${className}`}>⚛</span>;
  }
  if (name.endsWith(".ts")) {
    return <span className={`text-[#3178c6] font-bold text-[10px] leading-none ${className}`}>TS</span>;
  }
  if (name.endsWith(".js")) {
    return <span className={`text-[#f7df1e] font-bold text-[10px] leading-none ${className}`}>JS</span>;
  }
  if (name.endsWith(".html")) {
    return <span className={`text-[#e34f26] font-bold text-[10px] leading-none ${className}`}>&lt;&gt;</span>;
  }
  if (name.endsWith(".json")) {
    return <span className={`text-[#eab308] font-bold text-[10px] leading-none ${className}`}>&#123;&#125;</span>;
  }
  if (name.endsWith(".css")) {
    return <Hash className={`text-[#2563eb] ${className}`} />;
  }
  if (name.endsWith(".md")) {
    return <FileText className={`text-[#0891b2] ${className}`} />;
  }
  if (name.endsWith(".pdf")) {
    return <span className={`text-[#ef4444] font-bold text-[10px] leading-none ${className}`}>PDF</span>;
  }
  return <FileCode className={`text-vscode-dim ${className}`} />;
}
