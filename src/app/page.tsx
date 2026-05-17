'use client';

import Header from '@/components/layout/Header';
import IconSidebar from '@/components/layout/IconSidebar';
import RightPanel from '@/components/settings/RightPanel';
import SearchModal from '@/components/search/SearchModal';
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import SurahSidebar from '@/components/reader/SurahSidebar';
import SurahReader from '@/components/reader/SurahReader';

function AppLayout() {
  const { setIsSearchOpen } = useApp();
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
    </div>
  );
}

export default function Home() {
  return <AppLayout />;
}
