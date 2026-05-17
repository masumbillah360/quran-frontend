'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { ARABIC_FONTS } from '@/constants/fonts';

import { AyahDetail, SurahAudio } from '@/types';

const NO_BISMILLAH = [1, 9];

function AyahSkeleton() {
  return (
    <div className="flex border-b border-(--border-default) animate-pulse">
      <div className="flex flex-col items-center py-6 px-3 gap-3 w-14 shrink-0">
        <div className="w-9 h-9 rounded-full bg-(--bg-elevated)" />
        <div className="w-8 h-8 rounded-full bg-(--bg-elevated)" />
        <div className="w-8 h-8 rounded-full bg-(--bg-elevated)" />
      </div>
      <div className="flex-1 py-6 pr-8 space-y-4">
        <div className="h-3 w-16 rounded bg-(--bg-elevated)" />
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-4/5 rounded bg-(--bg-elevated)" />
          <div className="h-6 w-3/4 rounded bg-(--bg-elevated)" />
          <div className="h-6 w-2/3 rounded bg-(--bg-elevated)" />
        </div>
        <div className="h-px bg-(--border-default)" />
        <div className="h-3 w-24 rounded bg-(--bg-elevated)" />
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded bg-(--bg-elevated)" />
          <div className="h-4 w-5/6 rounded bg-(--bg-elevated)" />
        </div>
      </div>
    </div>
  );
}

export default function SurahReader() {
  const {
    currentSurah,
    setCurrentSurah,
    fontSettings,
    viewMode,
  } = useApp();


  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cancelled = { current: false };
    topRef.current?.scrollIntoView({ behavior: 'instant' });
    return () => { cancelled.current = true; };
  }, [currentSurah]);

  const arabicFont = ARABIC_FONTS.find(f => f.id === fontSettings.arabicFont);
  const arabicFontFamily = arabicFont?.family ?? '"Amiri Quran", serif';

  return (
    <main className="flex-1 overflow-y-auto bg-(--bg-canvas) relative">
      <div ref={topRef} className="scroll-mt-0" />

      <div className="relative overflow-hidden bg-linear-to-b from-(--gradient-header-from) to-(--bg-canvas) border-b border-(--border-default)">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-(--bg-accent)/8 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-6">
          <div className="relative w-28 sm:w-36 lg:w-44 aspect-376/254 shrink-0 opacity-80">
            {'Meccan' === 'Meccan' ? (
              <Image src="/makkah.avif" alt="Makkah" fill className="object-contain" sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px" />
            ) : (
              <Image src="/madinah.avif" alt="Madinah" fill className="object-contain" sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px" />
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-(--text-primary)">
              {true ? `Surah Faatiha` : `Surah ${currentSurah}`}
            </h1>
            <p className="mt-1 text-sm text-(--text-quaternary)">
              Ayah‑{'100'},{' '}
              {'Meccan' === 'Meccan' ? 'Makkah' : 'Madinah'}
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => { }}
                disabled={false}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={13} />
                {'Previous'}
              </button>

              <button
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${false
                  ? 'bg-(--bg-accent) border-(--accent)/50 text-white'
                  : false
                    ? 'bg-(--bg-active)/50 border-(--accent)/30 text-(--text-accent)'
                    : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-accent) hover:border-(--accent)/50 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                {true ? <Pause size={13} /> : <Play size={13} />}
                {true ? 'Pause' : true ? 'Resume' : 'Play Surah'}
              </button>

              <button
                onClick={() => false && setCurrentSurah(currentSurah + 1)}
                disabled={false}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-(--bg-surface) border border-(--border-subtle) text-(--text-tertiary) hover:text-(--text-primary) hover:border-(--border-accent) disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {false ? 'Name' : 'Next'}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="relative w-32 sm:w-40 lg:w-48 aspect-176/36 shrink-0">
            {!NO_BISMILLAH.includes(currentSurah) && (
              <Image src="/bismillah.53600316.svg" alt="Bismillah" fill className="object-contain" sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px" />
            )}
          </div>
        </div>
      </div>

      {true ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => <AyahSkeleton key={i} />)}
        </>
      ) : false ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
          <AlertCircle size={36} className="text-(--text-danger)" />
          <p className="text-(--text-tertiary) text-sm max-w-sm">{"ERROR"}</p>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-(--bg-elevated) hover:bg-(--border-accent) text-(--text-primary) text-sm rounded-lg border border-(--border-accent) transition-all"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : viewMode === 'reading' ? (
        <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto">
          <p
            className="text-right leading-[3.2] text-(--text-primary)"
            style={{ fontFamily: arabicFontFamily, fontSize: `${fontSettings.arabicFontSize}px`, direction: 'rtl' }}
            lang="ar"
            dir="rtl"
          >
            {[["A", "B"]].map((ayah, i) => (
              <span key={i}>
                {ayah.map((word) => (
                  <span key={word} >{word}</span>
                ))}
                {' '}
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-(--accent-dark)/60 text-(--text-accent) mx-1"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', verticalAlign: 'middle' }}
                >
                  {ayah}
                </span>
                {' '}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <div>
          {["Ayah"].map((ayah) => (
            <div key={ayah}>{ayah}</div>
          ))}
        </div>
      )}

      <div className="h-32 md:h-4" />
    </main>
  );
}
