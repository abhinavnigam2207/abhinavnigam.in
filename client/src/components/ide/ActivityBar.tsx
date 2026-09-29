import { Files, Search, GitBranch, Sparkles, Settings, Palette } from "lucide-react";

interface ActivityBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  copilotOpen: boolean;
  onToggleCopilot: () => void;
  onOpenCmd: () => void;
  onOpenThemeModal: () => void;
}

export function ActivityBar({
  sidebarOpen,
  onToggleSidebar,
  copilotOpen,
  onToggleCopilot,
  onOpenCmd,
  onOpenThemeModal,
}: ActivityBarProps) {
  return (
    <div
      style={{ gridArea: "act" }}
      className="bg-vscode-bg2 flex flex-col items-center justify-between py-2 border-r border-vscode-border select-none z-10 w-[50px]"
    >
      {/* Top action icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Explorer Button */}
        <button
          onClick={onToggleSidebar}
          className={`w-full h-11 flex items-center justify-center relative cursor-pointer transition-colors ${
            sidebarOpen
              ? "text-vscode-blue2"
              : "text-vscode-dim hover:text-vscode-text"
          }`}
          title="Explorer (Ctrl + B)"
          aria-label="Toggle Explorer"
        >
          {sidebarOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-vscode-blue2 rounded-r" />
          )}
          <Files size={21} strokeWidth={sidebarOpen ? 2.2 : 1.7} />
        </button>

        {/* Search / Command Palette Button */}
        <button
          onClick={onOpenCmd}
          className="w-full h-11 flex items-center justify-center relative cursor-pointer text-vscode-dim hover:text-vscode-text transition-colors"
          title="Search / Command Palette (Ctrl + P)"
          aria-label="Command Palette"
        >
          <Search size={20} strokeWidth={1.7} />
        </button>

        {/* Source Control / Git Button */}
        <button
          onClick={onOpenCmd}
          className="w-full h-11 flex items-center justify-center relative cursor-pointer text-vscode-dim hover:text-vscode-text transition-colors"
          title="Source Control (main* branch)"
          aria-label="Source Control"
        >
          <GitBranch size={20} strokeWidth={1.7} />
          <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-vscode-green" />
        </button>

        {/* Copilot AI Button */}
        <button
          onClick={onToggleCopilot}
          className={`w-full h-11 flex items-center justify-center relative cursor-pointer transition-colors ${
            copilotOpen
              ? "text-vscode-purple"
              : "text-vscode-dim hover:text-vscode-purple"
          }`}
          title="Ask Abhinav Copilot AI (Ctrl + Shift + C)"
          aria-label="Toggle Copilot AI"
        >
          {copilotOpen && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-vscode-purple rounded-r" />
          )}
          <Sparkles size={21} strokeWidth={copilotOpen ? 2.2 : 1.8} className={copilotOpen ? "animate-pulse" : ""} />
        </button>
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Theme Picker Button */}
        <button
          onClick={onOpenThemeModal}
          className="w-full h-11 flex items-center justify-center relative cursor-pointer text-vscode-dim hover:text-vscode-text transition-colors"
          title="Color Theme Switcher"
          aria-label="Theme Switcher"
        >
          <Palette size={19} strokeWidth={1.7} />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenThemeModal}
          className="w-full h-11 flex items-center justify-center relative cursor-pointer text-vscode-dim hover:text-vscode-text transition-colors"
          title="Settings & Themes"
          aria-label="Settings"
        >
          <Settings size={19} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}
