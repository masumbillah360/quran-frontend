import {
    AyahDetail,
    SearchResultItem,
    Surah,
    SurahAudio,
    SurahDetailResponse,
} from '@/types';
const API_BASE = 'http://localhost:3000';
interface ApiResponse<T> {
    success: boolean;
    data: T;
}
export async function fetchSurahsList(q?: string): Promise<Surah[]> {
    const url = q
        ? `${API_BASE}/api/surahs?q=${encodeURIComponent(q)}`
        : `${API_BASE}/api/surahs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch surahs list');
    const json: ApiResponse<Surah[]> = await res.json();
    return json.data;
}
export async function fetchSurah(surahNumber: number): Promise<{
    ayahs: AyahDetail[];
    audio: SurahAudio;
}> {
    const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const json: ApiResponse<{ ayahs: any[]; audio: SurahAudio }> = await res.json();

    const ayahs: AyahDetail[] = json.data.ayahs.map((a: any) => ({
        surahId: a.surah_id,
        ayahId: a.ayah_number,
        page: a.page_number,
        wbws: (a.words ?? [])
            .filter((w: any) => w.char_type === 'word')
            .map((w: any, idx: number) => ({
                wordId: idx + 1,
                arabic_text: w.text,
                translation: w.translation ?? '',
                audio: w.audio_url ?? '',
                uthmani: w.text ?? '',
            })),
        translations: a.translation
            ? [{ id: 0, name: a.translation.translation_name ?? '', translation: a.translation.translation ?? '', languageId: 1 }]
            : [],
        audio: a.audio
            ? {
                timestamp_from: 0,
                timestamp_to: (a.audio.duration ?? 0) * 1000,
                segments: a.audio.segments.map((s: any) => ({
                    wordIndex: parseInt(s.word_index, 10),
                    startTime: s.start_time,
                    endTime: s.end_time,
                })),
                audio_url: a.audio.audio_url,
                duration: a.audio.duration ?? 0,
            }
            : { timestamp_from: 0, timestamp_to: 0, segments: [], audio_url: '', duration: 0 },
    }));

    return { ayahs, audio: json.data.audio };
}
export async function searchQuran(query: string): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];
    try {
        const res = await fetch(
            `${API_BASE}/api/search?q=${encodeURIComponent(query)}&lang=en`,
        );
        if (!res.ok) throw new Error('Search failed');
        const json: ApiResponse<SearchResultItem[]> = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}
export async function fetchSurahStatic(surahNumber: number): Promise<{
    ayahs: AyahDetail[];
    audio: SurahAudio;
}> {
    const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`, {
        next: { revalidate: false },
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const json: ApiResponse<{ ayahs: any[]; audio: SurahAudio }> =
        await res.json();

    const ayahs: AyahDetail[] = json.data.ayahs.map((a: any) => ({
        surahId: a.surah_id,
        ayahId: a.ayah_number,
        page: a.page_number,
        wbws: (a.words ?? [])
            .filter((w: any) => w.char_type === 'word')
            .map((w: any, idx: number) => ({
                wordId: idx + 1,
                arabic_text: w.text,
                translation: w.translation ?? '',
                audio: w.audio_url ?? '',
                uthmani: w.text ?? '',
            })),
        translations: a.translation
            ? [{ id: 0, name: a.translation.translation_name ?? '', translation: a.translation.translation ?? '', languageId: 1 }]
            : [],
        audio: a.audio
            ? {
                timestamp_from: 0,
                timestamp_to: (a.audio.duration ?? 0) * 1000,
                segments: a.audio.segments.map((s: any) => ({
                    wordIndex: parseInt(s.word_index, 10),
                    startTime: s.start_time,
                    endTime: s.end_time,
                })),
                audio_url: a.audio.audio_url,
                duration: a.audio.duration ?? 0,
            }
            : { timestamp_from: 0, timestamp_to: 0, segments: [], audio_url: '', duration: 0 },
    }));

    return { ayahs, audio: json.data.audio };
}
export async function fetchSurahsListStatic(): Promise<Surah[]> {
    const res = await fetch(`${API_BASE}/api/surahs`, {
        next: { revalidate: false },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch surahs list');
    }
    const json: ApiResponse<Surah[]> = await res.json();
    return json.data;
}
