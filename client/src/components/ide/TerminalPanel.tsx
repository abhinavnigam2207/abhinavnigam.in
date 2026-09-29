import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { Terminal as TerminalIcon, X, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { FileId, TerminalLine } from "../../types/ide";

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (fileId: FileId) => void;
}

const INITIAL_LINES: TerminalLine[] = [
  { id: "1", type: "dim", text: "Microsoft Windows [Version 10.0.26100.3194] - WSL2 Ubuntu 24.04 LTS" },
  { id: "2", type: "info", text: "Welcome to Abhinav Nigam's Developer Terminal (Senior Software Engineer @ Google)" },
  { id: "3", type: "dim", text: "Type 'help' for available commands, or click any quick pill above." },
  { id: "4", type: "ok", text: "Google Cloud SecOps environment active: 78% flaky tests resolved | 12+ years experience." },
];

export function TerminalPanel({ isOpen, onClose, onNavigate }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, isOpen]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Record user command
    const newLines: TerminalLine[] = [
      ...lines,
      { id: Date.now().toString(), type: "input", text: `abhinav@google:~$ ${trimmed}` },
    ];
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    switch (command) {
      case "help":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "out",
          text: `AVAILABLE COMMANDS:
  whoami          — View Abhinav's bio & current role at Google
  experience      — Open professional experience & career timeline
  skills          — View technical skills & architecture stack
  projects        — View key cloud & platform engineering projects
  google-refer    — Open Google referral submission form
  blog            — View DEV.to architecture & console articles
  contact         — View contact methods & direct message form
  open <file>     — Open a file (e.g. 'open experience.ts')
  ls              — List files in repository
  pwd             — Print current working directory
  clear           — Clear terminal screen
  date            — Show current date & time`,
        });
        break;

      case "whoami":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Abhinav Nigam — Senior Software Engineer at Google (Google Cloud SecOps)\n12+ years building web products, cloud platforms, and leading engineering squads across Google, Observe.ai, Rapido, and Jio.",
        });
        break;

      case "experience":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening experience.ts (Google Cloud SecOps, Observe.ai, Rapido, Jio, IHS Markit)...",
        });
        onNavigate("experience");
        break;

      case "skills":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening skills.json (TypeScript, React, Angular, Go, Node.js, Cloud SecOps, Distributed Architecture)...",
        });
        onNavigate("skills");
        break;

      case "projects":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening projects.js (Google Cloud SIEM Scheduling, Observe.ai BFF, Rapido Delivery SLA)...",
        });
        onNavigate("projects");
        break;

      case "google-refer":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening google-refer.tsx (Referral candidate intake portal)...",
        });
        onNavigate("google-refer");
        break;

      case "blog":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening blog.md (Articles on Micro-Frontends and Browser Console power tools)...",
        });
        onNavigate("blog");
        break;

      case "contact":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: "Opening contact.css (Email: abhinavnigam2207@gmail.com | Phone: +91-9999-230-962)...",
        });
        onNavigate("contact");
        break;

      case "ls":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "out",
          text: "home.tsx   about.html   experience.ts   projects.js   skills.json   google-refer.tsx   blog.md   contact.css   README.md   Abhinav_Nigam_CV.pdf",
        });
        break;

      case "pwd":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "out",
          text: "/home/abhinav/workspace/portfolio-2026",
        });
        break;

      case "clear":
        setLines([]);
        setInputVal("");
        return;

      case "date":
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "dim",
          text: new Date().toString(),
        });
        break;

      case "open":
      case "cat":
        if (arg.includes("about")) onNavigate("about");
        else if (arg.includes("exp")) onNavigate("experience");
        else if (arg.includes("proj")) onNavigate("projects");
        else if (arg.includes("skill")) onNavigate("skills");
        else if (arg.includes("refer")) onNavigate("google-refer");
        else if (arg.includes("blog")) onNavigate("blog");
        else if (arg.includes("contact")) onNavigate("contact");
        else if (arg.includes("readme")) onNavigate("readme");
        else onNavigate("home");
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "ok",
          text: `Navigated to ${arg || "home.tsx"}`,
        });
        break;

      default:
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: "err",
          text: `bash: command not found: ${command}. Type 'help' for available commands.`,
        });
        break;
    }

    setLines(newLines);
    setInputVal("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx] || "");
        } else {
          setHistoryIdx(-1);
          setInputVal("");
        }
      }
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    runCommand(inputVal);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`border-t border-vscode-border bg-vscode-bg flex flex-col font-mono text-xs select-none transition-all duration-200 ${
        isExpanded ? "h-[360px]" : "h-[220px]"
      }`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-vscode-bg2 border-b border-vscode-border shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-vscode-green" />
          <span className="font-semibold text-vscode-text text-[11px] uppercase tracking-wider">
            Terminal
          </span>
          <span className="text-[10px] text-vscode-dim bg-vscode-bg3 px-1.5 py-0.2 rounded border border-vscode-border">
            bash
          </span>
        </div>

        {/* Quick Command Pills */}
        <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto thin-scroll max-w-[200px] sm:max-w-none py-0.5">
          {["whoami", "experience", "skills", "projects", "google-refer", "clear"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => runCommand(cmd)}
              className="px-2 py-0.5 rounded bg-vscode-bg3 hover:bg-vscode-blue2 hover:text-white border border-vscode-border text-vscode-text text-[10px] transition-colors cursor-pointer shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLines([])}
            className="p-1 rounded text-vscode-dim hover:text-vscode-text cursor-pointer"
            title="Clear Terminal"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-vscode-dim hover:text-vscode-text cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-vscode-dim hover:text-vscode-red cursor-pointer"
            title="Close Terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Log Area */}
      <div
        className="flex-1 overflow-y-auto thin-scroll p-3 space-y-1 bg-vscode-bg select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="leading-relaxed">
            {line.type === "input" && (
              <span className="text-vscode-text font-semibold">{line.text}</span>
            )}
            {line.type === "ok" && (
              <span className="text-vscode-green">{line.text}</span>
            )}
            {line.type === "info" && (
              <span className="text-vscode-blue font-medium">{line.text}</span>
            )}
            {line.type === "dim" && (
              <span className="text-vscode-dim">{line.text}</span>
            )}
            {line.type === "err" && (
              <span className="text-vscode-red">{line.text}</span>
            )}
            {line.type === "out" && (
              <pre className="text-vscode-text whitespace-pre-wrap font-mono m-0">
                {line.text}
              </pre>
            )}
          </div>
        ))}

        {/* CLI Prompt Row */}
        <form onSubmit={onSubmit} className="flex items-center gap-1.5 pt-1">
          <span className="text-vscode-blue2 font-semibold shrink-0">abhinav@google:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 outline-none text-vscode-text font-mono text-xs p-0 m-0 caret-vscode-blue2"
            autoFocus
            spellCheck={false}
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
