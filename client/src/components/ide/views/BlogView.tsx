import { ArrowUpRight, Clock3, BookOpen } from "lucide-react";
import { blogArticles } from "../../../content/ideContent";

export function BlogView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // blog.md — published technical articles & frontend architecture notes
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        # Notes from building for the web (Published on <span className="text-vscode-blue">DEV.to</span>)
      </div>

      <div className="space-y-4">
        {blogArticles.map((article, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border hover:border-vscode-blue2/50 transition-all shadow-xs space-y-3 group"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-vscode-dim">
              <div className="flex items-center gap-2">
                <span>{article.date}</span>
                {article.updated && (
                  <>
                    <span>•</span>
                    <span className="text-vscode-purple">{article.updated}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-vscode-dim">
                <Clock3 size={12} />
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* Title & Link */}
            <h3 className="font-display font-bold text-lg text-vscode-bright m-0 tracking-tight group-hover:text-vscode-blue2 transition-colors">
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-inherit no-underline"
              >
                <span>{article.title}</span>
                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </h3>

            {/* Description */}
            <p className="font-sans text-xs text-vscode-text leading-relaxed m-0">
              {article.description}
            </p>

            {/* Tags row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-vscode-border/50">
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-[9px] font-mono text-vscode-dim"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-sans text-xs text-vscode-blue2 hover:underline font-semibold"
              >
                <span>Read on DEV.to</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
