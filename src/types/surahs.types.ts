export interface SurahMeta {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}

export interface WordAudioSegment {
    wordIndex: string;
    startTime: number;
    endTime: number;
}

export interface QuranWord {
    id: number;
    ayah_id: number;
    position: number;
    text: string;
    text_indopak: string;
    translation: string;
    transliteration: string;
    char_type: 'word' | 'end';
    audio_url: string | null;
    created_at: string;
    audioSegment: WordAudioSegment | null;
}

export interface AyahTranslation {
    translation: string;
    translation_name: string;
}

export interface AyahAudio {
    id: number;
    ayah_id: number;
    audio_url: string;
    duration: number;
    reciter: string;
    created_at: string;
    segments: WordAudioSegment[];
}

export interface Ayah {
    id: number;
    surah_id: number;
    ayah_number: number;
    verse_key: string;

    text_uthmani: string;
    text_indopak: string;
    text_simple: string;

    page_number: number;
    juz_number: number;
    hizb_number: number;
    rub_number: number;

    sajdah_type: string | null;
    created_at: string;

    translation: AyahTranslation;

    audio: AyahAudio;

    words: QuranWord[];
}

export interface SurahAudioItem {
    ayah_number: number;
    audio_url: string;
    duration: number;
    reciter: string;
}

export interface SurahDetailResponse {
    success: boolean;
    data: {
        ayahs: Ayah[];
        audio: SurahAudioItem[];
    };
}

export interface TranslationItem {
    id: number;
    name: string;
    translation: string;
    languageId: number;
}

export interface WordByWord {
    wordId: number;
    arabic_text: string;
    translation: string;
    audio: string;
    uthmani: string;
}

export interface WordAudio {
    audio_url: string;
    duration: number;
    timestamp_from: number;
    timestamp_to: number;
    segments: {
        wordIndex: number;
        startTime: number;
        endTime: number;
    }[];
}

export interface AyahDetail {
    surahId: number;
    ayahId: number;
    page: number;
    wbws: WordByWord[];
    translations: TranslationItem[];
    audio: WordAudio;
}

export interface SurahAudio {
    reciterId: number;
    audio_url: string;
    duration: number;
    file_size: number;
}

export interface SurahListItem {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
}

export type Surah = SurahMeta;

export interface SearchResultItem {
    verseKey: string;
    textUthmani: string;
    translation: string;
    surahEnglishName: string;
    surahNumber: number;
    ayahId: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// OPTIMIZED DATA TYPES (for local JSON data loading)
// ══════════════════════════════════════════════════════════════════════════════

/** Audio segment timing for word-level synchronization */
export interface LocalAudioSegment {
    /** Word position (1-indexed) - can be string or number in JSON */
    wordIndex: number | string;
    /** Start time in milliseconds */
    startTime: number;
    /** End time in milliseconds */
    endTime: number;
}

/** Individual word data within an ayah */
export interface LocalWordData {
    /** Unique ID for this word (auto-generated if missing) */
    id?: string;
    /** Position of the word in the ayah (1-indexed) */
    position: number;
    /** Arabic text (Uthmani script) */
    text: string;
    /** Arabic text (IndoPak script variant) */
    textIndopak?: string;
    /** English translation of this word */
    translation: string;
    /** Transliteration (pronunciation guide) */
    transliteration: string;
    /** 'word' for actual words, 'end' for ayah number marker */
    charType: 'word' | 'end';
    /** Audio timing segment for word highlighting */
    audioSegment?: LocalAudioSegment;
}

/** Audio metadata for an ayah */
export interface LocalAyahAudio {
    /** URL to the audio file */
    url: string;
    /** Duration in seconds */
    duration: number;
    /** Raw segment data from API: [wordIndex, startMs, endMs][] */
    segments?: [string, string, string][];
}

/** Individual ayah (verse) data - optimized format */
export interface LocalAyahData {
    /** Unique ID for this ayah (auto-generated if missing) */
    id?: string;
    /** Ayah number within the surah (1-indexed) */
    ayahNumber: number;
    /** Verse key like "1:1", "2:255" */
    verseKey: string;
    /** Page number in the Mushaf */
    pageNumber: number;
    /** Juz number (1-30) */
    juzNumber: number;
    /** Hizb number */
    hizbNumber: number;
    /** Rub number */
    rubNumber: number;
    /** Whether this ayah has a sajdah (prostration) */
    sajdah: boolean | null;
    /** Full Arabic text of the ayah (for display/copy) */
    textUthmani?: string;
    /** English translation */
    translation: string;
    /** Name of the translation (e.g., "Saheeh International") */
    translationName: string;
    /** Audio data */
    audio: LocalAyahAudio;
    /** Word-by-word breakdown */
    words: LocalWordData[];
}

/** Complete surah data (full detail, loaded on-demand) */
export interface LocalSurahData {
    /** Surah number */
    surahNumber: number;
    /** Arabic name */
    name: string;
    /** English name */
    englishName: string;
    /** English translation of name */
    englishTranslation: string;
    /** Revelation type */
    revelationType: 'Meccan' | 'Medinan';
    /** Total ayahs */
    totalAyahs: number;
    /** Whether bismillah appears before (false for Al-Fatiha & At-Tawbah) */
    bismillahPre: boolean;
    /** All ayahs with full word data */
    ayahs: LocalAyahData[];
}

/** Cached surah entry */
export interface LocalCachedSurah {
    data: LocalSurahData;
    loadedAt: number;
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ══════════════════════════════════════════════════════════════════════════════
 */

/** Convert Western numerals to Arabic/Eastern numerals */
export function toArabicNumerals(n: number): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n)
        .split('')
        .map((d) => arabicDigits[parseInt(d)] || d)
        .join('');
}

/** Parse raw segment array into typed LocalAudioSegment */
export function parseAudioSegments(
    segments: [string, string, string][] | undefined
): Map<number, LocalAudioSegment> {
    const map = new Map<number, LocalAudioSegment>();
    if (!segments) return map;

    for (const [wordIdx, startMs, endMs] of segments) {
        const wordIndex = parseInt(wordIdx);
        map.set(wordIndex, {
            wordIndex,
            startTime: parseInt(startMs),
            endTime: parseInt(endMs),
        });
    }
    return map;
}

/** Get estimated height for an ayah card (for virtualization) */
export function estimateAyahHeight(ayah: LocalAyahData, arabicFontSize: number): number {
    const wordCount = ayah.words.filter((w) => w.charType === 'word').length;
    const translationLength = ayah.translation.length;

    // Base heights
    const headerHeight = 40; // verse key + buttons
    const arabicLineHeight = arabicFontSize * 2.8;
    const translationLineHeight = 24;
    const padding = 40;

    // Estimate lines needed
    const arabicLines = Math.ceil(wordCount / 8); // ~8 words per line
    const translationLines = Math.ceil(translationLength / 80); // ~80 chars per line

    return (
        headerHeight +
        arabicLines * arabicLineHeight +
        translationLines * translationLineHeight +
        padding
    );
}