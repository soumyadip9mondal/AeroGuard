'use client';

import { useUIStore } from '@/stores/ui.store';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { sidebarExpanded } = useUIStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <CommandPalette />

      <main
        className={cn(
          'flex-1 transition-all duration-standard ease-standard',
          sidebarExpanded ? 'lg:ml-[240px]' : 'lg:ml-[60px]'
        )}
      >
        {children}
      </main>
    </div>
  );
}
