/**
 * ══════════════════════════════════════════════════════════════════════════════
 * OPTIMIZED AYAH CARD (Production-Ready)
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Improvements:
 * - Better accessibility (ARIA labels, roles, focus management)
 * - Optimized word highlighting (no querySelectorAll on each update)
 * - Proper error handling for copy
 * - Touch-friendly interactions
 * - Reduced auto-scroll frequency
 */

'use client';

import { useRef, useEffect, memo, useCallback, useState } from 'react';
import { Play, Pause, Copy, Check, Share2, Bookmark } from 'lucide-react';
import { LocalAyahData, toArabicNumerals } from '@/types/surahs.types';
import { useApp } from '@/context/AppContext';
import { cleanArabicText } from '@/utils';

interface OptimizedAyahCardProps {
  ayah: LocalAyahData;
  surahNumber: number;
  isActive: boolean;
  activeWordPosition: number | null;
  arabicFontSize: number;
  arabicFontFamily: string;
  translationFontSize: number;
  onMeasure?: (height: number) => void;
}

const OptimizedAyahCard = memo(function OptimizedAyahCard({
  ayah,
  surahNumber,
  isActive,
  activeWordPosition,
  arabicFontSize,
  arabicFontFamily,
  translationFontSize,
  onMeasure,
}: OptimizedAyahCardProps) {
  const { playAyah, audioState } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const wordRefsMap = useRef<Map<number, HTMLSpanElement>>(new Map());
  const hasScrolledRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const isPlaying = isActive && audioState.isPlaying;

  // ── Measure height for virtualization ──
  useEffect(() => {
    if (cardRef.current && onMeasure) {
      // Use ResizeObserver for more accurate measurements
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onMeasure(entry.contentRect.height + 40); // +40 for padding
        }
      });

      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
  }, [onMeasure]);

  // ── Optimized word highlighting using refs ──
  useEffect(() => {
    // Remove highlight from all words
    wordRefsMap.current.forEach((el) => {
      el.classList.remove('word-highlight');
    });

    // Add highlight to active word
    if (isActive && activeWordPosition !== null) {
      const activeEl = wordRefsMap.current.get(activeWordPosition);
      if (activeEl) {
        activeEl.classList.add('word-highlight');
      }
    }
  }, [isActive, activeWordPosition]);

  // ── Auto-scroll (only once when ayah starts playing) ──
  useEffect(() => {
    if (isActive && isPlaying && !hasScrolledRef.current && cardRef.current) {
      hasScrolledRef.current = true;
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Reset when ayah changes
    if (!isActive) {
      hasScrolledRef.current = false;
    }
  }, [isActive, isPlaying]);

  // ── Word ref registration ──
  const registerWordRef = useCallback((position: number, el: HTMLSpanElement | null) => {
    if (el) {
      wordRefsMap.current.set(position, el);
    } else {
      wordRefsMap.current.delete(position);
    }
  }, []);

  // ── Handlers ──
  const handleTogglePlay = useCallback(() => {
    playAyah(surahNumber, ayah);
  }, [playAyah, surahNumber, ayah]);

  const handleCopy = useCallback(async () => {
    const words = ayah.words.filter((w) => w.charType === 'word');
    const arabicText = words.map((w) => w.text).join(' ');
    const textToCopy = `${arabicText}\n\n${ayah.translation}\n\n— Surah ${surahNumber}, Ayah ${ayah.ayahNumber}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);

      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setCopyError(false);
      } catch {
        // Truly failed
      }
      document.body.removeChild(textarea);
    }
  }, [ayah, surahNumber]);

  const handleShare = useCallback(async () => {
    const words = ayah.words.filter((w) => w.charType === 'word');
    const arabicText = words.map((w) => w.text).join(' ');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${surahNumber}, Ayah ${ayah.ayahNumber}`,
          text: `${arabicText}\n\n${ayah.translation}`,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          handleCopy(); // Fallback to copy
        }
      }
    } else {
      handleCopy();
    }
  }, [ayah, surahNumber, handleCopy]);

  const words = ayah.words.filter((w) => w.charType === 'word');

  return (
    <article
      ref={cardRef}
      id={`ayah-${surahNumber}-${ayah.ayahNumber}`}
      className="border-b px-4 sm:px-6 py-5 transition-colors duration-200"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: isActive
          ? 'color-mix(in srgb, var(--bg-active) 40%, transparent)'
          : 'transparent',
      }}
      aria-label={`Ayah ${ayah.ayahNumber} of Surah ${surahNumber}`}
      role="article"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide"
          style={{ color: 'var(--text-accent)', background: 'var(--badge-bg)' }}
          aria-label={`Verse ${ayah.verseKey}`}
        >
          {ayah.verseKey}
        </span>

        <div className="flex items-center gap-0.5" role="toolbar" aria-label="Ayah actions">
          <button
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'play-pulse' : 'hover:opacity-80'
              }`}
            style={{
              background: isPlaying ? 'var(--accent)' : 'transparent',
              color: isPlaying ? 'white' : 'var(--text-muted)',
            }}
            aria-label={isPlaying ? 'Pause ayah' : 'Play ayah'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style={{
              color: copied ? 'var(--text-accent)' : copyError ? 'var(--text-danger)' : 'var(--text-muted)'
            }}
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : copyError ? 'Copy failed' : 'Copy ayah'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          <button
            className="w-9 h-9 rounded-full items-center justify-center transition-colors hover:opacity-80 hidden sm:flex"
            style={{ color: 'var(--text-muted)' }}
            onClick={handleShare}
            aria-label="Share ayah"
          >
            <Share2 size={16} />
          </button>

          <button
            className="w-9 h-9 rounded-full items-center justify-center transition-colors hover:opacity-80 hidden sm:flex"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Bookmark ayah"
          >
            <Bookmark size={16} />
          </button>
        </div>
      </header>

      {/* Arabic Text */}
      <div
        className="text-right mb-4 leading-[2.8]"
        style={{
          fontFamily: arabicFontFamily,
          fontSize: `${arabicFontSize}px`,
          direction: 'rtl',
          color: 'var(--text-primary)',
        }}
        dir="rtl"
        lang="ar"
        role="text"
        aria-label="Arabic text"
      >
        {words.map((word) => (
          <WordSpan
            key={word.id ?? `w-${word.position}`}
            word={word}
            registerRef={registerWordRef}
          />
        ))}
        {/* Ayah number marker */}
        <span
          className="inline-flex items-center justify-center rounded-full mx-1.5 align-middle select-none"
          style={{
            fontFamily: arabicFontFamily,
            color: 'var(--text-accent)',
            borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
          aria-hidden="true"
        >
          {toArabicNumerals(ayah.ayahNumber)}
        </span>
      </div>

      {/* Translation */}
      <footer className="mt-4 pl-0 sm:pl-2">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {ayah.translationName}
        </p>
        <p
          className="leading-relaxed"
          style={{
            fontSize: `${translationFontSize}px`,
            color: 'var(--text-secondary)',
          }}
          lang="en"
        >
          {ayah.translation}
        </p>
      </footer>
    </article>
  );
}, arePropsEqual);

// ── Custom comparison for memo ──
function arePropsEqual(
  prev: OptimizedAyahCardProps,
  next: OptimizedAyahCardProps
): boolean {
  return (
    prev.ayah.id === next.ayah.id &&
    prev.isActive === next.isActive &&
    prev.activeWordPosition === next.activeWordPosition &&
    prev.arabicFontSize === next.arabicFontSize &&
    prev.arabicFontFamily === next.arabicFontFamily &&
    prev.translationFontSize === next.translationFontSize
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WORD SPAN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

interface WordSpanProps {
  word: {
    id?: string;
    position: number;
    text: string;
    translation: string;
    transliteration: string;
  };
  registerRef: (position: number, el: HTMLSpanElement | null) => void;
}

const WordSpan = memo(function WordSpan({ word, registerRef }: WordSpanProps) {
  const handleRef = useCallback(
    (el: HTMLSpanElement | null) => registerRef(word.position, el),
    [word.position, registerRef]
  );

  return (
    <span
      ref={handleRef}
      data-word-pos={word.position}
      className="word-span relative inline-block cursor-pointer mx-px transition-all duration-150"
      tabIndex={0}
      role="button"
      aria-label={`${word.text}: ${word.translation}`}
    >
      <span dangerouslySetInnerHTML={{ __html: cleanArabicText(word.text) }} />
      {/* CSS-only tooltip */}
      <span className="word-tooltip" role="tooltip">
        {word.transliteration && (
          <span className="word-tooltip-transliteration">{word.transliteration}</span>
        )}
        {word.transliteration && ' — '}
        {word.translation}
      </span>
    </span>
  );
});

export default OptimizedAyahCard;
