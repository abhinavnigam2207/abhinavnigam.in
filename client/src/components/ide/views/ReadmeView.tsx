import { Keyboard, Sparkles, Terminal, FileCode, ExternalLink } from "lucide-react";
import { abhinavProfile } from "../../../content/ideContent";

export function ReadmeView() {
  const shortcuts = [
    { key: "Ctrl + P", desc: "Open Command Palette / Search Files" },
    { key: "Ctrl + B", desc: "Toggle Sidebar Explorer" },
    { key: "Ctrl + `", desc: "Toggle Developer Terminal" },
    { key: "Ctrl + Shift + C", desc: "Toggle Ask Abhinav Copilot AI" },
    { key: "Alt + 1..8", desc: "Switch Between Open Tabs" },
    { key: "Ctrl + W", desc: "Close Current Active Tab" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 select-text font-mono text-xs">
      {/* Code Header Comment */}
      <div className="text-vscode-gcm italic text-xs mb-1">
        // README.md — portfolio documentation & keyboard shortcuts
      </div>

      <div className="space-y-6">
        {/* Title Card */}
        <div className="p-6 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-3">
          <h1 className="font-display font-black text-2xl md:text-3xl text-vscode-bright m-0 tracking-tight">
            Abhinav Nigam — Portfolio Workspace
          </h1>
          <p className="font-sans text-xs md:text-sm text-vscode-text m-0 leading-relaxed">
            Welcome to the interactive VS Code developer portfolio of Abhinav Nigam. Designed as an authentic engineering workspace, this portfolio lets you explore verified career milestones, production systems, and published architectural writings.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-vscode-blue2 font-semibold">
              v2026.1.0-release
            </span>
            <span className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-vscode-green font-semibold">
              TypeScript 5.9 + React 19
            </span>
            <span className="px-2 py-0.5 rounded bg-vscode-bg3 border border-vscode-border text-vscode-purple font-semibold">
              LangChain RAG Core
            </span>
          </div>
        </div>

        {/* Keyboard Shortcuts Table */}
        <div className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-3">
          <div className="flex items-center gap-2 border-b border-vscode-border pb-2">
            <Keyboard size={16} className="text-vscode-blue2" />
            <h3 className="font-sans font-bold text-sm text-vscode-bright m-0">
              Keyboard Shortcuts & Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
            {shortcuts.map((sc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded bg-vscode-bg border border-vscode-border"
              >
                <span className="text-xs text-vscode-text">{sc.desc}</span>
                <kbd className="font-mono text-[11px] bg-vscode-bg3 text-vscode-blue2 font-semibold px-2 py-0.5 rounded border border-vscode-border shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="p-5 rounded-lg bg-vscode-bg2 border border-vscode-border space-y-3">
          <div className="flex items-center gap-2 border-b border-vscode-border pb-2">
            <FileCode size={16} className="text-vscode-green" />
            <h3 className="font-sans font-bold text-sm text-vscode-bright m-0">
              Architecture & Built-in Features
            </h3>
          </div>

          <ul className="list-disc list-inside font-sans text-xs text-vscode-text space-y-1.5 m-0 leading-relaxed">
            <li><strong>Theme Engine:</strong> VS Code Light Modern (default), GitHub Light, Solarized Light, Quiet Light, Nord Snow, and Dark themes.</li>
            <li><strong>Integrated Terminal:</strong> Functional bash CLI with command execution (<code className="text-vscode-blue2 font-mono">whoami</code>, <code className="text-vscode-blue2 font-mono">experience</code>, <code className="text-vscode-blue2 font-mono">skills</code>, <code className="text-vscode-blue2 font-mono">cat</code>, etc.).</li>
            <li><strong>Ask Abhinav Copilot:</strong> Retrieval-Augmented Generation (RAG) assistant indexing Abhinav's CV and articles with LangChain.</li>
            <li><strong>Google Referral Portal:</strong> Candidate intake workflow with client validation and OneDrive integration hooks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
