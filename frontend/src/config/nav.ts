import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  History,
  Box,
  MessageSquare,
  Archive,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Inspect',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
      { label: 'New Inspection', href: '/app/inspection/new', icon: PlusCircle },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { label: 'Analysis', href: '/app/analysis', icon: BarChart3 },
      { label: 'History', href: '/app/history', icon: History },
      { label: '3D Digital Twin', href: '/app/models/demo', icon: Box },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Inventory', href: '/app/inventory', icon: Archive },
      { label: 'Reports', href: '/app/reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'AI Assistant', href: '/app/assistant', icon: MessageSquare },
      { label: 'Settings', href: '/app/settings', icon: Settings },
    ],
  },
];
