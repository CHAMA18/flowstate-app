'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore, TimerMode } from '@/stores/pomodoro-store'
import { Play, Pause, RotateCcw, Settings, Coffee, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MODE_CONFIG: Record<TimerMode, { label: string; icon: React.ReactNode; gradient: string; bgGlow: string }> = {
  work: {
    label: 'Focus',
    icon: <Briefcase className="w-4 h-4" />,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGlow: 'oklch(0.78 0.16 65 / 15%)',
  },
  shortBreak: {
    label: 'Short Break',
    icon: <Coffee className="w-4 h-4" />,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    bgGlow: 'oklch(0.72 0.16 160 / 15%)',
  },
  longBreak: {
    label: 'Long Break',
    icon: <Clock className="w-4 h-4" />,
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    bgGlow: 'oklch(0.68 0.20 300 / 15%)',
  },
}

export function PomodoroTimer() {
  const {
    mode, timeLeft, totalTime, isRunning, sessionsCompleted,
    start, pause, reset, tick, setMode, settings, updateSettings,
  } = usePomodoroStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playCompletionSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (e) {
      // Audio not available
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const completed = tick()
        if (completed) {
          playCompletionSound()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick, playCompletionSound])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0
  const config = MODE_CONFIG[mode]

  const circumference = 2 * Math.PI * 140
  const strokeDashoffset = circumference * (1 - progress)

  const radius = 140
  const strokeWidth = 8
  const center = radius + strokeWidth
  const svgSize = (radius + strokeWidth) * 2

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* Ambient background glow */}
      <motion.div
        className="absolute inset-0 -m-8 rounded-3xl opacity-40 pointer-events-none"
        style={{ background: config.bgGlow, filter: 'blur(60px)' }}
        animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 backdrop-blur-sm relative z-10">
        {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
              mode === m
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground/80'
            )}
          >
            {MODE_CONFIG[m].icon}
            <span className="hidden sm:inline">{MODE_CONFIG[m].label}</span>
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 0 20px var(--ring))' }}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />

          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.78 0.16 65)" />
              <stop offset="50%" stopColor="oklch(0.72 0.16 160)" />
              <stop offset="100%" stopColor="oklch(0.68 0.20 300)" />
            </linearGradient>
          </defs>

          {/* Tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6) * (Math.PI / 180)
            const isMajor = i % 5 === 0
            const innerR = radius - (isMajor ? 20 : 14)
            const outerR = radius - 10
            return (
              <line
                key={i}
                x1={center + innerR * Math.cos(angle)}
                y1={center + innerR * Math.sin(angle)}
                x2={center + outerR * Math.cos(angle)}
                y2={center + outerR * Math.sin(angle)}
                stroke="currentColor"
                strokeWidth={isMajor ? 2 : 1}
                className="text-muted-foreground/20"
              />
            )
          })}
        </svg>

        {/* Timer display overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${minutes}-${seconds}`}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span className={cn(
                'text-6xl sm:text-7xl font-light tabular-nums tracking-tight',
                isRunning && 'timer-pulse'
              )}>
                {String(minutes).padStart(2, '0')}
                <span className="text-muted-foreground/60">:</span>
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-sm text-muted-foreground mt-1 font-medium uppercase tracking-widest">
                {config.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-500',
              i < (sessionsCompleted % settings.longBreakInterval)
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm shadow-amber-500/30'
                : 'bg-muted-foreground/20'
            )}
            animate={i < (sessionsCompleted % settings.longBreakInterval) ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} today
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="rounded-full w-11 h-11 text-muted-foreground hover:text-foreground transition-all hover:rotate-[-180deg] duration-500"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <motion.button
          onClick={isRunning ? pause : start}
          className={cn(
            'relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
            'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
            'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
            'hover:scale-105 active:scale-95'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </motion.button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full w-11 h-11 text-muted-foreground hover:text-foreground transition-all hover:rotate-45 duration-300"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Focus Duration</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ workDuration: Math.max(1, settings.workDuration - 5) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >-</button>
                  <span className="text-sm font-medium w-8 text-center">{settings.workDuration}</span>
                  <button
                    onClick={() => updateSettings({ workDuration: Math.min(120, settings.workDuration + 5) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Short Break</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ shortBreakDuration: Math.max(1, settings.shortBreakDuration - 1) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >-</button>
                  <span className="text-sm font-medium w-8 text-center">{settings.shortBreakDuration}</span>
                  <button
                    onClick={() => updateSettings({ shortBreakDuration: Math.min(30, settings.shortBreakDuration + 1) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Long Break</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSettings({ longBreakDuration: Math.max(1, settings.longBreakDuration - 5) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >-</button>
                  <span className="text-sm font-medium w-8 text-center">{settings.longBreakDuration}</span>
                  <button
                    onClick={() => updateSettings({ longBreakDuration: Math.min(60, settings.longBreakDuration + 5) })}
                    className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-xs hover:bg-muted/80"
                  >+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
