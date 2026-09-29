import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal, X } from "lucide-react";
import { IDE_FILES } from "../../content/ideContent";
import { FileIcon } from "./FileIcon";
import type { FileId } from "../../types/ide";

interface SidebarExplorerProps {
  activeFile: FileId;
  openTabs: FileId[];
  onSelectFile: (fileId: FileId) => void;
  onCloseTab: (fileId: FileId) => void;
}

export function SidebarExplorer({
  activeFile,
  openTabs,
  onSelectFile,
  onCloseTab,
}: SidebarExplorerProps) {
  const [srcOpen, setSrcOpen] = useState(true);
  const [openEditorsOpen, setOpenEditorsOpen] = useState(true);

  const srcFiles = IDE_FILES.filter((f) => f.folder === "src" || f.folder === "data");
  const rootFiles = IDE_FILES.filter((f) => f.folder === "root");

  return (
    <div
      style={{ gridArea: "side" }}
      className="bg-vscode-bg2 flex flex-col h-full border-r border-vscode-border select-none overflow-hidden text-xs font-mono w-[240px]"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-vscode-border">
        <span className="font-semibold text-[11px] uppercase tracking-wider text-vscode-dim">
          Explorer
        </span>
        <button
          className="text-vscode-dim hover:text-vscode-text p-0.5 rounded cursor-pointer"
          title="More actions"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll py-1">
        {/* Open Editors Section */}
        <div className="mb-2">
          <button
            onClick={() => setOpenEditorsOpen(!openEditorsOpen)}
            className="w-full flex items-center gap-1.5 px-3 py-1 font-semibold text-[11px] text-vscode-dim hover:text-vscode-text cursor-pointer"
          >
            {openEditorsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="uppercase tracking-wider">Open Editors</span>
          </button>

          {openEditorsOpen && (
            <div className="mt-0.5">
              {openTabs.map((id) => {
                const file = IDE_FILES.find((f) => f.id === id);
                if (!file) return null;
                const isActive = activeFile === id;
                return (
                  <div
                    key={id}
                    onClick={() => onSelectFile(id)}
                    className={`group flex items-center justify-between px-5 py-1 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-vscode-bg text-vscode-blue2 font-medium"
                        : "text-vscode-text hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon name={file.name} className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-vscode-red p-0.5 rounded cursor-pointer transition-opacity"
                      title="Close"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Tree Section */}
        <div>
          <div className="flex items-center gap-1 px-3 py-1 font-semibold text-[11px] text-vscode-dim">
            <span className="uppercase tracking-wider">Abhinav-Portfolio</span>
          </div>

          {/* src folder */}
          <div className="mt-0.5">
            <button
              onClick={() => setSrcOpen(!srcOpen)}
              className="w-full flex items-center gap-1.5 px-4 py-1 text-vscode-text hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer font-medium"
            >
              {srcOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {srcOpen ? (
                <FolderOpen size={14} className="text-vscode-yellow" />
              ) : (
                <Folder size={14} className="text-vscode-yellow" />
              )}
              <span>src</span>
            </button>

            {srcOpen && (
              <div className="ml-3 border-l border-vscode-border/50 pl-1 mt-0.5">
                {srcFiles.map((file) => {
                  const isActive = activeFile === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`flex items-center justify-between px-3 py-1 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-vscode-bg text-vscode-blue2 font-semibold shadow-xs"
                          : "text-vscode-text hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon name={file.name} className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      {file.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-vscode-blue2/10 text-vscode-blue2 border border-vscode-blue2/30 font-sans">
                          {file.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* root files */}
          <div className="mt-1">
            {rootFiles.map((file) => {
              const isActive = activeFile === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`flex items-center justify-between px-7 py-1 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-vscode-bg text-vscode-blue2 font-semibold shadow-xs"
                      : "text-vscode-text hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon name={file.name} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
