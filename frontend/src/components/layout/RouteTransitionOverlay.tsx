'use client';

import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/ui.store';
import FullscreenLoader from '@/components/shared/FullscreenLoader';

export default function RouteTransitionOverlay() {
  const { pendingRoute } = useUIStore();
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pendingRoute) {
      setShow(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        setShow(false);
      }, 7000);
    }
  }, [pendingRoute]);

  if (!show) return null;

  return <FullscreenLoader />;
}
