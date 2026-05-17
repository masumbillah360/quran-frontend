"use client";
import { ARABIC_FONTS } from "@/constants/fonts";
import { FontSettings } from "@/types/fonts.types";


interface PreviewSectionProps {
  arabicFont: FontSettings["arabicFont"];
  arabicFontSize: number;
  translationFontSize: number;
}

export function PreviewSection({
  arabicFont,
  arabicFontSize,
  translationFontSize,
}: PreviewSectionProps) {
  const currentFont = ARABIC_FONTS.find((f) => f.id === arabicFont);
  const fontFamily = currentFont?.family ?? '"Amiri Quran", serif';

  return (
    <div className="rounded-xl bg-(--bg-surface) border border-(--border-subtle) overflow-hidden">
      <div className="px-3 py-2 border-b border-(--border-default) flex items-center justify-between">
        <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
          Preview
        </span>
        <span className="text-[10px] text-(--text-muted)">{currentFont?.name}</span>
      </div>
      <div className="p-3">
        <p
          className="text-right text-[#000203] leading-loose mb-2"
          style={{
            fontFamily,
            fontSize: `${Math.min(arabicFontSize, 26)}px`,
            direction: "rtl",
          }}
          lang="ar"
          dir="rtl"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p
          className="text-(--text-quaternary) leading-relaxed"
          style={{ fontSize: `${translationFontSize}px` }}
        >
          In the name of Allah, the Entirely Merciful, the Especially Merciful.
        </p>
      </div>
    </div>
  );
}
