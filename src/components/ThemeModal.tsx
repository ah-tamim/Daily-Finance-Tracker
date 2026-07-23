import React from 'react';
import { Palette, Check, X, Moon, Sun } from 'lucide-react';
import { THEMES, ThemeId, ThemeConfig } from '../utils/theme';

interface ThemeModalProps {
  isOpen: boolean;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold theme-text">Select App Theme</h3>
              <p className="text-xs theme-text-muted">Choose your preferred visual aesthetic and color palette</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 theme-subtle-btn rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {THEMES.map((theme: ThemeConfig) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'theme-card hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span className="font-bold text-xs theme-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {theme.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="p-1 bg-emerald-600 text-white rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 theme-text-muted flex items-center gap-1 font-mono">
                        {theme.category === 'dark' ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                        {theme.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] theme-text-muted line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Color preview bar */}
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="h-2 flex-1 rounded-sm border border-slate-300 dark:border-slate-700" style={{ backgroundColor: theme.previewColor }} />
                  <div className="h-2 flex-1 rounded-sm opacity-80" style={{ backgroundColor: theme.accentColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold theme-subtle-btn rounded-lg transition"
          >
            Close
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};
