import { SurahMeta, SurahData, SearchResult } from '@/types';

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
    const json: ApiResponse<SurahMeta[]> = await res.json();
    return json.data;
}

export async function fetchSurah(surahNumber: number): Promise<SurahData> {
    const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch surah ${surahNumber}`);
    }
    const json: ApiResponse<SurahData> = await res.json();
    return json.data;
}

export async function searchQuran(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    try {
        const res = await fetch(
            `${API_BASE}/api/search?q=${encodeURIComponent(query)}&lang=en`,
        );
        if (!res.ok) throw new Error('Search failed');
        const json: ApiResponse<SearchResult[]> = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}
