import { useState, useRef, useEffect } from "react";
import type { FileId } from "../../types/ide";

interface MenuBarProps {
  onNavigate: (fileId: FileId) => void;
  onToggleSidebar: () => void;
  onToggleTerm: () => void;
  onToggleCopilot: () => void;
  onOpenCmd: () => void;
  onCloseTab?: () => void;
  onCloseAllTabs?: () => void;
  onOpenThemeModal?: () => void;
}

type MenuKey = "file" | "edit" | "selection" | "view" | "go" | "run" | "terminal" | "help" | null;

export function MenuBar({
  onNavigate,
  onToggleSidebar,
  onToggleTerm,
  onToggleCopilot,
  onOpenCmd,
  onCloseTab,
  onCloseAllTabs,
  onOpenThemeModal,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItem = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  const btnClass =
    "px-2 py-0.5 rounded text-[11px] font-sans text-vscode-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors select-none cursor-pointer";
  const dropdownClass =
    "absolute top-full left-0 mt-0.5 w-56 bg-vscode-bg border border-vscode-border rounded shadow-xl py-1 z-50 text-[11px] font-sans select-none animate-fade-in";
  const itemClass =
    "flex items-center justify-between px-3 py-1.5 text-vscode-text hover:bg-vscode-blue2 hover:text-white transition-colors cursor-pointer";
  const dividerClass = "my-1 border-t border-vscode-border";

  return (
    <div
      ref={containerRef}
      style={{ gridArea: "menu" }}
      className="bg-vscode-title flex items-center gap-0.5 px-3 border-b border-vscode-border text-xs relative z-20 h-[26px]"
    >
      {/* File Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}>
          File
        </button>
        {activeMenu === "file" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("home"))}>
              <span>Home (Overview)</span>
              <kbd className="opacity-60 text-[10px]">Alt+1</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("experience"))}>
              <span>Experience</span>
              <kbd className="opacity-60 text-[10px]">Alt+2</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("projects"))}>
              <span>Projects</span>
              <kbd className="opacity-60 text-[10px]">Alt+3</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("skills"))}>
              <span>Skills</span>
              <kbd className="opacity-60 text-[10px]">Alt+4</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("google-refer"))}>
              <span>Google Referral</span>
              <kbd className="opacity-60 text-[10px]">Alt+5</kbd>
            </div>
            <div className={dividerClass} />
            <div className={itemClass} onClick={() => handleItem(() => onCloseTab?.())}>
              <span>Close Active Tab</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+W</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onCloseAllTabs?.())}>
              <span>Close All Tabs</span>
            </div>
            <div className={dividerClass} />
            <div className={itemClass} onClick={() => handleItem(() => window.print())}>
              <span>Print / Save as PDF</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+P</kbd>
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "edit" ? null : "edit")}>
          Edit
        </button>
        {activeMenu === "edit" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(() => alert("All code here is production-ready! 😉"))}>
              <span>Undo</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+Z</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => navigator.clipboard.writeText("https://linkedin.com/in/abhinavnigam2207"))}>
              <span>Copy LinkedIn URL</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => navigator.clipboard.writeText("abhinavnigam2207@gmail.com"))}>
              <span>Copy Email Address</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "selection" ? null : "selection")}>
          Selection
        </button>
        {activeMenu === "selection" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("skills"))}>
              <span>Select All Skills</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("experience"))}>
              <span>Expand Career Timeline</span>
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}>
          View
        </button>
        {activeMenu === "view" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(onOpenCmd)}>
              <span>Command Palette...</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+P</kbd>
            </div>
            <div className={dividerClass} />
            <div className={itemClass} onClick={() => handleItem(onToggleSidebar)}>
              <span>Toggle Side Bar</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+B</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(onToggleTerm)}>
              <span>Toggle Terminal</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+`</kbd>
            </div>
            <div className={itemClass} onClick={() => handleItem(onToggleCopilot)}>
              <span className="text-vscode-purple font-semibold">✨ Toggle Copilot AI</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+Shift+C</kbd>
            </div>
            <div className={dividerClass} />
            <div className={itemClass} onClick={() => handleItem(() => onOpenThemeModal?.())}>
              <span>Color Theme Preferences...</span>
            </div>
          </div>
        )}
      </div>

      {/* Go Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "go" ? null : "go")}>
          Go
        </button>
        {activeMenu === "go" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("home"))}>
              <span>Go to Overview</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("experience"))}>
              <span>Go to Experience</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("projects"))}>
              <span>Go to Projects</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("blog"))}>
              <span>Go to Blog & Articles</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("contact"))}>
              <span>Go to Contact</span>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "terminal" ? null : "terminal")}>
          Terminal
        </button>
        {activeMenu === "terminal" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(onToggleTerm)}>
              <span>Toggle Terminal</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+`</kbd>
            </div>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button className={btnClass} onClick={() => setActiveMenu(activeMenu === "help" ? null : "help")}>
          Help
        </button>
        {activeMenu === "help" && (
          <div className={dropdownClass}>
            <div className={itemClass} onClick={() => handleItem(() => onNavigate("readme"))}>
              <span>Welcome & Documentation</span>
            </div>
            <div className={itemClass} onClick={() => handleItem(onOpenCmd)}>
              <span>Keyboard Shortcuts Reference</span>
              <kbd className="opacity-60 text-[10px]">Ctrl+P</kbd>
            </div>
            <div className={dividerClass} />
            <div className={itemClass} onClick={() => handleItem(() => window.open("https://github.com/abhinavnigam2207", "_blank"))}>
              <span>View Abhinav's GitHub</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
