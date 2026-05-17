'use client';

import { ThemeMode, FontSettings } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppContextType {
  currentSurah: number;
  setCurrentSurah: (n: number) => void;
  fontSettings: FontSettings;

  setFontSettings: (s: FontSettings) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (v: boolean) => void;
  updateFontSettings: (partial: Partial<FontSettings>) => void;
  isSurahSidebarOpen: boolean;
  setIsSurahSidebarOpen: (v: boolean) => void;
  isFontSettingsExpanded: boolean;
  setIsFontSettingsExpanded: (v: boolean) => void;
  viewMode: 'translation' | 'reading';
  setViewMode: (m: 'translation' | 'reading') => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light' | 'sepia';
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFont: 'kfgq',
  arabicFontSize: 30,
  translationFontSize: 17,
};


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentSurah, setCurrentSurahState] = useState<number>(1);
  const [fontSettings, setFontSettingsState] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [isSurahSidebarOpen, setIsSurahSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFontSettingsExpanded, setIsFontSettingsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'translation' | 'reading'>('translation');
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('quran_theme') as ThemeMode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedTheme) setThemeState(savedTheme);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('quran_theme', t);
  }, []);

  useEffect(() => {
    const effective = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(effective);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setCurrentSurah = useCallback((n: number) => {
    setCurrentSurahState(n);
    localStorage.setItem('quran_current_surah', String(n));
  }, []);


  const setFontSettings = useCallback((s: FontSettings) => {
    setFontSettingsState(s);
    localStorage.setItem('quran_font_settings', JSON.stringify(s));
  }, []);

  const updateFontSettings = useCallback((partial: Partial<FontSettings>) => {
    setFontSettingsState(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('quran_font_settings', JSON.stringify(next));
      return next;
    });
  }, []);



  return (
    <AppContext.Provider value={{
      currentSurah,
      setCurrentSurah,
      fontSettings,
      setFontSettings,
      updateFontSettings,
      isSurahSidebarOpen,
      setIsSurahSidebarOpen,
      isRightPanelOpen,
      setIsRightPanelOpen,
      isSearchOpen,
      setIsSearchOpen,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      isFontSettingsExpanded,
      setIsFontSettingsExpanded,
      viewMode,
      setViewMode,
      theme,
      setTheme,
      resolvedTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}