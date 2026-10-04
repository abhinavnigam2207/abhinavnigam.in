import { useState, useEffect, useCallback } from "react";
import { TitleBar } from "../components/ide/TitleBar";
import { MenuBar } from "../components/ide/MenuBar";
import { ActivityBar } from "../components/ide/ActivityBar";
import { SidebarExplorer } from "../components/ide/SidebarExplorer";
import { TabBar } from "../components/ide/TabBar";
import { TerminalPanel } from "../components/ide/TerminalPanel";
import { StatusBar } from "../components/ide/StatusBar";
import { CommandPalette } from "../components/ide/CommandPalette";
import { ThemePickerModal } from "../components/ide/ThemePickerModal";
import { CopilotDrawer } from "../components/ide/CopilotDrawer";
import { CompactTopBar } from "../components/ide/CompactTopBar";
import { MobileDrawer } from "../components/ide/MobileDrawer";

// Views
import { HomeView } from "../components/ide/views/HomeView";
import { AboutView } from "../components/ide/views/AboutView";
import { ExperienceView } from "../components/ide/views/ExperienceView";
import { ProjectsView } from "../components/ide/views/ProjectsView";
import { SkillsView } from "../components/ide/views/SkillsView";
import { GoogleReferView } from "../components/ide/views/GoogleReferView";
import { BlogView } from "../components/ide/views/BlogView";
import { ContactView } from "../components/ide/views/ContactView";
import { ReadmeView } from "../components/ide/views/ReadmeView";
import { ResumeView } from "../components/ide/views/ResumeView";

import type { FileId } from "../types/ide";
import { IDE_FILES } from "../content/ideContent";
import "../site.css";

const STORAGE_THEME_KEY = "abhinav-portfolio-theme-v2";
const IDE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Syne:wght@700;800&display=swap";

interface IDEAppProps {
  initialFile?: FileId;
}

export default function IDEApp({ initialFile = "home" }: IDEAppProps) {
  const [activeFile, setActiveFile] = useState<FileId>(initialFile);
  const [openTabs, setOpenTabs] = useState<FileId[]>([
    "home",
    "experience",
    "projects",
    "skills",
    "google-refer",
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Responsive Compact Shell State (< 1024px)
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // The IDE shell's global styles and fonts apply only while it is mounted.
  useEffect(() => {
    document.documentElement.classList.add("ide-mode");
    const fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = IDE_FONTS_URL;
    document.head.appendChild(fonts);
    return () => {
      document.documentElement.classList.remove("ide-mode");
      fonts.remove();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Theme Management (Default: light)
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      return localStorage.getItem(STORAGE_THEME_KEY) || "default";
    }
    return "default";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const root = document.documentElement;
      if (themeId === "default") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", themeId);
      }
      localStorage.setItem(STORAGE_THEME_KEY, themeId);
    }
  }, [themeId]);

  // Open file in tabs
  const handleOpenFile = useCallback((id: FileId) => {
    setActiveFile(id);
    setOpenTabs((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  // Close tab
  const handleCloseTab = useCallback((id: FileId) => {
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t !== id);
      if (remaining.length === 0) {
        remaining.push("home");
      }
      if (activeFile === id) {
        setActiveFile(remaining[remaining.length - 1] || "home");
      }
      return remaining;
    });
  }, [activeFile]);

  // Close all tabs
  const handleCloseAllTabs = useCallback(() => {
    setOpenTabs(["home"]);
    setActiveFile("home");
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      // Ctrl+B or Cmd+B (Toggle Sidebar)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Ctrl+` (Toggle Terminal)
      else if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      }
      // Ctrl+Shift+C (Toggle Copilot)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
      }
      // Ctrl+W (Close Tab)
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        handleCloseTab(activeFile);
      }
      // Alt+1 to Alt+9 (Jump between open tabs)
      else if (e.altKey && !isNaN(Number(e.key))) {
        const num = Number(e.key);
        if (num > 0 && num <= openTabs.length) {
          e.preventDefault();
          setActiveFile(openTabs[num - 1] || "home");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, openTabs, handleCloseTab]);

  // Render current active view
  const renderActiveView = () => {
    switch (activeFile) {
      case "home":
        return (
          <HomeView
            onNavigate={handleOpenFile}
            onToggleCopilot={() => setCopilotOpen(true)}
            onToggleTerm={() => setTerminalOpen(true)}
          />
        );
      case "about":
        return <AboutView />;
      case "experience":
        return <ExperienceView />;
      case "projects":
        return <ProjectsView />;
      case "skills":
        return <SkillsView />;
      case "google-refer":
        return <GoogleReferView />;
      case "blog":
        return <BlogView />;
      case "contact":
        return <ContactView />;
      case "readme":
        return <ReadmeView />;
      case "resume":
        return <ResumeView />;
      default:
        return (
          <HomeView
            onNavigate={handleOpenFile}
            onToggleCopilot={() => setCopilotOpen(true)}
            onToggleTerm={() => setTerminalOpen(true)}
          />
        );
    }
  };

  return (
    <div
      className={`app-grid ${isCompact ? "app-compact" : !sidebarOpen ? "sidebar-collapsed" : ""}`}
    >
      {isCompact ? (
        <>
          {/* Mobile & Tablet Compact Topbar */}
          <CompactTopBar
            activeFile={activeFile}
            drawerOpen={mobileDrawerOpen}
            onToggleDrawer={() => setMobileDrawerOpen((prev) => !prev)}
            onOpenCmd={() => setCmdOpen(true)}
            onOpenThemeModal={() => setThemeModalOpen(true)}
            onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
            onToggleTerm={() => setTerminalOpen((prev) => !prev)}
          />

          {/* Mobile & Tablet Slide-over Explorer Drawer */}
          <MobileDrawer
            isOpen={mobileDrawerOpen}
            activeFile={activeFile}
            themeId={themeId}
            onClose={() => setMobileDrawerOpen(false)}
            onSelectFile={handleOpenFile}
            onOpenThemeModal={() => setThemeModalOpen(true)}
          />
        </>
      ) : (
        <>
          {/* 1. Title Bar (Top row) */}
          <TitleBar onOpenCmd={() => setCmdOpen(true)} />

          {/* 2. Menu Bar (Second row) */}
          <MenuBar
            onNavigate={handleOpenFile}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onToggleTerm={() => setTerminalOpen((prev) => !prev)}
            onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
            onOpenCmd={() => setCmdOpen(true)}
            onCloseTab={() => handleCloseTab(activeFile)}
            onCloseAllTabs={handleCloseAllTabs}
            onOpenThemeModal={() => setThemeModalOpen(true)}
          />

          {/* 3. Activity Bar (Far left column) */}
          <ActivityBar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            copilotOpen={copilotOpen}
            onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
            onOpenCmd={() => setCmdOpen(true)}
            onOpenThemeModal={() => setThemeModalOpen(true)}
          />

          {/* 4. Sidebar File Explorer (Second column) */}
          <SidebarExplorer
            activeFile={activeFile}
            openTabs={openTabs}
            onSelectFile={handleOpenFile}
            onCloseTab={handleCloseTab}
          />
        </>
      )}

      {/* 5. Editor Workspace (Takes remaining height and width) */}
      <main
        style={!isCompact ? { gridArea: "editor" } : undefined}
        className="flex-1 flex flex-col h-full bg-vscode-bg overflow-hidden relative min-w-0"
      >
        {/* Editor Tab Bar */}
        <TabBar
          activeFile={activeFile}
          openTabs={openTabs}
          onSelectTab={setActiveFile}
          onCloseTab={handleCloseTab}
        />

        {/* Viewport for Active File */}
        <div className="flex-1 overflow-y-auto thin-scroll bg-vscode-bg relative">
          {renderActiveView()}
        </div>

        {/* Docked Interactive Terminal */}
        <TerminalPanel
          isOpen={terminalOpen}
          onClose={() => setTerminalOpen(false)}
          onNavigate={handleOpenFile}
        />
      </main>

      {/* 6. Status Bar (Bottom row) */}
      <StatusBar
        activeFile={activeFile}
        themeId={themeId}
        isCompact={isCompact}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
        onToggleTerm={() => setTerminalOpen((prev) => !prev)}
      />

      {/* 7. Slide-over Copilot AI Drawer */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />

      {/* 8. Command Palette Modal (Ctrl + P) */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelectFile={handleOpenFile}
        onToggleTerm={() => setTerminalOpen((prev) => !prev)}
        onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
        onOpenThemeModal={() => setThemeModalOpen(true)}
      />

      {/* 9. Theme Picker Modal */}
      <ThemePickerModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentThemeId={themeId}
        onSelectTheme={setThemeId}
      />
    </div>
  );
}
