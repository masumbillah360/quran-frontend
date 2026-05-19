/**
 * ══════════════════════════════════════════════════════════════════════════════
 * QURAN SEARCH SERVICE
 * ══════════════════════════════════════════════════════════════════════════════
 * Searches across all 114 surahs locally (no API needed).
 * Searches: surah names (EN/AR), translations, ayah text (EN/AR).
 */

import { SURAHS } from '@/data/surahs';
import { LocalSurahData } from '@/types/surahs.types';

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

const surahModules: Record<number, () => Promise<LocalSurahData>> = {
  1: () => import('@/data/001_Al_Faatiha.json').then(normalize),
  2: () => import('@/data/002_Al_Baqara.json').then(normalize),
  3: () => import('@/data/003_Aal_i_Imraan.json').then(normalize),
  4: () => import('@/data/004_An_Nisaa.json').then(normalize),
  5: () => import('@/data/005_Al_Maaida.json').then(normalize),
  6: () => import('@/data/006_Al_An_aam.json').then(normalize),
  7: () => import('@/data/007_Al_A_raaf.json').then(normalize),
  8: () => import('@/data/008_Al_Anfaal.json').then(normalize),
  9: () => import('@/data/009_At_Tawba.json').then(normalize),
  10: () => import('@/data/010_Yunus.json').then(normalize),
  11: () => import('@/data/011_Hud.json').then(normalize),
  12: () => import('@/data/012_Yusuf.json').then(normalize),
  13: () => import('@/data/013_Ar_Ra_d.json').then(normalize),
  14: () => import('@/data/014_Ibrahim.json').then(normalize),
  15: () => import('@/data/015_Al_Hijr.json').then(normalize),
  16: () => import('@/data/016_An_Nahl.json').then(normalize),
  17: () => import('@/data/017_Al_Israa.json').then(normalize),
  18: () => import('@/data/018_Al_Kahf.json').then(normalize),
  19: () => import('@/data/019_Maryam.json').then(normalize),
  20: () => import('@/data/020_Taa_Haa.json').then(normalize),
  21: () => import('@/data/021_Al_Anbiyaa.json').then(normalize),
  22: () => import('@/data/022_Al_Hajj.json').then(normalize),
  23: () => import('@/data/023_Al_Muminoon.json').then(normalize),
  24: () => import('@/data/024_An_Noor.json').then(normalize),
  25: () => import('@/data/025_Al_Furqaan.json').then(normalize),
  26: () => import('@/data/026_Ash_Shu_araa.json').then(normalize),
  27: () => import('@/data/027_An_Naml.json').then(normalize),
  28: () => import('@/data/028_Al_Qasas.json').then(normalize),
  29: () => import('@/data/029_Al_Ankaboot.json').then(normalize),
  30: () => import('@/data/030_Ar_Room.json').then(normalize),
  31: () => import('@/data/031_Luqman.json').then(normalize),
  32: () => import('@/data/032_As_Sajda.json').then(normalize),
  33: () => import('@/data/033_Al_Ahzaab.json').then(normalize),
  34: () => import('@/data/034_Saba.json').then(normalize),
  35: () => import('@/data/035_Faatir.json').then(normalize),
  36: () => import('@/data/036_Yaseen.json').then(normalize),
  37: () => import('@/data/037_As_Saaffaat.json').then(normalize),
  38: () => import('@/data/038_Saad.json').then(normalize),
  39: () => import('@/data/039_Az_Zumar.json').then(normalize),
  40: () => import('@/data/040_Ghafir.json').then(normalize),
  41: () => import('@/data/041_Fussilat.json').then(normalize),
  42: () => import('@/data/042_Ash_Shura.json').then(normalize),
  43: () => import('@/data/043_Az_Zukhruf.json').then(normalize),
  44: () => import('@/data/044_Ad_Dukhaan.json').then(normalize),
  45: () => import('@/data/045_Al_Jaathiya.json').then(normalize),
  46: () => import('@/data/046_Al_Ahqaf.json').then(normalize),
  47: () => import('@/data/047_Muhammad.json').then(normalize),
  48: () => import('@/data/048_Al_Fath.json').then(normalize),
  49: () => import('@/data/049_Al_Hujuraat.json').then(normalize),
  50: () => import('@/data/050_Qaaf.json').then(normalize),
  51: () => import('@/data/051_Adh_Dhaariyat.json').then(normalize),
  52: () => import('@/data/052_At_Tur.json').then(normalize),
  53: () => import('@/data/053_An_Najm.json').then(normalize),
  54: () => import('@/data/054_Al_Qamar.json').then(normalize),
  55: () => import('@/data/055_Ar_Rahmaan.json').then(normalize),
  56: () => import('@/data/056_Al_Waaqia.json').then(normalize),
  57: () => import('@/data/057_Al_Hadid.json').then(normalize),
  58: () => import('@/data/058_Al_Mujaadila.json').then(normalize),
  59: () => import('@/data/059_Al_Hashr.json').then(normalize),
  60: () => import('@/data/060_Al_Mumtahana.json').then(normalize),
  61: () => import('@/data/061_As_Saff.json').then(normalize),
  62: () => import('@/data/062_Al_Jumu_a.json').then(normalize),
  63: () => import('@/data/063_Al_Munaafiqoon.json').then(normalize),
  64: () => import('@/data/064_At_Taghaabun.json').then(normalize),
  65: () => import('@/data/065_At_Talaaq.json').then(normalize),
  66: () => import('@/data/066_At_Tahrim.json').then(normalize),
  67: () => import('@/data/067_Al_Mulk.json').then(normalize),
  68: () => import('@/data/068_Al_Qalam.json').then(normalize),
  69: () => import('@/data/069_Al_Haaqqa.json').then(normalize),
  70: () => import('@/data/070_Al_Ma_aarij.json').then(normalize),
  71: () => import('@/data/071_Nooh.json').then(normalize),
  72: () => import('@/data/072_Al_Jinn.json').then(normalize),
  73: () => import('@/data/073_Al_Muzzammil.json').then(normalize),
  74: () => import('@/data/074_Al_Muddaththir.json').then(normalize),
  75: () => import('@/data/075_Al_Qiyaama.json').then(normalize),
  76: () => import('@/data/076_Al_Insaan.json').then(normalize),
  77: () => import('@/data/077_Al_Mursalaat.json').then(normalize),
  78: () => import('@/data/078_An_Naba.json').then(normalize),
  79: () => import('@/data/079_An_Naazi_aat.json').then(normalize),
  80: () => import('@/data/080_Abasa.json').then(normalize),
  81: () => import('@/data/081_At_Takwir.json').then(normalize),
  82: () => import('@/data/082_Al_Infitaar.json').then(normalize),
  83: () => import('@/data/083_Al_Mutaffifin.json').then(normalize),
  84: () => import('@/data/084_Al_Inshiqaaq.json').then(normalize),
  85: () => import('@/data/085_Al_Burooj.json').then(normalize),
  86: () => import('@/data/086_At_Taariq.json').then(normalize),
  87: () => import('@/data/087_Al_A_laa.json').then(normalize),
  88: () => import('@/data/088_Al_Ghaashiya.json').then(normalize),
  89: () => import('@/data/089_Al_Fajr.json').then(normalize),
  90: () => import('@/data/090_Al_Balad.json').then(normalize),
  91: () => import('@/data/091_Ash_Shams.json').then(normalize),
  92: () => import('@/data/092_Al_Lail.json').then(normalize),
  93: () => import('@/data/093_Ad_Dhuhaa.json').then(normalize),
  94: () => import('@/data/094_Ash_Sharh.json').then(normalize),
  95: () => import('@/data/095_At_Tin.json').then(normalize),
  96: () => import('@/data/096_Al_Alaq.json').then(normalize),
  97: () => import('@/data/097_Al_Qadr.json').then(normalize),
  98: () => import('@/data/098_Al_Bayyina.json').then(normalize),
  99: () => import('@/data/099_Az_Zalzala.json').then(normalize),
  100: () => import('@/data/100_Al_Aadiyaat.json').then(normalize),
  101: () => import('@/data/101_Al_Qaari_a.json').then(normalize),
  102: () => import('@/data/102_At_Takaathur.json').then(normalize),
  103: () => import('@/data/103_Al_Asr.json').then(normalize),
  104: () => import('@/data/104_Al_Humaza.json').then(normalize),
  105: () => import('@/data/105_Al_Fil.json').then(normalize),
  106: () => import('@/data/106_Quraish.json').then(normalize),
  107: () => import('@/data/107_Al_Maa_un.json').then(normalize),
  108: () => import('@/data/108_Al_Kawthar.json').then(normalize),
  109: () => import('@/data/109_Al_Kaafiroon.json').then(normalize),
  110: () => import('@/data/110_An_Nasr.json').then(normalize),
  111: () => import('@/data/111_Al_Masad.json').then(normalize),
  112: () => import('@/data/112_Al_Ikhlaas.json').then(normalize),
  113: () => import('@/data/113_Al_Falaq.json').then(normalize),
  114: () => import('@/data/114_An_Naas.json').then(normalize),
};

function normalize(m: { default: unknown }): LocalSurahData {
  const raw = m.default as Record<string, unknown>;
  const surahNumber = (raw.surahNumber as number) ?? 1;
  return {
    surahNumber,
    name: (raw.name as string) ?? '',
    englishName: (raw.englishName as string) ?? '',
    englishTranslation: (raw.englishTranslation as string) ?? (raw.englishNameTranslation as string) ?? '',
    revelationType: ((raw.revelationType as string) ?? 'Meccan') as 'Meccan' | 'Medinan',
    totalAyahs: (raw.totalAyahs as number) ?? 0,
    bismillahPre: (raw.bismillahPre as boolean) ?? (surahNumber !== 1 && surahNumber !== 9),
    ayahs: ((raw.ayahs as unknown[]) ?? []).map((ayah: unknown, idx: number) => {
      const a = ayah as Record<string, unknown>;
      return {
        id: (a.id as string) ?? `${surahNumber}:${(a.ayahNumber as number) ?? idx + 1}`,
        ayahNumber: (a.ayahNumber as number) ?? idx + 1,
        verseKey: (a.verseKey as string) ?? `${surahNumber}:${idx + 1}`,
        pageNumber: (a.pageNumber as number) ?? 1,
        juzNumber: (a.juzNumber as number) ?? 1,
        hizbNumber: (a.hizbNumber as number) ?? 1,
        rubNumber: (a.rubNumber as number) ?? 1,
        sajdah: (a.sajdah as boolean | null) ?? null,
        translation: (a.translation as string) ?? '',
        translationName: (a.translationName as string) ?? 'Saheeh International',
        audio: { url: '', duration: 0, segments: undefined },
        words: ((a.words as unknown[]) ?? []).map((word: unknown, wIdx: number) => {
          const w = word as Record<string, unknown>;
          return {
            id: (w.id as string) ?? `${surahNumber}:${(a.ayahNumber as number) ?? idx + 1}:${(w.position as number) ?? wIdx + 1}`,
            position: (w.position as number) ?? wIdx + 1,
            text: (w.text as string) ?? '',
            translation: (w.translation as string) ?? '',
            transliteration: (w.transliteration as string) ?? '',
            charType: ((w.charType as string) ?? 'word') as 'word' | 'end',
            audioSegment: undefined,
          };
        }),
      };
    }),
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

export async function searchQuranLocal(query: string, maxResults = 50): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const qLower = trimmed.toLowerCase();
  const qClean = removeDiacritics(trimmed);
  const qRegex = new RegExp(escapeRegex(trimmed), 'i');
  const qCleanRegex = new RegExp(escapeRegex(qClean), 'i');
  const results: SearchResult[] = [];

  // 1. Search surah metadata (instant, no loading needed)
  for (const surah of SURAHS) {
    if (
      surah.englishName.toLowerCase().includes(qLower) ||
      surah.englishNameTranslation.toLowerCase().includes(qLower) ||
      surah.name.includes(trimmed) ||
      removeDiacritics(surah.name).includes(qClean) ||
      String(surah.number).includes(trimmed)
    ) {
      results.push({
        type: 'surah',
        surahNumber: surah.number,
        surahEnglishName: surah.englishName,
        surahArabicName: surah.name,
        matchType: 'name',
      });
    }
  }

  // 2. Search ayah text across all surahs (load in batches)
  const surahNumbers = Array.from({ length: 114 }, (_, i) => i + 1);
  const batchSize = 10;

  for (let i = 0; i < surahNumbers.length && results.length < maxResults; i += batchSize) {
    const batch = surahNumbers.slice(i, i + batchSize);
    const loaded = await Promise.all(
      batch.map(async (num) => {
        try {
          const mod = surahModules[num];
          if (!mod) return null;
          return await mod();
        } catch {
          return null;
        }
      })
    );

    for (const surah of loaded) {
      if (!surah || results.length >= maxResults) continue;

      for (const ayah of surah.ayahs) {
        if (results.length >= maxResults) break;

        const arabicWords = ayah.words
          .filter((w) => w.charType === 'word')
          .map((w) => w.text)
          .join(' ');
        const arabicClean = removeDiacritics(arabicWords);
        const translation = ayah.translation || '';

        let matchType: SearchResult['matchType'] | null = null;

        if (qRegex.test(translation)) {
          matchType = 'english';
        } else if (qRegex.test(arabicWords) || qCleanRegex.test(arabicClean)) {
          matchType = 'arabic';
        }

        if (matchType) {
          results.push({
            type: 'ayah',
            surahNumber: surah.surahNumber,
            surahEnglishName: surah.englishName,
            surahArabicName: surah.name,
            ayahNumber: ayah.ayahNumber,
            verseKey: ayah.verseKey,
            arabicText: arabicWords,
            translation,
            matchType,
          });
        }
      }
    }
  }

  return results;
}
