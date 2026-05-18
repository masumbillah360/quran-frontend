'use client';

import { ThemeMode, FontSettings, AyahDetail, AudioState } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';

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
  handleScroll: (e: Event) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFont: 'kfgq',
  arabicFontSize: 30,
  translationFontSize: 17,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [currentSurah, setCurrentSurahState] = useState<number>(1);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
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
  const surahAudioDataRef = useRef<{ audioUrl: string; ayahs: AyahDetail[] } | null>(null);
  const currentAyahIdxRef = useRef(-1);
  const currentSurahRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const currentAyahRef = useRef<number | null>(null);
  const currentWordRef = useRef<number | null>(null);

  useEffect(() => {
    const savedSurah = localStorage.getItem('quran_current_surah');
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
    const effective =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
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

  const setCurrentSurah = useCallback(
    (n: number) => {
      setCurrentSurahState(n);
      localStorage.setItem('quran_current_surah', String(n));
      router.push(`/surah/${n}`);
    },
    [router],
  );

  const setFontSettings = useCallback((s: FontSettings) => {
    setFontSettingsState(s);
    localStorage.setItem('quran_font_settings', JSON.stringify(s));
  }, []);

  const updateFontSettings = useCallback((partial: Partial<FontSettings>) => {
    setFontSettingsState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('quran_font_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSurahAudioData = useCallback(
    (_surahNum: number, audioUrl: string, ayahs: AyahDetail[]) => {
      surahAudioDataRef.current = { audioUrl, ayahs };
    },
    [],
  );

  useEffect(() => {
    isPlayingRef.current = audioState.isPlaying;
    currentAyahRef.current = audioState.currentAyah;
    currentWordRef.current = audioState.currentWord;
  }, [audioState.isPlaying, audioState.currentAyah, audioState.currentWord]);

  const getWordAtTime = useCallback(
    (currentTimeMs: number, ayah: AyahDetail): number | null => {
      for (const seg of ayah.audio.segments) {
        if (currentTimeMs >= seg.startTime && currentTimeMs <= seg.endTime) {
          return seg.wordIndex;
        }
      }
      return null;
    },
    [],
  );

  const stopAudioPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setAudioState((prev) => ({ ...prev, isPlaying: false, currentWord: null }));
  }, []);

  const stopAudio = useCallback(() => {
    stopAudioPlayback();
    currentAyahIdxRef.current = -1;
    currentSurahRef.current = null;
    setAudioState({
      isPlaying: false,
      currentSurah: null,
      currentAyah: null,
      currentWord: null,
    });
  }, [stopAudioPlayback]);

  const pauseAudio = useCallback(() => {
    currentAudioRef.current?.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isPlayingRef.current = false;
    setAudioState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resumeAudio = useCallback(() => {
    currentAudioRef.current?.play().then(() => {
      isPlayingRef.current = true;
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    }).catch(console.error);
  }, []);

  const playAyahAudio = useCallback(
    (surahNumber: number, ayah: AyahDetail, ayahIndex: number) => {
      stopAudioPlayback();

      if (!ayah.audio?.audio_url) return;

      const audio = new Audio(ayah.audio.audio_url);
      currentAudioRef.current = audio;
      currentAyahIdxRef.current = ayahIndex;
      currentSurahRef.current = surahNumber;

      setAudioState({
        isPlaying: true,
        currentSurah: surahNumber,
        currentAyah: ayah.ayahId,
        currentWord: null,
      });

      const updateProgress = () => {
        if (!audio.paused && audio.duration) {
          const timeMs = audio.currentTime * 1000;
          const wordIndex = ayah.audio?.segments
            ? getWordAtTime(timeMs, ayah)
            : null;
          setAudioState((prev) => ({ ...prev, currentWord: wordIndex }));
          rafRef.current = requestAnimationFrame(updateProgress);
        }
      };

      audio.addEventListener('play', () => {
        rafRef.current = requestAnimationFrame(updateProgress);
      });

      audio.addEventListener('ended', () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const audioData = surahAudioDataRef.current;
        if (audioData && ayahIndex < audioData.ayahs.length - 1) {
          setTimeout(() => {
            playAyahAudio(surahNumber, audioData.ayahs[ayahIndex + 1], ayahIndex + 1);
          }, 500);
        } else {
          currentSurahRef.current = null;
          setAudioState((prev) => ({ ...prev, isPlaying: false, currentWord: null }));
        }
      });

      audio.addEventListener('error', () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        currentSurahRef.current = null;
        setAudioState({ isPlaying: false, currentAyah: null, currentSurah: null, currentWord: null });
      });

      audio.play().catch(console.error);
    },
    [stopAudioPlayback, getWordAtTime],
  );

  const playAyah = useCallback(
    (surahNumber: number, ayah: AyahDetail) => {
      const ayahIndex = surahAudioDataRef.current?.ayahs.findIndex(
        (a) => a.ayahId === ayah.ayahId,
      ) ?? 0;
      playAyahAudio(surahNumber, ayah, ayahIndex);
    },
    [playAyahAudio],
  );

  const playSurahFrom = useCallback(
    (surahNumber: number, startAyahIndex: number) => {
      const audioData = surahAudioDataRef.current;
      if (!audioData || startAyahIndex >= audioData.ayahs.length) return;
      playAyahAudio(surahNumber, audioData.ayahs[startAyahIndex], startAyahIndex);
    },
    [playAyahAudio],
  );

  const goToNextAyah = useCallback(() => {
    const audioData = surahAudioDataRef.current;
    if (!audioData) return;
    const nextIndex = currentAyahIdxRef.current + 1;
    if (nextIndex < audioData.ayahs.length && currentSurahRef.current !== null) {
      playAyahAudio(currentSurahRef.current, audioData.ayahs[nextIndex], nextIndex);
    }
  }, [playAyahAudio]);

  const goToPrevAyah = useCallback(() => {
    const audioData = surahAudioDataRef.current;
    if (!audioData) return;
    const prevIndex = currentAyahIdxRef.current - 1;
    if (prevIndex >= 0 && currentSurahRef.current !== null) {
      playAyahAudio(currentSurahRef.current, audioData.ayahs[prevIndex], prevIndex);
    }
  }, [playAyahAudio]);

  const toggleAyahAudio = useCallback(
    (surahNum: number, ayah: AyahDetail) => {
      if (
        currentSurahRef.current === surahNum &&
        currentAyahRef.current === ayah.ayahId &&
        isPlayingRef.current
      ) {
        pauseAudio();
      } else if (
        currentSurahRef.current === surahNum &&
        currentAyahRef.current === ayah.ayahId &&
        !isPlayingRef.current
      ) {
        resumeAudio();
      } else {
        playAyah(surahNum, ayah);
      }
    },
    [playAyah, pauseAudio, resumeAudio],
  );

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
      setIsHeaderVisible(false);
    } else if (currentScrollY < lastScrollYRef.current - 10) {
      setIsHeaderVisible(true);
    }
    lastScrollYRef.current = currentScrollY;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
      }
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
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