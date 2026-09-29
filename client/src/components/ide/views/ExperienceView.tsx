import { ArrowUpRight } from "lucide-react";
import { careerTimeline } from "../../../content/ideContent";

export function ExperienceView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // experience.ts — professional journey & verified outcomes
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        <span className="text-vscode-purple">interface</span> <span className="text-vscode-blue">CareerTimeline</span> <span className="text-vscode-purple">extends</span> <span className="text-vscode-green">EngineeringLeadership</span> &#123;&#125;
      </div>

      {/* Timeline container */}
      <div className="relative pl-6 border-l-2 border-vscode-border space-y-8 ml-3">
        {careerTimeline.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-vscode-bg border-2 border-vscode-blue2 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-vscode-blue2" />
            </div>

            {/* Career Card */}
            <div className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border hover:border-vscode-blue2/50 transition-all shadow-xs space-y-3">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-vscode-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-vscode-bright m-0 tracking-tight">
                    {item.company}
                  </h3>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-vscode-dim hover:text-vscode-blue2 transition-colors"
                      title={`Visit ${item.company}`}
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
                <span className="text-vscode-blue2 font-semibold text-[11px]">
                  {item.period}
                </span>
              </div>

              {/* Role & Team Subtitle */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                <span className="font-bold text-vscode-text">{item.role}</span>
                <span className="text-vscode-dim">•</span>
                <span className="text-vscode-purple font-medium">{item.team}</span>
              </div>

              {/* Summary Description */}
              <p className="font-sans text-xs text-vscode-text leading-relaxed m-0">
                {item.summary}
              </p>

              {/* Measurable Outcome Callout */}
              <div className="p-2.5 rounded bg-vscode-bg border border-vscode-green/30 text-vscode-green text-xs font-sans font-medium flex items-start gap-2">
                <span className="font-bold shrink-0">Impact:</span>
                <span>{item.outcome}</span>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.technologies.map((t, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-[10px] font-mono text-vscode-dim"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
