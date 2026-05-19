'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SURAHS } from '@/data/surahs';

export default function SurahSidebar() {
  const {
    currentSurah,
    setCurrentSurah,
    isSurahSidebarOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAHS.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      String(s.number).includes(q)
    );
  });

  const handleSurahSelect = (num: number) => {
    setIsMobileMenuOpen(false);
    setCurrentSurah(num);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-(--bg-canvas) border-r border-(--border-default) transition-all duration-300 ease-in-out overflow-hidden ${isSurahSidebarOpen ? 'w-80' : 'w-0'
          }`}>
        {isSurahSidebarOpen && (
          <SidebarContent
            surahs={filteredSurahs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSurahSelect={handleSurahSelect}
            currentSurah={currentSurah}
          />
        )}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-(--bg-canvas) h-full flex flex-col shadow-2xl border-r border-(--border-default)">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-default) shrink-0">
              <span className="text-sm font-bold text-(--text-primary)">Quran Navigator</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-(--text-muted) hover:bg-(--bg-surface) hover:text-(--text-primary) transition-all">
                <X size={16} />
              </button>
            </div>
            <SidebarContent
              surahs={filteredSurahs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSurahSelect={handleSurahSelect}
              currentSurah={currentSurah}
            />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({
  surahs,
  searchQuery,
  setSearchQuery,
  onSurahSelect,
  currentSurah,
}: {
  surahs: typeof SURAHS;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSurahSelect: (num: number) => void;
  currentSurah: number;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden pt-4">
      {/* Search */}
      <div className="mb-4 px-4 shrink-0">
        <div className="border-(--border-default) bg-(--bg-surface) flex h-10 items-center gap-3 rounded-full border px-3 text-base">
          <Search size={18} className="text-(--text-muted) shrink-0" />
          <input
            type="text"
            placeholder="Search Surah"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent font-light text-sm text-(--text-primary) placeholder:text-(--text-muted) outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto pb-16 px-4">
        <div className="space-y-2">
          {surahs.length === 0 ? (
            <div className="text-center py-10 text-(--text-muted) text-xs font-medium">
              No surahs found
            </div>
          ) : (
            surahs.map((surah) => {
              const isActive = surah.number === currentSurah;

              return (
                <button
                  key={surah.number}
                  onClick={() => onSurahSelect(surah.number)}
                  className={`group/card border-(--border-default) flex h-19 w-full min-w-50 cursor-pointer items-center justify-between gap-5 rounded-md border px-4 select-none text-start transition-all duration-150 ${isActive
                    ? 'bg-(--bg-active)/30 border-(--accent)/40'
                    : 'bg-(--bg-surface) hover:bg-(--bg-elevated)/50'
                    }`}>
                  <div
                    className={`flex size-8 min-h-8 min-w-8 rotate-45 items-center justify-center rounded-md transition-colors duration-150 ${isActive
                      ? 'bg-(--bg-accent)'
                      : 'bg-(--bg-surface) group-hover/card:bg-(--bg-accent)/30'
                      }`}>
                    <span
                      className={`text-xs font-medium -rotate-45 transition-colors ${isActive ? 'text-white' : 'text-(--text-secondary)'
                        }`}>
                      {surah.number}
                    </span>
                  </div>

                  <div className="grow min-w-0">
                    <p
                      className={`text-sm font-medium line-clamp-1 pr-3 break-all ${isActive ? 'text-(--text-accent)' : 'text-(--text-primary)'
                        }`}>
                      {surah.englishName}
                    </p>
                    <p className="text-xs text-(--text-muted) line-clamp-1 font-normal break-all mt-0.5">
                      {surah.englishNameTranslation}
                    </p>
                  </div>

                  <span
                    dir="ltr"
                    className={`text-2xl text-right [unicode-bidi:isolate] font-calligraphy transition-colors ${isActive ? 'text-(--text-accent)' : 'text-(--text-secondary)'
                      }`}
                    style={{ fontFamily: "'SurahCalligraphy', serif" }}>
                    {String(surah.number).padStart(3, '0')}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}