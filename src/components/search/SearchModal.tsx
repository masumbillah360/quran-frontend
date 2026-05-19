'use client';
import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';
import { SurahMeta, SearchResultItem } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchQuran } from '@/services/quranApi';
import { Search, X, Loader2, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';

const QUICK_SURAHS = [1, 2, 18, 36, 55, 67, 112, 113, 114];

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, setCurrentSurah } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
    const [surahResults, setSurahResults] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    return () => {
      setQuery('');
      setResults([]);
      setSurahResults([]);
      setHasSearched(false);
      setError(null);
    };
  }, [isSearchOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSurahResults([]);
      setHasSearched(false);
      return;
    }
    
    // Search surahs locally
    const qLower = q.toLowerCase();
    const localSurahs = SURAHS.filter(s => 
      s.englishName.toLowerCase().includes(qLower) ||
      s.englishNameTranslation.toLowerCase().includes(qLower) ||
      s.name.includes(q) ||
      String(s.number).includes(q)
    );
    setSurahResults(localSurahs);
    
    // Search ayahs from API (will be replaced with local data later)
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const ayahData = await searchQuran(q);
      setResults(ayahData);
    } catch {
      // Silently fail for ayah search since we still have surah results
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsSearchOpen(false);
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      doSearch(query);
    }
  };

  const handleResultClick = (surahNum: number) => {
    setCurrentSurah(surahNum);
    setIsSearchOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  if (!isSearchOpen) return null;

  const quickSurahs = QUICK_SURAHS.map(n => SURAHS.find(s => s.number === n)!).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 modal-backdrop"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-(--bg-surface) border border-(--border-accent) rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-(--border-subtle)">
          {loading
            ? <Loader2 size={17} className="text-(--text-accent) animate-spin shrink-0" />
            : <Search size={17} className="text-(--text-accent) shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by surah name, verse text…"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-(--text-primary) placeholder-[#4a5568] text-sm outline-none"
            autoComplete="off"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {query && (
              <button
                onClick={clearSearch}
                className="w-6 h-6 rounded-md flex items-center justify-center text-(--text-quaternary) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-all"
              >
                <X size={13} />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-(--border-accent) text-[10px] text-(--text-quaternary) hover:text-(--text-primary) hover:border-(--text-muted) transition-all"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-4 text-(--text-danger)">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Empty / initial state */}
          {!query && !hasSearched && (
            <div className="p-4">
              <p className="text-[11px] font-bold text-(--text-muted) uppercase tracking-widest mb-3 px-1">
                Quick Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickSurahs.map(surah => (
                  <button
                    key={surah.number}
                    onClick={() => handleResultClick(surah.number)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-(--bg-canvas) hover:bg-(--bg-active)/30 border border-(--border-subtle) hover:border-(--accent-dark)/50 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-(--bg-accent)/20 border border-(--accent-dark)/40 flex items-center justify-center text-[11px] font-bold text-(--text-accent) shrink-0">
                      {surah.number}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-(--text-secondary) group-hover:text-(--text-primary) truncate transition-colors">
                        {surah.englishName}
                      </div>
                      <div className="text-[11px] text-(--text-muted) truncate">{surah.englishNameTranslation}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-(--border-subtle) flex items-center justify-center gap-2 text-[11px] text-(--text-muted)">
                <BookOpen size={12} />
                Search across all 6,236 ayahs of the Quran
              </div>
            </div>
          )}

          {/* No results */}
          {hasSearched && !loading && surahResults.length === 0 && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-(--bg-elevated) flex items-center justify-center">
                <Search size={24} className="text-(--text-muted)" />
              </div>
              <p className="text-(--text-quaternary) text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-(--text-muted) text-xs">Try different keywords or check spelling</p>
            </div>
          )}

          {/* Results */}
          {(surahResults.length > 0 || results.length > 0) && (
            <div>
              <div className="sticky top-0 px-4 py-2 bg-(--bg-canvas)/80 backdrop-blur-sm border-b border-(--border-subtle)">
                <p className="text-[11px] text-(--text-muted) font-medium">
                  {surahResults.length + results.length} result{(surahResults.length + results.length) !== 1 ? 's' : ''} for &ldquo;<span className="text-(--text-accent)">{query}</span>&rdquo;
                </p>
              </div>

              {/* Surah matches */}
              {surahResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                    Surahs
                  </div>
                  {surahResults.map((surah) => (
                    <button
                      key={`surah-${surah.number}`}
                      onClick={() => handleResultClick(surah.number)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-(--bg-elevated) border-b border-(--border-default) last:border-0 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-(--bg-accent)/20 border border-(--accent-dark)/40 flex items-center justify-center text-[11px] font-bold text-(--text-accent) shrink-0">
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-(--text-secondary) group-hover:text-(--text-primary) truncate transition-colors">
                          {surah.englishName}
                        </div>
                        <div className="text-[11px] text-(--text-muted) truncate">{surah.englishNameTranslation}</div>
                      </div>
                      <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--text-accent) transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Ayah matches */}
              {results.length > 0 && (
                <div>
                  {surahResults.length > 0 && (
                    <div className="px-4 py-2 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                      Ayahs
                    </div>
                  )}
                  {results.map((result, idx) => {
                    const [, aNum] = result.verseKey.split(':').map(Number);
                    return (
                      <button
                        key={`${result.surahNumber}:${aNum}-${idx}`}
                        onClick={() => handleResultClick(result.surahNumber)}
                        className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-(--bg-elevated) border-b border-(--border-default) last:border-0 transition-all text-left group"
                      >
                        <div className="w-11 h-11 rounded-xl bg-(--bg-accent)/15 border border-(--accent-dark)/30 flex flex-col items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-(--text-accent) leading-tight">{result.surahNumber}</span>
                          <div className="w-4 h-px bg-(--bg-accent)/50 my-0.5" />
                          <span className="text-[9px] font-bold text-(--text-accent) leading-tight">{aNum}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-(--text-accent)">
                              {result.surahEnglishName}
                            </span>
                            <span className="text-[10px] text-(--text-muted) font-mono">
                              {result.verseKey}
                            </span>
                          </div>
                          <p className="text-sm text-(--text-tertiary) group-hover:text-(--text-secondary) leading-relaxed line-clamp-2 transition-colors">
                            {result.translation}
                          </p>
                        </div>

                        <ChevronRight
                          size={14}
                          className="text-(--text-muted) group-hover:text-(--text-accent) transition-colors shrink-0 mt-2"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-(--border-subtle) bg-(--bg-canvas)/40">
          <span className="text-[11px] text-(--text-muted)">
            Press <kbd className="border border-(--border-accent) px-1 py-px rounded text-[10px] font-mono bg-(--bg-surface)">Enter</kbd> to search
          </span>
          <span className="text-[11px] text-(--text-muted)">
            <kbd className="border border-(--border-accent) px-1 py-px rounded text-[10px] font-mono bg-(--bg-surface)">Ctrl K</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
