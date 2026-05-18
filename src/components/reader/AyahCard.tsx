"use client";

import { Ayah } from "@/types";
import { Play, Pause, BookOpen, MoreHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";
import { ARABIC_FONTS } from "@/constants/fonts";
import { useApp } from "@/context/AppContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cleanArabicText, toArabicNumerals } from "@/utils";


interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
}

export default function AyahCard({ ayah, surahNumber }: AyahCardProps) {
  const { audioState, toggleAyahAudio, fontSettings } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const isThisAyah =
    audioState.currentSurah === surahNumber &&
    audioState.currentAyah === ayah.ayah_number;

  const isPlaying = isThisAyah && audioState.isPlaying;
  const activeWord = isThisAyah ? audioState.currentWord : null;

  const arabicFont = ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont);
  const arabicFamily = arabicFont?.family ?? '"Amiri Quran", serif';
  const translation = ayah?.translation?.translation ?? "";

  const prevPlayingRef = useRef(false);
  useEffect(() => {
    if (isThisAyah && isPlaying && !prevPlayingRef.current && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    prevPlayingRef.current = isPlaying && isThisAyah;
  }, [isThisAyah, isPlaying]);

  const handleTogglePlay = () => {
    toggleAyahAudio(surahNumber, ayah);
  };

  return (
    <div
      ref={cardRef}
      className={`border-b border-(--border-default) px-6 py-6 transition-colors duration-200 ${isThisAyah ? "bg-(--bg-active)/40" : "hover:bg-(--bg-surface)/40"
        }`}
    >
      <div className="flex gap-6 pt-4">
        <div className="hidden md:flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-(--text-accent)">
            {surahNumber}:{ayah.ayah_number}
          </p>
          <button
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isPlaying
              ? "bg-(--accent) text-white"
              : "text-(--text-muted) hover:text-(--text-accent)"
              }`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-(--text-muted) hover:text-(--text-accent)">
            <BookOpen size={18} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-(--text-muted) hover:text-(--text-accent)">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="w-full">
          <p
            className="text-right text-(--text-primary) font-arabic mb-4 leading-[2.8]"
            style={{
              fontFamily: arabicFamily,
              fontSize: `${fontSettings.arabicFontSize}px`,
              direction: "rtl",
            }}
            dir="rtl"
            lang="ar"
          >
            {ayah.words.filter((w) => w.char_type === 'word').map((word) => {
              const isWordActive = activeWord === word.position;

              return (
                <Tooltip key={word.id}>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-block cursor-pointer transition-all duration-150 mx-[0.5px] ${isWordActive
                        ? "text-[#52b788] scale-110 font-bold"
                        : "hover:text-(--accent)"
                        }`}
                      dangerouslySetInnerHTML={{ __html: cleanArabicText(word.text) }}
                    />
                  </TooltipTrigger>

                  <TooltipContent side="top">
                    <span className="text-sm">
                      {word.translation || "No translation"}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <span
              className="mx-2 inline-block translate-y-0.5 font-normal text-(--text-primary)"
              style={{
                fontFamily: ARABIC_FONTS[0]?.family ?? '"Amiri Quran", serif',
              }}
            >
              {toArabicNumerals(ayah.ayah_number)}
            </span>
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
              {ayah.translation?.translation_name ?? "Saheeh International"}
            </p>
            <p
              className="text-body leading-relaxed"
              style={{
                fontSize: `${fontSettings.translationFontSize}px`,
                color: "var(--text-primary)",
              }}
            >
              {translation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}