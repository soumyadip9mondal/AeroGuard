'use client';

import { Search, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

export default function TopBar() {
  const { setCommandPaletteOpen, setMobileDrawerOpen, pageTitle, pageSubtitle } = useUIStore();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="topbar">
      <div className="flex items-center gap-4 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg lg:hidden text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date — hidden on mobile */}
        <span className="hidden text-[15px] font-medium md:block text-[#0F172A]">
          {today}
        </span>

        {/* Search button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] px-2.5 py-1 min-h-[32px] transition-colors text-[#4B5563]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden text-[13px] font-medium lg:inline">Search</span>
          <kbd className="hidden text-[11px] font-mono px-1 py-0.5 rounded lg:inline bg-white text-[#9CA3AF] border border-[#E5E7EB]">⌘K</kbd>
        </button>


      </div>
    </header>
  );
}
