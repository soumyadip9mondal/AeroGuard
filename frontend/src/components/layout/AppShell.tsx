'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useUIStore } from '@/stores/ui.store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function UniversalLoader() {
  const { pendingRoute, globalLoading } = useUIStore();

  const isShowing = Boolean(pendingRoute || globalLoading);

  if (!isShowing) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-base/80 backdrop-blur-md flex items-center justify-center">
      <div className="w-80 h-80 sm:w-[500px] sm:h-[500px]">
        <DotLottieReact
          src="/video/Telegram%20Message%20Transp%20Bkg.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { setMobileDrawerOpen } = useUIStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen(false);
    }
  }, [setMobileDrawerOpen]);

  const handleResize = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const drawerOpen = useUIStore.getState().mobileDrawerOpen;
    if (isMobile && drawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [setMobileDrawerOpen]);

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
    <div className="shell">
      <Sidebar />
      <CommandPalette />
      <div className="main max-md:w-full">
        <TopBar />
        <div className="content relative">
          <UniversalLoader />
          {children}
        </div>
      </div>
    </div>
  );
}
