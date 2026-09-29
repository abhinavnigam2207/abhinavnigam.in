import { useState } from "react";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { ideProjects } from "../../../content/ideContent";

export function ProjectsView() {
  const [filter, setFilter] = useState<"all" | "cloud" | "platform" | "architecture">("all");

  const filteredProjects = ideProjects.filter((p) => {
    if (filter === "all") return true;
    return p.category === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // projects.js — mission-critical systems & cloud architectures
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        <span className="text-vscode-purple">const</span> <span className="text-vscode-blue">projects</span> = [ <span className="text-vscode-orange">...cloudSecOps</span>, <span className="text-vscode-orange">...platforms</span>, <span className="text-vscode-orange">...architecture</span> ];
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: "all", label: "All Projects" },
          { id: "cloud", label: "Cloud & SecOps" },
          { id: "platform", label: "Platform & BFF" },
          { id: "architecture", label: "Architecture" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3 py-1.5 rounded text-xs font-sans transition-all cursor-pointer border ${
              filter === tab.id
                ? "bg-vscode-blue2 text-white font-semibold border-vscode-blue2 shadow-xs"
                : "bg-vscode-bg2 border-vscode-border text-vscode-text hover:bg-vscode-bg3"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project Cards 2-Col Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border hover:border-vscode-blue2/50 hover:-translate-y-0.5 transition-all shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Card Title Row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-vscode-dim font-mono font-semibold">
                    {p.period}
                  </span>
                  <h3 className="font-display font-bold text-base md:text-lg text-vscode-bright m-0 mt-0.5 tracking-tight group-hover:text-vscode-blue2 transition-colors">
                    {p.title}
                  </h3>
                </div>
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-vscode-dim hover:text-vscode-blue2 transition-colors shrink-0"
                    title="Open Project"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="font-sans text-xs text-vscode-text leading-relaxed m-0">
                {p.description}
              </p>

              {/* Impact Callout */}
              <div className="p-2 rounded bg-vscode-bg border border-vscode-green/30 text-vscode-green text-[11px] font-sans font-medium flex items-center gap-1.5">
                <span className="font-bold">Metric:</span>
                <span>{p.result}</span>
              </div>
            </div>

            {/* Bottom Tech Pills & Actions */}
            <div className="pt-4 mt-4 border-t border-vscode-border/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {p.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-[9px] font-mono text-vscode-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-sans text-vscode-dim hover:text-vscode-text transition-colors"
                >
                  <Github size={12} />
                  <span>Code</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
