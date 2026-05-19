/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SURAH LOADER SERVICE
 * ══════════════════════════════════════════════════════════════════════════════
 * Handles lazy loading, caching, and management of surah JSON data.
 * Optimized for performance with large surahs.
 * Uses local JSON data files from src/data/ instead of API calls.
 */

import { SurahData, CachedSurah } from '@/types/surahs.types';

// ── Cache Configuration ──────────────────────────────────────────────────────
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHED_SURAHS = 5; // Keep max 5 surahs in memory

// ── In-Memory Cache ──────────────────────────────────────────────────────────
const surahCache = new Map<number, CachedSurah>();
const loadingPromises = new Map<number, Promise<SurahData>>();

// ── Dynamic import map for all 114 surahs ────────────────────────────────────
const surahModules: Record<number, () => Promise<SurahData>> = {
    1: () =>
        import('@/data/001_Al_Faatiha.json').then((m) =>
            normalizeSurahData(m.default, 1),
        ),
    2: () =>
        import('@/data/002_Al_Baqara.json').then((m) =>
            normalizeSurahData(m.default, 2),
        ),
    3: () =>
        import('@/data/003_Aal_i_Imraan.json').then((m) =>
            normalizeSurahData(m.default, 3),
        ),
    4: () =>
        import('@/data/004_An_Nisaa.json').then((m) =>
            normalizeSurahData(m.default, 4),
        ),
    5: () =>
        import('@/data/005_Al_Maaida.json').then((m) =>
            normalizeSurahData(m.default, 5),
        ),
    6: () =>
        import('@/data/006_Al_An_aam.json').then((m) =>
            normalizeSurahData(m.default, 6),
        ),
    7: () =>
        import('@/data/007_Al_A_raaf.json').then((m) =>
            normalizeSurahData(m.default, 7),
        ),
    8: () =>
        import('@/data/008_Al_Anfaal.json').then((m) =>
            normalizeSurahData(m.default, 8),
        ),
    9: () =>
        import('@/data/009_At_Tawba.json').then((m) =>
            normalizeSurahData(m.default, 9),
        ),
    10: () =>
        import('@/data/010_Yunus.json').then((m) =>
            normalizeSurahData(m.default, 10),
        ),
    11: () =>
        import('@/data/011_Hud.json').then((m) =>
            normalizeSurahData(m.default, 11),
        ),
    12: () =>
        import('@/data/012_Yusuf.json').then((m) =>
            normalizeSurahData(m.default, 12),
        ),
    13: () =>
        import('@/data/013_Ar_Ra_d.json').then((m) =>
            normalizeSurahData(m.default, 13),
        ),
    14: () =>
        import('@/data/014_Ibrahim.json').then((m) =>
            normalizeSurahData(m.default, 14),
        ),
    15: () =>
        import('@/data/015_Al_Hijr.json').then((m) =>
            normalizeSurahData(m.default, 15),
        ),
    16: () =>
        import('@/data/016_An_Nahl.json').then((m) =>
            normalizeSurahData(m.default, 16),
        ),
    17: () =>
        import('@/data/017_Al_Israa.json').then((m) =>
            normalizeSurahData(m.default, 17),
        ),
    18: () =>
        import('@/data/018_Al_Kahf.json').then((m) =>
            normalizeSurahData(m.default, 18),
        ),
    19: () =>
        import('@/data/019_Maryam.json').then((m) =>
            normalizeSurahData(m.default, 19),
        ),
    20: () =>
        import('@/data/020_Taa_Haa.json').then((m) =>
            normalizeSurahData(m.default, 20),
        ),
    21: () =>
        import('@/data/021_Al_Anbiyaa.json').then((m) =>
            normalizeSurahData(m.default, 21),
        ),
    22: () =>
        import('@/data/022_Al_Hajj.json').then((m) =>
            normalizeSurahData(m.default, 22),
        ),
    23: () =>
        import('@/data/023_Al_Muminoon.json').then((m) =>
            normalizeSurahData(m.default, 23),
        ),
    24: () =>
        import('@/data/024_An_Noor.json').then((m) =>
            normalizeSurahData(m.default, 24),
        ),
    25: () =>
        import('@/data/025_Al_Furqaan.json').then((m) =>
            normalizeSurahData(m.default, 25),
        ),
    26: () =>
        import('@/data/026_Ash_Shu_araa.json').then((m) =>
            normalizeSurahData(m.default, 26),
        ),
    27: () =>
        import('@/data/027_An_Naml.json').then((m) =>
            normalizeSurahData(m.default, 27),
        ),
    28: () =>
        import('@/data/028_Al_Qasas.json').then((m) =>
            normalizeSurahData(m.default, 28),
        ),
    29: () =>
        import('@/data/029_Al_Ankaboot.json').then((m) =>
            normalizeSurahData(m.default, 29),
        ),
    30: () =>
        import('@/data/030_Ar_Room.json').then((m) =>
            normalizeSurahData(m.default, 30),
        ),
    31: () =>
        import('@/data/031_Luqman.json').then((m) =>
            normalizeSurahData(m.default, 31),
        ),
    32: () =>
        import('@/data/032_As_Sajda.json').then((m) =>
            normalizeSurahData(m.default, 32),
        ),
    33: () =>
        import('@/data/033_Al_Ahzaab.json').then((m) =>
            normalizeSurahData(m.default, 33),
        ),
    34: () =>
        import('@/data/034_Saba.json').then((m) =>
            normalizeSurahData(m.default, 34),
        ),
    35: () =>
        import('@/data/035_Faatir.json').then((m) =>
            normalizeSurahData(m.default, 35),
        ),
    36: () =>
        import('@/data/036_Yaseen.json').then((m) =>
            normalizeSurahData(m.default, 36),
        ),
    37: () =>
        import('@/data/037_As_Saaffaat.json').then((m) =>
            normalizeSurahData(m.default, 37),
        ),
    38: () =>
        import('@/data/038_Saad.json').then((m) =>
            normalizeSurahData(m.default, 38),
        ),
    39: () =>
        import('@/data/039_Az_Zumar.json').then((m) =>
            normalizeSurahData(m.default, 39),
        ),
    40: () =>
        import('@/data/040_Ghafir.json').then((m) =>
            normalizeSurahData(m.default, 40),
        ),
    41: () =>
        import('@/data/041_Fussilat.json').then((m) =>
            normalizeSurahData(m.default, 41),
        ),
    42: () =>
        import('@/data/042_Ash_Shura.json').then((m) =>
            normalizeSurahData(m.default, 42),
        ),
    43: () =>
        import('@/data/043_Az_Zukhruf.json').then((m) =>
            normalizeSurahData(m.default, 43),
        ),
    44: () =>
        import('@/data/044_Ad_Dukhaan.json').then((m) =>
            normalizeSurahData(m.default, 44),
        ),
    45: () =>
        import('@/data/045_Al_Jaathiya.json').then((m) =>
            normalizeSurahData(m.default, 45),
        ),
    46: () =>
        import('@/data/046_Al_Ahqaf.json').then((m) =>
            normalizeSurahData(m.default, 46),
        ),
    47: () =>
        import('@/data/047_Muhammad.json').then((m) =>
            normalizeSurahData(m.default, 47),
        ),
    48: () =>
        import('@/data/048_Al_Fath.json').then((m) =>
            normalizeSurahData(m.default, 48),
        ),
    49: () =>
        import('@/data/049_Al_Hujuraat.json').then((m) =>
            normalizeSurahData(m.default, 49),
        ),
    50: () =>
        import('@/data/050_Qaaf.json').then((m) =>
            normalizeSurahData(m.default, 50),
        ),
    51: () =>
        import('@/data/051_Adh_Dhaariyat.json').then((m) =>
            normalizeSurahData(m.default, 51),
        ),
    52: () =>
        import('@/data/052_At_Tur.json').then((m) =>
            normalizeSurahData(m.default, 52),
        ),
    53: () =>
        import('@/data/053_An_Najm.json').then((m) =>
            normalizeSurahData(m.default, 53),
        ),
    54: () =>
        import('@/data/054_Al_Qamar.json').then((m) =>
            normalizeSurahData(m.default, 54),
        ),
    55: () =>
        import('@/data/055_Ar_Rahmaan.json').then((m) =>
            normalizeSurahData(m.default, 55),
        ),
    56: () =>
        import('@/data/056_Al_Waaqia.json').then((m) =>
            normalizeSurahData(m.default, 56),
        ),
    57: () =>
        import('@/data/057_Al_Hadid.json').then((m) =>
            normalizeSurahData(m.default, 57),
        ),
    58: () =>
        import('@/data/058_Al_Mujaadila.json').then((m) =>
            normalizeSurahData(m.default, 58),
        ),
    59: () =>
        import('@/data/059_Al_Hashr.json').then((m) =>
            normalizeSurahData(m.default, 59),
        ),
    60: () =>
        import('@/data/060_Al_Mumtahana.json').then((m) =>
            normalizeSurahData(m.default, 60),
        ),
    61: () =>
        import('@/data/061_As_Saff.json').then((m) =>
            normalizeSurahData(m.default, 61),
        ),
    62: () =>
        import('@/data/062_Al_Jumu_a.json').then((m) =>
            normalizeSurahData(m.default, 62),
        ),
    63: () =>
        import('@/data/063_Al_Munaafiqoon.json').then((m) =>
            normalizeSurahData(m.default, 63),
        ),
    64: () =>
        import('@/data/064_At_Taghaabun.json').then((m) =>
            normalizeSurahData(m.default, 64),
        ),
    65: () =>
        import('@/data/065_At_Talaaq.json').then((m) =>
            normalizeSurahData(m.default, 65),
        ),
    66: () =>
        import('@/data/066_At_Tahrim.json').then((m) =>
            normalizeSurahData(m.default, 66),
        ),
    67: () =>
        import('@/data/067_Al_Mulk.json').then((m) =>
            normalizeSurahData(m.default, 67),
        ),
    68: () =>
        import('@/data/068_Al_Qalam.json').then((m) =>
            normalizeSurahData(m.default, 68),
        ),
    69: () =>
        import('@/data/069_Al_Haaqqa.json').then((m) =>
            normalizeSurahData(m.default, 69),
        ),
    70: () =>
        import('@/data/070_Al_Ma_aarij.json').then((m) =>
            normalizeSurahData(m.default, 70),
        ),
    71: () =>
        import('@/data/071_Nooh.json').then((m) =>
            normalizeSurahData(m.default, 71),
        ),
    72: () =>
        import('@/data/072_Al_Jinn.json').then((m) =>
            normalizeSurahData(m.default, 72),
        ),
    73: () =>
        import('@/data/073_Al_Muzzammil.json').then((m) =>
            normalizeSurahData(m.default, 73),
        ),
    74: () =>
        import('@/data/074_Al_Muddaththir.json').then((m) =>
            normalizeSurahData(m.default, 74),
        ),
    75: () =>
        import('@/data/075_Al_Qiyaama.json').then((m) =>
            normalizeSurahData(m.default, 75),
        ),
    76: () =>
        import('@/data/076_Al_Insaan.json').then((m) =>
            normalizeSurahData(m.default, 76),
        ),
    77: () =>
        import('@/data/077_Al_Mursalaat.json').then((m) =>
            normalizeSurahData(m.default, 77),
        ),
    78: () =>
        import('@/data/078_An_Naba.json').then((m) =>
            normalizeSurahData(m.default, 78),
        ),
    79: () =>
        import('@/data/079_An_Naazi_aat.json').then((m) =>
            normalizeSurahData(m.default, 79),
        ),
    80: () =>
        import('@/data/080_Abasa.json').then((m) =>
            normalizeSurahData(m.default, 80),
        ),
    81: () =>
        import('@/data/081_At_Takwir.json').then((m) =>
            normalizeSurahData(m.default, 81),
        ),
    82: () =>
        import('@/data/082_Al_Infitaar.json').then((m) =>
            normalizeSurahData(m.default, 82),
        ),
    83: () =>
        import('@/data/083_Al_Mutaffifin.json').then((m) =>
            normalizeSurahData(m.default, 83),
        ),
    84: () =>
        import('@/data/084_Al_Inshiqaaq.json').then((m) =>
            normalizeSurahData(m.default, 84),
        ),
    85: () =>
        import('@/data/085_Al_Burooj.json').then((m) =>
            normalizeSurahData(m.default, 85),
        ),
    86: () =>
        import('@/data/086_At_Taariq.json').then((m) =>
            normalizeSurahData(m.default, 86),
        ),
    87: () =>
        import('@/data/087_Al_A_laa.json').then((m) =>
            normalizeSurahData(m.default, 87),
        ),
    88: () =>
        import('@/data/088_Al_Ghaashiya.json').then((m) =>
            normalizeSurahData(m.default, 88),
        ),
    89: () =>
        import('@/data/089_Al_Fajr.json').then((m) =>
            normalizeSurahData(m.default, 89),
        ),
    90: () =>
        import('@/data/090_Al_Balad.json').then((m) =>
            normalizeSurahData(m.default, 90),
        ),
    91: () =>
        import('@/data/091_Ash_Shams.json').then((m) =>
            normalizeSurahData(m.default, 91),
        ),
    92: () =>
        import('@/data/092_Al_Lail.json').then((m) =>
            normalizeSurahData(m.default, 92),
        ),
    93: () =>
        import('@/data/093_Ad_Dhuhaa.json').then((m) =>
            normalizeSurahData(m.default, 93),
        ),
    94: () =>
        import('@/data/094_Ash_Sharh.json').then((m) =>
            normalizeSurahData(m.default, 94),
        ),
    95: () =>
        import('@/data/095_At_Tin.json').then((m) =>
            normalizeSurahData(m.default, 95),
        ),
    96: () =>
        import('@/data/096_Al_Alaq.json').then((m) =>
            normalizeSurahData(m.default, 96),
        ),
    97: () =>
        import('@/data/097_Al_Qadr.json').then((m) =>
            normalizeSurahData(m.default, 97),
        ),
    98: () =>
        import('@/data/098_Al_Bayyina.json').then((m) =>
            normalizeSurahData(m.default, 98),
        ),
    99: () =>
        import('@/data/099_Az_Zalzala.json').then((m) =>
            normalizeSurahData(m.default, 99),
        ),
    100: () =>
        import('@/data/100_Al_Aadiyaat.json').then((m) =>
            normalizeSurahData(m.default, 100),
        ),
    101: () =>
        import('@/data/101_Al_Qaari_a.json').then((m) =>
            normalizeSurahData(m.default, 101),
        ),
    102: () =>
        import('@/data/102_At_Takaathur.json').then((m) =>
            normalizeSurahData(m.default, 102),
        ),
    103: () =>
        import('@/data/103_Al_Asr.json').then((m) =>
            normalizeSurahData(m.default, 103),
        ),
    104: () =>
        import('@/data/104_Al_Humaza.json').then((m) =>
            normalizeSurahData(m.default, 104),
        ),
    105: () =>
        import('@/data/105_Al_Fil.json').then((m) =>
            normalizeSurahData(m.default, 105),
        ),
    106: () =>
        import('@/data/106_Quraish.json').then((m) =>
            normalizeSurahData(m.default, 106),
        ),
    107: () =>
        import('@/data/107_Al_Maa_un.json').then((m) =>
            normalizeSurahData(m.default, 107),
        ),
    108: () =>
        import('@/data/108_Al_Kawthar.json').then((m) =>
            normalizeSurahData(m.default, 108),
        ),
    109: () =>
        import('@/data/109_Al_Kaafiroon.json').then((m) =>
            normalizeSurahData(m.default, 109),
        ),
    110: () =>
        import('@/data/110_An_Nasr.json').then((m) =>
            normalizeSurahData(m.default, 110),
        ),
    111: () =>
        import('@/data/111_Al_Masad.json').then((m) =>
            normalizeSurahData(m.default, 111),
        ),
    112: () =>
        import('@/data/112_Al_Ikhlaas.json').then((m) =>
            normalizeSurahData(m.default, 112),
        ),
    113: () =>
        import('@/data/113_Al_Falaq.json').then((m) =>
            normalizeSurahData(m.default, 113),
        ),
    114: () =>
        import('@/data/114_An_Naas.json').then((m) =>
            normalizeSurahData(m.default, 114),
        ),
};

/**
 * Normalize raw JSON data to match our SurahData interface.
 * Adds missing `id` fields and ensures consistent structure.
 */
function normalizeSurahData(raw: any, surahNumber: number): SurahData {
    return {
        surahNumber: raw.surahNumber ?? surahNumber,
        name: raw.name ?? '',
        englishName: raw.englishName ?? '',
        englishTranslation:
            raw.englishTranslation ?? raw.englishNameTranslation ?? '',
        revelationType: raw.revelationType ?? 'Meccan',
        totalAyahs: raw.totalAyahs ?? raw.ayahs?.length ?? 0,
        bismillahPre:
            raw.bismillahPre ?? (surahNumber !== 1 && surahNumber !== 9),
        ayahs: (raw.ayahs ?? []).map((ayah: any, idx: number) => ({
            id: ayah.id ?? `${surahNumber}:${ayah.ayahNumber ?? idx + 1}`,
            ayahNumber: ayah.ayahNumber ?? idx + 1,
            verseKey: ayah.verseKey ?? `${surahNumber}:${idx + 1}`,
            pageNumber: ayah.pageNumber ?? 1,
            juzNumber: ayah.juzNumber ?? 1,
            hizbNumber: ayah.hizbNumber ?? 1,
            rubNumber: ayah.rubNumber ?? 1,
            sajdah: ayah.sajdah ?? null,
            translation: ayah.translation ?? '',
            translationName: ayah.translationName ?? 'Saheeh International',
            audio: {
                url: ayah.audio?.url ?? '',
                duration: ayah.audio?.duration ?? 0,
                segments: ayah.audio?.segments ?? undefined,
            },
            words: (ayah.words ?? []).map((word: any, wIdx: number) => ({
                id:
                    word.id ??
                    `${surahNumber}:${ayah.ayahNumber ?? idx + 1}:${word.position ?? wIdx + 1}`,
                position: word.position ?? wIdx + 1,
                text: word.text ?? '',
                textIndopak: word.textIndopak,
                translation: word.translation ?? '',
                transliteration: word.transliteration ?? '',
                charType: word.charType ?? 'word',
                audioSegment: word.audioSegment
                    ? {
                          wordIndex: parseInt(
                              String(word.audioSegment.wordIndex),
                          ),
                          startTime: word.audioSegment.startTime,
                          endTime: word.audioSegment.endTime,
                      }
                    : undefined,
            })),
        })),
    };
}

/**
 * Load a surah by number. Returns cached data if available.
 */
export async function loadSurah(surahNumber: number): Promise<SurahData> {
    // Validate range
    if (surahNumber < 1 || surahNumber > 114) {
        throw new Error(`Invalid surah number: ${surahNumber}`);
    }

    // Check cache first
    const cached = surahCache.get(surahNumber);
    if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
        return cached.data;
    }

    // Check if already loading (dedupe concurrent requests)
    const existingPromise = loadingPromises.get(surahNumber);
    if (existingPromise) {
        return existingPromise;
    }

    // Get the dynamic import function for this surah
    const importFn = surahModules[surahNumber];
    if (!importFn) {
        throw new Error(`No data module found for surah ${surahNumber}`);
    }

    // Start loading
    const loadPromise = importFn();
    loadingPromises.set(surahNumber, loadPromise);

    try {
        const data = await loadPromise;

        // Manage cache size (LRU-like eviction)
        if (surahCache.size >= MAX_CACHED_SURAHS) {
            const oldestKey = surahCache.keys().next().value;
            if (oldestKey !== undefined) {
                surahCache.delete(oldestKey);
            }
        }

        // Cache the result
        surahCache.set(surahNumber, {
            data,
            loadedAt: Date.now(),
        });

        return data;
    } finally {
        loadingPromises.delete(surahNumber);
    }
}

/**
 * Preload adjacent surahs for smoother navigation
 */
export function preloadAdjacentSurahs(currentSurah: number): void {
    // Preload in background (don't await)
    if (currentSurah > 1) {
        loadSurah(currentSurah - 1).catch(() => {}); // Ignore errors
    }
    if (currentSurah < 114) {
        loadSurah(currentSurah + 1).catch(() => {});
    }
}

/**
 * Clear all cached data (useful for memory management)
 */
export function clearCache(): void {
    surahCache.clear();
}

/**
 * Check if a surah is cached
 */
export function isSurahCached(surahNumber: number): boolean {
    const cached = surahCache.get(surahNumber);
    return cached !== undefined && Date.now() - cached.loadedAt < CACHE_TTL;
}
