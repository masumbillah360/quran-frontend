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