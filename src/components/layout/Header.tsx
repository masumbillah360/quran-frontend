'use client';
import { ThemeMode } from '@/types';
import { useApp } from '@/context/AppContext';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Contrast, Menu, X, Settings, Monitor } from 'lucide-react';

const THEME_OPTIONS: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'sepia', icon: Contrast, label: 'Sepia' },
  { id: 'system', icon: Monitor, label: 'System' },
];

export default function Header() {
  const {
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    theme,
    setTheme,
    resolvedTheme,
  } = useApp();

  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const themeIcon = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark') ? Moon
    : theme === 'light' || (theme === 'system' && resolvedTheme === 'light') ? Sun
      : theme === 'sepia' ? Contrast
        : Sun;

  return (
    <header className="h-16 bg-(--bg-canvas) border-b border-(--border-default) flex items-center justify-between px-6 shrink-0 z-20 gap-4">
      {/* ── Left Side: App Branding ── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-(--text-tertiary) hover:bg-(--bg-surface) transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col justify-center">
            <div className="text-base font-bold text-(--text-primary) tracking-tight">Quran Mazid</div>
            <div className="text-[11px] text-(--text-muted) font-medium">Read, Study, and Learn The Quran</div>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <span className="text-base font-bold text-(--text-primary)">Quran Mazid</span>
        </div>
      </div>

      {/* ── Right Side: Actions & Support ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search Action */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-(--text-tertiary) hover:bg-(--bg-surface) transition-all"
          title="Search"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Theme Select Toggler */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${themeOpen ? 'bg-(--bg-elevated) text-(--text-accent)' : 'text-(--text-tertiary) hover:bg-(--bg-surface)'
              }`}
            title="Change theme"
            aria-label="Change theme"
          >
            {React.createElement(themeIcon, { size: 18 })}
          </button>

          {themeOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-(--bg-surface) border border-(--border-subtle) rounded-xl shadow-xl overflow-hidden z-50">
              {THEME_OPTIONS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setTheme(id); setThemeOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-(--bg-elevated) ${theme === id ? 'text-(--text-accent) bg-(--badge-bg) font-medium' : 'text-(--text-secondary)'
                    }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Extra Layout Actions Toggle */}
        <button
          className="flex w-10 h-10 rounded-full items-center justify-center text-(--text-muted) hover:bg-(--bg-surface) hover:text-(--text-tertiary) transition-all"
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}