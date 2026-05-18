export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}

export interface WbwWord {
    wordId: number;
    arabic_text: string;
    translation: string;
    audio: string;
    uthmani: string;
}

export interface AyahTranslation {
    id: number;
    name: string;
    translation: string;
    languageId: number;
}

export interface AyahAudioTiming {
    timestamp_from: number;
    timestamp_to: number;
    segments: Array<{ wordIndex: number; startTime: number; endTime: number }>;
    audio_url: string;
    duration: number;
}

export interface AyahDetail {
    surahId: number;
    ayahId: number;
    page: number;
    wbws: WbwWord[];
    translations: AyahTranslation[];
    audio: AyahAudioTiming;
}

export interface SurahAudio {
    reciterId: number;
    audio_url: string;
    duration: number;
    file_size: number;
}

export interface SurahDetailResponse {
    meta: Surah;
    ayahs: AyahDetail[];
    audio: SurahAudio;
}

export interface SearchResultItem {
    surahNumber: number;
    ayahId: number;
    text: string;
    translation: string;
    surahName: string;
    surahEnglishName: string;
}
