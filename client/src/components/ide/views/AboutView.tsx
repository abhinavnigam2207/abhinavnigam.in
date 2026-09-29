import { educationHistory, abhinavProfile } from "../../../content/ideContent";

export function AboutView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Header Tag */}
      <div className="text-vscode-gcm italic text-xs mb-4">
        &lt;!-- about.html — Abhinav Nigam | Bio, Education & Core Principles --&gt;
      </div>

      <div className="space-y-6">
        {/* Section: Bio */}
        <div className="p-6 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-4">
          <div className="flex items-center gap-2 text-vscode-orange text-xs font-semibold">
            <span>&lt;section id="bio"&gt;</span>
          </div>

          <div className="pl-4 border-l-2 border-vscode-orange/30 space-y-3 font-sans text-xs md:text-sm text-vscode-text leading-relaxed">
            <h2 className="font-display font-bold text-2xl text-vscode-bright m-0">
              Engineering with clarity and intention.
            </h2>
            <p className="m-0">
              I am a Senior Software Engineer with over 12 years of hands-on experience building mission-critical web applications, enterprise platforms, and cloud interfaces. Over the last decade, I have focused on solving high-complexity UI architecture challenges — from SIEM security reporting and custom data visualizations to route-based micro-frontends and real-time operational delivery dispatchers.
            </p>
            <p className="m-0">
              At Google, I lead 5 engineers within the Google Cloud SecOps organization, delivering scheduled reports for enterprise SIEM dashboards, managing shared visualization component libraries, and spearheading test reliability programs that reduced flaky failures by 78%.
            </p>
            <p className="m-0 text-vscode-dim">
              Previously at Observe.ai, Rapido, and Reliance Jio, I led teams ranging from 8 to 14 engineers, introducing Backend-for-Frontend (BFF) aggregation microservices, cutting cloud database costs by 14%, and scaling core web applications to millions of users.
            </p>
          </div>

          <div className="text-vscode-orange text-xs font-semibold">
            <span>&lt;/section&gt;</span>
          </div>
        </div>

        {/* Section: Education */}
        <div className="p-6 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-4">
          <div className="flex items-center gap-2 text-vscode-blue text-xs font-semibold">
            <span>&lt;section id="education"&gt;</span>
          </div>

          <div className="pl-4 border-l-2 border-vscode-blue/30 space-y-3">
            {educationHistory.map((edu, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-sans font-bold text-base text-vscode-bright m-0">
                    {edu.institution}
                  </h3>
                  <span className="text-vscode-blue2 font-mono text-[11px] font-semibold">
                    {edu.period}
                  </span>
                </div>
                <div className="text-vscode-text font-sans font-medium text-xs">
                  {edu.degree}
                </div>
                <div className="text-vscode-dim font-sans text-xs pt-1">
                  {edu.details}
                </div>
              </div>
            ))}
          </div>

          <div className="text-vscode-blue text-xs font-semibold">
            <span>&lt;/section&gt;</span>
          </div>
        </div>

        {/* Section: Core Ideologies & Beliefs */}
        <div className="p-6 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-4">
          <div className="flex items-center gap-2 text-vscode-green text-xs font-semibold">
            <span>&lt;section id="principles"&gt;</span>
          </div>

          <div className="pl-4 border-l-2 border-vscode-green/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-vscode-bg border border-vscode-border">
              <div className="font-bold text-vscode-bright font-sans text-xs mb-1">
                1. Reliability First
              </div>
              <p className="text-vscode-dim text-[11px] font-sans m-0 leading-relaxed">
                Flaky tests and brittle pipelines erode team velocity. Engineering rigor means building repeatable, deterministic verification.
              </p>
            </div>

            <div className="p-3 rounded bg-vscode-bg border border-vscode-border">
              <div className="font-bold text-vscode-bright font-sans text-xs mb-1">
                2. Thoughtful Abstraction
              </div>
              <p className="text-vscode-dim text-[11px] font-sans m-0 leading-relaxed">
                Shared libraries and design systems should reduce cognitive load, not invent unnecessary complexity. Keep contracts lean.
              </p>
            </div>

            <div className="p-3 rounded bg-vscode-bg border border-vscode-border">
              <div className="font-bold text-vscode-bright font-sans text-xs mb-1">
                3. Evidence Over Opinion
              </div>
              <p className="text-vscode-dim text-[11px] font-sans m-0 leading-relaxed">
                Every architectural choice should have measurable outcomes — whether it's latency, test flakiness, or infrastructure cloud cost.
              </p>
            </div>

            <div className="p-3 rounded bg-vscode-bg border border-vscode-border">
              <div className="font-bold text-vscode-bright font-sans text-xs mb-1">
                4. Empathy for End Users & Teams
              </div>
              <p className="text-vscode-dim text-[11px] font-sans m-0 leading-relaxed">
                Clean code is only meaningful if it empowers people. Fast, accessible interfaces make users happy; clear documentation makes squads thrive.
              </p>
            </div>
          </div>

          <div className="text-vscode-green text-xs font-semibold">
            <span>&lt;/section&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
