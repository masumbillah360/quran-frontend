'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import SurahReader from '@/components/reader/SurahReader';
import IconSidebar from '@/components/layout/IconSidebar';
import RightPanel from '@/components/settings/RightPanel';
import SearchModal from '@/components/search/SearchModal';
import SurahSidebar from '@/components/reader/SurahSidebar';
import AudioPlayerBar from '@/components/audio/AudioPlayerBar';
import JumpModal from '@/components/search/JumpModal';
import IconBottombar from '@/components/layout/IconBottombar';
import { Ayah, SurahAudioItem } from '@/types';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface AppLayoutProps {
    initialSurah: number;
    initialAyahs: Ayah[];
    initialAudio: SurahAudioItem[] | null;
}

// ── inner layout — identical to your original AppLayout ──────────────────────
function AppLayoutInner({ initialAyahs, initialAudio, initialSurah }: {
    initialAyahs: Ayah[];
    initialAudio: SurahAudioItem[] | null;
    initialSurah: number;
}) {
    const {
        audioState,
        setIsSearchOpen,
        isHeaderVisible,
        isBarsVisible,
        isSearchOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        stopAudio,
        pauseAudio,
        resumeAudio,
        goToNextAyah,
        goToPrevAyah,
        setIsSurahSidebarOpen,
        isSurahSidebarOpen,
        audioState: audio,
    } = useApp();

    const hasAudio = audioState.currentAyah !== null || audioState.isPlaying;

    // ── Keyboard Shortcuts ──
    const shortcuts = [
        { key: 'k', ctrl: true, action: () => setIsSearchOpen(true), description: 'Search', global: true },
        {
            key: ' ',
            action: () => {
                if (audio.currentAyah !== null) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    audio.isPlaying ? pauseAudio() : resumeAudio();
                }
            },
            description: 'Play/Pause',
        },
        { key: 'ArrowRight', shift: true, action: goToNextAyah, description: 'Next ayah' },
        { key: 'ArrowLeft', shift: true, action: goToPrevAyah, description: 'Prev ayah' },
        {
            key: 'Escape',
            action: () => {
                if (isSearchOpen) setIsSearchOpen(false);
                else if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                else stopAudio();
            },
            description: 'Close/Stop', global: true,
        },
        { key: 'b', ctrl: true, action: () => setIsSurahSidebarOpen(!isSurahSidebarOpen), description: 'Sidebar' },
    ];

    useKeyboardShortcuts(shortcuts);

    return (
        // ✅ Exact same JSX as your original — zero design change
        <div className="flex h-screen bg-(--bg-canvas) text-(--text-primary) overflow-hidden">
            {/* Left Column: Full height icon panel on desktop */}
            <IconSidebar />

            {/* Right Column: Spans remaining horizontal viewport space */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <div
                    style={{ maxHeight: isHeaderVisible && isBarsVisible ? '96px' : '0px' }}
                    className="overflow-hidden transition-all duration-300">
                    <Header />
                </div>

                {/* Main Application Body Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    <SurahSidebar />
                    <div className="flex flex-1 overflow-hidden">
                        {/* ✅ Pass SSG data down — SurahReader uses it as initial state */}
                        <SurahReader
                            surahNumber={initialSurah}
                            initialAyahs={initialAyahs}
                            initialAudio={initialAudio}
                        />
                        <RightPanel />
                    </div>
                </div>
            </div>

            <SearchModal />
            <JumpModal />
            {hasAudio && <AudioPlayerBar />}

            {/* Bottom Bar with smooth transition */}
            <div
                style={{ transform: isBarsVisible ? 'translateY(0)' : 'translateY(100%)' }}
                className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 md:hidden">
                <IconBottombar />
            </div>
        </div>
    );
}

// ── outer wrapper — syncs URL surah into context ──────────────────────────────
export default function AppLayout({ initialSurah, initialAyahs, initialAudio }: AppLayoutProps) {
    const { setCurrentSurah, setSurahAudioData } = useApp();
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            setCurrentSurah(initialSurah);
            if (initialAudio && initialAudio.length > 0 && initialAyahs.length > 0) {
                setSurahAudioData(initialSurah, initialAudio[0].audio_url, initialAyahs);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AppLayoutInner
            initialAyahs={initialAyahs}
            initialAudio={initialAudio}
            initialSurah={initialSurah}
        />
    );
}