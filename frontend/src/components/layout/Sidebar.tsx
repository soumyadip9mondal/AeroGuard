'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, ChevronLeft, ChevronRight, LogOut, Search, X } from 'lucide-react';
import { navigation } from '@/config/nav';
import { APP_NAME, ORG_NAME } from '@/config/constants';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarExpanded, toggleSidebar, setSidebarExpanded, setCommandPaletteOpen, pendingRoute, setPendingRoute } = useUIStore();
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  useEffect(() => {
    setPendingRoute(null);
  }, [pathname, setPendingRoute]);

  // Close sidebar on Escape key (mobile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarExpanded && window.innerWidth < 1024) {
        setSidebarExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarExpanded, setSidebarExpanded]);

  // Swipe-to-close on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 1024) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 1024 || touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (
      window.innerWidth >= 1024 ||
      touchStartX.current === null ||
      touchCurrentX.current === null
    )
      return;
    const diff = touchStartX.current - touchCurrentX.current;
    // Swipe left to close (threshold 60px)
    if (diff > 60) {
      setSidebarExpanded(false);
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  }, [setSidebarExpanded]);

  // Close sidebar on mobile when navigating
  const handleMobileClose = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarExpanded(false);
    }
  }, [setSidebarExpanded]);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarExpanded(false)}
          />
        )}
      </AnimatePresence>

      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border-subtle bg-surface transition-all duration-standard ease-standard',
          // Mobile first width
          'w-[280px] sm:w-[320px]',
          // Desktop width based on state
          sidebarExpanded ? 'lg:w-[240px]' : 'lg:w-[60px]',
          // Translate logic: mobile slides in/out, desktop always visible
          sidebarExpanded
            ? 'translate-x-0 shadow-lg lg:shadow-none'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-[64px] items-center gap-3 border-b border-border-subtle px-[12px]">
          <img
            src="/logo.png"
            alt="AeroGuard Logo"
            className={cn(
              "shrink-0 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-300",
              sidebarExpanded ? "h-11 w-11 ml-0" : "h-9 w-9 ml-0"
            )}
          />
          {sidebarExpanded && (
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-bold text-text-primary tracking-wide truncate">{APP_NAME}</div>
              <div className="text-[11px] text-text-tertiary truncate">{ORG_NAME}</div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarExpanded(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Inspection CTA */}
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/app/inspection/new"
            onClick={handleMobileClose}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover',
              !sidebarExpanded && 'px-0'
            )}
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            {sidebarExpanded && <span>New Inspection</span>}
          </Link>
        </div>

        {/* Search */}
        {sidebarExpanded && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex w-full items-center gap-2 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:border-border-default hover:text-text-secondary"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search…</span>
              <kbd className="ml-auto text-[10px] font-mono text-text-tertiary bg-base px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navigation.map((group) => (
            <div key={group.label} className="mb-4">
              {sidebarExpanded && (
                <div className="text-label-sm mb-1 px-2 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActuallyActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const isActive = pendingRoute
                    ? (pendingRoute === item.href || pendingRoute.startsWith(item.href + '/'))
                    : isActuallyActive;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (item.href !== pathname && !pathname.startsWith(item.href + '/')) {
                          setPendingRoute(item.href);
                        }
                        handleMobileClose();
                      }}
                      className={cn(
                        'relative flex items-center rounded-md px-2 py-1.5 text-sm transition-colors duration-fast',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:bg-[rgba(255,255,255,0.04)] hover:text-text-primary',
                        !sidebarExpanded && 'justify-center px-0'
                      )}
                      title={!sidebarExpanded ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute inset-0 rounded-md bg-accent-subtle"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        >
                          <div className="absolute inset-y-0 left-0 w-[2px] bg-accent rounded-l-md" />
                        </motion.div>
                      )}
                      <span className="relative z-10 flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarExpanded && <span>{item.label}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border-subtle p-3">
          {sidebarExpanded ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-text-secondary">
                JR
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text-primary truncate">J. Rivera</div>
                <div className="text-[11px] text-text-tertiary truncate">MRO Engineer</div>
              </div>
              <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-xs font-medium text-text-secondary">
                JR
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Collapse toggle — desktop only, positioned outside aside to avoid overflow issues */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className={cn(
          'group fixed top-[48px] z-50 hidden h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface shadow-sm text-text-tertiary transition-all duration-standard ease-standard hover:bg-elevated hover:text-text-primary hover:shadow-md hover:scale-110 lg:flex',
          sidebarExpanded ? 'left-[224px]' : 'left-[44px]'
        )}
      >
        {sidebarExpanded ? (
          <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>
    </>
  );
}
