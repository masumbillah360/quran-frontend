import AyahSkeleton from '@/components/ui/ayah-skeleton';

export default function Loading() {
    return (
        // Matches exact AppLayout structure so no layout shift
        <div className="flex h-screen bg-(--bg-canvas) overflow-hidden">
            {/* Placeholder for IconSidebar width */}
            <div className="hidden md:block w-14 shrink-0" />
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Placeholder for Header */}
                <div className="h-15 shrink-0 border-b border-(--border-default)" />
                <div className="flex flex-1 overflow-hidden">
                    {/* Placeholder for SurahSidebar */}
                    <div className="hidden lg:block w-80 shrink-0 border-r border-(--border-default)" />
                    {/* Main content skeleton */}
                    <main className="flex-1 overflow-y-auto bg-(--bg-canvas)">
                        <div className="border-b border-(--border-default) px-6 py-6">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <div className="h-6 w-48 bg-(--bg-surface) rounded" />
                                <div className="h-4 w-32 bg-(--bg-surface) rounded" />
                                <div className="flex gap-3 mt-2">
                                    <div className="h-8 w-24 bg-(--bg-surface) rounded-lg" />
                                    <div className="h-8 w-28 bg-(--bg-surface) rounded-lg" />
                                    <div className="h-8 w-24 bg-(--bg-surface) rounded-lg" />
                                </div>
                            </div>
                        </div>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <AyahSkeleton key={i} />
                        ))}
                    </main>
                </div>
            </div>
        </div>
    );
}