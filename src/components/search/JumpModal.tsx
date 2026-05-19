'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';
import { ChevronDown, ArrowUpCircle, BookOpen } from 'lucide-react';

export default function JumpModal() {
    const { isJumpOpen, setIsJumpOpen, jumpToAyah, currentSurah } = useApp();

    const [selectedSurah, setSelectedSurah] = useState(currentSurah);
    const [selectedAyah, setSelectedAyah] = useState(1);
    const [surahSearch, setSurahSearch] = useState('');
    const [surahDropdownOpen, setSurahDropdownOpen] = useState(false);
    const [ayahDropdownOpen, setAyahDropdownOpen] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const surahInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isJumpOpen) {
            setSelectedSurah(currentSurah);
            setSelectedAyah(1);
            setSurahSearch('');
            setSurahDropdownOpen(false);
            setAyahDropdownOpen(false);
            setTimeout(() => surahInputRef.current?.focus(), 100);
        }
    }, [isJumpOpen, currentSurah]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsJumpOpen(false);
            if (e.key === 'Enter' && isJumpOpen) {
                jumpToAyah(selectedSurah, selectedAyah);
            }
        };
        if (isJumpOpen) {
            window.addEventListener('keydown', handler);
        }
        return () => window.removeEventListener('keydown', handler);
    }, [isJumpOpen, setIsJumpOpen, selectedSurah, selectedAyah, jumpToAyah]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setSurahDropdownOpen(false);
                setAyahDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const currentSurahData = useMemo(() => {
        return SURAHS.find(s => s.number === selectedSurah) || SURAHS[0];
    }, [selectedSurah]);

    const ayahCount = currentSurahData?.numberOfAyahs || 7;

    const ayahOptions = useMemo(() => {
        return Array.from({ length: ayahCount }, (_, i) => i + 1);
    }, [ayahCount]);

    useEffect(() => {
        if (selectedAyah > ayahCount) {
            setSelectedAyah(ayahCount);
        }
    }, [selectedAyah, ayahCount]);

    const filteredSurahs = useMemo(() => {
        const query = surahSearch.toLowerCase().trim();
        if (!query) return SURAHS;
        return SURAHS.filter(s =>
            s.number.toString().includes(query) ||
            s.englishName.toLowerCase().includes(query) ||
            s.englishNameTranslation.toLowerCase().includes(query) ||
            s.name.includes(query)
        );
    }, [surahSearch]);

    const handleSurahSelect = (num: number) => {
        setSelectedSurah(num);
        setSelectedAyah(1);
        setSurahSearch('');
        setSurahDropdownOpen(false);
    };

    const handleJumpToAyah = () => {
        jumpToAyah(selectedSurah, selectedAyah);
    };

    if (!isJumpOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/70 transition-opacity"
                onClick={() => setIsJumpOpen(false)}
            />

            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-(--bg-surface) rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 md:p-8">
                    <h2 className="text-center font-bold text-lg text-(--text-primary) mb-6">
                        Jump to Ayah
                    </h2>

                    <div className="space-y-5">
                        {/* Surah Selection */}
                        <div>
                            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                                Select Surah
                            </label>
                            <div className="relative">
                                <input
                                    ref={surahInputRef}
                                    type="text"
                                    value={surahSearch}
                                    onChange={e => { setSurahSearch(e.target.value); setSurahDropdownOpen(true); }}
                                    onFocus={() => setSurahDropdownOpen(true)}
                                    placeholder={`Surah ${currentSurahData.englishName} (#${currentSurahData.number})`}
                                    className="w-full bg-[#fdfaf6] dark:bg-(--bg-elevated) border border-(--border-subtle) text-(--text-primary) text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-(--border-accent) focus:ring-1 focus:ring-(--border-accent) transition-all placeholder:text-(--text-muted)"
                                />
                                <ChevronDown
                                    size={18}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition-transform ${surahDropdownOpen ? 'rotate-180' : ''}`}
                                />

                                {surahDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-(--bg-surface) border border-(--border-subtle) rounded-xl shadow-xl z-50">
                                        {filteredSurahs.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-(--text-muted)">No surah found</div>
                                        ) : (
                                            filteredSurahs.map(surah => (
                                                <button
                                                    key={surah.number}
                                                    onClick={() => handleSurahSelect(surah.number)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-(--bg-elevated) ${selectedSurah === surah.number ? 'text-(--text-accent) bg-(--badge-bg) font-medium' : 'text-(--text-secondary)'}`}
                                                >
                                                    <span>{surah.number}. {surah.englishName}</span>
                                                    <span className="text-xs text-(--text-muted)">{surah.numberOfAyahs} ayahs</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ayah Selection */}
                        <div>
                            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                                Select Ayah
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setAyahDropdownOpen(!ayahDropdownOpen)}
                                    className="w-full appearance-none bg-[#fdfaf6] dark:bg-(--bg-elevated) border border-(--border-subtle) text-(--text-primary) text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-(--border-accent) focus:ring-1 focus:ring-(--border-accent) transition-all cursor-pointer text-left flex items-center justify-between"
                                >
                                    <span>Ayah {selectedAyah} of {ayahCount}</span>
                                    <ChevronDown
                                        size={18}
                                        className={`text-(--text-muted) transition-transform ${ayahDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {ayahDropdownOpen && (
                                    <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-(--bg-surface) border border-(--border-subtle) rounded-xl shadow-xl z-50">
                                        {ayahOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => { setSelectedAyah(num); setAyahDropdownOpen(false); }}
                                                className={`w-full px-4 py-2 text-sm text-left transition-all hover:bg-(--bg-elevated) ${selectedAyah === num ? 'text-(--text-accent) bg-(--badge-bg) font-medium' : 'text-(--text-secondary)'}`}
                                            >
                                                Ayah {num}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-(--text-muted) text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-(--bg-elevated) rounded text-[10px] font-mono">Enter</kbd> to jump
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full">
                    <button
                        onClick={() => setIsJumpOpen(false)}
                        className="flex-1 py-4 text-sm font-medium bg-[#fcf9f5] dark:bg-(--bg-canvas) text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleJumpToAyah}
                        className="flex-1 py-4 text-sm font-medium bg-[#8e735b] hover:bg-[#7a624d] text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowUpCircle size={15} />
                        Jump
                    </button>
                </div>
            </div>
        </div>
    );
}
