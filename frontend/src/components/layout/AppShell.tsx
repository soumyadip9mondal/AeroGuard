'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/ui.store';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import RouteTransitionOverlay from './RouteTransitionOverlay';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { sidebarExpanded, setSidebarExpanded } = useUIStore();

  // Collapse sidebar on initial load if mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarExpanded(false);
    }
  }, [setSidebarExpanded]);

  // Handle resize across breakpoints
  const handleResize = useCallback(() => {
    const isMobile = window.innerWidth < 1024;
    const expanded = useUIStore.getState().sidebarExpanded;
    // When crossing from desktop to mobile, auto-close the sidebar
    if (isMobile && expanded) {
      setSidebarExpanded(false);
    }
  }, [setSidebarExpanded]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <CommandPalette />

      <main
        className={cn(
          'relative flex-1 min-w-0 w-full transition-all duration-standard ease-standard',
          sidebarExpanded ? 'lg:ml-[240px]' : 'lg:ml-[60px]'
        )}
      >
        <RouteTransitionOverlay />
        {children}
      </main>
    </div>
  );
}
