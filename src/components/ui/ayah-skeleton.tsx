'use client';

function AyahSkeleton() {
    return (
        <div className="flex border-b border-(--border-default) animate-pulse">
            <div className="flex flex-col items-center py-6 px-3 gap-3 w-14 shrink-0">
                <div className="w-9 h-9 rounded-full bg-(--bg-elevated)" />
                <div className="w-8 h-8 rounded-full bg-(--bg-elevated)" />
                <div className="w-8 h-8 rounded-full bg-(--bg-elevated)" />
            </div>
            <div className="flex-1 py-6 pr-8 space-y-4">
                <div className="h-3 w-16 rounded bg-(--bg-elevated)" />
                <div className="flex flex-col items-end gap-2">
                    <div className="h-6 w-4/5 rounded bg-(--bg-elevated)" />
                    <div className="h-6 w-3/4 rounded bg-(--bg-elevated)" />
                    <div className="h-6 w-2/3 rounded bg-(--bg-elevated)" />
                </div>
                <div className="h-px bg-(--border-default)" />
                <div className="h-3 w-24 rounded bg-(--bg-elevated)" />
                <div className="space-y-1.5">
                    <div className="h-4 w-full rounded bg-(--bg-elevated)" />
                    <div className="h-4 w-5/6 rounded bg-(--bg-elevated)" />
                </div>
            </div>
        </div>
    );
}

export default AyahSkeleton