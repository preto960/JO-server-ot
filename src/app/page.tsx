'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Shield, Swords, Users, Trophy, Skull, Scroll, Flame, Crown,
  Home, Search, Swords as SwordsIcon, Eye, LogIn, UserPlus,
  Menu, X, LogOut, User, BookOpen, Image, Star, MessageSquare,
  Bug, BarChart3, Gamepad2, Sparkles, ChevronRight, Globe,
  Zap, Heart, Target, ShieldHalf, CircleDot, Anchor, Fish,
  KeyRound, Mail, Plus, Trash2, Loader2, Lock, ArrowLeft, Send, Pin, Settings, LayoutDashboard, RefreshCw, Ban, Newspaper
} from 'lucide-react'
import { VOCATION_NAMES, SKILL_NAMES, GROUP_NAMES, type PageTab } from '@/lib/types'
import { formatNumber } from '@/lib/vocations'
import { TibiaLayout } from '@/components/layout/tibia-layout'

// ====== TYPES ======
interface AccountData {
  id: number; name: string; email: string; type: number;
  premDays: number; coins: number;
  players: { id: number; name: string; level: number; vocation: number; online: boolean }[];
}

interface NewsItem {
  id: number; title: string; body: string; type: number; date: number;
  articleText?: string; articleImage?: string;
}

interface HighscoreEntry {
  id: number; name: string; level: number; vocation: number;
  experience?: number; value?: number; maglevel?: number; rank: number;
  guildMember?: { guild: { name: string } };
}

interface OnlinePlayer {
  id: number; name: string; level: number; vocation: number; online: boolean;
  guildMember?: { guild: { name: string } };
}

interface GuildData {
  id: number; name: string; ownerName: string; creationdate: string;
  motd: string; description: string; memberCount: number;
}

interface MyGuildInfo {
  guildId: number; guildName: string; guildDescription: string; guildMotd: string; guildLogo: string;
  rankId: number; rankName: string; rankLevel: number; nick: string;
  player: { id: number; name: string; level: number; vocation: number; online: boolean };
}

interface PlayerProfile {
  id: number; name: string; level: number; vocation: number;
  experience: number; maglevel: number; sex: number; online: boolean;
  accountId: number;
  account?: { name: string };
  skills: { skillId: number; value: number }[];
  guildMember?: { guild: { name: string; id: number }; rank: { name: string; level: number }; nick?: string };
  deaths: { id: number; date: string; level: number }[];
}

interface SpellData {
  id: number; name: string; words: string; category: number; type: number;
  level: number; maglevel: number; mana: number; vocation: string;
}

interface CreatureData {
  id: number; name: string; exp: number; health: number; mana: number;
  speedLvl: number; race: string; attackable: boolean; hostile: boolean;
}

interface BanData {
  id: number; type: number; value: string; active: boolean;
  expires: number; added: number; reason: string; by: string;
}

interface ForumBoardData {
  id: number; name: string; description: string; threadCount: number;
  closed: boolean; hidden: boolean;
}

interface ForumThreadData {
  id: number; topic: string; section: number; authorAid: number; authorGuid: number;
  author: string; replies: number; views: number; postDate: number; sticked: boolean; closed: boolean;
}

interface ForumPostData {
  id: number; postText: string; authorAid: number; authorGuid: number;
  author: string; player: { name: string; level: number; vocation: number } | null;
  postDate: number; isEdited: boolean; editDate: number; postHtml: boolean;
}

interface ForumThreadDetail {
  id: number; postTopic: string; section: number; authorAid: number; authorGuid: number;
  author: string; replies: number; views: number; postDate: number; sticked: boolean; closed: boolean;
  posts: ForumPostData[];
}

// ====== SKILL ICONS ======
const skillIcons: Record<number, React.ReactNode> = {
  0: <Swords className="w-4 h-4" />,
  1: <SwordsIcon className="w-4 h-4" />,
  2: <Swords className="w-4 h-4" />,
  3: <Swords className="w-4 h-4" />,
  4: <Target className="w-4 h-4" />,
  5: <Shield className="w-4 h-4" />,
  6: <Fish className="w-4 h-4" />,
  7: <Sparkles className="w-4 h-4" />,
}

// ====== MAIN COMPONENT ======
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<PageTab>('home')
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(false)

  // Data states
  const [news, setNews] = useState<NewsItem[]>([])
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([])
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [guilds, setGuilds] = useState<GuildData[]>([])
  const [spells, setSpells] = useState<SpellData[]>([])
  const [creatures, setCreatures] = useState<CreatureData[]>([])
  const [bans, setBans] = useState<BanData[]>([])
  const [forumBoards, setForumBoards] = useState<ForumBoardData[]>([])
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null)
  const [guildDetail, setGuildDetail] = useState<any>(null)
  const [myGuilds, setMyGuilds] = useState<MyGuildInfo[]>([])

  // Guild management states
  const [showCreateGuild, setShowCreateGuild] = useState(false)
  const [createGuildForm, setCreateGuildForm] = useState({ name: '', description: '' })
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [invitePlayerName, setInvitePlayerName] = useState('')
  const [inviteGuildId, setInviteGuildId] = useState(0)
  const [showEditGuildDialog, setShowEditGuildDialog] = useState(false)
  const [editGuildForm, setEditGuildForm] = useState({ guildId: 0, motd: '', description: '' })
  const [guildActionLoading, setGuildActionLoading] = useState(false)

  // Content page states
  const [contentPage, setContentPage] = useState<{ id: number; name: string; title: string; body: string; date: number } | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  // Admin states
  const [adminStats, setAdminStats] = useState<any>(null)
  const [adminStatsLoading, setAdminStatsLoading] = useState(false)
  const [adminPlayerSearch, setAdminPlayerSearch] = useState('')
  const [adminPlayers, setAdminPlayers] = useState<any[]>([])
  const [adminPlayersLoading, setAdminPlayersLoading] = useState(false)
  const [adminNews, setAdminNews] = useState<any[]>([])
  const [adminNewsLoading, setAdminNewsLoading] = useState(false)

  // Forum states
  const [selectedBoard, setSelectedBoard] = useState<ForumBoardData | null>(null)
  const [forumThreads, setForumThreads] = useState<ForumThreadData[]>([])
  const [forumPage, setForumPage] = useState(1)
  const [forumTotalPages, setForumTotalPages] = useState(1)
  const [selectedThread, setSelectedThread] = useState<ForumThreadDetail | null>(null)
  const [newThreadForm, setNewThreadForm] = useState({ topic: '', content: '' })
  const [newReplyForm, setNewReplyForm] = useState({ content: '' })
  const [forumLoading, setForumLoading] = useState(false)

  // Filter states
  const [hsSkill, setHsSkill] = useState('0')
  const [hsVocation, setHsVocation] = useState('0')
  const [searchName, setSearchName] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Account management states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [emailForm, setEmailForm] = useState({ newEmail: '' })
  const [createCharForm, setCreateCharForm] = useState({ name: '', vocation: '0', sex: '0' })
  const [showCreateCharDialog, setShowCreateCharDialog] = useState(false)
  const [accountActionLoading, setAccountActionLoading] = useState(false)
  const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Bug tracker states
  const [bugsList, setBugsList] = useState<any[]>([])
  const [bugDetail, setBugDetail] = useState<any>(null)
  const [bugsLoading, setBugsLoading] = useState(false)
  const [bugForm, setBugForm] = useState({ subject: '', text: '', type: '0' })
  const [bugSubmitting, setBugSubmitting] = useState(false)
  const [bugStatusFilter, setBugStatusFilter] = useState<string>('all')

  // Changelog states
  const [changelogData, setChangelogData] = useState<any[]>([])
  const [changelogLoading, setChangelogLoading] = useState(false)

  // Gallery states
  const [galleryData, setGalleryData] = useState<any[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)

  // Polls states
  const [activePoll, setActivePoll] = useState<any>(null)
  const [pollLoading, setPollLoading] = useState(false)
  const [pollVoting, setPollVoting] = useState(false)

  // Last kills states
  const [lastKills, setLastKills] = useState<any[]>([])
  const [lastKillsLoading, setLastKillsLoading] = useState(false)

  // News archive states
  const [newsArchive, setNewsArchive] = useState<any[]>([])
  const [newsArchiveLoading, setNewsArchiveLoading] = useState(false)
  const [newsArchivePage, setNewsArchivePage] = useState(1)
  const [newsArchiveTotalPages, setNewsArchiveTotalPages] = useState(1)
  const [expandedNewsId, setExpandedNewsId] = useState<number | null>(null)

  // Fetch functions
  const fetchJSON = useCallback(async (url: string) => {
    try {
      const res = await fetch(url)
      const data = await res.json()
      return data
    } catch { return { success: false, error: 'Error de conexión' } }
  }, [])

  // Load initial data
  useEffect(() => {
    fetchJSON('/api/news?type=1&limit=5').then(d => d.success && setNews(d.data))
    fetchJSON('/api/online').then(d => { if (d.success) { setOnlinePlayers(d.data.players); setOnlineCount(d.data.count) } })
    fetchJSON('/api/guilds').then(d => d.success && setGuilds(d.data))
    fetchJSON('/api/spells').then(d => d.success && setSpells(d.data))
    fetchJSON('/api/creatures').then(d => d.success && setCreatures(d.data))
    fetchJSON('/api/bans').then(d => d.success && setBans(d.data))
    fetchJSON('/api/forum/boards').then(d => d.success && setForumBoards(d.data))
    fetchJSON('/api/auth/me').then(d => { if (d.success) setAccount(d.data) })
  }, [fetchJSON])

  // Load my guilds when account changes
  useEffect(() => {
    if (account) {
      fetchJSON('/api/guilds/my').then(d => {
        if (d.success) setMyGuilds(d.data || [])
      })
    } else {
      setMyGuilds([])
    }
  }, [account, fetchJSON])

  // Load content page when a content tab is activated
  const contentTabMap: Record<string, string> = {
    'rules': 'rules',
    'faq': 'faq',
    'server-info': 'serverinfo',
    'commands': 'commands',
    'team': 'team',
    'houses': 'houses',
  }

  useEffect(() => {
    const contentType = contentTabMap[activeTab]
    if (contentType) {
      setContentLoading(true)
      setContentError(null)
      fetchJSON(`/api/content?type=${contentType}`).then(d => {
        if (d.success) {
          setContentPage(d.data)
        } else {
          setContentError(d.error || 'Error al cargar el contenido.')
        }
        setContentLoading(false)
      })
    }
  }, [activeTab, fetchJSON])

  // Load admin stats when admin tab is activated
  useEffect(() => {
    if (activeTab === 'admin' && account && account.type >= 4) {
      setAdminStatsLoading(true)
      fetchJSON('/api/admin/stats').then(d => {
        if (d.success) setAdminStats(d.data)
        setAdminStatsLoading(false)
      })
      setAdminNewsLoading(true)
      fetchJSON('/api/admin/news?limit=10').then(d => {
        if (d.success) setAdminNews(d.data)
        setAdminNewsLoading(false)
      })
    }
  }, [activeTab, account, fetchJSON])

  // Load highscores when skill/vocation changes
  useEffect(() => {
    if (activeTab === 'highscores') {
      setLoading(true)
      fetchJSON(`/api/highscores?skill=${hsSkill}&vocation=${hsVocation}&limit=25`).then(d => {
        if (d.success) setHighscores(d.data)
        setLoading(false)
      })
    }
  }, [activeTab, hsSkill, hsVocation, fetchJSON])

  // Load bugs when bugs tab is activated
  useEffect(() => {
    if (activeTab === 'bugs') {
      setBugsLoading(true)
      const statusParam = bugStatusFilter === 'all' ? '' : `?status=${bugStatusFilter}`
      fetchJSON(`/api/bugs${statusParam}`).then(d => {
        if (d.success) setBugsList(d.data)
        setBugsLoading(false)
      })
    }
  }, [activeTab, bugStatusFilter, fetchJSON])

  // Load changelog when changelog tab is activated
  useEffect(() => {
    if (activeTab === 'changelog') {
      setChangelogLoading(true)
      fetchJSON('/api/changelog').then(d => {
        if (d.success) setChangelogData(d.data)
        setChangelogLoading(false)
      })
    }
  }, [activeTab, fetchJSON])

  // Load gallery when gallery tab is activated
  useEffect(() => {
    if (activeTab === 'gallery') {
      setGalleryLoading(true)
      fetchJSON('/api/gallery').then(d => {
        if (d.success) setGalleryData(d.data)
        setGalleryLoading(false)
      })
    }
  }, [activeTab, fetchJSON])

  // Load poll when polls tab is activated
  useEffect(() => {
    if (activeTab === 'polls') {
      setPollLoading(true)
      fetchJSON('/api/polls').then(d => {
        if (d.success) setActivePoll(d.data)
        setPollLoading(false)
      })
    }
  }, [activeTab, fetchJSON])

  // Load last kills when last-kills tab is activated
  useEffect(() => {
    if (activeTab === 'last-kills') {
      setLastKillsLoading(true)
      fetchJSON('/api/lastkills').then(d => {
        if (d.success) setLastKills(d.data)
        setLastKillsLoading(false)
      })
    }
  }, [activeTab, fetchJSON])

  // Load news archive when news-archive tab is activated
  useEffect(() => {
    if (activeTab === 'news-archive') {
      setNewsArchiveLoading(true)
      fetchJSON(`/api/news/archive?page=${newsArchivePage}&limit=20`).then(d => {
        if (d.success) {
          setNewsArchive(d.data)
          setNewsArchiveTotalPages(d.pagination?.totalPages || 1)
        }
        setNewsArchiveLoading(false)
      })
    }
  }, [activeTab, newsArchivePage, fetchJSON])

  // Auth handlers
  const handleLogin = async () => {
    setMessage(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    })
    const data = await res.json()
    if (data.success) { setAccount(data.data); setActiveTab('home'); setMessage({ type: 'success', text: '¡Bienvenido!' }) }
    else setMessage({ type: 'error', text: data.error })
  }

  const handleRegister = async () => {
    setMessage(null)
    if (registerForm.password !== registerForm.confirm) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' }); return
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: registerForm.name, email: registerForm.email, password: registerForm.password }),
    })
    const data = await res.json()
    if (data.success) { setMessage({ type: 'success', text: '¡Cuenta creada! Ya puedes iniciar sesión.' }); setActiveTab('login') }
    else setMessage({ type: 'error', text: data.error })
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAccount(null); setActiveTab('home')
    setMessage({ type: 'success', text: 'Sesión cerrada.' })
  }

  const searchPlayer = async () => {
    if (!searchName.trim()) return
    setLoading(true)
    const d = await fetchJSON(`/api/players/lookup?name=${encodeURIComponent(searchName)}`)
    if (d.success) { setPlayerProfile(d.data); setActiveTab('characters') }
    else setMessage({ type: 'error', text: d.error })
    setLoading(false)
  }

  const viewGuild = async (name: string) => {
    setLoading(true)
    const d = await fetchJSON(`/api/guilds/lookup?name=${encodeURIComponent(name)}`)
    if (d.success) { setGuildDetail(d.data); setActiveTab('guilds') }
    setLoading(false)
  }

  // ====== GUILD MANAGEMENT HANDLERS ======
  const handleCreateGuild = async () => {
    if (!createGuildForm.name.trim() || createGuildForm.name.trim().length < 3) {
      setMessage({ type: 'error', text: 'El nombre debe tener al menos 3 caracteres.' }); return
    }
    setGuildActionLoading(true)
    try {
      const res = await fetch('/api/guilds/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createGuildForm.name.trim(), description: createGuildForm.description }),
      })
      const d = await res.json()
      if (d.success) {
        setMessage({ type: 'success', text: '¡Guild creada exitosamente!' })
        setShowCreateGuild(false)
        setCreateGuildForm({ name: '', description: '' })
        // Refresh guilds list and my guilds
        fetchJSON('/api/guilds').then(r => r.success && setGuilds(r.data))
        fetchJSON('/api/guilds/my').then(r => r.success && setMyGuilds(r.data || []))
      } else {
        setMessage({ type: 'error', text: d.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setGuildActionLoading(false)
  }

  const handleInvitePlayer = async () => {
    if (!invitePlayerName.trim()) {
      setMessage({ type: 'error', text: 'Ingresa el nombre del jugador.' }); return
    }
    setGuildActionLoading(true)
    try {
      const res = await fetch('/api/guilds/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: inviteGuildId, playerName: invitePlayerName.trim() }),
      })
      const d = await res.json()
      if (d.success) {
        setMessage({ type: 'success', text: d.message })
        setShowInviteDialog(false)
        setInvitePlayerName('')
        setInviteGuildId(0)
        // Refresh guild detail
        if (guildDetail) {
          const gd = await fetchJSON(`/api/guilds/lookup?name=${encodeURIComponent(guildDetail.name)}`)
          if (gd.success) setGuildDetail(gd.data)
        }
      } else {
        setMessage({ type: 'error', text: d.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setGuildActionLoading(false)
  }

  const handleLeaveGuild = async (guildId: number) => {
    if (!confirm('¿Estás seguro de que quieres abandonar la guild?')) return
    setGuildActionLoading(true)
    try {
      const res = await fetch('/api/guilds/leave', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId }),
      })
      const d = await res.json()
      if (d.success) {
        setMessage({ type: 'success', text: d.message })
        setGuildDetail(null)
        // Refresh
        fetchJSON('/api/guilds').then(r => r.success && setGuilds(r.data))
        fetchJSON('/api/guilds/my').then(r => r.success && setMyGuilds(r.data || []))
      } else {
        setMessage({ type: 'error', text: d.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setGuildActionLoading(false)
  }

  const handleKickMember = async (guildId: number, playerId: number, playerName: string) => {
    if (!confirm(`¿Estás seguro de que quieres expulsar a "${playerName}" de la guild?`)) return
    setGuildActionLoading(true)
    try {
      const res = await fetch('/api/guilds/kick', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId, playerId }),
      })
      const d = await res.json()
      if (d.success) {
        setMessage({ type: 'success', text: d.message })
        // Refresh guild detail
        if (guildDetail) {
          const gd = await fetchJSON(`/api/guilds/lookup?name=${encodeURIComponent(guildDetail.name)}`)
          if (gd.success) setGuildDetail(gd.data)
        }
      } else {
        setMessage({ type: 'error', text: d.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setGuildActionLoading(false)
  }

  const handleUpdateGuild = async () => {
    if (!editGuildForm.guildId) return
    setGuildActionLoading(true)
    try {
      const res = await fetch('/api/guilds/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: editGuildForm.guildId,
          motd: editGuildForm.motd,
          description: editGuildForm.description,
        }),
      })
      const d = await res.json()
      if (d.success) {
        setMessage({ type: 'success', text: d.message })
        setShowEditGuildDialog(false)
        // Refresh guild detail
        if (guildDetail) {
          const gd = await fetchJSON(`/api/guilds/lookup?name=${encodeURIComponent(guildDetail.name)}`)
          if (gd.success) setGuildDetail(gd.data)
        }
        // Refresh my guilds
        fetchJSON('/api/guilds/my').then(r => r.success && setMyGuilds(r.data || []))
      } else {
        setMessage({ type: 'error', text: d.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setGuildActionLoading(false)
  }

  const openEditGuildDialog = (guildId: number, currentMotd: string, currentDescription: string) => {
    setEditGuildForm({ guildId, motd: currentMotd || '', description: currentDescription || '' })
    setShowEditGuildDialog(true)
  }

  const openInviteDialog = (guildId: number) => {
    setInviteGuildId(guildId)
    setInvitePlayerName('')
    setShowInviteDialog(true)
  }

  // Helper: check if current user is leader/vice of a specific guild
  const getUserGuildRole = (guildId: number): number => {
    const membership = myGuilds.find(m => m.guildId === guildId)
    if (!membership) return 0 // not a member
    return membership.rankLevel // 1=leader, 2=vice, 3=member
  }

  // ====== FORUM HANDLERS ======
  const openBoard = async (board: ForumBoardData) => {
    setSelectedBoard(board)
    setSelectedThread(null)
    setNewThreadForm({ topic: '', content: '' })
    setNewReplyForm({ content: '' })
    setForumLoading(true)
    setForumPage(1)
    const d = await fetchJSON(`/api/forum/threads?boardId=${board.id}&page=1&limit=20`)
    if (d.success) {
      setForumThreads(d.data)
      setForumTotalPages(d.pagination?.totalPages || 1)
    } else {
      setMessage({ type: 'error', text: d.error || 'Error al cargar hilos.' })
    }
    setForumLoading(false)
  }

  const changeForumPage = async (page: number) => {
    if (!selectedBoard) return
    setForumPage(page)
    setForumLoading(true)
    const d = await fetchJSON(`/api/forum/threads?boardId=${selectedBoard.id}&page=${page}&limit=20`)
    if (d.success) {
      setForumThreads(d.data)
      setForumTotalPages(d.pagination?.totalPages || 1)
    }
    setForumLoading(false)
  }

  const openThread = async (threadId: number) => {
    setForumLoading(true)
    setSelectedThread(null)
    setNewReplyForm({ content: '' })
    const d = await fetchJSON(`/api/forum/thread/${threadId}`)
    if (d.success) {
      setSelectedThread(d.data)
    } else {
      setMessage({ type: 'error', text: d.error || 'Error al cargar hilo.' })
    }
    setForumLoading(false)
  }

  const goBackToBoards = () => {
    setSelectedBoard(null)
    setSelectedThread(null)
    setForumThreads([])
    setForumPage(1)
    setForumTotalPages(1)
    setNewThreadForm({ topic: '', content: '' })
    setNewReplyForm({ content: '' })
  }

  const goBackToThreads = () => {
    const board = selectedBoard
    setSelectedThread(null)
    setNewReplyForm({ content: '' })
    if (board) openBoard(board)
  }

  const handleCreateThread = async () => {
    if (!selectedBoard || !account) return
    if (!newThreadForm.topic.trim() || !newThreadForm.content.trim()) {
      setMessage({ type: 'error', text: 'El tema y el contenido son requeridos.' })
      return
    }
    setForumLoading(true)
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoard.id,
          topic: newThreadForm.topic,
          content: newThreadForm.content,
        }),
      })
      const d = await res.json()
      if (d.success) {
        setNewThreadForm({ topic: '', content: '' })
        setMessage({ type: 'success', text: '¡Hilo creado exitosamente!' })
        openBoard(selectedBoard)
      } else {
        setMessage({ type: 'error', text: d.error || 'Error al crear hilo.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setForumLoading(false)
  }

  const handleReply = async () => {
    if (!selectedThread || !account) return
    if (!newReplyForm.content.trim()) {
      setMessage({ type: 'error', text: 'El contenido no puede estar vacío.' })
      return
    }
    setForumLoading(true)
    try {
      const res = await fetch('/api/forum/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newReplyForm.content,
        }),
      })
      const d = await res.json()
      if (d.success) {
        setNewReplyForm({ content: '' })
        setMessage({ type: 'success', text: '¡Respuesta publicada!' })
        openThread(selectedThread.id)
      } else {
        setMessage({ type: 'error', text: d.error || 'Error al responder.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión.' })
    }
    setForumLoading(false)
  }

  // ====== ACCOUNT MANAGEMENT HANDLERS ======
  const handleChangePassword = async () => {
    setAccountMessage(null)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAccountMessage({ type: 'error', text: 'Las contraseñas no coinciden.' }); return
    }
    if (passwordForm.newPassword.length < 6) {
      setAccountMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' }); return
    }
    setAccountActionLoading(true)
    const res = await fetch('/api/account/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
    })
    const data = await res.json()
    if (data.success) {
      setAccountMessage({ type: 'success', text: data.message })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      setAccountMessage({ type: 'error', text: data.error })
    }
    setAccountActionLoading(false)
  }

  const handleChangeEmail = async () => {
    setAccountMessage(null)
    if (!emailForm.newEmail.trim() || !emailForm.newEmail.includes('@')) {
      setAccountMessage({ type: 'error', text: 'Email inválido.' }); return
    }
    setAccountActionLoading(true)
    const res = await fetch('/api/account/change-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: emailForm.newEmail }),
    })
    const data = await res.json()
    if (data.success) {
      setAccountMessage({ type: 'success', text: data.message })
      setEmailForm({ newEmail: '' })
      // Refresh account data
      const meData = await fetchJSON('/api/auth/me')
      if (meData.success) setAccount(meData.data)
    } else {
      setAccountMessage({ type: 'error', text: data.error })
    }
    setAccountActionLoading(false)
  }

  const handleCreateCharacter = async () => {
    setAccountMessage(null)
    if (!createCharForm.name.trim() || createCharForm.name.length < 3) {
      setAccountMessage({ type: 'error', text: 'El nombre debe tener al menos 3 caracteres.' }); return
    }
    setAccountActionLoading(true)
    const res = await fetch('/api/account/create-character', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: createCharForm.name, vocation: parseInt(createCharForm.vocation), sex: parseInt(createCharForm.sex) }),
    })
    const data = await res.json()
    if (data.success) {
      setAccountMessage({ type: 'success', text: data.message })
      setCreateCharForm({ name: '', vocation: '0', sex: '0' })
      setShowCreateCharDialog(false)
      // Refresh account data
      const meData = await fetchJSON('/api/auth/me')
      if (meData.success) setAccount(meData.data)
    } else {
      setAccountMessage({ type: 'error', text: data.error })
    }
    setAccountActionLoading(false)
  }

  const handleDeleteCharacter = async (characterId: number, charName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${charName}"? El personaje será eliminado en 7 días.`)) return
    setAccountMessage(null)
    setAccountActionLoading(true)
    const res = await fetch('/api/account/delete-character', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId }),
    })
    const data = await res.json()
    if (data.success) {
      setAccountMessage({ type: 'success', text: data.message })
      // Refresh account data
      const meData = await fetchJSON('/api/auth/me')
      if (meData.success) setAccount(meData.data)
    } else {
      setAccountMessage({ type: 'error', text: data.error })
    }
    setAccountActionLoading(false)
  }

  // ====== BUG TRACKER HANDLERS ======
  const handleCreateBug = async () => {
    if (!account) return
    if (!bugForm.subject.trim() || !bugForm.text.trim()) {
      setMessage({ type: 'error', text: 'El asunto y la descripción son requeridos.' }); return
    }
    setBugSubmitting(true)
    try {
      const res = await fetch('/api/bugs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: bugForm.subject, text: bugForm.text, type: parseInt(bugForm.type) }),
      })
      const data = await res.json()
      if (data.success) {
        setBugForm({ subject: '', text: '', type: '0' })
        setMessage({ type: 'success', text: '¡Bug reportado exitosamente!' })
        // Refresh bugs list
        const statusParam = bugStatusFilter === 'all' ? '' : `?status=${bugStatusFilter}`
        fetchJSON(`/api/bugs${statusParam}`).then(d => { if (d.success) setBugsList(d.data) })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch { setMessage({ type: 'error', text: 'Error de conexión.' }) }
    setBugSubmitting(false)
  }

  const handleViewBug = async (bugId: number) => {
    setBugsLoading(true)
    const d = await fetchJSON(`/api/bugs/${bugId}`)
    if (d.success) setBugDetail(d.data)
    else setMessage({ type: 'error', text: d.error })
    setBugsLoading(false)
  }

  const handleVotePoll = async (pollId: number, answerId: number) => {
    if (typeof window === 'undefined') return
    const votedKey = `poll_voted_${pollId}`
    if (sessionStorage.getItem(votedKey)) {
      setMessage({ type: 'error', text: 'Ya has votado en esta encuesta.' }); return
    }
    setPollVoting(true)
    try {
      const res = await fetch('/api/polls', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, answerId }),
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem(votedKey, 'true')
        setMessage({ type: 'success', text: '¡Voto registrado!' })
        // Refresh poll data
        fetchJSON('/api/polls').then(d => { if (d.success) setActivePoll(d.data) })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch { setMessage({ type: 'error', text: 'Error de conexión.' }) }
    setPollVoting(false)
  }

  return (
    <TibiaLayout
      activeTab={activeTab}
      onNavigate={(tab) => setActiveTab(tab as PageTab)}
      isLoggedIn={!!account}
      accountName={account?.name}
      onLogin={() => setActiveTab('login')}
      onRegister={() => setActiveTab('register')}
      onAccount={() => setActiveTab('account')}
      onLogout={handleLogout}
      onlineCount={onlineCount}
    >

        {/* Message banner */}
        {message && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-md text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-900/50 text-green-300 border border-green-500/20'
                : 'bg-red-900/50 text-red-300 border border-red-500/20'
            }`}
          >
            {message.text}
            <button className="ml-4 underline opacity-70 hover:opacity-100" onClick={() => setMessage(null)}>
              Dismiss
            </button>
          </div>
        )}

        {/* ===== HOME TAB ===== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <Card className="overflow-hidden bg-gradient-to-r from-card via-secondary to-card border-primary/20">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 gold-shimmer">JO Server OT</h1>
                  <p className="text-muted-foreground mb-4 text-lg">
                    Servidor Open Tibia con el mejor gameplay y comunidad. ¡Únete a la aventura!
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setActiveTab('register')} className="bg-primary text-primary-foreground gap-2">
                      <UserPlus className="w-4 h-4" /> Crear Cuenta
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('highscores')} className="gap-2 border-primary/30 text-primary">
                      <Trophy className="w-4 h-4" /> Rankings
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-center">
                  <div className="bg-background/50 rounded-lg p-4 border border-border">
                    <div className="text-3xl font-bold text-primary">{onlineCount}</div>
                    <div className="text-sm text-muted-foreground">Jugadores Online</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 border border-border">
                    <div className="text-3xl font-bold text-green-400">Online</div>
                    <div className="text-sm text-muted-foreground">Estado del Servidor</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* News */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Star className="text-primary" /> Últimas Noticias</h2>
                {news.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">No hay noticias aún.</CardContent></Card>
                ) : news.map((item) => (
                  <Card key={item.id} className="card-hover border-border hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">{new Date(item.date * 1000).toLocaleDateString('es-ES')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3">{item.body || item.articleText || 'Sin contenido.'}</p>
                      <Button variant="link" className="text-primary p-0 h-auto mt-2 text-sm">
                        Leer más <ChevronRight className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Online Players Widget */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Globe className="text-green-400" /> Jugadores Online</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-3">{onlineCount} jugadores</div>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {onlinePlayers.slice(0, 15).map(p => (
                          <button key={p.id} onClick={() => { setSearchName(p.name); searchPlayer() }}
                            className="w-full flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-accent transition-colors text-left">
                            <span>{p.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Lv {p.level}</span>
                              <span className={`w-2 h-2 rounded-full ${p.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                            </div>
                          </button>
                        ))}
                        {onlinePlayers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nadie conectado.</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Top Players Widget */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Trophy className="text-primary" /> Top Jugadores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {highscores.slice(0, 10).map((p, i) => (
                          <button key={p.id} onClick={() => { setSearchName(p.name); searchPlayer() }}
                            className="w-full flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-accent transition-colors text-left">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 text-center font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                              <span>{p.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{VOCATION_NAMES[p.vocation]}</Badge>
                              <span className="text-xs font-mono">{p.level}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Guilds Widget */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Crown className="text-primary" /> Guilds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {guilds.slice(0, 10).map(g => (
                          <button key={g.id} onClick={() => viewGuild(g.name)}
                            className="w-full flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-accent transition-colors text-left">
                            <span className="font-medium">{g.name}</span>
                            <Badge variant="outline" className="text-xs">{g.memberCount} miembros</Badge>
                          </button>
                        ))}
                        {guilds.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay guilds.</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===== HIGHSCORES TAB ===== */}
        {activeTab === 'highscores' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-primary" /> Rankings</h2>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Habilidad</label>
                    <Select value={hsSkill} onValueChange={setHsSkill}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Experiencia</SelectItem>
                        <SelectItem value="7">Nivel Mágico</SelectItem>
                        <SelectItem value="1">Maza</SelectItem>
                        <SelectItem value="2">Espada</SelectItem>
                        <SelectItem value="3">Hacha</SelectItem>
                        <SelectItem value="4">Distancia</SelectItem>
                        <SelectItem value="5">Escudo</SelectItem>
                        <SelectItem value="6">Pesca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Vocación</label>
                    <Select value={hsVocation} onValueChange={setHsVocation}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Todas</SelectItem>
                        <SelectItem value="1">Hechicero</SelectItem>
                        <SelectItem value="2">Druida</SelectItem>
                        <SelectItem value="3">Paladín</SelectItem>
                        <SelectItem value="4">Caballero</SelectItem>
                        <SelectItem value="5">Maestro Hechicero</SelectItem>
                        <SelectItem value="6">Druida Mayor</SelectItem>
                        <SelectItem value="7">Paladín Real</SelectItem>
                        <SelectItem value="8">Caballero Élite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Cargando rankings...</CardContent></Card>
            ) : (
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">#</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vocación</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">{hsSkill === '0' ? 'Nivel' : SKILL_NAMES[parseInt(hsSkill)]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highscores.map((p, i) => (
                          <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                            onClick={() => { setSearchName(p.name); searchPlayer() }}>
                            <td className="p-3 text-sm font-bold">{i < 3 ? <span className="text-primary">{i + 1}</span> : i + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{p.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                                <span className="font-medium text-sm">{p.name}</span>
                                {p.guildMember?.guild && <Badge variant="outline" className="text-xs">{p.guildMember.guild.name}</Badge>}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{VOCATION_NAMES[p.vocation]}</td>
                            <td className="p-3 text-sm text-right font-mono font-bold">
                              {hsSkill === '0' ? p.level : (p.value || p.maglevel || 0)}
                            </td>
                          </tr>
                        ))}
                        {highscores.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No hay datos.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== ONLINE TAB ===== */}
        {activeTab === 'online' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="text-green-400" /> Jugadores Online
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{onlineCount} conectados</Badge>
            </h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nivel</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Vocación</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Guild</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onlinePlayers.map(p => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                          onClick={() => { setSearchName(p.name); searchPlayer() }}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="font-medium text-sm">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm font-mono">{p.level}</td>
                          <td className="p-3 text-sm text-muted-foreground">{VOCATION_NAMES[p.vocation]}</td>
                          <td className="p-3 text-sm text-muted-foreground">{p.guildMember?.guild?.name || '-'}</td>
                        </tr>
                      ))}
                      {onlinePlayers.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nadie está conectado ahora mismo.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CHARACTERS TAB ===== */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-primary" /> Buscar Personaje</h2>
            <div className="flex gap-2">
              <Input placeholder="Nombre del personaje..." value={searchName}
                onChange={e => setSearchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchPlayer()}
                className="max-w-md" />
              <Button onClick={searchPlayer} className="gap-2 bg-primary text-primary-foreground">
                <Search className="w-4 h-4" /> Buscar
              </Button>
            </div>

            {playerProfile && (
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                        {playerProfile.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{playerProfile.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{VOCATION_NAMES[playerProfile.vocation]}</Badge>
                        <Badge variant="outline">Nivel {playerProfile.level}</Badge>
                        <span className={`w-2 h-2 rounded-full ${playerProfile.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                        <span className="text-sm text-muted-foreground">{playerProfile.online ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{playerProfile.level}</div>
                      <div className="text-xs text-muted-foreground">Nivel</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{playerProfile.maglevel}</div>
                      <div className="text-xs text-muted-foreground">Magic Level</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{formatNumber(playerProfile.experience)}</div>
                      <div className="text-xs text-muted-foreground">Experiencia</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{playerProfile.sex === 0 ? 'Masculino' : 'Femenino'}</div>
                      <div className="text-xs text-muted-foreground">Sexo</div>
                    </div>
                  </div>

                  {/* Guild info */}
                  {playerProfile.guildMember && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Guild</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <Crown className="w-3 h-3 mr-1" /> {playerProfile.guildMember.guild.name}
                        </Badge>
                        <Badge variant="outline">{playerProfile.guildMember.rank.name}</Badge>
                        {playerProfile.guildMember.nick && (
                          <span className="text-sm text-muted-foreground">&quot;{playerProfile.guildMember.nick}&quot;</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Habilidades</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {playerProfile.skills.map(s => (
                      <div key={s.skillId} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2">
                        {skillIcons[s.skillId] || <Swords className="w-4 h-4" />}
                        <div>
                          <div className="text-xs text-muted-foreground">{SKILL_NAMES[s.skillId]}</div>
                          <div className="text-sm font-bold">{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Deaths */}
                  {playerProfile.deaths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Últimas Muertes</h3>
                      <div className="space-y-1">
                        {playerProfile.deaths.slice(0, 5).map(d => (
                          <div key={d.id} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Skull className="w-3 h-3 text-red-400" />
                            Murió en nivel <span className="text-red-400 font-medium">{d.level}</span> el {new Date(d.date).toLocaleDateString('es-ES')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!playerProfile && !loading && (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                Busca un personaje para ver su perfil.
              </CardContent></Card>
            )}
          </div>
        )}

        {/* ===== GUILDS TAB ===== */}
        {activeTab === 'guilds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Crown className="text-primary" /> Guilds</h2>
              {account && (
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setShowCreateGuild(true)}>
                  <Plus className="w-4 h-4" /> Crear Guild
                </Button>
              )}
            </div>

            {/* My Guilds Section */}
            {account && myGuilds.length > 0 && !guildDetail && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Mis Guilds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myGuilds.map((mg, idx) => (
                    <Card key={`${mg.guildId}-${mg.player.id}`} className="border-primary/20 bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors"
                      onClick={() => viewGuild(mg.guildName)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{mg.guildName}</h4>
                            <p className="text-xs text-muted-foreground">{mg.player.name} — <Badge variant="outline" className="text-xs py-0">{mg.rankName}</Badge></p>
                          </div>
                        </div>
                        {mg.guildMotd && (
                          <p className="text-xs text-muted-foreground italic line-clamp-1">"{mg.guildMotd}"</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No guild prompt for logged-in users */}
            {account && myGuilds.length === 0 && !guildDetail && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <p className="text-muted-foreground mb-3">No perteneces a ninguna guild.</p>
                  <Button className="gap-2 bg-primary text-primary-foreground" onClick={() => setShowCreateGuild(true)}>
                    <Plus className="w-4 h-4" /> Crear tu Guild
                  </Button>
                </CardContent>
              </Card>
            )}

            {guildDetail ? (
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{guildDetail.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const userRole = getUserGuildRole(guildDetail.id)
                        if (userRole === 1 || userRole === 2) {
                          return (
                            <>
                              <Button variant="outline" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); openEditGuildDialog(guildDetail.id, guildDetail.motd, guildDetail.description) }}>
                                <Settings className="w-3 h-3" /> Editar
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); openInviteDialog(guildDetail.id) }}>
                                <UserPlus className="w-3 h-3" /> Invitar
                              </Button>
                            </>
                          )
                        }
                        return null
                      })()}
                      <Button variant="ghost" size="sm" onClick={() => setGuildDetail(null)}>Volver</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{guildDetail.description || 'Sin descripción.'}</p>
                  {guildDetail.motd && (
                    <div className="bg-secondary/30 rounded-lg p-3 mb-4">
                      <span className="text-xs text-muted-foreground">MOTD: </span>
                      <span className="text-sm">{guildDetail.motd}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Miembros ({guildDetail.members?.length || 0})</h3>
                    {(() => {
                      const userRole = getUserGuildRole(guildDetail.id)
                      if (userRole > 0) {
                        return (
                          <Button variant="destructive" size="sm" className="gap-1 text-xs" onClick={() => handleLeaveGuild(guildDetail.id)} disabled={guildActionLoading}>
                            <LogOut className="w-3 h-3" /> Abandonar Guild
                          </Button>
                        )
                      }
                      return null
                    })()}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nombre</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Rango</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nivel</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Vocación</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Estado</th>
                          {(() => {
                            const userRole = getUserGuildRole(guildDetail.id)
                            if (userRole === 1 || userRole === 2) {
                              return <th className="text-right p-2 text-xs font-medium text-muted-foreground">Acción</th>
                            }
                            return null
                          })()}
                        </tr>
                      </thead>
                      <tbody>
                        {guildDetail.members?.map((m: any) => (
                          <tr key={m.player_id} className="border-b border-border/50 hover:bg-accent/30">
                            <td className="p-2 text-sm font-medium">{m.player?.name}{m.nick ? <span className="text-muted-foreground italic ml-1">"{m.nick}"</span> : ''}</td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {m.rank?.level === 1 && <span className="text-primary font-medium">{m.rank?.name}</span>}
                              {m.rank?.level === 2 && <span className="text-yellow-500 font-medium">{m.rank?.name}</span>}
                              {m.rank?.level && m.rank.level >= 3 && m.rank?.name}
                            </td>
                            <td className="p-2 text-sm font-mono">{m.player?.level}</td>
                            <td className="p-2 text-sm text-muted-foreground">{VOCATION_NAMES[m.player?.vocation]}</td>
                            <td className="p-2"><span className={`w-2 h-2 rounded-full inline-block ${m.player?.online ? 'bg-green-500' : 'bg-gray-600'}`} /></td>
                            {(() => {
                              const userRole = getUserGuildRole(guildDetail.id)
                              if (userRole === 1 || userRole === 2) {
                                if (m.rank?.level === 1) {
                                  return <td className="p-2 text-right text-xs text-muted-foreground">—</td>
                                }
                                // Cannot kick own account characters
                                const isOwnPlayer = account?.players?.some((p: any) => p.id === m.player_id)
                                if (isOwnPlayer) {
                                  return <td className="p-2 text-right text-xs text-muted-foreground">—</td>
                                }
                                return (
                                  <td className="p-2 text-right">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      onClick={() => handleKickMember(guildDetail.id, m.player_id, m.player?.name)}
                                      disabled={guildActionLoading}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </td>
                                )
                              }
                              return null
                            })()}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">Todas las Guilds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guilds.map(g => (
                    <Card key={g.id} className="card-hover border-border hover:border-primary/30 cursor-pointer"
                      onClick={() => viewGuild(g.name)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold">{g.name}</h3>
                            <p className="text-xs text-muted-foreground">Fundada por {g.ownerName}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto">{g.memberCount} miembros</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{g.description || 'Sin descripción.'}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {guilds.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-muted-foreground col-span-2">No hay guilds creadas.</CardContent></Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Guild Dialog */}
        <Dialog open={showCreateGuild} onOpenChange={setShowCreateGuild}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-primary" /> Crear Nueva Guild</DialogTitle>
              <DialogDescription>Completa los datos para crear tu guild.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="guild-name">Nombre</Label>
                <Input id="guild-name" placeholder="Nombre de la guild (3-30 caracteres)" value={createGuildForm.name}
                  onChange={(e) => setCreateGuildForm({ ...createGuildForm, name: e.target.value })} maxLength={30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guild-desc">Descripción</Label>
                <Textarea id="guild-desc" placeholder="Describe tu guild..." value={createGuildForm.description}
                  onChange={(e) => setCreateGuildForm({ ...createGuildForm, description: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setShowCreateGuild(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleCreateGuild} disabled={guildActionLoading}>
                {guildActionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Crear Guild
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Player Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Invitar Jugador</DialogTitle>
              <DialogDescription>Ingresa el nombre del jugador que deseas añadir a la guild.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nombre del Jugador</Label>
                <Input id="invite-name" placeholder="Nombre del personaje" value={invitePlayerName}
                  onChange={(e) => setInvitePlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvitePlayer()} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleInvitePlayer} disabled={guildActionLoading}>
                {guildActionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Invitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Guild Dialog */}
        <Dialog open={showEditGuildDialog} onOpenChange={setShowEditGuildDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Editar Guild</DialogTitle>
              <DialogDescription>Modifica la información de la guild.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-motd">MOTD (Mensaje del día)</Label>
                <Input id="edit-motd" placeholder="Mensaje del día" value={editGuildForm.motd}
                  onChange={(e) => setEditGuildForm({ ...editGuildForm, motd: e.target.value })} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Textarea id="edit-desc" placeholder="Descripción de la guild" value={editGuildForm.description}
                  onChange={(e) => setEditGuildForm({ ...editGuildForm, description: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setShowEditGuildDialog(false)}>Cancelar</Button>
              <Button className="bg-primary text-primary-foreground" onClick={handleUpdateGuild} disabled={guildActionLoading}>
                {guildActionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== SPELLS TAB ===== */}
        {activeTab === 'spells' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Scroll className="text-primary" /> Hechizos</h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Palabras</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nivel</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">ML</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Maná</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spells.map(s => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="p-3 text-sm font-medium text-primary">{s.name}</td>
                          <td className="p-3 text-sm font-mono text-muted-foreground">{s.words}</td>
                          <td className="p-3 text-sm font-mono">{s.level}</td>
                          <td className="p-3 text-sm font-mono">{s.maglevel}</td>
                          <td className="p-3 text-sm font-mono">{s.mana}</td>
                        </tr>
                      ))}
                      {spells.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay hechizos.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== CREATURES TAB ===== */}
        {activeTab === 'creatures' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Skull className="text-primary" /> Criaturas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creatures.map(c => (
                <Card key={c.id} className="card-hover border-border hover:border-primary/30">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{c.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">HP</span><span className="font-mono">{formatNumber(c.health)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Exp</span><span className="font-mono text-primary">{formatNumber(c.exp)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Raza</span><span>{c.race || 'Unknown'}</span></div>
                      <div className="flex gap-1 mt-2">
                        {c.hostile && <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">Hostil</Badge>}
                        {c.attackable && <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">Atacable</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {creatures.length === 0 && (
                <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No hay criaturas.</CardContent></Card>
              )}
            </div>
          </div>
        )}

        {/* ===== BANS TAB ===== */}
        {activeTab === 'bans' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-destructive" /> Lista de Bans</h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Razón</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Por</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bans.map(b => (
                        <tr key={b.id} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="p-3"><Badge variant="destructive" className="text-xs">Ban #{b.type}</Badge></td>
                          <td className="p-3 text-sm font-mono">{b.value}</td>
                          <td className="p-3 text-sm">{b.reason || '-'}</td>
                          <td className="p-3 text-sm text-muted-foreground">{b.by}</td>
                          <td className="p-3 text-sm text-muted-foreground">{b.added ? new Date(b.added * 1000).toLocaleDateString('es-ES') : '-'}</td>
                        </tr>
                      ))}
                      {bans.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay bans activos.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== FORUM TAB ===== */}
        {activeTab === 'forum' && (
          <div className="space-y-4">

            {/* ===== FORUM VIEW: BOARD LIST ===== */}
            {!selectedBoard && !selectedThread && (
              <>
                <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="text-primary" /> Foro</h2>
                <div className="space-y-3">
                  {forumBoards.map(b => (
                    <Card key={b.id} className="card-hover border-border hover:border-primary/30 cursor-pointer"
                      onClick={() => openBoard(b)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold">{b.name}</h3>
                            <p className="text-sm text-muted-foreground">{b.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {b.closed && <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" />Cerrado</Badge>}
                          <Badge variant="outline" className="text-xs">{b.threadCount} temas</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {forumBoards.length === 0 && (
                    <Card><CardContent className="p-8 text-center text-muted-foreground">No hay secciones del foro.</CardContent></Card>
                  )}
                </div>
              </>
            )}

            {/* ===== FORUM VIEW: THREAD LIST ===== */}
            {selectedBoard && !selectedThread && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={goBackToBoards} className="gap-1">
                      <ArrowLeft className="w-4 h-4" /> Volver
                    </Button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare className="text-primary" /> {selectedBoard.name}
                    </h2>
                  </div>
                  {account && !selectedBoard.closed && (
                    <Button size="sm" className="gap-1 bg-primary text-primary-foreground"
                      onClick={() => setNewThreadForm({ topic: '', content: '' })}>
                      <Plus className="w-4 h-4" /> Nuevo Hilo
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{selectedBoard.description}</p>

                {/* New Thread Form */}
                {account && !selectedBoard.closed && newThreadForm.topic !== undefined && (
                  <Card className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Crear Nuevo Hilo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Tema del hilo..."
                        value={newThreadForm.topic}
                        onChange={e => setNewThreadForm({ ...newThreadForm, topic: e.target.value })}
                      />
                      <Textarea
                        placeholder="Escribe tu mensaje..."
                        value={newThreadForm.content}
                        onChange={e => setNewThreadForm({ ...newThreadForm, content: e.target.value })}
                        rows={4}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm"
                          onClick={() => setNewThreadForm({ topic: '', content: '' })}>Cancelar</Button>
                        <Button size="sm" className="gap-1 bg-primary text-primary-foreground"
                          onClick={handleCreateThread} disabled={forumLoading}>
                          {forumLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Publicar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Thread List */}
                {forumLoading ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando hilos...
                  </CardContent></Card>
                ) : (
                  <Card className="border-border">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-secondary/30">
                              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tema</th>
                              <th className="text-left p-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">Autor</th>
                              <th className="text-center p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Respuestas</th>
                              <th className="text-center p-3 text-sm font-medium text-muted-foreground hidden md:table-cell">Vistas</th>
                              <th className="text-right p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forumThreads.map(t => (
                              <tr key={t.id}
                                className={`border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors ${t.sticked ? 'bg-secondary/10' : ''}`}
                                onClick={() => openThread(t.id)}>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {t.sticked && <Pin className="w-3 h-3 text-primary shrink-0" />}
                                    {t.closed && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                                    <span className="font-medium text-sm">{t.topic || 'Sin título'}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{t.author}</td>
                                <td className="p-3 text-sm text-center text-muted-foreground hidden md:table-cell">{t.replies}</td>
                                <td className="p-3 text-sm text-center text-muted-foreground hidden md:table-cell">{t.views}</td>
                                <td className="p-3 text-sm text-right text-muted-foreground whitespace-nowrap">
                                  {t.postDate ? new Date(t.postDate * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                                </td>
                              </tr>
                            ))}
                            {forumThreads.length === 0 && (
                              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay hilos en esta sección.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination */}
                {forumTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={forumPage <= 1}
                      onClick={() => changeForumPage(forumPage - 1)}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">Página {forumPage} de {forumTotalPages}</span>
                    <Button variant="outline" size="sm" disabled={forumPage >= forumTotalPages}
                      onClick={() => changeForumPage(forumPage + 1)}>Siguiente</Button>
                  </div>
                )}
              </>
            )}

            {/* ===== FORUM VIEW: THREAD DETAIL ===== */}
            {selectedThread && selectedBoard && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={goBackToThreads} className="gap-1">
                      <ArrowLeft className="w-4 h-4" /> Volver a {selectedBoard.name}
                    </Button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {selectedThread.sticked && <Pin className="w-4 h-4 text-primary" />}
                      {selectedThread.closed && <Lock className="w-4 h-4 text-muted-foreground" />}
                      {selectedThread.postTopic || 'Sin título'}
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedThread.views} vistas · {selectedThread.replies} respuestas
                  </Badge>
                </div>

                {/* Posts */}
                {forumLoading ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando hilo...
                  </CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {selectedThread.posts.map((post, idx) => (
                      <Card key={post.id} className={`border-border ${idx === 0 ? 'border-primary/20' : ''}`}>
                        <CardContent className="p-4">
                          {/* Post header */}
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                {post.author.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm">{post.author}</span>
                                {post.player && (
                                  <Badge variant="outline" className="text-xs">
                                    {VOCATION_NAMES[post.player.vocation]} · Lv {post.player.level}
                                  </Badge>
                                )}
                                {idx === 0 && <Badge variant="outline" className="text-xs text-primary border-primary/30">OP</Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {post.postDate ? new Date(post.postDate * 1000).toLocaleString('es-ES') : ''}
                                {post.isEdited && post.editDate > 0 && (
                                  <span className="ml-2">· Editado: {new Date(post.editDate * 1000).toLocaleString('es-ES')}</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Post body */}
                          <div className="ml-0 sm:ml-[52px]">
                            <div className="text-sm whitespace-pre-wrap break-words bg-secondary/20 rounded-lg p-3">
                              {post.postText}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {selectedThread.posts.length === 0 && (
                      <Card><CardContent className="p-8 text-center text-muted-foreground">No hay posts.</CardContent></Card>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {account && !selectedThread.closed && (
                  <Card className="border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" /> Responder
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={newReplyForm.content}
                        onChange={e => setNewReplyForm({ content: e.target.value })}
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button size="sm" className="gap-1 bg-primary text-primary-foreground"
                          onClick={handleReply} disabled={forumLoading || !newReplyForm.content.trim()}>
                          {forumLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Enviar Respuesta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!account && (
                  <Card className="border-border">
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      <a className="text-primary hover:underline cursor-pointer" onClick={() => setActiveTab('login')}>
                        Inicia sesión
                      </a> para responder en el foro.
                    </CardContent>
                  </Card>
                )}

                {selectedThread.closed && (
                  <Card className="border-border">
                    <CardContent className="p-4 text-center text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 inline-block mr-1" /> Este hilo está cerrado. No se pueden agregar más respuestas.
                    </CardContent>
                  </Card>
                )}
              </>
            )}

          </div>
        )}

        {/* ===== LOGIN TAB ===== */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto space-y-4">
            <Card className="border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2"><LogIn className="text-primary" /> Iniciar Sesión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email o Nombre</label>
                  <Input placeholder="tu@email.com" value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Contraseña</label>
                  <Input type="password" placeholder="••••••••" value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground">Iniciar Sesión</Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button className="text-primary underline" onClick={() => setActiveTab('register')}>Regístrate</button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== REGISTER TAB ===== */}
        {activeTab === 'register' && (
          <div className="max-w-md mx-auto space-y-4">
            <Card className="border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2"><UserPlus className="text-primary" /> Crear Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Nombre de Cuenta</label>
                  <Input placeholder="MiNombreOT" value={registerForm.name}
                    onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" placeholder="tu@email.com" value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Contraseña</label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Confirmar Contraseña</label>
                  <Input type="password" placeholder="Repite tu contraseña" value={registerForm.confirm}
                    onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                </div>
                <Button onClick={handleRegister} className="w-full bg-primary text-primary-foreground">Crear Cuenta</Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <button className="text-primary underline" onClick={() => setActiveTab('login')}>Inicia sesión</button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== ACCOUNT TAB ===== */}
        {activeTab === 'account' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!account ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                Debes iniciar sesión para ver tu cuenta.
                <Button className="ml-3" onClick={() => setActiveTab('login')}>Login</Button>
              </CardContent></Card>
            ) : (
              <>
                {/* Account Message */}
                {accountMessage && (
                  <div className={`rounded-lg p-3 text-sm font-medium ${
                    accountMessage.type === 'success' 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  }`}>
                    {accountMessage.text}
                  </div>
                )}

                {/* Account Info */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="text-primary" /> Información de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Nombre</div>
                        <div className="font-bold">{account.name}</div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-bold">{account.email}</div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Tipo</div>
                        <div className="font-bold">{GROUP_NAMES[account.type] || 'Jugador'}</div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">Días Premium</div>
                        <div className="font-bold">{account.premDays}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><KeyRound className="text-primary" /> Cambiar Contraseña</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1">Contraseña Actual</Label>
                      <Input type="password" placeholder="••••••••" value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1">Nueva Contraseña</Label>
                      <Input type="password" placeholder="Mínimo 6 caracteres" value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1">Confirmar Nueva Contraseña</Label>
                      <Input type="password" placeholder="Repite la nueva contraseña" value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
                    </div>
                    <Button onClick={handleChangePassword} disabled={accountActionLoading} className="bg-primary text-primary-foreground">
                      {accountActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      Cambiar Contraseña
                    </Button>
                  </CardContent>
                </Card>

                {/* Change Email */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Mail className="text-primary" /> Cambiar Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-1">Nuevo Email</Label>
                      <Input type="email" placeholder="nuevo@email.com" value={emailForm.newEmail}
                        onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleChangeEmail()} />
                    </div>
                    <Button onClick={handleChangeEmail} disabled={accountActionLoading} className="bg-primary text-primary-foreground">
                      {accountActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                      Cambiar Email
                    </Button>
                  </CardContent>
                </Card>

                {/* My Characters */}
                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2"><Users className="text-primary" /> Mis Personajes</CardTitle>
                    <Button size="sm" onClick={() => { setShowCreateCharDialog(true); setAccountMessage(null) }}
                      className="bg-primary text-primary-foreground">
                      <Plus className="w-4 h-4 mr-1" /> Crear Personaje
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {account.players.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
                            onClick={() => { setSearchName(p.name); searchPlayer() }}>
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className="text-sm bg-primary/10 text-primary">{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{VOCATION_NAMES[p.vocation]}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline">Lv {p.level}</Badge>
                            <span className={`w-2 h-2 rounded-full ${p.online ? 'bg-green-500' : 'bg-gray-600'}`} />
                            <button
                              className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                              onClick={() => handleDeleteCharacter(p.id, p.name)}
                              title="Eliminar personaje"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {account.players.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No tienes personajes. ¡Crea uno!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Create Character Dialog */}
                <Dialog open={showCreateCharDialog} onOpenChange={setShowCreateCharDialog}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Plus className="text-primary" /> Crear Personaje</DialogTitle>
                      <DialogDescription>Elige el nombre, vocación y sexo de tu nuevo personaje.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1">Nombre del Personaje</Label>
                        <Input placeholder="Nombre (3-25 caracteres)" value={createCharForm.name}
                          onChange={e => setCreateCharForm({ ...createCharForm, name: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleCreateCharacter()} />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1">Vocación</Label>
                        <Select value={createCharForm.vocation} onValueChange={v => setCreateCharForm({ ...createCharForm, vocation: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(VOCATION_NAMES).map(([id, name]) => (
                              <SelectItem key={id} value={id}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1">Sexo</Label>
                        <Select value={createCharForm.sex} onValueChange={v => setCreateCharForm({ ...createCharForm, sex: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Masculino</SelectItem>
                            <SelectItem value="1">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateCharDialog(false)}>Cancelar</Button>
                      <Button onClick={handleCreateCharacter} disabled={accountActionLoading} className="bg-primary text-primary-foreground">
                        {accountActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Crear Personaje
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        )}

        {/* ===== RULES / FAQ / CONTENT TABS ===== */}
        {(activeTab === 'rules' || activeTab === 'faq' || activeTab === 'server-info' || activeTab === 'commands' || activeTab === 'team' || activeTab === 'houses') && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="text-primary" /> {contentPage?.title || activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/-/g, ' ')}
            </h2>
            {contentLoading && (
              <Card className="border-border">
                <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-3" /> Cargando contenido...
                </CardContent>
              </Card>
            )}
            {contentError && !contentLoading && (
              <Card className="border-border">
                <CardContent className="p-8 text-center text-red-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Error al cargar</p>
                  <p className="text-sm text-muted-foreground">{contentError}</p>
                  <Button variant="outline" className="mt-4" onClick={() => setContentError(null)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
                  </Button>
                </CardContent>
              </Card>
            )}
            {contentPage && !contentLoading && !contentError && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <div
                    className="prose prose-invert max-w-none [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-6 [&_h3]:mb-3 [&_h3:first-child]:mt-0 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_b]:text-foreground [&_br]:block [&_br]:content-['']"
                    dangerouslySetInnerHTML={{ __html: contentPage.body }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== GALLERY TAB ===== */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Image className="text-primary" /> Galería
            </h2>
            {galleryLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando galería...
              </CardContent></Card>
            ) : galleryData.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay imágenes en la galería.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryData.map((img: any) => (
                  <Card key={img.id} className="border-border card-hover overflow-hidden">
                    <div className="aspect-video bg-secondary/30 flex items-center justify-center">
                      {img.image ? (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                      ) : (
                        <Image className="w-12 h-12 text-muted-foreground/30" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-1">{img.comment || 'Sin descripción'}</p>
                      <p className="text-xs text-muted-foreground">Por {img.author || 'Anónimo'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CHANGELOG TAB ===== */}
        {activeTab === 'changelog' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="text-primary" /> Registro de Cambios
            </h2>
            {changelogLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando changelog...
              </CardContent></Card>
            ) : changelogData.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay cambios registrados.</CardContent></Card>
            ) : (
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {changelogData.map((entry: any) => (
                      <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-accent/20 transition-colors">
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.type === 1 ? 'bg-green-500' : entry.type === 2 ? 'bg-red-500' : entry.type === 3 ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <div className="w-px h-8 bg-border" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={
                              entry.type === 1 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              entry.type === 2 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              entry.type === 3 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }>{entry.typeLabel}</Badge>
                            <Badge variant="outline" className="text-xs">{entry.whereLabel}</Badge>
                          </div>
                          <p className="text-sm">{entry.body}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(entry.date * 1000).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== POLLS TAB ===== */}
        {activeTab === 'polls' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="text-primary" /> Encuestas
            </h2>
            {pollLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando encuesta...
              </CardContent></Card>
            ) : !activePoll ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay encuestas activas en este momento.</CardContent></Card>
            ) : (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl">{activePoll.question}</CardTitle>
                  {activePoll.description && (
                    <p className="text-sm text-muted-foreground">{activePoll.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {activePoll.pollAnswers && activePoll.pollAnswers.map((answer: any) => {
                    const percentage = activePoll.votesAll > 0 ? Math.round((answer.votes / activePoll.votesAll) * 100) : 0
                    const hasVoted = typeof window !== 'undefined' && sessionStorage.getItem(`poll_voted_${activePoll.id}`)
                    return (
                      <div key={answer.answerId} className="relative">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{answer.answer}</span>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">{answer.votes} votos</span>
                                <Badge variant="outline" className="text-xs">{percentage}%</Badge>
                              </div>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                          {!hasVoted && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                              disabled={pollVoting}
                              onClick={() => handleVotePoll(activePoll.id, answer.answerId)}
                            >
                              Votar
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-2 text-sm text-muted-foreground">
                    Total de votos: <span className="font-bold text-foreground">{activePoll.votesAll}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== LAST KILLS TAB ===== */}
        {activeTab === 'last-kills' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Skull className="text-red-400" /> Últimas Muertes
            </h2>
            {lastKillsLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando muertes...
              </CardContent></Card>
            ) : lastKills.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay muertes registradas.</CardContent></Card>
            ) : (
              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Jugador</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nivel</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastKills.map((kill: any) => (
                          <tr key={kill.id} className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                            onClick={() => { setSearchName(kill.playerName); searchPlayer() }}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Skull className="w-4 h-4 text-red-400" />
                                <span className="font-medium text-sm">{kill.playerName}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm font-mono text-red-400">{kill.level}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {new Date(kill.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===== NEWS ARCHIVE TAB ===== */}
        {activeTab === 'news-archive' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="text-primary" /> Archivo de Noticias
            </h2>
            {newsArchiveLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando noticias...
              </CardContent></Card>
            ) : newsArchive.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay noticias.</CardContent></Card>
            ) : (
              <>
                <div className="space-y-3">
                  {newsArchive.map((item: any) => (
                    <Card key={item.id} className="border-border card-hover">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${item.type === 1 ? 'border-green-500/30 text-green-400' : item.type === 2 ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400'}`}>
                              {item.type === 1 ? 'Noticia' : item.type === 2 ? 'Ticker' : 'Artículo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.date * 1000).toLocaleDateString('es-ES')}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {expandedNewsId === item.id ? (
                          <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.body || item.articleText || '' }} />
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {(item.body || item.articleText || 'Sin contenido.').substring(0, 150)}
                            {(item.body || item.articleText || '').length > 150 && '...'}
                          </p>
                        )}
                        <Button variant="link" className="text-primary p-0 h-auto mt-1 text-sm"
                          onClick={() => setExpandedNewsId(expandedNewsId === item.id ? null : item.id)}>
                          {expandedNewsId === item.id ? 'Ver menos' : 'Leer más'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {newsArchiveTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={newsArchivePage <= 1}
                      onClick={() => setNewsArchivePage(p => p - 1)}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">Página {newsArchivePage} de {newsArchiveTotalPages}</span>
                    <Button variant="outline" size="sm" disabled={newsArchivePage >= newsArchiveTotalPages}
                      onClick={() => setNewsArchivePage(p => p + 1)}>Siguiente</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== BUGS TAB ===== */}
        {activeTab === 'bugs' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bug className="text-primary" /> Bug Tracker
            </h2>

            {/* Report Bug Form */}
            {account && (
              <Card className="border-border border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> Reportar Bug / Sugerencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input placeholder="Asunto" value={bugForm.subject}
                      onChange={e => setBugForm(f => ({ ...f, subject: e.target.value }))} />
                    <Select value={bugForm.type} onValueChange={v => setBugForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">🐛 Bug</SelectItem>
                        <SelectItem value="1">💡 Sugerencia</SelectItem>
                        <SelectItem value="2">💭 Idea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea placeholder="Describe el bug o sugerencia en detalle..." rows={3}
                    value={bugForm.text} onChange={e => setBugForm(f => ({ ...f, text: e.target.value }))} />
                  <Button onClick={handleCreateBug} disabled={bugSubmitting || !bugForm.subject.trim() || !bugForm.text.trim()}
                    className="bg-primary text-primary-foreground gap-2">
                    {bugSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {bugSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!account && (
              <Card className="border-border">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  <Lock className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  Inicia sesión para reportar bugs o sugerencias.
                </CardContent>
              </Card>
            )}

            {/* Status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtrar:</span>
              {[
                { key: 'all', label: 'Todos' },
                { key: '0', label: 'Abiertos' },
                { key: '1', label: 'En Progreso' },
                { key: '2', label: 'Resueltos' },
                { key: '3', label: 'Rechazados' },
              ].map(f => (
                <Button key={f.key} variant={bugStatusFilter === f.key ? 'secondary' : 'ghost'} size="sm"
                  onClick={() => setBugStatusFilter(f.key)} className="text-xs">
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Bug list */}
            {bugsLoading ? (
              <Card><CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
              </CardContent></Card>
            ) : bugsList.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No hay bugs reportados.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {bugsList.map((bug: any) => (
                  <Card key={bug.id} className="border-border card-hover cursor-pointer"
                    onClick={() => handleViewBug(bug.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{bug.subject}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${bug.type === 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : bug.type === 1 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
                            {bug.type === 0 ? 'Bug' : bug.type === 1 ? 'Sugerencia' : 'Idea'}
                          </Badge>
                          <Badge className={`text-xs ${
                            bug.status === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            bug.status === 1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            bug.status === 2 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {bug.status === 0 ? 'Abierto' : bug.status === 1 ? 'En Progreso' : bug.status === 2 ? 'Resuelto' : 'Rechazado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Por {bug.account}</span>
                        <span>{new Date(bug.date).toLocaleDateString('es-ES')}</span>
                        {bug.reply > 0 && <span>{bug.reply} respuestas</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Bug detail dialog */}
            {bugDetail && (
              <Dialog open={!!bugDetail} onOpenChange={() => setBugDetail(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg">{bugDetail.subject}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${bugDetail.type === 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : bugDetail.type === 1 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
                        {bugDetail.type === 0 ? 'Bug' : bugDetail.type === 1 ? 'Sugerencia' : 'Idea'}
                      </Badge>
                      <Badge className={`text-xs ${
                        bugDetail.status === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        bugDetail.status === 1 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        bugDetail.status === 2 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {bugDetail.status === 0 ? 'Abierto' : bugDetail.status === 1 ? 'En Progreso' : bugDetail.status === 2 ? 'Resuelto' : 'Rechazado'}
                      </Badge>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <p className="text-sm">{bugDetail.text}</p>
                    <Separator />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Reportado por: <strong className="text-foreground">{bugDetail.account}</strong></span>
                      <span>Fecha: {new Date(bugDetail.date).toLocaleDateString('es-ES')}</span>
                      {bugDetail.reply > 0 && <span>Respuestas: {bugDetail.reply}</span>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBugDetail(null)}>Cerrar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* ===== ADMIN TAB ===== */}
        {activeTab === 'admin' && account && account.type >= 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="text-primary" /> Panel de Administración
            </h2>

            {/* Stats Grid */}
            {adminStatsLoading ? (
              <Card className="border-border">
                <CardContent className="p-8 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-3" /> Cargando estadísticas...
                </CardContent>
              </Card>
            ) : adminStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{adminStats.totalAccounts}</p>
                    <p className="text-xs text-muted-foreground">Cuentas</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{adminStats.totalPlayers}</p>
                    <p className="text-xs text-muted-foreground">Personajes</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold">{adminStats.onlineCount}</p>
                    <p className="text-xs text-muted-foreground">En línea</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{adminStats.totalGuilds}</p>
                    <p className="text-xs text-muted-foreground">Guilds</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Newspaper className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{adminStats.totalNews}</p>
                    <p className="text-xs text-muted-foreground">Noticias</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{adminStats.totalThreads}</p>
                    <p className="text-xs text-muted-foreground">Temas Foro</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <Ban className="w-6 h-6 mx-auto mb-2 text-red-400" />
                    <p className="text-2xl font-bold">{adminStats.totalBans}</p>
                    <p className="text-xs text-muted-foreground">Bans Activos</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Admin Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* News Management */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" /> Gestión de Noticias
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {adminNewsLoading ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
                    </div>
                  ) : adminNews.length > 0 ? (
                    <div className="space-y-2">
                      {adminNews.map((n: any) => (
                        <div key={n.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {n.date ? new Date(n.date * 1000).toLocaleDateString('es-ES') : 'N/A'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">ID: {n.id}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay noticias.</p>
                  )}
                </CardContent>
              </Card>

              {/* Player Search */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" /> Buscar Jugadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del jugador..."
                      value={adminPlayerSearch}
                      onChange={e => setAdminPlayerSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setAdminPlayersLoading(true)
                          fetchJSON(`/api/admin/players?search=${encodeURIComponent(adminPlayerSearch)}&limit=20`).then(d => {
                            if (d.success) setAdminPlayers(d.data)
                            setAdminPlayersLoading(false)
                          })
                        }
                      }}
                    />
                    <Button variant="secondary" onClick={() => {
                      setAdminPlayersLoading(true)
                      fetchJSON(`/api/admin/players?search=${encodeURIComponent(adminPlayerSearch)}&limit=20`).then(d => {
                        if (d.success) setAdminPlayers(d.data)
                        setAdminPlayersLoading(false)
                      })
                    }}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {adminPlayersLoading ? (
                      <div className="flex items-center justify-center py-4 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Buscando...
                      </div>
                    ) : adminPlayers.length > 0 ? (
                      <div className="space-y-2">
                        {adminPlayers.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full ${p.online ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {VOCATION_NAMES[p.vocation] || 'N/A'} — Lv. {p.level}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {p.group_id > 1 && (
                                <Badge variant="outline" className="text-xs">{GROUP_NAMES[p.group_id] || 'Staff'}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : adminPlayerSearch ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No se encontraron jugadores.</p>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Escribe un nombre para buscar.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bans Management */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-400" /> Bans Activos
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-72 overflow-y-auto">
                {bans.length > 0 ? (
                  <div className="space-y-2">
                    {bans.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{b.value}</p>
                          <p className="text-xs text-muted-foreground">{b.reason}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="destructive" className="text-xs">{b.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={async () => {
                              if (confirm(`¿Desactivar ban #${b.id}?`)) {
                                const res = await fetch(`/api/admin/bans?id=${b.id}`, { method: 'DELETE' })
                                const data = await res.json()
                                if (data.success) {
                                  fetchJSON('/api/bans').then(d => d.success && setBans(d.data))
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay bans activos.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

    </TibiaLayout>
  )
}
