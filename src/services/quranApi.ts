import {
    Ayah,
    SurahAudioItem,
    SurahListItem,
    SurahMeta,
    SearchResultItem,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export async function fetchSurahsList(q?: string): Promise<SurahMeta[]> {
    const url = q
        ? `${API_BASE}/api/surahs?q=${encodeURIComponent(q)}`
        : `${API_BASE}/api/surahs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch surahs list');
    const json: ApiResponse<SurahListItem[]> = await res.json();
    return json.data.map((s) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType,
    }));
}

export async function fetchSurah(surahNumber: number): Promise<{
    ayahs: Ayah[];
    audio: SurahAudioItem[];
}> {
    const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const json: ApiResponse<{ ayahs: Ayah[]; audio: SurahAudioItem[] }> =
        await res.json();
    return json.data;
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