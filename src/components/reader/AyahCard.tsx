"use client";

import { AyahDetail } from "@/types";
import { Play, Pause, BookOpen, MoreHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";
import { ARABIC_FONTS } from "@/constants/fonts";
import { useApp } from "@/context/AppContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cleanArabicText, toArabicNumerals } from "@/utils";


interface AyahCardProps {
  ayah: AyahDetail;
  surahNumber: number;
}

export default function AyahCard({ ayah, surahNumber }: AyahCardProps) {
  const { audioState, playAyah, pauseAudio, resumeAudio, fontSettings } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const isThisAyah =
    audioState.currentSurah === surahNumber &&
    audioState.currentAyah === ayah.ayahId;

  const isPlaying = isThisAyah && audioState.isPlaying;
  const activeWord = isThisAyah ? audioState.currentWord : null;

  const arabicFont = ARABIC_FONTS.find((f) => f.id === fontSettings.arabicFont);
  const arabicFamily = arabicFont?.family ?? '"Amiri Quran", serif';
  const translation = ayah.translations[0]?.translation ?? "";

  useEffect(() => {
    if (isThisAyah && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isThisAyah]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else if (isThisAyah) {
      resumeAudio();
    } else {
      playAyah(surahNumber, ayah);
    }
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
            {surahNumber}:{ayah.ayahId}
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
            {ayah.wbws.map((word) => {
              const isWordActive = activeWord === word.wordId;

              return (
                <Tooltip key={word.wordId}>
                  <TooltipTrigger asChild>
                    <span
                      className={`inline-block cursor-pointer transition-all duration-150 mx-[0.5px] ${isWordActive
                        ? "text-[#52b788] scale-110 font-bold"
                        : "hover:text-(--accent)"
                        }`}
                      dangerouslySetInnerHTML={{ __html: cleanArabicText(word.arabic_text) }}
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
              {toArabicNumerals(ayah.ayahId)}
            </span>
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
              {ayah.translations[0]?.name ?? "Saheeh International"}
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
