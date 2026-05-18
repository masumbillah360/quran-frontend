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
import JumpModal from '@/components/search/JumpModal';
import IconBottombar from '@/components/layout/IconBottombar';

function AppLayout() {
  const { audioState, setIsSearchOpen, isHeaderVisible } = useApp();
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
        <div
          style={{ maxHeight: isHeaderVisible ? '96px' : '0px' }}
          className="overflow-hidden transition-all duration-300">
          <Header />
        </div>

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
      <JumpModal />
      {hasAudio && <AudioPlayerBar />}
      {/* Bottom Bar with smooth transition */}
      <div
        style={{ transform: isHeaderVisible ? 'translateY(0)' : 'translateY(100%)' }}
        className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 md:hidden">
        <IconBottombar />
      </div>
    </div>
  );
}

export default function Home() {
  return <AppLayout />;
}
