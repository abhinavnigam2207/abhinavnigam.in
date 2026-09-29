import { X, ChevronRight } from "lucide-react";
import { IDE_FILES } from "../../content/ideContent";
import { FileIcon } from "./FileIcon";
import type { FileId } from "../../types/ide";

interface TabBarProps {
  activeFile: FileId;
  openTabs: FileId[];
  onSelectTab: (id: FileId) => void;
  onCloseTab: (id: FileId) => void;
}

export function TabBar({ activeFile, openTabs, onSelectTab, onCloseTab }: TabBarProps) {
  const currentFile = IDE_FILES.find((f) => f.id === activeFile);

  return (
    <div className="flex flex-col border-b border-vscode-border bg-vscode-bg3 select-none">
      {/* Tab Strip */}
      <div className="flex items-center overflow-x-auto thin-scroll h-[35px] border-b border-vscode-border/50">
        {openTabs.map((id) => {
          const file = IDE_FILES.find((f) => f.id === id);
          if (!file) return null;
          const isActive = activeFile === id;
          return (
            <div
              key={id}
              onClick={() => onSelectTab(id)}
              className={`group flex items-center gap-2 px-3.5 h-full text-xs font-mono cursor-pointer border-r border-vscode-border transition-all shrink-0 relative ${
                isActive
                  ? "bg-vscode-bg text-vscode-bright font-medium border-t-2 border-t-vscode-blue2 shadow-xs"
                  : "bg-vscode-bg3 text-vscode-dim hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <FileIcon name={file.name} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(id);
                }}
                className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 hover:text-vscode-red transition-colors ${
                  isActive ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70"
                }`}
                title="Close Tab"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-mono text-vscode-dim bg-vscode-bg/50">
        <span>abhinav-portfolio</span>
        <ChevronRight size={11} className="opacity-50" />
        <span>{currentFile?.folder || "src"}</span>
        <ChevronRight size={11} className="opacity-50" />
        <div className="flex items-center gap-1.5 text-vscode-text font-medium">
          {currentFile && <FileIcon name={currentFile.name} className="w-3 h-3" />}
          <span>{currentFile?.name}</span>
        </div>
      </div>
    </div>
  );
}
