import { useState, useEffect, useRef } from "react";
import { Search, FileCode, Sparkles, Terminal, Palette, Download, Mail } from "lucide-react";
import { IDE_FILES, abhinavProfile } from "../../content/ideContent";
import { FileIcon } from "./FileIcon";
import type { FileId } from "../../types/ide";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (fileId: FileId) => void;
  onToggleTerm: () => void;
  onToggleCopilot: () => void;
  onOpenThemeModal: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectFile,
  onToggleTerm,
  onToggleCopilot,
  onOpenThemeModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    ...IDE_FILES.map((f) => ({
      id: f.id,
      type: "file" as const,
      title: f.name,
      sub: `${f.folder}/${f.name} — ${f.lang}`,
      icon: <FileIcon name={f.name} className="w-4 h-4 shrink-0" />,
      action: () => onSelectFile(f.id),
    })),
    {
      id: "cmd-copilot",
      type: "cmd" as const,
      title: "Ask Abhinav Copilot AI",
      sub: "Open conversational AI drawer powered by RAG",
      icon: <Sparkles size={16} className="text-vscode-purple shrink-0" />,
      action: onToggleCopilot,
    },
    {
      id: "cmd-terminal",
      type: "cmd" as const,
      title: "Toggle Developer Terminal",
      sub: "Docked interactive bash command prompt",
      icon: <Terminal size={16} className="text-vscode-green shrink-0" />,
      action: onToggleTerm,
    },
    {
      id: "cmd-theme",
      type: "cmd" as const,
      title: "Preferences: Color Theme",
      sub: "Switch between Light Modern, GitHub, Solarized, and Dark themes",
      icon: <Palette size={16} className="text-vscode-blue shrink-0" />,
      action: onOpenThemeModal,
    },
    {
      id: "cmd-email",
      type: "cmd" as const,
      title: "Copy Email: abhinavnigam2207@gmail.com",
      sub: "Copy Abhinav's direct email to clipboard",
      icon: <Mail size={16} className="text-vscode-orange shrink-0" />,
      action: () => {
        navigator.clipboard.writeText(abhinavProfile.email);
        alert("Email copied to clipboard!");
      },
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.sub.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) {
        filtered[selectedIdx].action();
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-vscode-bg border border-vscode-border rounded-lg shadow-2xl overflow-hidden font-mono text-xs select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-vscode-border bg-vscode-bg2">
          <Search size={15} className="text-vscode-dim shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a file name, command or symbol to jump to..."
            className="flex-1 bg-transparent border-0 outline-none text-vscode-text font-mono text-xs p-0 m-0"
          />
          <kbd className="text-[10px] text-vscode-dim bg-vscode-bg3 px-1.5 py-0.5 rounded border border-vscode-border">
            ESC
          </kbd>
        </div>

        {/* Filtered list items */}
        <div className="max-h-80 overflow-y-auto thin-scroll p-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-vscode-dim">
              No matching files or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-vscode-blue2 text-white font-medium shadow-xs"
                      : "text-vscode-text hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <div className="flex flex-col flex-1 truncate">
                    <span className="truncate">{item.title}</span>
                    <span
                      className={`text-[10px] truncate ${
                        isSelected ? "text-white/80" : "text-vscode-dim"
                      }`}
                    >
                      {item.sub}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
