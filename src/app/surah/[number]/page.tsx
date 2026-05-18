import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SURAHS } from '@/data/surahs';
import { AyahDetail, SurahAudio } from '@/types';
import AppLayout from '@/components/layout/AppLayout';

interface Props {
    params: Promise<{ number: string }>;
}

const API_BASE = 'http://localhost:3000';

// ✅ Generates all 114 static pages at build time
export async function generateStaticParams() {
    return Array.from({ length: 114 }, (_, i) => ({
        number: String(i + 1),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    console.log("params", params)
    const { number } = await params;
    const surahNum = parseInt(number, 10);
    const surah = SURAHS.find((s) => s.number === surahNum);

    if (!surah) return { title: 'Quran Mazid' };

    return {
        title: `Surah ${surah.englishName} (${surah.name}) — Quran Mazid`,
        description: `Read Surah ${surah.englishName} — ${surah.englishNameTranslation}. ${surah.numberOfAyahs} ayahs, revealed in ${surah.revelationType === 'Meccan' ? 'Makkah' : 'Madinah'}.`,
    };
}

// ✅ Server-side fetch at build time — no client bundle cost
async function fetchSurahSSG(surahNumber: number): Promise<{
    ayahs: AyahDetail[];
    audio: SurahAudio;
} | null> {
    try {
        const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`, {
            // cache: 'force-cache' is the default — permanent static cache
            next: { revalidate: false },
        });
        if (!res.ok) return null;
        const json = await res.json();

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
                ? [
                      {
                          id: 0,
                          name: a.translation.translation_name ?? '',
                          translation: a.translation.translation ?? '',
                          languageId: 1,
                      },
                  ]
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
                : {
                      timestamp_from: 0,
                      timestamp_to: 0,
                      segments: [],
                      audio_url: '',
                      duration: 0,
                  },
        }));

        const audio: SurahAudio = {
            reciterId: 1,
            audio_url: json.data.ayahs?.[0]?.audio?.audio_url ?? '',
            duration: json.data.ayahs?.[0]?.audio?.duration ?? 0,
            file_size: 0,
        };

        return { ayahs, audio };
    } catch {
        return null;
    }
}

export default async function SurahPage({ params }: Props) {
    const { number } = await params;
    const surahNum = parseInt(number, 10);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
        notFound();
    }

    const surahMeta = SURAHS.find((s) => s.number === surahNum);
    if (!surahMeta) notFound();

    // Fetched once at build time, served as static HTML forever
    const data = await fetchSurahSSG(surahNum);

    return (
        <AppLayout
            initialSurah={surahNum}
            initialAyahs={data?.ayahs ?? []}
            initialAudio={data?.audio ?? null}
        />
    );
}