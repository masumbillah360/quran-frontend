'use client';

import { useApp } from '@/context/AppContext';
import {
    IcoReadQuran,
    IcoGoToAyah,
    IcoBookmark,
    IcoOthers,
} from '@/assets/icons';

const NAV_ITEMS = [
    { id: 'read_quran', label: 'Read Quran', icon: IcoReadQuran },
    { id: 'go_to_ayah', label: 'Go to Ayah', icon: IcoGoToAyah },
    { id: 'bookmarks', label: 'Bookmark', icon: IcoBookmark },
    { id: 'others', label: 'Others', icon: IcoOthers },
];

export default function IconBottombar() {
    const {
        activeIconTab,
        setActiveIconTab,
        setIsSurahSidebarOpen,
        isSurahSidebarOpen,
        isJumpOpen,
        setIsJumpOpen
    } = useApp();

    const handleClick = (id: string) => {
        if (id === 'go_to_ayah') {
            setIsJumpOpen(!isJumpOpen);
        }

        if (activeIconTab === id) {
            setIsSurahSidebarOpen(!isSurahSidebarOpen);
        } else {
            setActiveIconTab(id);
            setIsSurahSidebarOpen(true);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-center h-16 bg-(--bg-surface) border-t border-(--border-subtle) pb-safe">
            {/* Centered inner wrapper to keep icons clustered together exactly like the screenshot */}
            <div className="flex items-center w-full max-w-70 h-full">
                {NAV_ITEMS.map(({ id, icon: Icon }) => {
                    const isActive = activeIconTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => handleClick(id)}
                            className="flex-1 flex items-center justify-center h-full cursor-pointer transition-transform active:scale-95"
                        >
                            <div
                                className={`transition-colors duration-200 ${isActive
                                    ? 'text-(--text-accent)'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}