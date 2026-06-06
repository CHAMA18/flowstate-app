'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/stores/auth-store'
import { LandingPage } from '@/components/landing/landing-page'
import { AuthPage } from '@/components/auth/auth-page'
import { PomodoroTimer } from '@/components/productivity/pomodoro-timer'
import { MusicPlayer } from '@/components/productivity/music-player'
import { WorkTracker } from '@/components/productivity/work-tracker'
import { StatsBar } from '@/components/productivity/stats-bar'
import { Button } from '@/components/ui/button'
import {
  Sun, Moon, Zap, Timer, Music, ListTodo, LogOut, User as UserIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AppView = 'landing' | 'auth' | 'app'
type ActivePanel = 'timer' | 'music' | 'tasks'

function useMounted() {
  const [mounted, setMounted] = useState(false)
  if (typeof window !== 'undefined' && !mounted) {
    Promise.resolve().then(() => setMounted(true))
  }
  return mounted
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const { user, initialized, initialize, logout } = useAuthStore()
  const [authViewed, setAuthViewed] = useState(false)
  const [activePanel, setActivePanel] = useState<ActivePanel>('timer')

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = initialize()
    return () => unsubscribe()
  }, [initialize])

  // Derive the current app view from auth state
  // If user is authenticated -> show app
  // If user has clicked "Get Started" -> show auth
  // Otherwise -> show landing page
  const appView: AppView = user ? 'app' : authViewed ? 'auth' : 'landing'

  if (!mounted || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Zap className="w-6 h-6 text-primary animate-pulse" />
          <span className="text-lg font-semibold">FlowState</span>
        </motion.div>
      </div>
    )
  }

  const handleGetStarted = () => setAuthViewed(true)
  const handleBackToHome = () => setAuthViewed(false)
  const handleAuthSuccess = () => {} // Auth state change will trigger re-render
  const handleLogout = async () => {
    await logout()
    setAuthViewed(false)
  }

  return (
    <AnimatePresence mode="wait">
      {/* Landing Page */}
      {appView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingPage onGetStarted={handleGetStarted} />
        </motion.div>
      )}

      {/* Auth Page */}
      {appView === 'auth' && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthPage onBack={handleBackToHome} onSuccess={handleAuthSuccess} />
        </motion.div>
      )}

      {/* Main App */}
      {appView === 'app' && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-background relative overflow-hidden noise-overlay"
        >
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
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
              style={{ background: 'radial-gradient(circle, oklch(0.68 0.20 300 / 4%) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight">FlowState</h1>
                    <p className="text-[10px] text-muted-foreground leading-none -mt-0.5">Deep Focus Productivity</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-muted/30">
                  {([
                    { id: 'timer' as const, icon: <Timer className="w-5 h-5" />, label: 'Timer' },
                    { id: 'music' as const, icon: <Music className="w-5 h-5" />, label: 'Focus Sounds' },
                    { id: 'tasks' as const, icon: <ListTodo className="w-5 h-5" />, label: 'Tasks' },
                  ]).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                        activePanel === item.id
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground/70'
                      )}
                    >
                      {item.icon}
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={resolvedTheme}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>

                {/* User menu */}
                <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l border-border/30">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/30">
                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {user?.displayName || user?.email || 'User'}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main layout */}
            <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
              {/* Desktop: Two-column layout */}
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-6 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <PomodoroTimer />
                </motion.div>
                <div className="mt-8 w-full max-w-md">
                  <StatsBar />
                </div>
              </div>

              <div className="hidden lg:flex w-[380px] flex-col border-l border-border/30">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                    <MusicPlayer />
                  </div>
                  <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                    <WorkTracker />
                  </div>
                </div>
              </div>

              {/* Mobile: Single panel view */}
              <div className="flex-1 lg:hidden overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {activePanel === 'timer' && (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-6 py-4"
                    >
                      <PomodoroTimer />
                      <div className="w-full max-w-sm mt-4">
                        <StatsBar />
                      </div>
                    </motion.div>
                  )}
                  {activePanel === 'music' && (
                    <motion.div
                      key="music"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                        <MusicPlayer />
                      </div>
                    </motion.div>
                  )}
                  {activePanel === 'tasks' && (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
                        <WorkTracker />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden flex items-center justify-around py-2 px-4 border-t border-border/30 bg-background/80 backdrop-blur-lg">
              {([
                { id: 'timer' as const, icon: <Timer className="w-5 h-5" />, label: 'Timer' },
                { id: 'music' as const, icon: <Music className="w-5 h-5" />, label: 'Focus Sounds' },
                { id: 'tasks' as const, icon: <ListTodo className="w-5 h-5" />, label: 'Tasks' },
              ]).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-300',
                    activePanel === item.id ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <motion.div
                    animate={activePanel === item.id ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {activePanel === item.id && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="w-1 h-1 rounded-full bg-primary"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
