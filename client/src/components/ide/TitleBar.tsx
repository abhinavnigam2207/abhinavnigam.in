import { useState } from "react";
import { Search } from "lucide-react";

interface TitleBarProps {
  onOpenCmd: () => void;
}

export function TitleBar({ onOpenCmd }: TitleBarProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClose = () => {
    const messages = [
      "You can't close a portfolio! 😄",
      "Nice try. I'm staying open 🚀",
      "Ctrl+W won't save you here 😂",
      "Senior Engineer mode is always active 🛡️",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleMinimize = () => {
    setToastMessage("Minimized to taskbar! (Just kidding 😉)");
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      style={{ gridArea: "title" }}
      className="bg-vscode-title flex items-center justify-between px-3 border-b border-vscode-border select-none relative z-30 text-xs text-vscode-dim h-[32px]"
    >
      {/* Window Controls */}
      <div className="flex items-center gap-2 w-48">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity border border-[#e0443e] cursor-pointer"
            title="Close Window"
            aria-label="Close"
          />
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity border border-[#dea123] cursor-pointer"
            title="Minimize"
            aria-label="Minimize"
          />
          <button
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity border border-[#1aab29] cursor-pointer"
            title="Maximize"
            aria-label="Maximize"
          />
        </div>
        <span className="text-[11px] font-sans text-vscode-dim font-medium tracking-wide hidden sm:inline ml-2">
          Visual Studio Code
        </span>
      </div>

      {/* Centered Command Palette Trigger */}
      <button
        onClick={onOpenCmd}
        className="flex items-center justify-center gap-2 px-3 py-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-vscode-border text-vscode-dim hover:text-vscode-bright transition-all text-[11px] font-mono cursor-pointer max-w-sm w-full mx-2 shadow-xs"
        title="Search files or commands (Ctrl + P)"
      >
        <Search size={13} className="opacity-70" />
        <span className="truncate">abhinav-portfolio — Visual Studio Code</span>
        <div className="hidden md:flex items-center gap-1 text-[10px] opacity-70 ml-auto">
          <kbd className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded text-[9px]">Ctrl</kbd>
          <kbd className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded text-[9px]">P</kbd>
        </div>
      </button>

      {/* Right status info */}
      <div className="flex items-center justify-end gap-2 w-48 text-[11px] font-mono">
        <span className="inline-flex items-center gap-1 text-vscode-green font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-vscode-green animate-pulse" />
          Google Cloud SecOps
        </span>
      </div>

      {/* Floating playful toast */}
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-vscode-bg border border-vscode-blue2 text-vscode-text px-4 py-2 rounded-md shadow-lg text-xs font-mono animate-toast-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
