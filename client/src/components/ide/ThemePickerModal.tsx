import { X, Check } from "lucide-react";
import { IDE_THEMES } from "../../content/ideContent";

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export function ThemePickerModal({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}: ThemePickerModalProps) {
  if (!isOpen) return null;

  const lightThemes = IDE_THEMES.filter((t) => t.type === "light");
  const darkThemes = IDE_THEMES.filter((t) => t.type === "dark");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-md bg-vscode-bg border border-vscode-border rounded-lg shadow-2xl overflow-hidden font-mono text-xs select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-vscode-bg2 border-b border-vscode-border">
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <span className="font-semibold text-vscode-bright text-sm font-sans">
              Color Theme Preferences
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-vscode-dim hover:text-vscode-text hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto thin-scroll">
          {/* Light Themes Section */}
          <div>
            <div className="text-[11px] font-semibold text-vscode-dim uppercase tracking-wider mb-2 px-1">
              ☀️ Light Themes (Default & Curated)
            </div>
            <div className="space-y-1">
              {lightThemes.map((t) => {
                const isSelected = currentThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-vscode-bg3 border-vscode-blue2 text-vscode-bright font-semibold shadow-xs"
                        : "border-transparent hover:bg-vscode-bg2 text-vscode-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{t.icon}</span>
                      <span className="font-sans text-xs">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: t.bgPreview }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: t.accent }}
                      />
                      {isSelected && <Check size={14} className="text-vscode-blue2 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Themes Section */}
          <div>
            <div className="text-[11px] font-semibold text-vscode-dim uppercase tracking-wider mb-2 px-1">
              🌙 Dark Themes (For Night Coding)
            </div>
            <div className="space-y-1">
              {darkThemes.map((t) => {
                const isSelected = currentThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-vscode-bg3 border-vscode-blue2 text-vscode-bright font-semibold shadow-xs"
                        : "border-transparent hover:bg-vscode-bg2 text-vscode-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{t.icon}</span>
                      <span className="font-sans text-xs">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: t.bgPreview }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: t.accent }}
                      />
                      {isSelected && <Check size={14} className="text-vscode-blue2 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-vscode-bg2 border-t border-vscode-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-vscode-bg border border-vscode-border text-vscode-text hover:bg-vscode-bg3 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
