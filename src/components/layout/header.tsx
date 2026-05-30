'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Trophy,
  Users,
  Swords,
  Shield,
  BookOpen,
  Bug,
  Scale,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type PageId =
  | 'home'
  | 'highscores'
  | 'online'
  | 'characters'
  | 'guilds'
  | 'spells'
  | 'creatures'
  | 'bans'
  | 'forum'
  | 'rules'
  | 'login'
  | 'register'
  | 'account';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isLoggedIn: boolean;
  accountName?: string;
  onLogout?: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { id: 'highscores', label: 'Highscores', icon: <Trophy className="h-4 w-4" /> },
  { id: 'online', label: 'Online', icon: <Users className="h-4 w-4" /> },
  { id: 'characters', label: 'Characters', icon: <Swords className="h-4 w-4" /> },
  { id: 'guilds', label: 'Guilds', icon: <Shield className="h-4 w-4" /> },
  { id: 'spells', label: 'Spells', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'creatures', label: 'Creatures', icon: <Bug className="h-4 w-4" /> },
  { id: 'bans', label: 'Bans', icon: <Scale className="h-4 w-4" /> },
  { id: 'forum', label: 'Forum', icon: <Users className="h-4 w-4" /> },
];

export default function Header({
  currentPage,
  onNavigate,
  isLoggedIn,
  accountName,
  onLogout,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/15 bg-[#0a0a14]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 transition-colors hover:text-amber-400"
        >
          <Crown className="h-7 w-7 text-amber-500" />
          <span className="text-xl font-bold tracking-tight text-amber-500">
            JO Server
            <span className="ml-1 text-foreground">OT</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-muted-foreground hover:bg-amber-500/10 hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  ['spells', 'creatures', 'bans', 'forum', 'rules'].includes(
                    currentPage
                  )
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-muted-foreground hover:bg-amber-500/10 hover:text-foreground'
                }`}
              >
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-amber-500/15 bg-[#12121f]"
            >
              {NAV_ITEMS.slice(6).map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="cursor-pointer text-muted-foreground hover:bg-amber-500/10 hover:text-foreground"
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-amber-500/15" />
              <DropdownMenuItem
                onClick={() => onNavigate('rules')}
                className="cursor-pointer text-muted-foreground hover:bg-amber-500/10 hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Rules & FAQ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                >
                  <User className="mr-2 h-4 w-4" />
                  {accountName || 'Account'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-amber-500/15 bg-[#12121f]"
              >
                <DropdownMenuItem
                  onClick={() => onNavigate('account')}
                  className="cursor-pointer hover:bg-amber-500/10"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-500/15" />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('login')}
                className="text-muted-foreground hover:text-amber-400"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => onNavigate('register')}
                className="bg-amber-500 text-black hover:bg-amber-400"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-muted-foreground hover:bg-amber-500/10 hover:text-foreground lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-amber-500/15 bg-[#0a0a14] lg:hidden">
          <nav className="flex max-h-[70vh] flex-col overflow-y-auto p-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-muted-foreground hover:bg-amber-500/10 hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('rules');
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                currentPage === 'rules'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-muted-foreground hover:bg-amber-500/10 hover:text-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Rules & FAQ
            </button>
            <div className="my-2 border-t border-amber-500/10" />
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-amber-500/10 hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  My Account
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onNavigate('login');
                    setMobileOpen(false);
                  }}
                  className="border-amber-500/20 text-amber-400"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  onClick={() => {
                    onNavigate('register');
                    setMobileOpen(false);
                  }}
                  className="bg-amber-500 text-black hover:bg-amber-400"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
