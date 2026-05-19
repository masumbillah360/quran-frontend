import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SURAHS } from '@/data/surahs';
import AppLayout from '@/components/layout/AppLayout';

interface Props {
    params: Promise<{ number: string }>;
}

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

export default async function SurahPage({ params }: Props) {
    const { number } = await params;
    const surahNum = parseInt(number, 10);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
        notFound();
    }

    const surahMeta = SURAHS.find((s) => s.number === surahNum);
    if (!surahMeta) notFound();

    return (
        <AppLayout
            initialSurah={surahNum}
        />
    );
}
