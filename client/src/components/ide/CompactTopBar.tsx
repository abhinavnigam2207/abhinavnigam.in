import React from "react";
import { LogOut, Menu, Search, Palette, Sparkles, Terminal, X } from "lucide-react";
import { FileIcon } from "./FileIcon";
import { IDE_FILES } from "../../content/ideContent";
import type { FileId } from "../../types/ide";

interface CompactTopBarProps {
  activeFile: FileId;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  onOpenCmd: () => void;
  onOpenThemeModal: () => void;
  onToggleCopilot: () => void;
  onToggleTerm: () => void;
}

export const CompactTopBar: React.FC<CompactTopBarProps> = ({
  activeFile,
  drawerOpen,
  onToggleDrawer,
  onOpenCmd,
  onOpenThemeModal,
  onToggleCopilot,
  onToggleTerm,
}) => {
  const currentFile = IDE_FILES.find((f) => f.id === activeFile) || IDE_FILES[0];

  return (
    <header className="compact-topbar flex items-center justify-between px-2.5 h-12 bg-vscode-title border-b border-vscode-border select-none z-30 shrink-0">
      {/* Left: Hamburger & Current File Indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleDrawer}
          className="flex items-center justify-center w-9 h-9 rounded-md text-vscode-text hover:bg-vscode-bg3 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vscode-blue"
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          title="Explorer Menu"
        >
          {drawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <FileIcon name={currentFile.name} className="w-3.5 h-3.5" />
          <span className="font-mono text-xs font-semibold text-vscode-text truncate max-w-[130px] sm:max-w-[200px]">
            {currentFile.name}
          </span>
          <span className="text-[10px] text-vscode-dim hidden sm:inline-block font-mono bg-vscode-bg2 px-1.5 py-0.5 rounded border border-vscode-border">
            {currentFile.lang}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Exit to main site */}
        <a
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded text-vscode-dim hover:text-vscode-text hover:bg-vscode-bg3 transition-colors"
          title="Back to the main site"
          aria-label="Exit IDE, back to the main site"
        >
          <LogOut size={16} />
        </a>

        {/* Search / Command Palette */}
        <button
          onClick={onOpenCmd}
          className="flex items-center justify-center w-8 h-8 rounded text-vscode-dim hover:text-vscode-text hover:bg-vscode-bg3 transition-colors"
          title="Search files (Ctrl+P)"
          aria-label="Search files"
        >
          <Search size={16} />
        </button>

        {/* Theme Picker */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center justify-center w-8 h-8 rounded text-vscode-dim hover:text-vscode-text hover:bg-vscode-bg3 transition-colors"
          title="Change theme"
          aria-label="Change theme"
        >
          <Palette size={16} />
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={onToggleTerm}
          className="flex items-center justify-center w-8 h-8 rounded text-vscode-dim hover:text-vscode-text hover:bg-vscode-bg3 transition-colors"
          title="Toggle Terminal (Ctrl+`)"
          aria-label="Toggle Terminal"
        >
          <Terminal size={16} />
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onToggleCopilot}
          className="flex items-center gap-1 px-2.5 h-7 rounded text-xs font-medium text-white bg-vscode-blue hover:opacity-90 active:scale-95 transition-all shadow-sm ml-1"
          title="Ask Abhinav AI Copilot"
          aria-label="Ask Abhinav AI Copilot"
        >
          <Sparkles size={13} className="text-yellow-200" />
          <span className="font-mono text-[11px] font-semibold">AI</span>
        </button>
      </div>
    </header>
  );
};
