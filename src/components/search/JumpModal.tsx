'use client';

import { useState, useEffect, useMemo } from 'react';
import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';
import { ChevronDown } from 'lucide-react';

export default function JumpModal() {
    // Assuming your AppContext handles the state for this modal as well
    const { isJumpOpen, setIsJumpOpen, setCurrentSurah, setCurrentAyah } = useApp();

    // Defaulting to Al Fatihah (Surah 1)
    const [selectedSurah, setSelectedSurah] = useState<number>(1);
    const [selectedAyah, setSelectedAyah] = useState<number>(1);

    // Reset or focus logic when modal opens
    useEffect(() => {
        if (isJumpOpen) {
            // You can reset states here if needed when opened
            // setSelectedSurah(1);
            // setSelectedAyah(1);
        }
    }, [isJumpOpen]);

    // Keyboard shortcut: Escape to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsJumpOpen(false);
        };
        if (isJumpOpen) {
            window.addEventListener('keydown', handler);
        }
        return () => window.removeEventListener('keydown', handler);
    }, [isJumpOpen, setIsJumpOpen]);

    // Generate an array of Ayah numbers based on the selected Surah's total ayahs
    // (Assuming your SURAHS data has an 'ayahCount' or 'numberOfAyahs' property)
    const currentSurahData = useMemo(() => {
        return SURAHS.find(s => s.number === selectedSurah) || SURAHS[0];
    }, [selectedSurah]);

    const ayahOptions = useMemo(() => {
        // Fallback to 7 if property is missing just for Al Fatihah default
        const count = currentSurahData?.numberOfAyahs || 7;
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [currentSurahData]);

    // Handle Surah change, reset Ayah to 1
    const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSurah(Number(e.target.value));
        setSelectedAyah(1);
    };

    const handleJumpToAyah = () => {
        setCurrentSurah(selectedSurah);
        setCurrentAyah(selectedAyah);
        setIsJumpOpen(false);
    };

    const handleJumpToTafsir = () => {
        // Implement your Tafsir navigation logic here
        setCurrentSurah(selectedSurah);
        setCurrentAyah(selectedAyah);
        // e.g., router.push(`/tafsir/${selectedSurah}/${selectedAyah}`)
        setIsJumpOpen(false);
    };

    if (!isJumpOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 modal-backdrop transition-opacity"
                onClick={() => setIsJumpOpen(false)}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-md bg-(--bg-surface) rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 md:p-8">
                    <h2 className="text-center font-bold text-lg text-(--text-primary) mb-6">
                        Jump to Ayah/Tafsir
                    </h2>

                    <div className="space-y-5">
                        {/* Surah Selection */}
                        <div>
                            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                                Select Surah
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedSurah}
                                    onChange={handleSurahChange}
                                    className="w-full appearance-none bg-[#fdfaf6] dark:bg-(--bg-elevated) border border-(--border-subtle) text-(--text-primary) text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-(--border-accent) focus:ring-1 focus:ring-(--border-accent) transition-all cursor-pointer"
                                >
                                    {SURAHS.map((surah) => (
                                        <option key={surah.number} value={surah.number}>
                                            {surah.englishName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                                />
                            </div>
                        </div>

                        {/* Ayah Selection */}
                        <div>
                            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                                Select Ayah
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedAyah}
                                    onChange={(e) => setSelectedAyah(Number(e.target.value))}
                                    className="w-full appearance-none bg-[#fdfaf6] dark:bg-(--bg-elevated) border border-(--border-subtle) text-(--text-primary) text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-(--border-accent) focus:ring-1 focus:ring-(--border-accent) transition-all cursor-pointer"
                                >
                                    {ayahOptions.map((num) => (
                                        <option key={num} value={num}>
                                            {String(num).padStart(2, '0')} - {String(ayahOptions.length).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full">
                    <button
                        onClick={handleJumpToTafsir}
                        className="flex-1 py-4 text-sm font-medium bg-[#fcf9f5] dark:bg-(--bg-canvas) text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-colors"
                    >
                        Jump To Tafsir
                    </button>
                    <button
                        onClick={handleJumpToAyah}
                        className="flex-1 py-4 text-sm font-medium bg-[#8e735b] hover:bg-[#7a624d] text-white transition-colors"
                    >
                        Jump To Ayah
                    </button>
                </div>
            </div>
        </div>
    );
}