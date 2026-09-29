import React, { useEffect } from "react";
import {
  X,
  FolderOpen,
  Folder,
  Palette,
  Github,
  Linkedin,
  Mail,
  Download,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { FileIcon } from "./FileIcon";
import { IDE_FILES, IDE_THEMES, abhinavProfile } from "../../content/ideContent";
import type { FileId } from "../../types/ide";

interface MobileDrawerProps {
  isOpen: boolean;
  activeFile: FileId;
  themeId: string;
  onClose: () => void;
  onSelectFile: (fileId: FileId) => void;
  onOpenThemeModal: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  activeFile,
  themeId,
  onClose,
  onSelectFile,
  onOpenThemeModal,
}) => {
  const currentTheme = IDE_THEMES.find((t) => t.id === themeId) || IDE_THEMES[0];

  // Prevent background scrolling when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const srcFiles = IDE_FILES.filter((f) => f.folder === "src" || f.folder === "data");
  const rootFiles = IDE_FILES.filter((f) => f.folder === "root");

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative z-10 w-[82vw] max-w-[320px] h-full bg-vscode-bg2 border-r border-vscode-border shadow-2xl flex flex-col animate-slide-up text-vscode-text"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        aria-label="Mobile Navigation Explorer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-3 h-12 border-b border-vscode-border bg-vscode-title">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-vscode-dim">
              Explorer
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-vscode-bg text-vscode-blue font-semibold border border-vscode-border">
              abhinav-portfolio
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded text-vscode-dim hover:text-vscode-text hover:bg-vscode-bg3 active:scale-95 transition-all"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card Summary */}
        <div className="p-3 border-b border-vscode-border bg-vscode-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-vscode-blue overflow-hidden shrink-0 bg-vscode-bg">
              <img
                src="/images/abhinav-avatar.png"
                alt="Abhinav Nigam"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://avatars.githubusercontent.com/u/10427824?v=4";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-xs text-vscode-text truncate flex items-center gap-1">
                Abhinav Nigam
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              </div>
              <div className="text-[11px] text-vscode-blue font-mono truncate">
                Sr. SWE @ Google
              </div>
              <div className="text-[10px] text-vscode-dim truncate">
                Cloud SecOps • 12+ Yrs
              </div>
            </div>
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto thin-scroll py-2 px-1 text-xs font-mono">
          {/* Section: src/ */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 text-vscode-dim font-bold text-[11px] uppercase tracking-wider">
              <ChevronDown size={14} />
              <FolderOpen size={14} className="text-vscode-blue2" />
              <span>src / portfolio</span>
            </div>

            <div className="space-y-0.5 mt-0.5">
              {srcFiles.map((f) => {
                const isActive = activeFile === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFile(f.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all ${
                      isActive
                        ? "bg-vscode-bg text-vscode-blue font-semibold border-l-2 border-vscode-blue shadow-sm"
                        : "text-vscode-text hover:bg-vscode-bg3 active:bg-vscode-bg3"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileIcon name={f.name} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {f.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-500/10 text-vscode-blue border border-blue-500/20">
                        {f.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: root/ */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 text-vscode-dim font-bold text-[11px] uppercase tracking-wider">
              <ChevronDown size={14} />
              <Folder size={14} className="text-vscode-yellow" />
              <span>root / documents</span>
            </div>

            <div className="space-y-0.5 mt-0.5">
              {rootFiles.map((f) => {
                const isActive = activeFile === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectFile(f.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-all ${
                      isActive
                        ? "bg-vscode-bg text-vscode-blue font-semibold border-l-2 border-vscode-blue shadow-sm"
                        : "text-vscode-text hover:bg-vscode-bg3 active:bg-vscode-bg3"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileIcon name={f.name} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {f.download && (
                      <Download size={13} className="text-vscode-dim shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-vscode-border bg-vscode-bg/70 space-y-2.5 shrink-0">
          {/* Theme switcher button */}
          <button
            onClick={() => {
              onClose();
              onOpenThemeModal();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-vscode-bg2 hover:bg-vscode-bg3 border border-vscode-border text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-vscode-blue" />
              <span className="text-vscode-text font-mono truncate">Theme</span>
            </div>
            <div className="flex items-center gap-1 text-vscode-dim text-[11px]">
              <span>{currentTheme.name}</span>
              <ChevronRight size={13} />
            </div>
          </button>

          {/* Social Links Row */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={abhinavProfile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded bg-vscode-bg2 hover:bg-vscode-bg3 text-vscode-text border border-vscode-border transition-colors"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={15} className="text-[#0077b5]" />
            </a>
            <a
              href={abhinavProfile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded bg-vscode-bg2 hover:bg-vscode-bg3 text-vscode-text border border-vscode-border transition-colors"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <Github size={15} />
            </a>
            <a
              href={abhinavProfile.devto}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded bg-vscode-bg2 hover:bg-vscode-bg3 text-vscode-text border border-vscode-border transition-colors"
              title="DEV.to Articles"
              aria-label="DEV.to Articles"
            >
              <BookOpen size={15} className="text-vscode-purple" />
            </a>
            <a
              href={`mailto:${abhinavProfile.email}`}
              className="flex items-center justify-center w-8 h-8 rounded bg-vscode-bg2 hover:bg-vscode-bg3 text-vscode-text border border-vscode-border transition-colors"
              title="Send Email"
              aria-label="Send Email"
            >
              <Mail size={15} className="text-vscode-green" />
            </a>
          </div>

          {/* SecOps Status Pill */}
          <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-mono text-vscode-dim text-center">
            <ShieldCheck size={12} className="text-vscode-blue" />
            <span>Google Cloud SecOps Verified</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
