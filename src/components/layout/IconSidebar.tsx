'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
    QuranLogo,
    QuranLogoSepia,
    IcoHome,
    IcoReadQuran,
    IcoGoToAyah,
    IcoBookmark,
    IcoOthers,
} from '@/assets/icons';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: IcoHome },
    { id: 'read_quran', label: 'Read Quran', icon: IcoReadQuran },
    { id: 'go_to_ayah', label: 'Go to Ayah', icon: IcoGoToAyah },
    { id: 'bookmarks', label: 'Bookmark', icon: IcoBookmark },
    { id: 'others', label: 'Others', icon: IcoOthers },
];

export default function IconSidebar() {
    const {
        activeIconTab,
        setActiveIconTab,
        setIsSurahSidebarOpen,
        isSurahSidebarOpen,
        resolvedTheme,
    } = useApp();

    const handleClick = (id: string) => {
        if (activeIconTab === id) {
            setIsSurahSidebarOpen(!isSurahSidebarOpen);
        } else {
            setActiveIconTab(id);
            setIsSurahSidebarOpen(true);
        }
    };

    return (
        <aside className="hidden md:flex flex-col items-center w-16 shrink-0 bg-(--bg-accent)/5  py-4 gap-6 h-full z-30">
            {/* Brand / Logo icon at top */}
            <Link
                href="/"
                aria-label="Home"
                className="transition-transform duration-200 hover:scale-105">
                {resolvedTheme === 'sepia' ? (
                    <QuranLogoSepia size={36} />
                ) : (
                        <QuranLogo size={36} />
                )}
            </Link>

            {/* Navigation item column - centered vertically */}
            <div className="flex flex-col items-center gap-5 w-full flex-1 justify-center">
                {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
                    const isActive = activeIconTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => handleClick(id)}
                            // title={label}
                            className={`relative size-10 rounded-xl flex items-center justify-center transition-all duration-300 group cursor-pointer
                ${
                                isActive
                                    ? 'bg-[#1b8043]/10 text-[#1b8043] font-semibold scale-105'
                                    : 'text-gray-400 hover:bg-(--bg-surface) hover:text-gray-600'
                                }`}>
                            <Icon />
                            <span className="absolute left-13 bg-gray-900 text-white text-base px-3 py-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-40">
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
