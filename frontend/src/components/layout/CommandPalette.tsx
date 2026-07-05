'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  History,
  Box,
  MessageSquare,
  Package,
  FileText,
  Settings,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

const pages = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, group: 'Navigation' },
  { name: 'New Inspection', href: '/app/inspection/new', icon: PlusCircle, group: 'Navigation' },
  { name: 'Analysis', href: '/app/analysis', icon: BarChart3, group: 'Navigation' },
  { name: 'Inspection History', href: '/app/history', icon: History, group: 'Navigation' },
  { name: '3D Digital Twin', href: '/app/models/demo', icon: Box, group: 'Navigation' },
  { name: 'AI Assistant', href: '/app/assistant', icon: MessageSquare, group: 'Navigation' },
  { name: 'Inventory', href: '/app/inventory', icon: Package, group: 'Navigation' },
  { name: 'Reports', href: '/app/reports', icon: FileText, group: 'Navigation' },
];

const quickActions = [
  { name: 'Start New Inspection', href: '/app/inspection/new', group: 'Actions' },
  { name: 'Search Aircraft N-737AB', href: '/app/history?tail=N-737AB', group: 'Actions' },
  { name: 'View Fleet Health', href: '/app/dashboard', group: 'Actions' },
  { name: 'Generate Report', href: '/app/reports', group: 'Actions' },
];

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navigate = (href: string) => {
    setCommandPaletteOpen(false);
    setSearch('');
    router.push(href);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Dialog */}
      <div className="relative mx-auto mt-[15vh] sm:mt-[20vh] w-full max-w-[560px] px-3 sm:px-4 animate-slide-up">
        <Command
          className="overflow-hidden rounded-xl border border-black/10 bg-[#FDFBF7] shadow-2xl ring-1 ring-black/5"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-black/10 px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, actions, aircraft..."
              className="flex h-12 w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            <kbd className="text-[10px] font-mono text-gray-500 bg-black/5 px-1.5 py-0.5 rounded border border-black/10">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[min(320px,50vh)] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm font-medium text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-gray-400">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Command.Item
                    key={page.href}
                    value={page.name}
                    onSelect={() => navigate(page.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors aria-selected:bg-black/5 aria-selected:text-gray-900"
                  >
                    <Icon className="h-4 w-4 text-gray-500 aria-selected:text-blue-600" />
                    <span className="font-medium">{page.name}</span>
                    <ArrowRight className="ml-auto h-3 w-3 text-gray-400 opacity-0 aria-selected:opacity-100" />
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Separator className="my-1.5 h-px bg-black/5" />

            <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-gray-400">
              {quickActions.map((action) => (
                <Command.Item
                  key={action.name}
                  value={action.name}
                  onSelect={() => navigate(action.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors aria-selected:bg-black/5 aria-selected:text-gray-900"
                >
                  <ArrowRight className="h-4 w-4 text-gray-400 aria-selected:text-blue-600" />
                  <span className="font-medium">{action.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
