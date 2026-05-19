/* eslint-disable react-hooks/set-state-in-effect */
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * VIRTUALIZED AYAH LIST (Production-Ready)
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Improvements:
 * - Better height estimation
 * - Scroll offset for sticky header
 * - Debounced resize handling
 * - Intersection Observer for better performance
 */

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
  /** Offset for sticky header height */
  headerOffset?: number;
}

// ── Configuration ────────────────────────────────────────────────────────────
const BUFFER_COUNT = 5; // Render 5 extra ayahs above/below viewport
const SCROLL_DEBOUNCE = 8; // ~120fps max update rate
const RESIZE_DEBOUNCE = 150;

export default function VirtualizedAyahList({
  ayahs,
  surahNumber,
  containerRef,
  headerOffset = 180, // Sticky header + surah header
}: VirtualizedAyahListProps) {
  const { fontSettings, audioState } = useApp();
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 15 });
  const heightCacheRef = useRef<Map<number, number>>(new Map());
  const lastScrollTime = useRef(0);

  const arabicFont = ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont);
  const arabicFontFamily = arabicFont?.family ?? '"Amiri Quran", serif';

  // ── Calculate estimated height based on font size ──
  const estimatedHeight = useMemo(() => {
    // Base height scales with font size
    const arabicLines = 2; // Average lines of Arabic text
    const translationLines = 3; // Average translation lines
    const padding = 50;

    return (
      arabicLines * fontSettings.arabicFontSize * 2.8 +
      translationLines * fontSettings.translationFontSize * 1.6 +
      padding
    );
  }, [fontSettings.arabicFontSize, fontSettings.translationFontSize]);

  // ── Get height for an ayah (cached or estimated) ──
  const getHeight = useCallback(
    (index: number): number => {
      return heightCacheRef.current.get(index) ?? estimatedHeight;
    },
    [estimatedHeight]
  );

  // ── Calculate total height and visible range ──
  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || ayahs.length === 0) return;

    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_DEBOUNCE) return;
    lastScrollTime.current = now;

    const scrollTop = Math.max(0, container.scrollTop - headerOffset);
    const viewportHeight = container.clientHeight;

    // Linear search for start index (fine for < 300 items)
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

    // Find last visible ayah
    let endIndex = startIndex;
    let visibleHeight = 0;

    for (let i = startIndex; i < ayahs.length; i++) {
      const height = getHeight(i);
      visibleHeight += height;
      endIndex = i;
      if (visibleHeight > viewportHeight + estimatedHeight * 2) break;
    }

    // Apply buffer
    const bufferedStart = Math.max(0, startIndex - BUFFER_COUNT);
    const bufferedEnd = Math.min(ayahs.length - 1, endIndex + BUFFER_COUNT);

    setVisibleRange((prev) => {
      if (prev.start === bufferedStart && prev.end === bufferedEnd) {
        return prev;
      }
      return { start: bufferedStart, end: bufferedEnd };
    });
  }, [ayahs.length, containerRef, getHeight, estimatedHeight, headerOffset]);

  // ── Attach scroll listener ──
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

  // ── Recalculate on ayahs/font change ──
  useEffect(() => {
    heightCacheRef.current.clear();
    setVisibleRange({ start: 0, end: 15 });

    // Delay recalculation to allow DOM update
    const timer = setTimeout(updateVisibleRange, 50);
    return () => clearTimeout(timer);
  }, [ayahs, fontSettings, updateVisibleRange]);

  // ── Handle window resize ──
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

  // ── Measure callback ──
  const measureHeight = useCallback((index: number, height: number) => {
    const cached = heightCacheRef.current.get(index);
    if (cached !== height && height > 0) {
      heightCacheRef.current.set(index, height);
    }
  }, []);

  // ── Calculate spacer heights ──
  const { topSpacer, bottomSpacer, visibleAyahs } = useMemo(() => {
    let top = 0;
    for (let i = 0; i < visibleRange.start; i++) {
      // eslint-disable-next-line react-hooks/refs
      top += getHeight(i);
    }

    let bottom = 0;
    for (let i = visibleRange.end + 1; i < ayahs.length; i++) {
      // eslint-disable-next-line react-hooks/refs
      bottom += getHeight(i);
    }

    const visible = ayahs.slice(visibleRange.start, visibleRange.end + 1);

    return { topSpacer: top, bottomSpacer: bottom, visibleAyahs: visible };
  }, [visibleRange, ayahs, getHeight]);

  // ── Current playing state ──
  const activeAyahNumber =
    audioState.currentSurah === surahNumber ? audioState.currentAyah : null;
  const activeWordPosition =
    audioState.currentSurah === surahNumber ? audioState.currentWord : null;

  return (
    <div role="list" aria-label="Ayahs">
      {/* Top spacer */}
      {topSpacer > 0 && (
        <div
          style={{ height: topSpacer }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {/* Visible ayahs */}
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

      {/* Bottom spacer */}
      {bottomSpacer > 0 && (
        <div
          style={{ height: bottomSpacer }}
          aria-hidden="true"
          className="pointer-events-none"
        />
      )}

      {/* Loading indicator for more items */}
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
