"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Settings,
  Sun,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SliderControl } from "./SliderControl";
import { PreviewSection } from "./PreviewSection";
import FontPicker from "../ui/font-picker";
import { ThemePicker } from "./ThemePicker";

/* ── Main RightPanel component ── */
export default function RightPanel() {
  const {
    isRightPanelOpen,
    viewMode,
    setViewMode,
    fontSettings,
    updateFontSettings,
    isFontSettingsExpanded,
    setIsFontSettingsExpanded,
    theme,
    setTheme,
  } = useApp();

  const [readingOpen, setReadingOpen] = useState(false);

  if (!isRightPanelOpen) return null;

  return (
    <aside className="hidden 2xl:flex flex-col w-72 xl:w-80 shrink-0 bg-(--bg-canvas) border-l border-(--border-default) overflow-y-auto">
      {/* ── View mode toggle ── */}
      <div className="p-4 border-b border-(--border-default)">
        <div className="flex bg-(--bg-surface) rounded-xl p-1 gap-1 border border-(--border-subtle)">
          {(["translation", "reading"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${viewMode === mode
                ? "bg-(--bg-elevated) text-(--text-primary) border border-(--border-accent) shadow-sm"
                : "text-(--text-quaternary) hover:text-(--text-secondary)"
                }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reading Settings ── */}
      <div className="border-b border-(--border-default)">
        <button
          onClick={() => setReadingOpen(!readingOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-(--bg-surface) transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen
              size={15}
              className="text-(--text-quaternary) group-hover:text-(--text-tertiary) transition-colors"
            />
            <span className="text-sm font-medium text-(--text-secondary)">
              Reading Settings
            </span>
          </div>
          {readingOpen ? (
            <ChevronUp size={13} className="text-(--text-quaternary)" />
          ) : (
            <ChevronDown size={13} className="text-(--text-quaternary)" />
          )}
        </button>

        {readingOpen && (
          <div className="px-4 pb-4 space-y-2">
            {[
              { label: "Show Transliteration", id: "transliteration" },
              { label: "Show Word Meaning", id: "word-meaning" },
              { label: "Highlight Active Verse", id: "highlight" },
              { label: "Auto-scroll with Audio", id: "auto-scroll" },
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-center justify-between py-2 cursor-pointer group"
              >
                <span className="text-sm text-(--text-tertiary) group-hover:text-(--text-secondary) transition-colors">
                  {opt.label}
                </span>
                <div className="relative w-8 h-4 rounded-full bg-(--bg-elevated) border border-(--border-accent) transition-all">
                  <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-[#4a5568] transition-all" />
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Theme Settings ── */}
      <div className="border-b border-(--border-default)">
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5 mb-3">
            <Sun size={15} className="text-(--text-accent)" />
            <span className="text-sm font-bold text-(--text-accent)">
              Theme
            </span>
          </div>
          <ThemePicker theme={theme} onChange={setTheme} />
        </div>
      </div>

      {/* ── Font Settings ── */}
      <div className="border-b border-(--border-default)">
        <button
          onClick={() => setIsFontSettingsExpanded(!isFontSettingsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-(--bg-active)/10 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-(--bg-accent)/30 flex items-center justify-center">
              <Settings size={11} className="text-(--text-accent)" />
            </div>
            <span className="text-sm font-bold text-(--text-accent)">
              Font Settings
            </span>
          </div>
          {isFontSettingsExpanded ? (
            <ChevronUp size={13} className="text-(--text-accent)" />
          ) : (
            <ChevronDown size={13} className="text-(--text-accent)" />
          )}
        </button>

        {isFontSettingsExpanded && (
          <div className="px-4 pb-5 space-y-5">
            <SliderControl
              label="Arabic Font Size"
              value={fontSettings.arabicFontSize}
              min={18}
              max={100}
              onChange={(v) => updateFontSettings({ arabicFontSize: v })}
            />

            <SliderControl
              label="Translation Font Size"
              value={fontSettings.translationFontSize}
              min={14}
              max={100}
              onChange={(v) => updateFontSettings({ translationFontSize: v })}
            />

            <div className="space-y-2">
              <span className="text-sm text-(--text-secondary)">
                Arabic Font Face
              </span>
              <FontPicker />
            </div>

            <PreviewSection
              arabicFont={fontSettings.arabicFont}
              arabicFontSize={fontSettings.arabicFontSize}
              translationFontSize={fontSettings.translationFontSize}
            />
          </div>
        )}
      </div>

      {/* ── Quran stats ── */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Surahs", value: "114" },
          { label: "Ayahs", value: "6,236" },
          { label: "Pages", value: "604" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-(--bg-surface) border border-(--border-subtle) rounded-xl p-2.5 text-center"
          >
            <div className="text-base font-bold text-(--text-accent)">
              {stat.value}
            </div>
            <div className="text-[10px] text-(--text-muted) mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
