'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Swords, Users, Search, Crown, Trophy, Eye, Skull, Home,
  LogIn, UserPlus, LogOut, User, BookOpen, Scroll, Terminal,
  HelpCircle, Shield, Newspaper, RefreshCw, Image, Star,
  BarChart3, Bug, MessageSquare, ChevronDown, Menu, X,
  Server, Settings, LayoutDashboard,
} from 'lucide-react'

// ====== TYPES ======
interface NavItem {
  key: string
  label: string
  icon: React.ReactNode
  auth?: 'logged-in' | 'logged-out' | 'both'
  action?: 'logout' | 'account' | 'login' | 'register'
}

interface NavCategory {
  id: string
  label: string
  icon: React.ReactNode
  items: NavItem[]
  defaultOpen?: boolean
}

export interface TibiaLayoutProps {
  activeTab: string
  onNavigate: (tab: string) => void
  isLoggedIn: boolean
  accountName?: string
  accountType?: number
  onLogin: () => void
  onRegister: () => void
  onAccount: () => void
  onLogout: () => void
  onlineCount: number
  children: React.ReactNode
}

// ====== MENU CATEGORIES ======
function buildMenuCategories(isAdmin: boolean): NavCategory[] {
  const categories: NavCategory[] = [
    {
      id: 'account',
      label: 'Account',
      icon: <User className="w-4 h-4" />,
      defaultOpen: true,
      items: [
        { key: 'login', label: 'Login', icon: <LogIn className="w-4 h-4" />, auth: 'logged-out', action: 'login' },
        { key: 'register', label: 'Create Account', icon: <UserPlus className="w-4 h-4" />, auth: 'logged-out', action: 'register' },
        { key: 'account', label: 'My Account', icon: <User className="w-4 h-4" />, auth: 'logged-in', action: 'account' },
        { key: 'logout', label: 'Logout', icon: <LogOut className="w-4 h-4" />, auth: 'logged-in', action: 'logout' },
      ],
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users className="w-4 h-4" />,
      defaultOpen: true,
      items: [
        { key: 'characters', label: 'Characters', icon: <Search className="w-4 h-4" />, auth: 'both' },
        { key: 'guilds', label: 'Guilds', icon: <Crown className="w-4 h-4" />, auth: 'both' },
        { key: 'highscores', label: 'Highscores', icon: <Trophy className="w-4 h-4" />, auth: 'both' },
        { key: 'online', label: 'Online Players', icon: <Eye className="w-4 h-4" />, auth: 'both' },
        { key: 'last-deaths', label: 'Last Deaths', icon: <Skull className="w-4 h-4" />, auth: 'both' },
        { key: 'houses', label: 'Houses', icon: <Home className="w-4 h-4" />, auth: 'both' },
        { key: 'bugs', label: 'Bug Tracker', icon: <Bug className="w-4 h-4" />, auth: 'both' },
        { key: 'forum', label: 'Forum', icon: <MessageSquare className="w-4 h-4" />, auth: 'both' },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      icon: <BookOpen className="w-4 h-4" />,
      defaultOpen: true,
      items: [
        { key: 'creatures', label: 'Creatures', icon: <Skull className="w-4 h-4" />, auth: 'both' },
        { key: 'spells', label: 'Spells', icon: <Scroll className="w-4 h-4" />, auth: 'both' },
        { key: 'commands', label: 'Commands', icon: <Terminal className="w-4 h-4" />, auth: 'both' },
        { key: 'server-info', label: 'Server Info', icon: <Server className="w-4 h-4" />, auth: 'both' },
        { key: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" />, auth: 'both' },
      ],
    },
    {
      id: 'server',
      label: 'Server',
      icon: <Shield className="w-4 h-4" />,
      defaultOpen: true,
      items: [
        { key: 'rules', label: 'Rules', icon: <Shield className="w-4 h-4" />, auth: 'both' },
        { key: 'news-archive', label: 'News Archive', icon: <Newspaper className="w-4 h-4" />, auth: 'both' },
        { key: 'changelog', label: 'Changelog', icon: <RefreshCw className="w-4 h-4" />, auth: 'both' },
        { key: 'gallery', label: 'Gallery', icon: <Image className="w-4 h-4" />, auth: 'both' },
        { key: 'team', label: 'Team', icon: <Star className="w-4 h-4" />, auth: 'both' },
        { key: 'polls', label: 'Polls', icon: <BarChart3 className="w-4 h-4" />, auth: 'both' },
      ],
    },
  ]

  // Add Admin Panel category for admins (type >= 4)
  if (isAdmin) {
    categories.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: <Settings className="w-4 h-4" />,
      defaultOpen: true,
      items: [
        { key: 'admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, auth: 'logged-in' },
      ],
    })
  }

  return categories
}

// ====== SIDEBAR CONTENT ======
function SidebarContent({
  menuCategories,
  collapsedCategories,
  toggleCategory,
  isItemVisible,
  isCategoryVisible,
  activeTab,
  onNavigate,
  handleNavClick,
}: {
  menuCategories: NavCategory[]
  collapsedCategories: Set<string>
  toggleCategory: (id: string) => void
  isItemVisible: (item: NavItem) => boolean
  isCategoryVisible: (cat: NavCategory) => boolean
  activeTab: string
  onNavigate: (tab: string) => void
  handleNavClick: (item: NavItem) => void
}) {
  return (
    <>
      {/* Home button */}
      <div className="p-2 border-b border-border/50">
        <button
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'home' ? 'tibia-menu-item-active' : 'tibia-menu-item'
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* Categorized menu */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {menuCategories.map(category => {
            if (!isCategoryVisible(category)) return null
            const isOpen = !collapsedCategories.has(category.id)

            return (
              <div key={category.id}>
                {/* Category header - clickable to expand/collapse */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md tibia-category-header text-xs font-bold uppercase tracking-wider"
                >
                  {category.icon}
                  <span className="flex-1 text-left">{category.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Collapsible items with smooth transition */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="mt-0.5 ml-2 space-y-0.5 border-l border-border/30 pl-2 py-0.5">
                    {category.items
                      .filter(item => isItemVisible(item))
                      .map(item => (
                        <button
                          key={item.key}
                          onClick={() => handleNavClick(item)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                            activeTab === item.key
                              ? 'tibia-menu-item-active'
                              : 'tibia-menu-item'
                          }`}
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </>
  )
}

// ====== MAIN COMPONENT ======
export function TibiaLayout({
  activeTab,
  onNavigate,
  isLoggedIn,
  accountName,
  accountType = 1,
  onLogin,
  onRegister,
  onAccount,
  onLogout,
  onlineCount,
  children,
}: TibiaLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const isAdmin = accountType >= 4
  const menuCategories = buildMenuCategories(isAdmin)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCategory = (id: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isItemVisible = (item: NavItem) => {
    if (item.auth === 'both') return true
    if (item.auth === 'logged-in') return isLoggedIn
    if (item.auth === 'logged-out') return !isLoggedIn
    return true
  }

  const isCategoryVisible = (cat: NavCategory) => {
    return cat.items.some(item => isItemVisible(item))
  }

  const handleNavClick = (item: NavItem) => {
    switch (item.action) {
      case 'logout':
        onLogout()
        break
      case 'login':
        onLogin()
        break
      case 'register':
        onRegister()
        break
      case 'account':
        onAccount()
        break
      default:
        onNavigate(item.key)
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="tibia-header sticky top-0 z-50 flex items-center justify-between h-14 px-4">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md tibia-header-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <Swords className="w-7 h-7 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="text-lg font-bold gold-shimmer hidden sm:inline">
              JO Server OT
            </span>
            <span className="text-lg font-bold gold-shimmer sm:hidden">
              JO Server
            </span>
          </button>
        </div>

        {/* Center: Server status indicator */}
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            <span className="text-green-400 font-semibold">{onlineCount}</span>{' '}
            Players Online
          </span>
        </div>

        {/* Right: Auth buttons */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-primary border-primary/30 text-xs"
              >
                <User className="w-3 h-3 mr-1" />
                {accountName || 'Account'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAccount}
                className="h-8 text-xs gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Account</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-8 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogin}
                className="h-8 text-xs gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login</span>
              </Button>
              <Button
                size="sm"
                onClick={onRegister}
                className="h-8 text-xs gap-1 bg-primary text-primary-foreground"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ===== MOBILE SIDEBAR BACKDROP ===== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== BODY: SIDEBAR + CONTENT ===== */}
      <div className="flex flex-1 relative">
        {/* ===== DESKTOP SIDEBAR ===== */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[220px] lg:min-w-[220px] tibia-sidebar border-r border-border/50">
          <SidebarContent
            menuCategories={menuCategories}
            collapsedCategories={collapsedCategories}
            toggleCategory={toggleCategory}
            isItemVisible={isItemVisible}
            isCategoryVisible={isCategoryVisible}
            activeTab={activeTab}
            onNavigate={onNavigate}
            handleNavClick={handleNavClick}
          />
        </aside>

        {/* ===== MOBILE SIDEBAR (overlay) ===== */}
        <aside
          className={`fixed lg:hidden top-14 left-0 bottom-0 w-[260px] z-50 tibia-sidebar-mobile transition-transform duration-300 flex flex-col ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            menuCategories={menuCategories}
            collapsedCategories={collapsedCategories}
            toggleCategory={toggleCategory}
            isItemVisible={isItemVisible}
            isCategoryVisible={isCategoryVisible}
            activeTab={activeTab}
            onNavigate={onNavigate}
            handleNavClick={handleNavClick}
          />
        </aside>

        {/* ===== CONTENT AREA ===== */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="tibia-footer border-t border-border/50 px-4 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary" />
            <span className="gold-shimmer font-semibold">JO Server OT</span>
            <Separator orientation="vertical" className="h-3" />
            <span>MyAAC TibiaCom Template</span>
          </div>
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} JO Server</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Powered by Open Tibia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
