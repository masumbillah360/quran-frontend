import { SurahData, CachedSurah } from '@/types/surahs.types';
import { fetchSurah } from './quranApi';

const CACHE_TTL = 30 * 60 * 1000;
const MAX_CACHED_SURAHS = 5;

const surahCache = new Map<number, CachedSurah>();
const loadingPromises = new Map<number, Promise<SurahData>>();

export async function loadSurah(surahNumber: number): Promise<SurahData> {
    if (surahNumber < 1 || surahNumber > 114) {
        throw new Error(`Invalid surah number: ${surahNumber}`);
    }

    const cached = surahCache.get(surahNumber);
    if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
        return cached.data;
    }

    const existingPromise = loadingPromises.get(surahNumber);
    if (existingPromise) {
        return existingPromise;
    }

    const loadPromise = fetchSurah(surahNumber);
    loadingPromises.set(surahNumber, loadPromise);

    try {
        const data = await loadPromise;

        if (surahCache.size >= MAX_CACHED_SURAHS) {
            const oldestKey = surahCache.keys().next().value;
            if (oldestKey !== undefined) {
                surahCache.delete(oldestKey);
            }
        }

        surahCache.set(surahNumber, {
            data,
            loadedAt: Date.now(),
        });

        return data;
    } finally {
        loadingPromises.delete(surahNumber);
    }
}

export function preloadAdjacentSurahs(currentSurah: number): void {
    if (currentSurah > 1) {
        loadSurah(currentSurah - 1).catch(() => {});
    }
    if (currentSurah < 114) {
        loadSurah(currentSurah + 1).catch(() => {});
    }
}

export function clearCache(): void {
    surahCache.clear();
}

export function isSurahCached(surahNumber: number): boolean {
    const cached = surahCache.get(surahNumber);
    return cached !== undefined && Date.now() - cached.loadedAt < CACHE_TTL;
}
