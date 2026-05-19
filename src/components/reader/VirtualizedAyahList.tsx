/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { LocalAyahData } from '@/types/surahs.types';
import OptimizedAyahCard from './OptimizedAyahCard';
import { useApp } from '@/context/AppContext';
import { ARABIC_FONTS } from '@/constants/fonts';

interface VirtualizedAyahListProps {
  ayahs: LocalAyahData[];
  surahNumber: number;
  containerRef: React.RefObject<HTMLElement | null>;
  headerOffset?: number;
  jumpTargetAyah?: number | null;
}

const BUFFER_COUNT = 5;
const SCROLL_DEBOUNCE = 8;
const RESIZE_DEBOUNCE = 150;

export default function VirtualizedAyahList({
  ayahs,
  surahNumber,
  containerRef,
  headerOffset = 180,
  jumpTargetAyah = null,
}: VirtualizedAyahListProps) {
  const { fontSettings, audioState } = useApp();
  const heightCacheRef = useRef<Map<number, number>>(new Map());
  const lastScrollTime = useRef(0);
  const hasJumpScrolled = useRef(false);

  const arabicFont = ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont);
  const arabicFontFamily = arabicFont?.family ?? '"Amiri Quran", serif';

  const estimatedHeight = useMemo(() => {
    const arabicLines = 2;
    const translationLines = 3;
    const padding = 50;
    return (
      arabicLines * fontSettings.arabicFontSize * 2.8 +
      translationLines * fontSettings.translationFontSize * 1.6 +
      padding
    );
  }, [fontSettings.arabicFontSize, fontSettings.translationFontSize]);

  const computeInitialRange = useCallback(() => {
    if (jumpTargetAyah !== null && ayahs.length > 0) {
      const idx = ayahs.findIndex((a) => a.ayahNumber === jumpTargetAyah);
      if (idx >= 0) {
        const start = Math.max(0, idx - 3);
        return { start, end: Math.min(ayahs.length - 1, idx + 12) };
      }
    }
    return { start: 0, end: Math.min(15, ayahs.length - 1) };
  }, [jumpTargetAyah, ayahs.length]);

  const [visibleRange, setVisibleRange] = useState(computeInitialRange);

  const getHeight = useCallback(
    (index: number): number => {
      return heightCacheRef.current.get(index) ?? estimatedHeight;
    },
    [estimatedHeight]
  );

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || ayahs.length === 0) return;

    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_DEBOUNCE) return;
    lastScrollTime.current = now;

    const scrollTop = Math.max(0, container.scrollTop - headerOffset);
    const viewportHeight = container.clientHeight;

    let accumulatedHeight = 0;
    let startIndex = 0;

    for (let i = 0; i < ayahs.length; i++) {
      const height = getHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = i;
        break;
      }
      accumulatedHeight += height;
    }

    let endIndex = startIndex;
    let visibleHeight = 0;

    for (let i = startIndex; i < ayahs.length; i++) {
      const height = getHeight(i);
      visibleHeight += height;
      endIndex = i;
      if (visibleHeight > viewportHeight + estimatedHeight * 2) break;
    }

    const bufferedStart = Math.max(0, startIndex - BUFFER_COUNT);
    const bufferedEnd = Math.min(ayahs.length - 1, endIndex + BUFFER_COUNT);

    setVisibleRange((prev) => {
      if (prev.start === bufferedStart && prev.end === bufferedEnd) {
        return prev;
      }
      return { start: bufferedStart, end: bufferedEnd };
    });
  }, [ayahs.length, containerRef, getHeight, estimatedHeight, headerOffset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateVisibleRange();
        rafId = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibleRange();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef, updateVisibleRange]);

  useEffect(() => {
    heightCacheRef.current.clear();
    hasJumpScrolled.current = false;
    if (jumpTargetAyah === null) {
      setVisibleRange({ start: 0, end: 15 });
    } else {
      setVisibleRange(computeInitialRange());
    }

    const timer = setTimeout(updateVisibleRange, 50);
    return () => clearTimeout(timer);
  }, [ayahs, fontSettings, updateVisibleRange, jumpTargetAyah, computeInitialRange]);

  useEffect(() => {
    if (jumpTargetAyah === null || hasJumpScrolled.current) return;

    const tryScroll = (attempts: number) => {
      const el = document.getElementById(`ayah-${surahNumber}-${jumpTargetAyah}`);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        hasJumpScrolled.current = true;
      } else if (attempts > 0) {
        setTimeout(() => tryScroll(attempts - 1), 100);
      }
    };

    tryScroll(15);
  }, [surahNumber, jumpTargetAyah, visibleRange]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        heightCacheRef.current.clear();
        updateVisibleRange();
      }, RESIZE_DEBOUNCE);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimer);
    };
  }, [updateVisibleRange]);

  const measureHeight = useCallback((index: number, height: number) => {
    const cached = heightCacheRef.current.get(index);
    if (cached !== height && height > 0) {
      heightCacheRef.current.set(index, height);
    }
  }, []);

  const { topSpacer, bottomSpacer, visibleAyahs } = useMemo(() => {
    let top = 0;
    for (let i = 0; i < visibleRange.start; i++) {
      top += getHeight(i);
    }

    let bottom = 0;
    for (let i = visibleRange.end + 1; i < ayahs.length; i++) {
      bottom += getHeight(i);
    }

    const visible = ayahs.slice(visibleRange.start, visibleRange.end + 1);

    return { topSpacer: top, bottomSpacer: bottom, visibleAyahs: visible };
  }, [visibleRange, ayahs, getHeight]);

  const activeAyahNumber =
    audioState.currentSurah === surahNumber ? audioState.currentAyah : null;
  const activeWordPosition =
    audioState.currentSurah === surahNumber ? audioState.currentWord : null;

  return (
    <div role="list" aria-label="Ayahs">
      {topSpacer > 0 && (
        <div
          style={{ height: topSpacer }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {visibleAyahs.map((ayah, idx) => {
        const actualIndex = visibleRange.start + idx;
        const isActive = activeAyahNumber === ayah.ayahNumber;

        return (
          <div key={ayah.id} role="listitem">
            <OptimizedAyahCard
              ayah={ayah}
              surahNumber={surahNumber}
              isActive={isActive}
              activeWordPosition={isActive ? activeWordPosition : null}
              arabicFontSize={fontSettings.arabicFontSize}
              arabicFontFamily={arabicFontFamily}
              translationFontSize={fontSettings.translationFontSize}
              onMeasure={(height) => measureHeight(actualIndex, height)}
            />
          </div>
        );
      })}

      {bottomSpacer > 0 && (
        <div
          style={{ height: bottomSpacer }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {ayahs.length > visibleRange.end + 1 && (
        <div
          className="text-center py-4 text-sm"
          style={{ color: 'var(--text-muted)' }}
          aria-live="polite"
        >
          {ayahs.length - visibleRange.end - 1} more ayahs below
        </div>
      )}
    </div>
  );
}
