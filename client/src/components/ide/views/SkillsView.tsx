import { skillCategories } from "../../../content/ideContent";

export function SkillsView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // skills.json — technical competencies & architectural toolchain
      </div>
      <div className="text-vscode-dim text-[11px] mb-6">
        &#123; <span className="text-vscode-orange">"experience"</span>: <span className="text-vscode-green">"12+ years"</span>, <span className="text-vscode-orange">"status"</span>: <span className="text-vscode-green">"shipping_at_google"</span> &#125;
      </div>

      {/* 2-Column Skill Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((group) => (
          <div
            key={group.group}
            className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-3 shadow-xs"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between border-b border-vscode-border pb-2">
              <span className="font-bold text-sm font-sans text-vscode-bright">
                {group.group}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-vscode-bg3 text-vscode-dim">
                {group.items.length} items
              </span>
            </div>

            {/* Group Items */}
            <div className="space-y-2 pt-1">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-vscode-bg border border-vscode-border/60 hover:border-vscode-blue2/40 transition-colors"
                >
                  <span className="font-sans font-medium text-xs text-vscode-text">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-vscode-dim font-mono">
                      {item.level}
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-vscode-blue2/10 text-vscode-blue2 border border-vscode-blue2/20 font-mono font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
