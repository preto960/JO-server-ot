'use client';

import React from 'react';
import {
  Home,
  Trophy,
  Users,
  Swords,
  Shield,
  BookOpen,
  Bug,
  Scale,
  Scroll,
  HelpCircle,
} from 'lucide-react';
import type { PageId } from './header';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface NavGroup {
  title: string;
  items: { id: PageId; label: string; icon: React.ReactNode }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Community',
    items: [
      { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
      { id: 'online', label: 'Online Players', icon: <Users className="h-4 w-4" /> },
      { id: 'highscores', label: 'Highscores', icon: <Trophy className="h-4 w-4" /> },
      { id: 'guilds', label: 'Guilds', icon: <Shield className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Library',
    items: [
      { id: 'characters', label: 'Characters', icon: <Swords className="h-4 w-4" /> },
      { id: 'spells', label: 'Spells', icon: <Scroll className="h-4 w-4" /> },
      { id: 'creatures', label: 'Creatures', icon: <Bug className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Information',
    items: [
      { id: 'forum', label: 'Forum', icon: <BookOpen className="h-4 w-4" /> },
      { id: 'bans', label: 'Bans', icon: <Scale className="h-4 w-4" /> },
      { id: 'rules', label: 'Rules & FAQ', icon: <HelpCircle className="h-4 w-4" /> },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-amber-500/10 bg-[#0a0a14] xl:block">
      <nav className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-y-auto p-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-amber-500/60">
              {group.title}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all ${
                      currentPage === item.id
                        ? 'bg-amber-500/15 font-medium text-amber-400'
                        : 'text-muted-foreground hover:bg-amber-500/10 hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
