'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
import { usePomodoroStore } from '@/stores/pomodoro-store'
import { useSearchStore } from '@/stores/search-store'
import { useTaskStore } from '@/stores/task-store'
import { useQuickCaptureStore } from '@/stores/quick-capture-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useCRMStore } from '@/stores/crm-store'
import { useReflectionStore } from '@/stores/reflection-store'
import { useWaitingForStore } from '@/stores/waiting-for-store'
import { LandingPage } from '@/components/landing/landing-page'
import { AuthPage } from '@/components/auth/auth-page'
import { PomodoroTimer } from '@/components/productivity/pomodoro-timer'
import { MusicPlayer } from '@/components/productivity/music-player'
import { WorkTracker } from '@/components/productivity/work-tracker'
import { DailyDashboard } from '@/components/productivity/daily-dashboard'
import { QuickCapture } from '@/components/productivity/quick-capture'
import { CalendarView } from '@/components/productivity/calendar-view'
import { FocusSessions } from '@/components/productivity/focus-sessions'
import { MeetingNotes } from '@/components/productivity/meeting-notes'
import { RecurringTasks } from '@/components/productivity/recurring-tasks'
import { PersonalCRM } from '@/components/productivity/personal-crm'
import { WaitingForList } from '@/components/productivity/waiting-for'
import { DailyReflection } from '@/components/productivity/daily-reflection'
import { SmartSearch } from '@/components/productivity/smart-search'
import {
  Sun, Moon, Zap, Timer, Music, ListTodo, LogOut, User as UserIcon,
  ChevronLeft, ChevronRight, Flame,
  LayoutDashboard, Lightbulb, Calendar, Target, FileText,
  RefreshCw, Users, Hourglass, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AppView = 'landing' | 'auth' | 'app'
type ActivePanel =
  | 'dashboard' | 'capture' | 'timer' | 'focus' | 'music' | 'tasks'
  | 'calendar' | 'meetings' | 'recurring' | 'crm' | 'waiting' | 'reflection'

interface NavItem {
  id: ActivePanel
  icon: any
  label: string
  shortcut?: string
  section?: string
}

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return mounted
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const { user, initialized, initialize, logout } = useAuthStore()
  const { isRunning, mode, timeLeft, sessionsCompleted } = usePomodoroStore()
  const { setOpen: setSearchOpen } = useSearchStore()
  const [authViewed, setAuthViewed] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const appView: AppView = user ? 'app' : authViewed ? 'auth' : 'landing'

  useEffect(() => {
    const unsubscribe = initialize()
    return () => unsubscribe()
  }, [initialize])

  useEffect(() => {
    if (!showUserMenu) return
    const handler = () => setShowUserMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showUserMenu])

  // Keyboard shortcuts
  useEffect(() => {
    if (appView !== 'app') return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      // Quick capture with 'c'
      if (e.key === 'c') { setActivePanel('capture'); return }
      if (e.key === 'd') { setActivePanel('dashboard'); return }
      if (e.key === 't') { setActivePanel('tasks'); return }
      if (e.key === 'f') { setActivePanel('focus'); return }
      if (e.key === 'r') { setActivePanel('reflection'); return }
      if (e.key === '/') { e.preventDefault(); setSearchOpen(true); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [appView, setSearchOpen])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  if (!mounted || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary animate-pulse" />
          <span className="text-lg font-semibold">FlowState</span>
        </motion.div>
      </div>
    )
  }

  const handleGetStarted = () => setAuthViewed(true)
  const handleBackToHome = () => setAuthViewed(false)
  const handleAuthSuccess = () => {}
  const handleLogout = async () => {
    await logout()
    setAuthViewed(false)
  }

  const navSections = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D' },
        { id: 'capture' as const, icon: Lightbulb, label: 'Quick Capture', shortcut: 'C' },
      ]
    },
    {
      label: 'Focus',
      items: [
        { id: 'focus' as const, icon: Target, label: 'Focus Sessions', shortcut: 'F' },
        { id: 'timer' as const, icon: Timer, label: 'Timer', shortcut: '' },
        { id: 'music' as const, icon: Music, label: 'Sounds', shortcut: '' },
      ]
    },
    {
      label: 'Plan',
      items: [
        { id: 'tasks' as const, icon: ListTodo, label: 'Tasks', shortcut: 'T' },
        { id: 'calendar' as const, icon: Calendar, label: 'Calendar', shortcut: '' },
        { id: 'meetings' as const, icon: FileText, label: 'Meeting Notes', shortcut: '' },
        { id: 'recurring' as const, icon: RefreshCw, label: 'Recurring', shortcut: '' },
      ]
    },
    {
      label: 'Track',
      items: [
        { id: 'crm' as const, icon: Users, label: 'People', shortcut: '' },
        { id: 'waiting' as const, icon: Hourglass, label: 'Waiting For', shortcut: '' },
        { id: 'reflection' as const, icon: Sun, label: 'Reflection', shortcut: 'R' },
      ]
    },
  ]

  const allNavItems = navSections.flatMap(s => s.items)

  const getPanelTitle = () => {
    switch (activePanel) {
      case 'dashboard': return 'Dashboard'
      case 'capture': return 'Quick Capture'
      case 'focus': return 'Focus Sessions'
      case 'timer': return 'Focus Timer'
      case 'music': return 'Ambient Sounds'
      case 'tasks': return 'Task Manager'
      case 'calendar': return 'Calendar'
      case 'meetings': return 'Meeting Notes'
      case 'recurring': return 'Recurring Tasks'
      case 'crm': return 'People CRM'
      case 'waiting': return 'Waiting For'
      case 'reflection': return 'Daily Reflection'
    }
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
        return <DailyDashboard />
      case 'capture':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <QuickCapture />
            </div>
          </div>
        )
      case 'focus':
        return <FocusSessions />
      case 'timer':
        return (
          <div className="h-full flex flex-col items-center justify-center p-6 lg:p-8">
            <PomodoroTimer />
          </div>
        )
      case 'music':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <MusicPlayer />
            </div>
          </div>
        )
      case 'tasks':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <WorkTracker />
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <CalendarView />
            </div>
          </div>
        )
      case 'meetings':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <MeetingNotes />
            </div>
          </div>
        )
      case 'recurring':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <RecurringTasks />
            </div>
          </div>
        )
      case 'crm':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <PersonalCRM />
            </div>
          </div>
        )
      case 'waiting':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <WaitingForList />
            </div>
          </div>
        )
      case 'reflection':
        return (
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-5 border border-border/30">
              <DailyReflection />
            </div>
          </div>
        )
    }
  }

  return (
    <AnimatePresence mode="wait">
      {/* Landing Page */}
      {appView === 'landing' && (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <LandingPage onGetStarted={handleGetStarted} />
        </motion.div>
      )}

      {/* Auth Page */}
      {appView === 'auth' && (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <AuthPage onBack={handleBackToHome} onSuccess={handleAuthSuccess} />
        </motion.div>
      )}

      {/* Main App with Sidebar */}
      {appView === 'app' && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-background relative overflow-hidden noise-overlay"
        >
          {/* Smart Search Overlay */}
          <SmartSearch />

          {/* Background gradient orbs */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
              style={{ background: 'radial-gradient(circle, oklch(0.78 0.16 65 / 8%) 0%, transparent 70%)' }}
              animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(circle, oklch(0.72 0.16 160 / 6%) 0%, transparent 70%)' }}
              animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative z-10 flex h-screen">
            {/* ═══════════════ SIDEBAR ═══════════════ */}
            <motion.aside
              className={cn(
                'relative flex flex-col h-full border-r border-border/30',
                'bg-card/40 backdrop-blur-2xl',
                'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
              )}
              animate={{ width: sidebarCollapsed ? 72 : 260 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Sidebar inner glow line */}
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-transparent to-primary/10" />

              {/* ─── Brand ─── */}
              <div className={cn(
                'flex items-center gap-3 px-4 h-16 border-b border-border/20',
                sidebarCollapsed && 'justify-center px-0'
              )}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <h1 className="text-base font-bold tracking-tight leading-none">FlowState</h1>
                      <p className="text-[9px] text-muted-foreground leading-none mt-0.5 tracking-wide uppercase">Deep Focus</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Mini Timer Display ─── */}
              <div className={cn('px-3 py-3 border-b border-border/15', sidebarCollapsed && 'px-2')}>
                <div className={cn(
                  'relative rounded-xl overflow-hidden',
                  'bg-gradient-to-br from-primary/8 via-primary/5 to-transparent',
                  'border border-primary/15',
                  isRunning && 'border-primary/30',
                  sidebarCollapsed ? 'p-2' : 'p-3'
                )}>
                  {isRunning && (
                    <motion.div className="absolute inset-0 bg-primary/5" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                  )}
                  <div className={cn('relative flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
                    <div className="relative flex-shrink-0">
                      <svg width={sidebarCollapsed ? 36 : 40} height={sidebarCollapsed ? 36 : 40} className="transform -rotate-90">
                        <circle cx={sidebarCollapsed ? 18 : 20} cy={sidebarCollapsed ? 18 : 20} r={sidebarCollapsed ? 14 : 16} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                        <circle cx={sidebarCollapsed ? 18 : 20} cy={sidebarCollapsed ? 18 : 20} r={sidebarCollapsed ? 14 : 16} fill="none" stroke="url(#miniTimerGrad)" strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * (sidebarCollapsed ? 14 : 16)}
                          strokeDashoffset={2 * Math.PI * (sidebarCollapsed ? 14 : 16) * (1 - (mode === 'work' ? 0.65 : mode === 'shortBreak' ? 0.35 : 0.5))}
                        />
                        <defs>
                          <linearGradient id="miniTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="oklch(0.78 0.16 65)" />
                            <stop offset="100%" stopColor="oklch(0.72 0.16 160)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mode === 'work' ? <Flame className="w-3.5 h-3.5 text-amber-500" /> : <Sun className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} className="flex-1 min-w-0">
                          <div className={cn('text-xl font-semibold tabular-nums tracking-tight leading-none', isRunning && 'text-primary')}>{timerDisplay}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-muted-foreground capitalize">{mode === 'work' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                            {sessionsCompleted > 0 && (<><span className="text-[8px] text-muted-foreground/40">·</span><span className="text-[10px] text-amber-500/70">{sessionsCompleted} done</span></>)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ─── Navigation Sections ─── */}
              <nav className="flex-1 px-2 py-2 overflow-y-auto sidebar-nav-scroll">
                {navSections.map((section, si) => (
                  <div key={section.label} className={cn(si > 0 && 'mt-2')}>
                    {!sidebarCollapsed && (
                      <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider px-3 mb-1">{section.label}</p>
                    )}
                    {sidebarCollapsed && si > 0 && <div className="border-t border-border/15 mx-2 my-2" />}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = activePanel === item.id
                        const Icon = item.icon
                        return (
                          <motion.button
                            key={item.id}
                            onClick={() => setActivePanel(item.id)}
                            className={cn(
                              'group relative w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                              sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5',
                              isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                            whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isActive && (
                              <motion.div layoutId="sidebar-active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                            )}
                            <div className={cn('flex items-center justify-center flex-shrink-0 transition-transform duration-200', isActive && 'scale-110')}>
                              <Icon className={cn('transition-colors duration-200', sidebarCollapsed ? 'w-5 h-5' : 'w-[16px] h-[16px]')} />
                            </div>
                            <AnimatePresence>
                              {!sidebarCollapsed && (
                                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }} className="flex-1 flex items-center justify-between min-w-0">
                                  <span className={cn('text-[13px] font-medium truncate', isActive && 'text-primary')}>{item.label}</span>
                                  {item.shortcut && (
                                    <span className={cn('text-[9px] font-mono opacity-0 group-hover:opacity-40 transition-opacity', 'px-1 py-0.5 rounded bg-muted/50')}>
                                      {item.shortcut}
                                    </span>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {sidebarCollapsed && (
                              <div className={cn('absolute left-full ml-2 px-2.5 py-1.5 rounded-lg', 'bg-popover border border-border/50 shadow-lg', 'text-xs font-medium whitespace-nowrap', 'opacity-0 pointer-events-none group-hover:opacity-100', 'transition-opacity duration-150 z-50')}>
                                {item.label}
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* ─── Bottom Section ─── */}
              <div className="border-t border-border/20 px-2 py-2 space-y-0.5">
                {/* Search button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                    sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Search className="w-[16px] h-[16px]" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-[13px] font-medium">Search</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/60">⌘K</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                    sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div key={resolvedTheme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      {resolvedTheme === 'dark' ? <Sun className="w-[16px] h-[16px]" /> : <Moon className="w-[16px] h-[16px]" />}
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="text-[13px] font-medium">
                        {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* User profile */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu) }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                      sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5',
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex-1 flex items-center justify-between min-w-0">
                          <span className="text-xs font-medium truncate max-w-[120px]">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
                          <ChevronRight className={cn('w-3 h-3 transition-transform duration-200', showUserMenu && 'rotate-90')} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'absolute bottom-full mb-1 z-50',
                          sidebarCollapsed ? 'left-full ml-2' : 'left-2 right-2',
                          'bg-popover border border-border/50 rounded-xl shadow-xl overflow-hidden'
                        )}
                      >
                        <div className="px-3 py-2.5 border-b border-border/30">
                          <p className="text-xs font-medium truncate">{user?.displayName || 'User'}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Collapse toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
                    sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-1.5',
                    'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronLeft className="w-[16px] h-[16px]" />
                  </motion.div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="text-xs font-medium">Collapse</motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.aside>

            {/* ═══════════════ MAIN CONTENT ═══════════════ */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Top bar */}
              <header className="flex items-center justify-between px-6 h-14 border-b border-border/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold">{getPanelTitle()}</h2>
                  {activePanel === 'focus' && isRunning && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">In Progress</span>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-xs">Search</span>
                    <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted/50 border border-border/30 hidden md:inline">⌘K</kbd>
                  </button>
                </div>
              </header>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="h-full"
                  >
                    {renderPanel()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mobile bottom navigation */}
              <nav className="lg:hidden flex items-center justify-around py-1.5 px-2 border-t border-border/30 bg-background/80 backdrop-blur-lg flex-shrink-0">
                {[
                  { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
                  { id: 'capture' as const, icon: Lightbulb, label: 'Capture' },
                  { id: 'focus' as const, icon: Target, label: 'Focus' },
                  { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
                  { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
                ].map((item) => {
                  const isActive = activePanel === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-300 relative',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <motion.div animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.2 }}>
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span className="text-[9px] font-medium">{item.label}</span>
                      {isActive && <motion.div layoutId="mobile-nav-indicator" className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" transition={{ type: 'spring', duration: 0.5 }} />}
                    </button>
                  )
                })}
              </nav>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
