'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import SurahReader from '@/components/reader/SurahReader';
import IconSidebar from '@/components/layout/IconSidebar';
import RightPanel from '@/components/settings/RightPanel';
import SearchModal from '@/components/search/SearchModal';
import SurahSidebar from '@/components/reader/SurahSidebar';
import AudioPlayerBar from '@/components/audio/AudioPlayerBar';

function AppLayout() {
  const { audioState, setIsSearchOpen } = useApp();
  const hasAudio = audioState.currentAyah !== null || audioState.isPlaying;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIsSearchOpen]);

  return (
    <div className="flex h-screen bg-(--bg-canvas) text-(--text-primary) overflow-hidden">
      {/* Left Column: Full height icon panel on desktop */}
      <IconSidebar />

      {/* Right Column: Spans remaining horizontal viewport space */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Main Application Body Workspace */}
        <div className="flex flex-1 overflow-hidden">
          <SurahSidebar />
          <div className="flex flex-1 overflow-hidden">
            <SurahReader />
            <RightPanel />
          </div>
        </div>
      </div>
      <SearchModal />
      {hasAudio && <AudioPlayerBar />}
    </div>
  );
}

export default function Home() {
  return <AppLayout />;
}
