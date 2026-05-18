import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SURAHS } from '@/data/surahs';
import { Ayah, SurahAudioItem } from '@/types';
import AppLayout from '@/components/layout/AppLayout';

interface Props {
    params: Promise<{ number: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export async function generateStaticParams() {
    return Array.from({ length: 114 }, (_, i) => ({
        number: String(i + 1),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { number } = await params;
    const surahNum = parseInt(number, 10);
    const surah = SURAHS.find((s) => s.number === surahNum);

    if (!surah) return { title: 'Quran Mazid' };

    return {
        title: `Surah ${surah.englishName} (${surah.name}) — Quran Mazid`,
        description: `Read Surah ${surah.englishName} — ${surah.englishNameTranslation}. ${surah.numberOfAyahs} ayahs, revealed in ${surah.revelationType === 'Meccan' ? 'Makkah' : 'Madinah'}.`,
    };
}

async function fetchSurahSSG(surahNumber: number): Promise<{
    ayahs: Ayah[];
    audio: SurahAudioItem[];
} | null> {
    try {
        const res = await fetch(`${API_BASE}/api/surahs/${surahNumber}`, {
            next: { revalidate: false },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
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

    const data = await fetchSurahSSG(surahNum);

    return (
        <AppLayout
            initialSurah={surahNum}
            initialAyahs={data?.ayahs ?? []}
            initialAudio={data?.audio ?? null}
        />
    );
}