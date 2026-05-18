'use client';

import { ThemeMode, FontSettings, AyahDetail, AudioState } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
interface AppContextType {
  currentSurah: number;
  setCurrentSurah: (n: number) => void;
  currentAyah: number;
  setCurrentAyah: (n: number) => void;
  fontSettings: FontSettings;
  setFontSettings: (s: FontSettings) => void;
  updateFontSettings: (partial: Partial<FontSettings>) => void;
  isSurahSidebarOpen: boolean;
  setIsSurahSidebarOpen: (v: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (v: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  isJumpOpen: boolean;
  setIsJumpOpen: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  isFontSettingsExpanded: boolean;
  setIsFontSettingsExpanded: (v: boolean) => void;
  viewMode: 'translation' | 'reading';
  setViewMode: (m: 'translation' | 'reading') => void;
  audioState: AudioState;
  playAyah: (surahNum: number, ayah: AyahDetail) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  toggleAyahAudio: (surahNum: number, ayah: AyahDetail) => void;
  goToNextAyah: () => void;
  goToPrevAyah: () => void;
  playSurahFrom: (surahNum: number, fromAyahIdx: number) => void;
  stopAudio: () => void;
  setSurahAudioData: (surahNum: number, url: string, ayahs: AyahDetail[]) => void;
  currentAudioRef: React.RefObject<HTMLAudioElement | null>;
  activeIconTab: string;
  setActiveIconTab: (tab: string) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light' | 'sepia';
  isHeaderVisible: boolean;
  setIsHeaderVisible: (v: boolean) => void;
  handleScroll: (e: Event) => void
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFont: 'kfgq',
  arabicFontSize: 30,
  translationFontSize: 17,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentSurah, setCurrentSurahState] = useState<number>(1);
  const [currentAyah,
    setCurrentAyah] = useState<number>(1);
  const [fontSettings, setFontSettingsState] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [isSurahSidebarOpen, setIsSurahSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFontSettingsExpanded, setIsFontSettingsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'translation' | 'reading'>('translation');
  const [activeIconTab, setActiveIconTab] = useState('quran');
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light' | 'sepia'>('dark');

  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentAyah: null,
    currentSurah: null,
    currentWord: null,
  });
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const surahAudioUrlRef = useRef<string | null>(null);
  const ayahsRef = useRef<AyahDetail[]>([]);
  const rafRef = useRef<number | null>(null);
  const isSingleAyahMode = useRef(false);
  const currentAyahIdxRef = useRef(-1);
  const canPlayHandlerRef = useRef<(() => void) | null>(null);
  const canPlayAttachedRef = useRef(false);

  useEffect(() => {
    const savedSurah = localStorage.getItem('quran_current_surah');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedSurah) setCurrentSurahState(parseInt(savedSurah));
    try {
      const savedFont = localStorage.getItem('quran_font_settings');
      if (savedFont) setFontSettingsState({ ...DEFAULT_FONT_SETTINGS, ...JSON.parse(savedFont) });
    } catch { }
    const savedTheme = localStorage.getItem('quran_theme') as ThemeMode | null;
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

  const setSurahAudioData = useCallback((surahNum: number, url: string, ayahs: AyahDetail[]) => {
    surahAudioUrlRef.current = url;
    ayahsRef.current = ayahs;
  }, []);
  const getWordAtTime = useCallback((currentTimeMs: number, ayah: AyahDetail): number | null => {
    for (const seg of ayah.audio.segments) {
      // seg = [word_index, absStartMs, absEndMs] — all absolute from audio start
      const [wordId, startMs, endMs] = seg;
      if (currentTimeMs >= startMs && currentTimeMs < endMs) {
        return wordId;
      }
    }
    return null;
  }, []);

  const findAyahIdxForTime = useCallback((currentTimeMs: number): number => {
    const ayahs = ayahsRef.current;
    for (let i = 0; i < ayahs.length; i++) {
      if (
        currentTimeMs >= ayahs[i].audio.timestamp_from &&
        currentTimeMs < ayahs[i].audio.timestamp_to
      ) {
        return i;
      }
    }
    return -1;
  }, []);

  const stopWordTracking = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    isSingleAyahMode.current = false;
    currentAyahIdxRef.current = -1;
    canPlayHandlerRef.current = null;
    stopWordTracking();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setAudioState({ isPlaying: false, currentAyah: null, currentSurah: null, currentWord: null });
  }, [stopWordTracking]);


  const isPlayingRef = useRef(false);
  const currentAyahRef = useRef<number | null>(null);
  const currentWordRef = useRef<number | null>(null);
  useEffect(() => {
    isPlayingRef.current = audioState.isPlaying;
    currentAyahRef.current = audioState.currentAyah;
    currentWordRef.current = audioState.currentWord;
  }, [audioState.isPlaying, audioState.currentAyah, audioState.currentWord]);

  const startWordTracking = useCallback(() => {
    stopWordTracking();

    const tick = () => {
      const audio = currentAudioRef.current;
      if (!audio || !isPlayingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const currentTimeMs = audio.currentTime * 1000;
      const idx = findAyahIdxForTime(currentTimeMs);

      if (idx >= 0) {
        const ayah = ayahsRef.current[idx];

        if (currentAyahRef.current !== ayah.ayahId) {
          currentAyahRef.current = ayah.ayahId;
          setAudioState(prev => ({ ...prev, currentAyah: ayah.ayahId }));
        }

        currentAyahIdxRef.current = idx;

        const wordId = getWordAtTime(currentTimeMs, ayah);
        if (currentWordRef.current !== wordId) {
          currentWordRef.current = wordId ?? null;
          setAudioState(prev => ({ ...prev, currentWord: wordId ?? null }));
        }
      }
      if (isSingleAyahMode.current && idx === -1 && currentAyahIdxRef.current >= 0) {
        const lastAyah = ayahsRef.current[currentAyahIdxRef.current];
        if (lastAyah && currentTimeMs >= lastAyah.audio.timestamp_to + 500) {
          stopAudio();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopWordTracking, findAyahIdxForTime, getWordAtTime, stopAudio]);

  const handleCanPlay = useCallback(() => {
    canPlayHandlerRef.current?.();
  }, []);

  const handleAudioEnded = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  const handleAudioError = useCallback(() => {
    canPlayHandlerRef.current = null;
    setAudioState({ isPlaying: false, currentAyah: null, currentSurah: null, currentWord: null });
  }, []);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (!currentAudioRef.current) {
      currentAudioRef.current = new Audio();
      currentAudioRef.current.addEventListener('canplay', handleCanPlay);
      currentAudioRef.current.addEventListener('ended', handleAudioEnded);
      currentAudioRef.current.addEventListener('error', handleAudioError);
      canPlayAttachedRef.current = true;
    } else if (!canPlayAttachedRef.current) {
      currentAudioRef.current.addEventListener('canplay', handleCanPlay);
      currentAudioRef.current.addEventListener('ended', handleAudioEnded);
      currentAudioRef.current.addEventListener('error', handleAudioError);
      canPlayAttachedRef.current = true;
    }
    return currentAudioRef.current;
  }, [handleCanPlay, handleAudioEnded, handleAudioError]);

  const pauseAudio = useCallback(() => {
    if (currentAudioRef.current) currentAudioRef.current.pause();
    stopWordTracking();
    isPlayingRef.current = false;
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, [stopWordTracking]);

  const resumeAudio = useCallback(() => {
    if (currentAudioRef.current && audioState.currentAyah !== null) {
      currentAudioRef.current.play().catch(console.error);
      isPlayingRef.current = true;
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      startWordTracking();
    }
  }, [audioState.currentAyah, startWordTracking]);

  const playAyah = useCallback((surahNum: number, ayah: AyahDetail) => {
    const audioUrl = surahAudioUrlRef.current;
    if (!audioUrl) return;

    // Resume if same ayah was paused
    if (
      audioState.currentSurah === surahNum &&
      audioState.currentAyah === ayah.ayahId &&
      !audioState.isPlaying
    ) {
      resumeAudio();
      return;
    }

    const audio = ensureAudio();
    audio.pause();
    const needsLoad = audio.src !== audioUrl;
    if (needsLoad) {
      audio.src = audioUrl;
      audio.load();
    }

    isSingleAyahMode.current = true;
    currentAyahIdxRef.current = ayahsRef.current.findIndex(a => a.ayahId === ayah.ayahId);

    const onReady = () => {
      const seekTime = ayah.audio.timestamp_from / 1000;
      audio.currentTime = seekTime;
      audio.play().catch(console.error);
      isPlayingRef.current = true;
      setAudioState({ isPlaying: true, currentAyah: ayah.ayahId, currentSurah: surahNum, currentWord: null });
      canPlayHandlerRef.current = null;
      startWordTracking();
    };

    if (!needsLoad || audio.readyState >= 2) {
      // Already loaded (same URL, or browser still has it buffered)
      onReady();
    } else {
      canPlayHandlerRef.current = onReady;
    }
  }, [audioState, ensureAudio, resumeAudio, startWordTracking]);

  const playSurahFrom = useCallback((surahNum: number, fromAyahIdx: number) => {
    const audioUrl = surahAudioUrlRef.current;
    if (!audioUrl || ayahsRef.current.length === 0) return;

    const ayah = ayahsRef.current[fromAyahIdx];
    if (!ayah) return;

    const audio = ensureAudio();
    audio.pause();

    // FIX: Same as playAyah — skip reload when URL is unchanged.
    const needsLoad = audio.src !== audioUrl;
    if (needsLoad) {
      audio.src = audioUrl;
      audio.load();
    }

    isSingleAyahMode.current = false;
    currentAyahIdxRef.current = fromAyahIdx;

    const onReady = () => {
      const seekTime = ayah.audio.timestamp_from / 1000;
      audio.currentTime = seekTime;
      audio.play().catch(console.error);
      isPlayingRef.current = true;
      setAudioState({ isPlaying: true, currentAyah: ayah.ayahId, currentSurah: surahNum, currentWord: null });
      canPlayHandlerRef.current = null;
      startWordTracking();
    };

    if (!needsLoad || audio.readyState >= 2) {
      onReady();
    } else {
      canPlayHandlerRef.current = onReady;
    }
  }, [ensureAudio, startWordTracking]);

  const goToNextAyah = useCallback(() => {
    const ayahs = ayahsRef.current;
    const currentIdx = currentAyahIdxRef.current;
    if (currentIdx < 0 || currentIdx >= ayahs.length - 1) return;
    const nextAyah = ayahs[currentIdx + 1];
    if (nextAyah && audioState.currentSurah) {
      playAyah(audioState.currentSurah, nextAyah);
    }
  }, [audioState.currentSurah, playAyah]);

  const goToPrevAyah = useCallback(() => {
    const ayahs = ayahsRef.current;
    const currentIdx = currentAyahIdxRef.current;
    if (currentIdx <= 0 || ayahs.length === 0) return;
    const prevAyah = ayahs[currentIdx - 1];
    if (prevAyah && audioState.currentSurah) {
      playAyah(audioState.currentSurah, prevAyah);
    }
  }, [audioState.currentSurah, playAyah]);

  const toggleAyahAudio = useCallback((surahNum: number, ayah: AyahDetail) => {
    if (audioState.currentSurah === surahNum && audioState.currentAyah === ayah.ayahId && audioState.isPlaying) {
      pauseAudio();
    } else if (audioState.currentSurah === surahNum && audioState.currentAyah === ayah.ayahId && !audioState.isPlaying) {
      resumeAudio();
    } else {
      playAyah(surahNum, ayah);
    }
  }, [audioState, pauseAudio, resumeAudio, playAyah]);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const currentScrollY = target.scrollTop;
    if (currentScrollY < 80) {
      setIsHeaderVisible(true);
      lastScrollYRef.current = currentScrollY;
      return;
    }
    if (currentScrollY > lastScrollYRef.current + 10) {
      setIsHeaderVisible(false); // scroll DOWN → hide
    } else if (currentScrollY < lastScrollYRef.current - 10) {
      setIsHeaderVisible(true); // scroll UP → show
    }
    lastScrollYRef.current = currentScrollY;
  }, []); // ← no deps, stable forever

  useEffect(() => {
    return () => {
      stopWordTracking();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [stopWordTracking]);

  return (
    <AppContext.Provider value={{
      currentSurah,
      setCurrentSurah,
      currentAyah,
      setCurrentAyah,
      fontSettings,
      setFontSettings,
      updateFontSettings,
      isSurahSidebarOpen,
      setIsSurahSidebarOpen,
      isRightPanelOpen,
      setIsRightPanelOpen,
      isSearchOpen,
      setIsSearchOpen,
      isJumpOpen,
      setIsJumpOpen,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      isFontSettingsExpanded,
      setIsFontSettingsExpanded,
      viewMode,
      setViewMode,
      audioState,
      playAyah,
      pauseAudio,
      resumeAudio,
      toggleAyahAudio,
      goToNextAyah,
      goToPrevAyah,
      playSurahFrom,
      stopAudio,
      setSurahAudioData,
      currentAudioRef,
      activeIconTab,
      setActiveIconTab,
      theme,
      setTheme,
      resolvedTheme,
      isHeaderVisible,
      setIsHeaderVisible,
      handleScroll,
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