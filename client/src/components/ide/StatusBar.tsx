import { GitBranch, AlertCircle, Check, Sparkles, Palette } from "lucide-react";
import { IDE_THEMES, IDE_FILES } from "../../content/ideContent";
import type { FileId } from "../../types/ide";

interface StatusBarProps {
  activeFile: FileId;
  themeId: string;
  isCompact?: boolean;
  onOpenThemeModal: () => void;
  onToggleCopilot: () => void;
  onToggleTerm: () => void;
}

export function StatusBar({
  activeFile,
  themeId,
  isCompact = false,
  onOpenThemeModal,
  onToggleCopilot,
  onToggleTerm,
}: StatusBarProps) {
  const currentFile = IDE_FILES.find((f) => f.id === activeFile);
  const currentTheme = IDE_THEMES.find((t) => t.id === themeId) || IDE_THEMES[0];

  return (
    <footer
      style={!isCompact ? { gridArea: "status" } : undefined}
      className={`bg-vscode-blue2 text-white flex items-center justify-between px-3 select-none text-[11px] font-mono shrink-0 z-30 ${
        isCompact ? "h-7 status-bar-safe" : "h-[24px]"
      }`}
    >
      {/* Left side items */}
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        <button
          onClick={onToggleTerm}
          className="flex items-center gap-1 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Git: main branch (clean)"
        >
          <GitBranch size={12} />
          <span>main*</span>
        </button>

        {/* Problems & Warnings */}
        <button
          onClick={onToggleTerm}
          className="flex items-center gap-1.5 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="0 Errors, 0 Warnings"
        >
          <span className="flex items-center gap-0.5">
            <span className="text-[10px]">⊗</span> 0
          </span>
          <span className="flex items-center gap-0.5">
            <AlertCircle size={10} /> 0
          </span>
        </button>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline opacity-90">Ln 24, Col 8</span>
        <span className="hidden md:inline opacity-90">Spaces: 2</span>
        <span className="hidden sm:inline opacity-90">UTF-8</span>

        {/* Language Mode */}
        <span className="hidden sm:inline hover:bg-black/15 px-1.5 py-0.5 rounded cursor-default font-medium">
          {currentFile?.lang || "TypeScript React"}
        </span>

        {/* Prettier checkmark */}
        <span className="hidden lg:flex items-center gap-1 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-default" title="Formatted with Prettier">
          <Check size={11} strokeWidth={2.5} />
          <span>Prettier</span>
        </span>

        {/* Theme Switcher Button */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-1 hover:bg-black/20 px-2 py-0.5 rounded cursor-pointer font-sans transition-colors font-medium"
          title="Change Color Theme"
        >
          <Palette size={11} />
          <span>{currentTheme.icon}</span>
          <span className="hidden md:inline">{currentTheme.name}</span>
        </button>

        {/* Copilot AI Button */}
        <button
          onClick={onToggleCopilot}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded cursor-pointer font-sans font-semibold transition-colors"
          title="Toggle Ask Abhinav Copilot"
        >
          <Sparkles size={11} />
          <span>Copilot</span>
        </button>
      </div>
    </footer>
  );
}
