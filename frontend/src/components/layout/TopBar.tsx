'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { setCommandPaletteOpen, setSidebarExpanded } = useUIStore();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    /* Responsive padding: tighter on mobile */
    <header className="flex h-[56px] items-center justify-between border-b border-border-subtle bg-base px-3 sm:px-6">
      <div className="flex items-center gap-4 min-w-0">
        {/* Hamburger — mobile only; desktop uses the sidebar's built-in chevron */}
        <button
          onClick={() => setSidebarExpanded(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-medium text-text-primary leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-text-tertiary truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-[12px] text-text-tertiary md:block">{today}</span>

        {/* Search button — min-height for touch target */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border-subtle px-2.5 py-1 min-h-[36px] text-text-tertiary transition-colors hover:border-border-default hover:text-text-secondary"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden text-[12px] sm:inline">Search</span>
          <kbd className="hidden text-[10px] font-mono bg-surface px-1 py-0.5 rounded sm:inline">⌘K</kbd>
        </button>

        {/* Bell button — enlarged touch target */}
        <button className="relative flex items-center justify-center rounded-md p-2.5 min-h-[36px] min-w-[36px] text-text-tertiary transition-colors hover:bg-elevated hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
