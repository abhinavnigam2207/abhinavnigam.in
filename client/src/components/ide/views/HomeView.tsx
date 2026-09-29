import { useState, useEffect } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, Terminal, FileText, Briefcase, Mail } from "lucide-react";
import { abhinavProfile } from "../../../content/ideContent";
import type { FileId } from "../../../types/ide";

interface HomeViewProps {
  onNavigate: (fileId: FileId) => void;
  onToggleCopilot: () => void;
  onToggleTerm: () => void;
}

export function HomeView({ onNavigate, onToggleCopilot, onToggleTerm }: HomeViewProps) {
  // Typing tagline animation
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTagline = abhinavProfile.typingTaglines[taglineIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentTagline.length) {
        timer = setTimeout(() => {
          setDisplayText(currentTagline.slice(0, displayText.length + 1));
        }, 45);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2500);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentTagline.slice(0, displayText.length - 1));
        }, 25);
      } else {
        setIsDeleting(false);
        setTaglineIdx((prev) => (prev + 1) % abhinavProfile.typingTaglines.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, taglineIdx]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-3">
        // home.tsx — Abhinav Nigam | Senior Software Engineer @ Google
      </div>

      {/* Main Hero Card */}
      <div className="relative bg-black/[0.02] dark:bg-white/[0.02] border border-vscode-border rounded-lg p-4 sm:p-6 md:p-8 shadow-xs mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-vscode-bg3 border border-vscode-border text-[11px] text-vscode-dim max-w-full truncate">
              <span className="w-2 h-2 rounded-full bg-vscode-green animate-pulse shrink-0" />
              <span className="font-semibold text-vscode-text truncate">Google Cloud SecOps</span>
              <span className="opacity-40 hidden xs:inline">|</span>
              <span className="hidden sm:inline truncate">Mountain View & Global Teams</span>
            </div>

            {/* Display Headline & Mobile Avatar */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-vscode-bright tracking-tight m-0 leading-tight">
                {abhinavProfile.name}
              </h1>
              {/* Mobile compact avatar */}
              <div className="sm:hidden shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-vscode-blue2/20 via-vscode-purple/20 to-vscode-green/20 border border-vscode-border flex items-center justify-center overflow-hidden">
                <span className="font-display font-black text-base text-vscode-bright">AN</span>
              </div>
            </div>

            {/* Cycling Typing Tagline */}
            <div className="text-xs sm:text-sm md:text-base text-vscode-blue2 font-medium min-h-[28px] flex items-center">
              <span>{displayText}</span>
              <span className="w-2 h-4 ml-0.5 bg-vscode-blue2 animate-blink" />
            </div>

            {/* Lead Bio Description */}
            <p className="text-vscode-dim text-xs md:text-sm font-sans leading-relaxed max-w-2xl m-0 pt-1">
              Senior Software Engineer with <strong className="text-vscode-bright font-semibold">12+ years</strong> specializing in high-performance web products, resilient platform architecture, and mission-critical cloud interfaces across{" "}
              <strong className="text-vscode-blue font-semibold">Google Cloud SecOps</strong>,{" "}
              <strong className="text-vscode-purple font-semibold">Observe.ai</strong>,{" "}
              <strong className="text-vscode-orange font-semibold">Rapido</strong>, and{" "}
              <strong className="text-vscode-green font-semibold">Reliance Jio</strong>.
            </p>
          </div>

          {/* Desktop Avatar Monogram */}
          <div className="shrink-0 animate-avatar-float hidden sm:block">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-vscode-blue2/20 via-vscode-purple/20 to-vscode-green/20 border-2 border-vscode-border flex items-center justify-center shadow-lg relative overflow-hidden group">
              <img
                src="/brandmark.png"
                alt="Abhinav Nigam"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="font-display font-black text-3xl text-vscode-bright tracking-tighter">
                AN
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-vscode-border/60">
          <button
            onClick={() => onNavigate("experience")}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-vscode-blue2 text-white font-sans text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Briefcase size={14} />
            <span>Explore Experience</span>
          </button>

          <button
            onClick={() => onNavigate("projects")}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-vscode-bg3 border border-vscode-border text-vscode-text font-sans text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <span>Projects</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={onToggleCopilot}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-vscode-purple/10 border border-vscode-purple/30 text-vscode-purple font-sans text-xs font-semibold hover:bg-vscode-purple/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Ask Copilot AI</span>
          </button>

          <button
            onClick={onToggleTerm}
            className="flex items-center gap-2 px-3 py-2 rounded bg-vscode-bg border border-vscode-border text-vscode-dim hover:text-vscode-text font-sans text-xs active:scale-95 transition-all cursor-pointer"
          >
            <Terminal size={14} />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onNavigate("google-refer")}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-vscode-green/10 border border-vscode-green/30 text-vscode-green font-sans text-xs font-semibold hover:bg-vscode-green/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Google Referral</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* Metrics Highlights Grid */}
      <div className="mb-8">
        <div className="text-[11px] font-semibold text-vscode-dim uppercase tracking-wider mb-3">
          Key Engineering Highlights
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {abhinavProfile.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-vscode-bg2 border border-vscode-border hover:border-vscode-blue2/50 transition-all shadow-xs"
            >
              <div className="font-display text-xl md:text-2xl font-black text-vscode-bright tracking-tight">
                {m.value}
              </div>
              <div className="text-xs font-medium text-vscode-text mt-1">{m.label}</div>
              <div className="text-[10px] text-vscode-dim mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <div className="text-[11px] font-semibold text-vscode-dim uppercase tracking-wider mb-3">
          Explore Repository Files
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigate("experience")}
            className="p-4 rounded-lg bg-vscode-bg border border-vscode-border hover:border-vscode-blue2 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-vscode-blue2 mb-2">
              <span className="font-bold text-xs">experience.ts</span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-vscode-dim text-xs font-sans m-0 leading-relaxed">
              Google Cloud SecOps, Observe.ai, Rapido, and Reliance Jio career outcomes.
            </p>
          </div>

          <div
            onClick={() => onNavigate("projects")}
            className="p-4 rounded-lg bg-vscode-bg border border-vscode-border hover:border-vscode-purple hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-vscode-purple mb-2">
              <span className="font-bold text-xs">projects.js</span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-vscode-dim text-xs font-sans m-0 leading-relaxed">
              Custom scheduled report service, BFF layer, and real-time SLA dashboards.
            </p>
          </div>

          <div
            onClick={() => onNavigate("blog")}
            className="p-4 rounded-lg bg-vscode-bg border border-vscode-border hover:border-vscode-green hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-vscode-green mb-2">
              <span className="font-bold text-xs">blog.md</span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-vscode-dim text-xs font-sans m-0 leading-relaxed">
              Architecture blueprints and browser console engineering articles on DEV.to.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
