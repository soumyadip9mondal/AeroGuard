'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, X, LogOut, PanelLeft, PanelLeftOpen } from 'lucide-react';
import { useUser, useClerk, UserButton } from '@clerk/nextjs';
import { navigation } from '@/config/nav';
import { APP_NAME, ORG_NAME } from '@/config/constants';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileDrawerOpen, setMobileDrawerOpen, pendingRoute, setPendingRoute, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { user } = useUser();
  const { signOut } = useClerk();
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  useEffect(() => {
    setPendingRoute(null);
  }, [pathname, setPendingRoute]);

  // Close drawer on Escape key (mobile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen && window.innerWidth < 768) {
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen, setMobileDrawerOpen]);

  // Swipe-to-close on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (
      window.innerWidth >= 768 ||
      touchStartX.current === null ||
      touchCurrentX.current === null
    )
      return;
    const diff = touchStartX.current - touchCurrentX.current;
    // Swipe left to close (threshold 60px)
    if (diff > 60) {
      setMobileDrawerOpen(false);
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  }, [setMobileDrawerOpen]);

  // Close drawer on mobile when navigating
  const handleMobileClose = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen(false);
    }
  }, [setMobileDrawerOpen]);

  return (
    <>
      {/* Mobile overlay — z-40 */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          style={{ transition: 'opacity 75ms ease' }}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          /* Desktop: in-flow sidebar via .sidebar CSS class */
          'sidebar',
          /* Mobile: fixed drawer */
          'max-md:fixed max-md:left-0 max-md:top-0 max-md:z-50 max-md:h-[100dvh] max-md:overflow-y-auto max-md:overflow-x-hidden',
          'max-md:w-[260px] max-md:sm:w-[280px] max-md:bg-[#eaf6ff]',
          'max-md:transition-transform max-md:duration-75 max-md:ease-out',
          mobileDrawerOpen
            ? 'max-md:translate-x-0 max-md:shadow-lg'
            : 'max-md:-translate-x-full',
          /* Hide on mobile when not open (desktop always visible via .sidebar) */
          !mobileDrawerOpen && 'max-md:pointer-events-none'
        )}
        data-collapsed={sidebarCollapsed}
      >
        {/* Header */}
        <div className="group relative flex h-[56px] items-center gap-3 px-[14px] pt-4">
          <img
            src="/logo.png"
            alt="AeroGuard Logo"
            className={cn("h-12 w-12 shrink-0 object-contain mx-auto transition-opacity duration-75", sidebarCollapsed ? "opacity-100 group-hover:opacity-0" : "opacity-100")}
          />
          <div className={cn("min-w-0 flex-1 transition-all duration-75 overflow-hidden", sidebarCollapsed ? "md:max-w-0 md:opacity-0 max-md:max-w-[200px] max-md:opacity-100" : "max-w-[200px] opacity-100")}>
            <div className="text-[19px] font-bold text-[#0951B8] tracking-wide truncate">{APP_NAME}</div>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn("hidden md:flex h-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#111827]", sidebarCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-8 opacity-100 ml-auto")}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5 shrink-0" />
          </button>
          {/* Expand button overlays the logo on hover when collapsed */}
          <button
            onClick={() => setSidebarCollapsed(false)}
            className={cn(
              "hidden md:flex absolute top-0 left-0 h-[72px] w-full items-center justify-center transition-all duration-75 z-10",
              sidebarCollapsed ? "opacity-0 group-hover:opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            )}
            aria-label="Expand sidebar"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 hover:bg-black/10 transition-colors" style={{ color: '#1E3A8A' }}>
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            </div>
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg md:hidden"
            style={{ color: '#1E3A8A' }}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="nav-container">
          {navigation.map((group) => (
            <div key={group.label} className="mb-2">
              <div>
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
                      className={cn('nav-item', isActive && 'active')}
                    >
                      <Icon className="h-[22px] w-[22px] shrink-0" />
                      <span className={cn("transition-all duration-75 overflow-hidden", sidebarCollapsed ? "md:max-w-0 md:opacity-0 max-md:max-w-[150px] max-md:opacity-100" : "max-w-[150px] opacity-100")}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto" style={{ borderTop: '0.5px solid rgba(30,58,138,0.15)', padding: '12px 14px' }}>
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center mx-auto">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10",
                    userButtonPopoverCard: "bg-[#F4F9FF] border border-[#0951B8]/10 shadow-2xl rounded-xl w-[200px] py-1",
                    userButtonPopoverActionButton: "hover:bg-[#0951B8]/10 text-[#1E3A8A] py-1.5",
                    userButtonPopoverActionButtonText: "text-[#1E3A8A] font-medium text-sm",
                    userButtonPopoverActionButtonIcon: "text-[#1E3A8A] w-4 h-4",
                    userButtonPopoverFooter: "bg-[#EAF6FF] border-t border-[#0951B8]/10 py-1.5",
                  }
                }}
              />
            </div>
            <div className={cn("min-w-0 flex-1 transition-all duration-75 overflow-hidden whitespace-nowrap", sidebarCollapsed ? "md:max-w-0 md:opacity-0 max-md:max-w-[200px] max-md:opacity-100" : "max-w-[200px] opacity-100")}>
              <div className="text-[15px] font-medium text-[#1E3A8A] truncate">{user?.fullName || 'AeroGuard User'}</div>
              <div className="text-[13px] truncate" style={{ color: 'rgba(30,58,138,0.7)' }}>
                {(user?.publicMetadata?.role as string) || 'MRO Engineer'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
