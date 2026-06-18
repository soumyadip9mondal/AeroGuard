'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { setCommandPaletteOpen, toggleSidebar } = useUIStore();

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="flex h-[56px] items-center justify-between border-b border-border-subtle bg-base px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-text-tertiary hover:text-text-primary transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[15px] font-medium text-text-primary leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-text-tertiary">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-[12px] text-text-tertiary md:block">{today}</span>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border-subtle px-2.5 py-1 text-text-tertiary transition-colors hover:border-border-default hover:text-text-secondary"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden text-[12px] sm:inline">Search</span>
          <kbd className="hidden text-[10px] font-mono bg-surface px-1 py-0.5 rounded sm:inline">⌘K</kbd>
        </button>

        <button className="relative flex items-center justify-center rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-elevated hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
