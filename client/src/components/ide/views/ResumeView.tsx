import { Download, Printer, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { abhinavProfile, careerTimeline, educationHistory, skillCategories } from "../../../content/ideContent";

export function ResumeView() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // Abhinav_Nigam_CV.pdf — verified curriculum vitae
      </div>

      {/* Top action toolbar */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-vscode-bg2 border border-vscode-border mb-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-vscode-red" />
          <span className="font-sans font-bold text-xs text-vscode-bright">
            Abhinav_Nigam_CV.pdf
          </span>
          <span className="text-[10px] text-vscode-dim font-mono bg-vscode-bg3 px-1.5 py-0.5 rounded">
            12+ Years Experience
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-vscode-bg border border-vscode-border text-vscode-text font-sans text-xs hover:bg-vscode-bg3 transition-colors cursor-pointer"
          >
            <Printer size={13} />
            <span>Print CV</span>
          </button>

          <a
            href={`mailto:${abhinavProfile.email}?subject=Requesting%20Full%20CV%20PDF`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-vscode-blue2 text-white font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs no-underline"
          >
            <Download size={13} />
            <span>Download CV</span>
          </a>
        </div>
      </div>

      {/* Printable Paper Canvas Preview */}
      <div className="p-8 rounded-lg bg-vscode-bg border border-vscode-border shadow-md space-y-6 font-sans">
        {/* CV Header */}
        <div className="border-b border-vscode-border pb-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="font-display font-black text-2xl text-vscode-bright m-0">
              {abhinavProfile.name}
            </h1>
            <span className="font-mono text-xs font-semibold text-vscode-blue2">
              {abhinavProfile.role}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-vscode-dim font-mono">
            <span>{abhinavProfile.email}</span>
            <span>•</span>
            <span>{abhinavProfile.phone}</span>
            <span>•</span>
            <span>{abhinavProfile.location}</span>
            <span>•</span>
            <a href={abhinavProfile.linkedin} target="_blank" rel="noreferrer" className="text-vscode-blue2 hover:underline">
              linkedin.com/in/abhinavnigam2207
            </a>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-vscode-blue2 m-0">
            Professional Summary
          </h2>
          <p className="text-xs text-vscode-text leading-relaxed m-0">
            {abhinavProfile.bioIntro} Track record of reducing flaky tests by 78% in Google Cloud SecOps SIEM dashboards, designing enterprise web component design systems, building resilient BFF microservices, and leading high-velocity engineering squads.
          </p>
        </div>

        {/* Experience Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-vscode-blue2 m-0 border-b border-vscode-border pb-1">
            Work Experience
          </h2>

          <div className="space-y-4">
            {careerTimeline.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <strong className="text-vscode-bright font-bold">{item.company}</strong>
                    <span className="text-vscode-dim"> — {item.role}</span>
                  </div>
                  <span className="font-mono text-[11px] text-vscode-dim">{item.period}</span>
                </div>
                <div className="text-[11px] text-vscode-purple font-mono font-medium">
                  {item.team}
                </div>
                <p className="text-vscode-text m-0 leading-relaxed">
                  {item.summary}
                </p>
                <div className="text-[11px] text-vscode-green font-medium">
                  Key Result: {item.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-vscode-blue2 m-0 border-b border-vscode-border pb-1">
            Education
          </h2>
          {educationHistory.map((edu, idx) => (
            <div key={idx} className="text-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <strong className="text-vscode-bright">{edu.institution}</strong>
                <span className="font-mono text-[11px] text-vscode-dim">{edu.period}</span>
              </div>
              <div className="text-vscode-text">{edu.degree}</div>
              <div className="text-[11px] text-vscode-dim">{edu.details}</div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-vscode-blue2 m-0 border-b border-vscode-border pb-1">
            Skills & Competencies
          </h2>
          <div className="space-y-1 text-xs">
            {skillCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="font-bold text-vscode-text w-40 shrink-0">{cat.group}:</span>
                <span className="text-vscode-dim">{cat.items.map((i) => i.name).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
