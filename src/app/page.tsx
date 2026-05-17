'use client';

import IconSidebar from "@/components/layout/IconSidebar";

function AppLayout() {


  return (
    <div className="flex h-screen bg-(--bg-canvas) text-(--text-primary) overflow-hidden">
      {/* Left Column: Full height icon panel on desktop */}
      <IconSidebar />

      {/* Right Column: Spans remaining horizontal viewport space */}
      <div className="flex flex-col flex-1 overflow-hidden">
      </div>
    </div>
  );
}

export default function Home() {
  return <AppLayout />;
}