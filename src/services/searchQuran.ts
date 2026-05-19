import { searchQuran } from './quranApi';

export interface SearchResult {
    type: 'surah' | 'ayah';
    surahNumber: number;
    surahEnglishName: string;
    surahArabicName: string;
    ayahNumber?: number;
    verseKey?: string;
    arabicText?: string;
    translation?: string;
    matchType: 'name' | 'translation' | 'arabic' | 'english';
}

export async function searchQuranLocal(query: string, maxResults = 50): Promise<SearchResult[]> {
    const results = await searchQuran(query);
    return results.slice(0, maxResults) as SearchResult[];
}
