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
import AyahCard from './AyahCard';
import { AyahDetail, SurahAudio } from '@/types';
import { fetchSurah } from '@/services/quranApi';
import { SURAHS } from '@/data/surahs';
import { cleanArabicText, toArabicNumerals } from '@/utils';

const NO_BISMILLAH = [1, 9];

export default function SurahReader() {
  const {
    currentSurah,
    setCurrentSurah,
    fontSettings,
    viewMode,
    audioState,
    playSurahFrom,
    setSurahAudioData,
    pauseAudio,
    resumeAudio,
  } = useApp();

  const [ayahs, setAyahs] = useState<AyahDetail[]>([]);
  const [surahAudio, setSurahAudio] = useState<SurahAudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cancelled = { current: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setAyahs([]);
    setSurahAudio(null);

    fetchSurah(currentSurah)
      .then((data) => {
        if (!cancelled.current) {
          setAyahs(data.ayahs);
          setSurahAudio(data.audio);
          setSurahAudioData(
            currentSurah,
            data.audio.audio_url,
            data.ayahs,
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled.current) {
            setError(
              'Failed to load surah. Please check your internet connection and try again.',
            );
            setLoading(false);
          }
        });

    topRef.current?.scrollIntoView({ behavior: 'instant' });
    return () => {
      cancelled.current = true;
    };
  }, [currentSurah, setSurahAudioData]);

  const arabicFont = ARABIC_FONTS.find(
    (f) => f.id === fontSettings.arabicFont,
  );
  const arabicFontFamily = arabicFont?.family ?? '"Amiri Quran", serif';
  const surahMeta = SURAHS.find((s) => s.number === currentSurah);

  const isSurahPlaying =
    audioState.isPlaying && audioState.currentSurah === currentSurah;
  const isSurahActive = audioState.currentSurah === currentSurah;

  const handlePlaySurah = () => {
    if (!surahAudio) return;
    if (isSurahPlaying) {
      pauseAudio();
    } else if (isSurahActive && !isSurahPlaying) {
      resumeAudio();
    } else {
      setSurahAudioData(currentSurah, surahAudio.audio_url, ayahs);
      playSurahFrom(currentSurah, 0);
    }
  };

  const prevSurah = currentSurah > 1 ? SURAHS[currentSurah - 2] : null;
  const nextSurah = currentSurah < 114 ? SURAHS[currentSurah] : null;

  return (
    <main className="flex-1 overflow-y-auto bg-(--bg-canvas) relative">
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
              {surahMeta
                ? `Surah ${surahMeta.englishName}`
                : `Surah ${currentSurah}`}
            </h1>
            <p className="mt-1 text-sm text-(--text-quaternary)">
              Ayah‑{surahMeta?.numberOfAyahs ?? '…'},{' '}
              {surahMeta?.revelationType === 'Meccan'
                ? 'Makkah'
                : 'Madinah'}
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() =>
                  prevSurah &&
                  setCurrentSurah(currentSurah - 1)
                }
                disabled={!prevSurah}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={13} />
                {prevSurah ? prevSurah.englishName : 'Previous'}
              </button>

              <button
                onClick={handlePlaySurah}
                disabled={!surahAudio}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${isSurahPlaying
                  ? 'bg-(--bg-accent) border-(--accent)/50 text-white'
                  : isSurahActive && !isSurahPlaying
                    ? 'bg-(--bg-active)/50 border-(--accent)/30 text-(--text-accent)'
                    : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-accent) hover:border-(--accent)/50 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}>
                {isSurahPlaying ? (
                  <Pause size={13} />
                ) : (
                  <Play size={13} />
                )}
                {isSurahPlaying
                  ? 'Pause'
                  : isSurahActive
                    ? 'Resume'
                    : 'Play Surah'}
              </button>

              <button
                onClick={() =>
                  nextSurah &&
                  setCurrentSurah(currentSurah + 1)
                }
                disabled={!nextSurah}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {nextSurah ? nextSurah.englishName : 'Next'}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="relative w-32 sm:w-40 lg:w-48 aspect-176/36 shrink-0">
            {!NO_BISMILLAH.includes(currentSurah) && (
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

      {loading ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <AyahSkeleton key={i} />
          ))}
        </>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle size={36} className="text-(--text-danger)" />
            <p className="text-(--text-tertiary) text-sm max-w-sm">
              {error}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setAyahs([]);
                fetchSurah(currentSurah)
                  .then((data) => {
                    setAyahs(data.ayahs);
                    setSurahAudio(data.audio);
                    setSurahAudioData(
                      currentSurah,
                      data.audio.audio_url,
                      data.ayahs,
                    );
                    setLoading(false);
                  })
                  .catch(() => {
                    setError(
                      'Failed to load surah. Please check your internet connection and try again.',
                    );
                    setLoading(false);
                  });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-(--bg-elevated) hover:bg-(--border-accent) text-(--text-primary) text-sm rounded-lg border border-(--border-accent) transition-all">
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : viewMode === 'reading' ? (
            <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto min-h-4/6 ">
              <p
                className="text-right leading-[3.2] text-(--text-primary)"
                style={{
                  fontFamily: arabicFontFamily,
                  fontSize: `${fontSettings.arabicFontSize}px`,
                  direction: 'rtl',
                }}
                lang="ar"
                dir="rtl">
                {ayahs.map((ayah) => (
                  <span key={ayah.ayahId}>
                    {ayah.wbws.map((word) => (
                      <span
                        key={word.wordId}
                        dangerouslySetInnerHTML={{
                          __html: cleanArabicText(
                            word.uthmani,
                          ),
                        }}
                      />
                    ))}{' '}
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-(--accent-dark)/60 text-(--text-accent) mx-1"
                      style={{
                        fontFamily:
                          ARABIC_FONTS[0]?.family ??
                          '"Amiri Quran", serif',
                      }}>
                      {toArabicNumerals(ayah.ayahId)}
                    </span>{' '}
                  </span>
                ))}
              </p>
            </div>
          ) : (
              <div className="h-full">
                {ayahs.map((ayah) => (
            <AyahCard
              key={ayah.ayahId}
              ayah={ayah}
              surahNumber={currentSurah}
            />
          ))}
        </div>
      )}

      {!loading && !error && ayahs.length > 0 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-6 border-t border-(--border-default) mt-2">
          <button
            onClick={() =>
              prevSurah && setCurrentSurah(currentSurah - 1)
            }
            disabled={!prevSurah}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-sm text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">
              {prevSurah?.englishName ?? 'Previous'}
            </span>
            <span className="sm:hidden">Prev</span>
          </button>
          <span className="text-xs text-(--text-muted) font-mono">
            {currentSurah} / 114
          </span>
          <button
            onClick={() =>
              nextSurah && setCurrentSurah(currentSurah + 1)
            }
            disabled={!nextSurah}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-sm text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <span className="hidden sm:inline">
              {nextSurah?.englishName ?? 'Next'}
            </span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      <div className="h-32 md:h-4" />
    </main>
  );
}
