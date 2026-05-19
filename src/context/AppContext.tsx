'use client';

import { ThemeMode, FontSettings, Ayah, AudioState, LocalSurahData, LocalAyahData } from '@/types';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { loadSurah, preloadAdjacentSurahs } from '@/services/surahLoader';

interface AppContextType {
  currentSurah: number;
  setCurrentSurah: (n: number) => void;
  currentAyah: number;
  setCurrentAyah: (n: number) => void;
  surahData: LocalSurahData | null;
  surahLoading: boolean;
  surahError: string | null;
  reloadSurah: () => void;
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
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playAyah: (surah: number, ayah: LocalAyahData) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  goToNextAyah: () => void;
  goToPrevAyah: () => void;
  seekAudio: (time: number) => void;
  clearAudioError: () => void;
  toggleAyahAudio: (surahNum: number, ayah: Ayah) => void;
  playSurahFrom: (surahNum: number, fromAyahIdx: number) => void;
  setSurahAudioData: (surahNum: number, url: string, ayahs: Ayah[]) => void;
  currentAudioRef: React.RefObject<HTMLAudioElement | null>;
  activeIconTab: string;
  setActiveIconTab: (tab: string) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light' | 'sepia';
  isHeaderVisible: boolean;
  setIsHeaderVisible: (v: boolean) => void;
  isBarsVisible: boolean;
  setIsBarsVisible: (v: boolean) => void;
  handleScroll: (e: Event) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEFAULT_FONT_SETTINGS: FontSettings = {
  arabicFont: 'kfgq',
  arabicFontSize: 30,
  translationFontSize: 17,
};

// ── Storage Helpers ──
const STORAGE_KEYS = {
  THEME: 'qm-theme',
  FONT: 'qm-font',
  SURAH: 'qm-surah',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* noop */ }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // ── Theme ──
  const [theme, setThemeState] = useState<ThemeMode>(() => loadFromStorage(STORAGE_KEYS.THEME, 'dark'));
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light' | 'sepia'>('dark');

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    saveToStorage(STORAGE_KEYS.THEME, t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const effective = theme === 'system'
      ? (mq.matches ? 'dark' : 'light')
      : theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(effective);
    const handler = () => {
      const newEffective = theme === 'system'
        ? (mq.matches ? 'dark' : 'light')
        : theme;
      setResolvedTheme(newEffective);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // ── Surah Data ──
  const [currentSurah, setCurrentSurahState] = useState(() => loadFromStorage(STORAGE_KEYS.SURAH, 1));
  const [surahData, setSurahData] = useState<LocalSurahData | null>(null);
  const [surahLoading, setSurahLoading] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);
  const surahDataRef = useRef<LocalSurahData | null>(null);
  const [currentAyah, setCurrentAyah] = useState<number>(1);

  const setCurrentSurah = useCallback((n: number) => {
    if (n < 1 || n > 114) return;
    // Stop any playing audio from the previous surah
    destroyAudio();
    generationRef.current++;
    currentAyahRef.current = null;
    setAudioState({
      isPlaying: false, isLoading: false, error: null,
      currentSurah: 0, currentAyah: null, currentWord: null, currentAyahIndex: -1,
    });
    setCurrentSurahState(n);
    saveToStorage(STORAGE_KEYS.SURAH, n);
    router.push(`/surah/${n}`);
  }, [router]);

  const loadCurrentSurah = useCallback(async () => {
    setSurahLoading(true);
    setSurahError(null);
    try {
      const data = await loadSurah(currentSurah);
      setSurahData(data);
      surahDataRef.current = data;
      preloadAdjacentSurahs(currentSurah);
    } catch (err) {
      setSurahError(err instanceof Error ? err.message : 'Failed to load surah');
    } finally {
      setSurahLoading(false);
    }
  }, [currentSurah]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSurahLoading(true);
      setSurahError(null);
      try {
        const data = await loadSurah(currentSurah);
        if (!cancelled) {
          setSurahData(data);
          surahDataRef.current = data;
          preloadAdjacentSurahs(currentSurah);
        }
      } catch (err) {
        if (!cancelled) setSurahError(err instanceof Error ? err.message : 'Failed to load surah');
      } finally {
        if (!cancelled) setSurahLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentSurah]);

  // ── Font Settings (persisted) ──
  const [fontSettings, setFontSettingsState] = useState<FontSettings>(() =>
    loadFromStorage(STORAGE_KEYS.FONT, DEFAULT_FONT_SETTINGS)
  );

  const setFontSettings = useCallback((s: FontSettings) => {
    setFontSettingsState(s);
    saveToStorage(STORAGE_KEYS.FONT, s);
  }, []);

  const updateFontSettings = useCallback((partial: Partial<FontSettings>) => {
    setFontSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveToStorage(STORAGE_KEYS.FONT, next);
      return next;
    });
  }, []);

  // ── UI State ──
  const [isSurahSidebarOpen, setIsSurahSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFontSettingsExpanded, setIsFontSettingsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'translation' | 'reading'>('translation');
  const [activeIconTab, setActiveIconTab] = useState('quran');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isBarsVisible, setIsBarsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // ══════════════════════════════════════════════════════════════════════════════
  // AUDIO ENGINE (Optimized - Generation-based)
  //
  // Design rules:
  //   1. Every Audio element gets a unique "generation" id.
  //      All callbacks check their own generation against the live one.
  //      If they differ, the callback is from a dead element → ignore it.
  //   2. Cleanup NEVER sets src=''. It just pauses, removes listeners, and
  //      drops the reference. No synthetic error events.
  //   3. All state reads inside callbacks use refs (never closure-captured
  //      useState values) to avoid stale closures.
  // ══════════════════════════════════════════════════════════════════════════════

  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false, isLoading: false, error: null,
    currentSurah: 0, currentAyah: null, currentWord: null, currentAyahIndex: -1,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); // Legacy compatibility
  const wordTimerRef = useRef<number>(0);
  const currentAyahRef = useRef<LocalAyahData | null>(null);
  const audioStateRef = useRef(audioState);
  const generationRef = useRef(0); // ← ownership token
  const surahAudioDataRef = useRef<{ audioUrl: string; ayahs: Ayah[] } | null>(null);
  const currentAyahIdxRef = useRef(-1);
  const currentSurahRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Keep ref in sync with state
  useEffect(() => { audioStateRef.current = audioState; }, [audioState]);

  // Cleanup on unmount
  useEffect(() => () => { destroyAudio(); }, []);

  // ── Destroy current audio (safe, no error events) ──
  function destroyAudio() {
    cancelAnimationFrame(wordTimerRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.onended = null;
      a.onerror = null;
      a.oncanplay = null;
      audioRef.current = null;
      currentAudioRef.current = null;
    }
  }

  // ── Word Tracking ──
  function startTracking(ayah: LocalAyahData, gen: number) {
    cancelAnimationFrame(wordTimerRef.current);

    // Pre-build segment lookup
    const segments: { pos: number; start: number; end: number }[] = [];
    const words = ayah.words.filter(w => w.charType === 'word');

    for (const w of words) {
      if (w.audioSegment) {
        segments.push({ pos: w.position, start: w.audioSegment.startTime, end: w.audioSegment.endTime });
      }
    }
    // Fallback to ayah-level segments
    if (segments.length === 0 && ayah.audio.segments) {
      for (const s of ayah.audio.segments) {
        segments.push({ pos: parseInt(s[0]), start: parseInt(s[1]), end: parseInt(s[2]) });
      }
    }

    const tick = () => {
      // Dead generation → stop
      if (gen !== generationRef.current) return;

      const a = audioRef.current;
      if (!a || a.paused) return;

      const ms = a.currentTime * 1000;
      let active: number | null = null;
      for (const seg of segments) {
        if (ms >= seg.start && ms <= seg.end) { active = seg.pos; break; }
      }

      setAudioState(prev =>
        prev.currentWord === active ? prev : { ...prev, currentWord: active }
      );

      wordTimerRef.current = requestAnimationFrame(tick);
    };

    wordTimerRef.current = requestAnimationFrame(tick);
  }

  function stopTracking() {
    cancelAnimationFrame(wordTimerRef.current);
  }

  // ── Core: play a specific ayah ──
  const playAyahInternal = useCallback((surah: number, ayah: LocalAyahData) => {
    // 1) Kill the old element completely
    destroyAudio();

    // 2) New generation — all old callbacks become no-ops
    const gen = ++generationRef.current;

    // 3) Create new Audio
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    currentAudioRef.current = audio;
    currentAyahRef.current = ayah;

    const list = surahDataRef.current?.ayahs || [];
    const idx = list.findIndex(a => a.ayahNumber === ayah.ayahNumber);
    currentAyahIdxRef.current = idx;
    currentSurahRef.current = surah;

    // 4) Set state (clears old error)
    setAudioState({
      isPlaying: true,
      isLoading: true,
      error: null,
      currentSurah: surah,
      currentAyah: ayah.ayahNumber,
      currentWord: null,
      currentAyahIndex: idx,
    });

    // 5) Event handlers — all gated on `gen`
    audio.oncanplay = () => {
      if (gen !== generationRef.current) return;
      setAudioState(prev => ({ ...prev, isLoading: false }));
    };

    audio.onended = () => {
      if (gen !== generationRef.current) return;
      stopTracking();

      // Auto-advance
      const nextIdx = idx + 1;
      const currentList = surahDataRef.current?.ayahs || [];
      if (nextIdx < currentList.length) {
        setTimeout(() => {
          if (gen === generationRef.current) {
            playAyahInternal(surah, currentList[nextIdx]);
          }
        }, 120);
      } else {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentWord: null }));
      }
    };

    audio.onerror = () => {
      // Only show error if this is still the live generation
      if (gen !== generationRef.current) return;
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio. Please check your connection.',
      }));
    };

    // 6) Load and play
    audio.src = ayah.audio.url;
    audio.play()
      .then(() => {
        if (gen === generationRef.current) {
          startTracking(ayah, gen);
        }
      })
      .catch(() => {
        if (gen === generationRef.current) {
          setAudioState(prev => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            error: 'Playback blocked. Tap play again.',
          }));
        }
      });
  }, []);

  // ── Public: play/toggle an ayah ──
  const playAyah = useCallback((surah: number, ayah: LocalAyahData) => {
    const s = audioStateRef.current;

    // Same ayah → toggle
    if (s.currentAyah === ayah.ayahNumber && s.currentSurah === surah) {
      if (s.isPlaying) {
        audioRef.current?.pause();
        stopTracking();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else {
        audioRef.current?.play().catch(() => { });
        if (currentAyahRef.current) startTracking(currentAyahRef.current, generationRef.current);
        setAudioState(prev => ({ ...prev, isPlaying: true, error: null }));
      }
      return;
    }

    // Different ayah → play it
    playAyahInternal(surah, ayah);
  }, [playAyahInternal]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    stopTracking();
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resumeAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play()
      .then(() => {
        if (currentAyahRef.current) startTracking(currentAyahRef.current, generationRef.current);
        setAudioState(prev => ({ ...prev, isPlaying: true, error: null }));
      })
      .catch(() => {
        setAudioState(prev => ({
          ...prev,
          error: 'Playback failed. Tap play again.',
        }));
      });
  }, []);

  const stopAudio = useCallback(() => {
    destroyAudio();
    generationRef.current++;
    currentAyahRef.current = null;
    setAudioState({
      isPlaying: false, isLoading: false, error: null,
      currentSurah: 0, currentAyah: null, currentWord: null, currentAyahIndex: -1,
    });
  }, []);

  const seekAudio = useCallback((time: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(time, a.duration || 0));
  }, []);

  const goToNextAyah = useCallback(() => {
    const s = audioStateRef.current;
    const list = surahDataRef.current?.ayahs || [];
    const next = s.currentAyahIndex + 1;
    if (next < list.length) {
      playAyahInternal(s.currentSurah, list[next]);
    }
  }, [playAyahInternal]);

  const goToPrevAyah = useCallback(() => {
    const s = audioStateRef.current;
    const list = surahDataRef.current?.ayahs || [];
    const prev = s.currentAyahIndex - 1;
    if (prev >= 0) {
      playAyahInternal(s.currentSurah, list[prev]);
    }
  }, [playAyahInternal]);

  const clearAudioError = useCallback(() => {
    setAudioState(prev => ({ ...prev, error: null }));
  }, []);

  // ── Legacy compatibility functions ──
  const setSurahAudioData = useCallback(
    (_surahNum: number, audioUrl: string, ayahs: Ayah[]) => {
      surahAudioDataRef.current = { audioUrl, ayahs };
    },
    [],
  );

  const toggleAyahAudio = useCallback(
    (surahNum: number, ayah: Ayah) => {
      // Convert legacy Ayah to LocalAyahData format
      const ayahData: LocalAyahData = {
        id: `${surahNum}:${ayah.ayah_number}`,
        ayahNumber: ayah.ayah_number,
        verseKey: ayah.verse_key,
        pageNumber: ayah.page_number,
        juzNumber: ayah.juz_number,
        hizbNumber: ayah.hizb_number,
        rubNumber: ayah.rub_number,
        sajdah: ayah.sajdah_type ? true : null,
        translation: ayah.translation?.translation ?? '',
        translationName: ayah.translation?.translation_name ?? 'Saheeh International',
        audio: {
          url: ayah.audio?.audio_url ?? '',
          duration: ayah.audio?.duration ?? 0,
          segments: ayah.audio?.segments?.map(s => [String(s.wordIndex), String(s.startTime), String(s.endTime)]) as [string, string, string][],
        },
        words: ayah.words.map(w => ({
          id: String(w.id),
          position: w.position,
          text: w.text,
          translation: w.translation,
          transliteration: w.transliteration,
          charType: w.char_type,
          audioSegment: w.audioSegment ? {
            wordIndex: parseInt(w.audioSegment.wordIndex),
            startTime: w.audioSegment.startTime,
            endTime: w.audioSegment.endTime,
          } : undefined,
        })),
      };

      const s = audioStateRef.current;
      if (s.currentAyah === ayah.ayah_number && s.currentSurah === surahNum) {
        if (s.isPlaying) {
          pauseAudio();
        } else {
          resumeAudio();
        }
      } else {
        playAyah(surahNum, ayahData);
      }
    },
    [playAyah, pauseAudio, resumeAudio],
  );

  const playSurahFrom = useCallback(
    (surahNumber: number, startAyahIndex: number) => {
      const list = surahDataRef.current?.ayahs || [];
      if (startAyahIndex < list.length) {
        playAyahInternal(surahNumber, list[startAyahIndex]);
      }
    },
    [playAyahInternal],
  );

  // ── Scroll handler ──
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

  // ══════════════════════════════════════════════════════════════════════════════
  // PROVIDER VALUE
  // ══════════════════════════════════════════════════════════════════════════════

  const value = {
    currentSurah,
    setCurrentSurah,
    currentAyah,
    setCurrentAyah,
    surahData,
    surahLoading,
    surahError,
    reloadSurah: loadCurrentSurah,
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
    audioRef,
    playAyah,
    pauseAudio,
    resumeAudio,
    stopAudio,
    goToNextAyah,
    goToPrevAyah,
    seekAudio,
    clearAudioError,
    toggleAyahAudio,
    playSurahFrom,
    setSurahAudioData,
    currentAudioRef,
    activeIconTab,
    setActiveIconTab,
    theme,
    setTheme,
    resolvedTheme,
    isHeaderVisible,
    setIsHeaderVisible,
    isBarsVisible,
    setIsBarsVisible,
    handleScroll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
