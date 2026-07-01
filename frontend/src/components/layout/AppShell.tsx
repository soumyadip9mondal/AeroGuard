'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useUIStore } from '@/stores/ui.store';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

function UniversalLoader() {
  const { pendingRoute } = useUIStore();
  const [show, setShow] = useState(true); // true on initial load
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load timer
  useEffect(() => {
    timerRef.current = setTimeout(() => setShow(false), 7000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Route transition timer
  useEffect(() => {
    if (pendingRoute) {
      setShow(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShow(false), 7000);
    }
  }, [pendingRoute]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 bg-base/80 backdrop-blur-md flex items-center justify-center">
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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawerOpen(false);
    }
  }, [setMobileDrawerOpen]);

  const handleResize = useCallback(() => {
    const isMobile = window.innerWidth < 1024;
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
      <div className="main max-lg:w-full">
        <TopBar />
        <div className="content relative">
          <UniversalLoader />
          {children}
        </div>
      </div>
    </div>
  );
}
