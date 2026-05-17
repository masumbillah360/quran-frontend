import { FontSettings } from '@/types/fonts.types';

export const ARABIC_FONTS: {
    id: FontSettings['arabicFont'];
    name: string;
    family: string;
}[] = [
    {
        id: 'kfgq',
        name: 'KFGQ (Uthmanic)',
        family: 'kfgq, kfgq Fallback, serif',
    },
    { id: 'hafs', name: 'Hafs', family: 'hafs, hafs Fallback, serif' },
    { id: 'amiri', name: 'Amiri Quran', family: '"Amiri Quran", serif' },
    {
        id: 'noto',
        name: 'Noto Naskh Arabic',
        family: '"Noto Naskh Arabic", serif',
    },
    { id: 'almushaf', name: 'Al Mushaf', family: '"Al Mushaf", serif' },
    {
        id: 'alqalam',
        name: 'Al Qalam Quran Majeed',
        family: '"Al Qalam Quran Majeed", serif',
    },
    { id: 'mequran', name: 'ME Quran', family: '"ME Quran", serif' },
    {
        id: 'pdms',
        name: 'PDMS Saleem Quran',
        family: '"PDMS Saleem Quran", serif',
    },
];
