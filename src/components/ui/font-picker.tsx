import { ARABIC_FONTS } from '@/constants/fonts';
import { useApp } from '@/context/AppContext';
import { FontSettings } from '@/types/fonts.types';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'

/* ── Arabic font picker ── */
function FontPicker() {
    const { fontSettings, updateFontSettings } = useApp();
    const [open, setOpen] = useState(false);
    const current =
        ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont) ??
        ARABIC_FONTS[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between bg-(--bg-surface) border border-(--border-subtle) hover:border-(--accent-dark)/60 rounded-xl px-3.5 py-2.5 text-sm text-(--text-primary) transition-all"
            >
                <span>{current.name}</span>
                <ChevronRight
                    size={13}
                    className={`text-(--text-quaternary) transition-transform ${open ? "rotate-90" : ""}`}
                />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-(--bg-surface) border border-(--border-accent) rounded-xl shadow-2xl z-20 overflow-hidden">
                        {ARABIC_FONTS.map((font) => (
                            <button
                                key={font.id}
                                onClick={() => {
                                    updateFontSettings({
                                        arabicFont: font.id as FontSettings["arabicFont"],
                                    });
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-3 text-sm transition-all hover:bg-(--bg-elevated) border-b border-(--border-default) last:border-0 ${fontSettings.arabicFont === font.id
                                    ? "text-(--text-accent) bg-(--bg-active)/20"
                                    : "text-(--text-secondary)"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {fontSettings.arabicFont === font.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#52b788]" />
                                    )}
                                    <span
                                        className={
                                            fontSettings.arabicFont === font.id ? "" : "ml-3.5"
                                        }
                                    >
                                        {font.name}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontFamily: font.family,
                                        fontSize: "16px",
                                        direction: "rtl",
                                    }}
                                    lang="ar"
                                    className="text-(--text-tertiary)"
                                >
                                    بِسْمِ اللَّهِ
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default FontPicker