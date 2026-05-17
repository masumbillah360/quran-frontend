'use client';

import { ThemeMode } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppContextType {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light' | 'sepia';
}

const AppContext = createContext<AppContextType | null>(null);



export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light' | 'sepia'>('dark');

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



  return (
    <AppContext.Provider value={{
      isMobileMenuOpen,
      setIsMobileMenuOpen,
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