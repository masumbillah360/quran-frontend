/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ARABIC_FONTS } from '@/constants/fonts';
import AyahSkeleton from '../ui/ayah-skeleton';
import VirtualizedAyahList from './VirtualizedAyahList';
import { AyahData } from '@/types';
import { SURAHS } from '@/data/surahs';
import { toArabicNumerals } from '@/utils';

const NO_BISMILLAH = [1, 9];
const SCROLL_THRESHOLD = 8;

interface SurahReaderProps {
  surahNumber: number;
}

export default function SurahReader({ surahNumber }: SurahReaderProps) {
  const {
    setCurrentSurah,
    currentSurah,
    fontSettings,
    viewMode,
    audioState,
    playSurahFrom,
    pauseAudio,
    resumeAudio,
    surahData,
    surahLoading,
    surahError,
    reloadSurah,
    setIsBarsVisible,
  } = useApp();

  const activeSurah = currentSurah || surahNumber;

  useEffect(() => {
    if (surahNumber !== currentSurah) {
      setCurrentSurah(surahNumber);
    }
  }, []);

  const [jumpTargetAyah, setJumpTargetAyah] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const lastBarsVisible = useRef(true);

  // ── Scroll-direction bar visibility ──
  useEffect(() => {
    const el = readerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = el.scrollTop;
        const delta = currentY - lastScrollY.current;
        const isAtBottom = currentY + el.clientHeight >= el.scrollHeight - 100;
        const isAtTop = currentY < 50;

        let nextVisible = lastBarsVisible.current;

        if (isAtBottom || isAtTop) {
          nextVisible = true;
        } else if (Math.abs(delta) > SCROLL_THRESHOLD) {
          nextVisible = delta < 0;
        }

        if (nextVisible !== lastBarsVisible.current) {
          lastBarsVisible.current = nextVisible;
          setIsBarsVisible(nextVisible);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [setIsBarsVisible]);

  // ── Scroll to top or jump target on surah change ──
  useEffect(() => {
    const raw = sessionStorage.getItem('jump-target');
    sessionStorage.removeItem('jump-target');

    let targetAyah: number | null = null;
    if (raw) {
      try {
        const t = JSON.parse(raw);
        if (t.surah === activeSurah) targetAyah = t.ayah;
      } catch { /* ignore */ }
    }

    setJumpTargetAyah(targetAyah);

    if (targetAyah === null && readerRef.current) {
      readerRef.current.scrollTop = 0;
    }
  }, [activeSurah]);

  // ── Same-surah jump (via custom event) ──
  useEffect(() => {
    const handleJump = (e: Event) => {
      const { ayah } = (e as CustomEvent).detail as { surah: number; ayah: number };
      setJumpTargetAyah(ayah);
    };

    window.addEventListener('jump-to-ayah', handleJump);
    return () => window.removeEventListener('jump-to-ayah', handleJump);
  }, []);

  // ── Scroll to jump target after data renders (reading mode only) ──
  useEffect(() => {
    if (jumpTargetAyah === null || viewMode !== 'reading') return;

    const tryScroll = (attempts: number) => {
      const el = document.getElementById(`ayah-${activeSurah}-${jumpTargetAyah}`);
      if (el && readerRef.current) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        setJumpTargetAyah(null);
      } else if (attempts > 0) {
        setTimeout(() => tryScroll(attempts - 1), 100);
      } else {
        setJumpTargetAyah(null);
      }
    };

    tryScroll(20);
  }, [activeSurah, jumpTargetAyah, surahData, viewMode]);

  const arabicFont = ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont);
  const arabicFontFamily = arabicFont?.family ?? '"Amiri Quran", serif';
  const surahMeta = SURAHS.find((s) => s.number === activeSurah);
  const isSurahPlaying = audioState.isPlaying && audioState.currentSurah === activeSurah;
  const isSurahActive = audioState.currentSurah === activeSurah && audioState.currentAyah !== null;

  const handlePlaySurah = () => {
    if (isSurahPlaying) {
      pauseAudio();
    } else if (isSurahActive && !isSurahPlaying) {
      resumeAudio();
    } else if (surahData && surahData.ayahs.length > 0) {
      playSurahFrom(activeSurah, 0);
    }
  };

  const handlePrev = () => {
    if (activeSurah > 1) setCurrentSurah(activeSurah - 1);
  };
  const handleNext = () => {
    if (activeSurah < 114) setCurrentSurah(activeSurah + 1);
  };

  const prevSurah = activeSurah > 1 ? SURAHS[activeSurah - 2] : null;
  const nextSurah = activeSurah < 114 ? SURAHS[activeSurah] : null;

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <main ref={readerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-(--bg-canvas) relative">
      <div ref={topRef} className="scroll-mt-0" />

      <div className="relative overflow-hidden border-b border-(--border-default)">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-(--bg-accent)/8 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-6">
          <div className="relative w-28 sm:w-36 lg:w-44 aspect-376/254 shrink-0 opacity-80">
            {surahMeta?.revelationType === 'Meccan' ? (
              <Image
                src="/makkah.avif"
                alt="Makkah"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
              />
            ) : (
                <Image
                  src="/madinah.avif"
                  alt="Madinah"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
                />
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-(--text-primary)">
              {surahMeta ? `Surah ${surahMeta.englishName}` : `Surah ${activeSurah}`}
            </h1>
            <p className="mt-1 text-sm text-(--text-quaternary)">
              Ayah‑{surahMeta?.numberOfAyahs ?? '…'},{' '}
              {surahMeta?.revelationType === 'Meccan' ? 'Makkah' : 'Madinah'}
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handlePrev}
                disabled={!prevSurah}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={13} />
                {prevSurah ? prevSurah.englishName : 'Previous'}
              </button>

              <button
                onClick={handlePlaySurah}
                disabled={surahLoading}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${isSurahPlaying
                  ? 'bg-(--bg-accent) border-(--accent)/50 text-white'
                  : isSurahActive && !isSurahPlaying
                    ? 'bg-(--bg-active)/50 border-(--accent)/30 text-(--text-accent)'
                    : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-accent) hover:border-(--accent)/50 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}>
                {isSurahPlaying ? <Pause size={13} /> : <Play size={13} />}
                {isSurahPlaying ? 'Pause' : isSurahActive ? 'Resume' : 'Play Surah'}
              </button>

              <button
                onClick={handleNext}
                disabled={!nextSurah}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {nextSurah ? nextSurah.englishName : 'Next'}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="relative w-32 sm:w-40 lg:w-48 aspect-176/36 shrink-0">
            {!NO_BISMILLAH.includes(activeSurah) && (
              <Image
                src="/bismillah.53600316.svg"
                alt="Bismillah"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
              />
            )}
          </div>
        </div>
      </div>

      {surahLoading ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <AyahSkeleton key={i} />
          ))}
        </>
      ) : surahError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle size={36} className="text-(--text-danger)" />
            <p className="text-(--text-tertiary) text-sm max-w-sm">{surahError}</p>
            <button
              onClick={reloadSurah}
              className="flex items-center gap-2 px-4 py-2 bg-(--bg-elevated) hover:bg-(--border-accent) text-(--text-primary) text-sm rounded-lg border border-(--border-accent) transition-all">
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : viewMode === 'reading' ? (
            <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto">
              <p
                className="text-right leading-[3.2] text-(--text-primary)"
                style={{
                  fontFamily: arabicFontFamily,
                  fontSize: `${fontSettings.arabicFontSize}px`,
                  direction: 'rtl',
                }}
                lang="ar"
                dir="rtl">
                {surahData?.ayahs.map((ayah: AyahData) => {
                  const words = ayah.words.filter((w) => w.charType === 'word');
                  return (
                    <span key={ayah.id} id={`ayah-${activeSurah}-${ayah.ayahNumber}`}>
                      {words.map((word) => (
                        <span
                          key={word.id}
                          dangerouslySetInnerHTML={{
                        __html: word.text,
                      }}
                    />
                  ))}{' '}
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-(--accent-dark)/60 text-(--text-accent) mx-1"
                        style={{
                          fontFamily: ARABIC_FONTS[0]?.family ?? '"Amiri Quran", serif',
                        }}>
                        {toArabicNumerals(ayah.ayahNumber)}
                      </span>{' '}
                    </span>
                  );
                })}
              </p>
            </div>
          ) : (
              <div>
                {surahData && (
                  <VirtualizedAyahList
                    ayahs={surahData.ayahs}
                    surahNumber={activeSurah}
                    containerRef={readerRef as React.RefObject<HTMLElement>}
                    jumpTargetAyah={jumpTargetAyah}
                  />
                )}
        </div>
      )}

      {!surahLoading && !surahError && surahData && surahData.ayahs.length > 0 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-6 border-t border-(--border-default) mt-2">
          <button
            onClick={handlePrev}
            disabled={!prevSurah}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-sm text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">{prevSurah?.englishName ?? 'Previous'}</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <span className="text-xs text-(--text-muted) font-mono">{activeSurah} / 114</span>
          <button
            onClick={handleNext}
            disabled={!nextSurah}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-sm text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <span className="hidden sm:inline">{nextSurah?.englishName ?? 'Next'}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      <div className="h-40 md:h-24" />
    </main>
  );
}
