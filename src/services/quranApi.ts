import { Surah } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

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
