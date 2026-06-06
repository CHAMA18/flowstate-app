'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore } from '@/stores/pomodoro-store'
import { useTaskStore } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play, Pause, RotateCcw, SkipForward, Target, Flame,
  Coffee, Brain, Timer, CheckCircle2, Circle, Zap,
  Settings2, ArrowUp, ArrowDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FocusPlan {
  id: string
  taskId?: string
  taskTitle: string
  estimatedPomodoros: number
  completedPomodoros: number
  order: number
}

export function FocusSessions() {
  const { mode, timeLeft, totalTime, isRunning, sessionsCompleted, settings, start, pause, reset, tick, setMode, updateSettings } = usePomodoroStore()
  const { tasks } = useTaskStore()
  const [showSettings, setShowSettings] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick()
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, tick])

  // Derive focus plan from active tasks
  const focusPlan = tasks.filter(t => !t.completed).map((t, i) => ({
    id: `plan-${t.id}`,
    taskId: t.id,
    taskTitle: t.title,
    estimatedPomodoros: t.pomodorosEstimated,
    completedPomodoros: t.pomodorosCompleted,
    order: i,
  }))

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

  const modeConfig = {
    work: { label: 'Focus', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10', gradient: 'from-amber-500 via-orange-500 to-rose-500' },
    shortBreak: { label: 'Short Break', icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500 via-teal-500 to-cyan-500' },
    longBreak: { label: 'Long Break', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-500 via-indigo-500 to-blue-500' },
  }

  const currentConfig = modeConfig[mode]
  const ModeIcon = currentConfig.icon

  const circumference = 2 * Math.PI * 140
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      {/* Mode selector */}
      <div className="flex gap-2">
        {Object.entries(modeConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => setMode(key as 'work' | 'shortBreak' | 'longBreak')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                mode === key
                  ? `${config.bg} ${config.color} border-current/20`
                  : 'text-muted-foreground border-transparent hover:bg-muted/50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Timer Ring */}
      <div className="relative">
        <svg width="300" height="300" className="transform -rotate-90">
          {/* Background ring */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/10" />
          {/* Progress ring */}
          <circle
            cx="150" cy="150" r="140" fill="none"
            stroke="url(#focusGrad)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={mode === 'work' ? '#f59e0b' : mode === 'shortBreak' ? '#10b981' : '#8b5cf6'} />
              <stop offset="100%" stopColor={mode === 'work' ? '#ef4444' : mode === 'shortBreak' ? '#06b6d4' : '#3b82f6'} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <ModeIcon className={cn('w-6 h-6 mb-2', currentConfig.color, isRunning && 'animate-pulse')} />
          <div className="text-5xl font-bold tabular-nums tracking-tight">{timerDisplay}</div>
          <p className="text-xs text-muted-foreground mt-1">{currentConfig.label} Mode</p>
          {sessionsCompleted > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 mt-2">
              <Flame className="w-2.5 h-2.5 mr-1 text-amber-500" />
              {sessionsCompleted} sessions
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <motion.button
          onClick={isRunning ? pause : start}
          className={cn(
            'h-14 w-14 rounded-full flex items-center justify-center transition-all',
            'bg-gradient-to-br shadow-lg',
            isRunning ? 'from-rose-500 to-orange-500 shadow-rose-500/20' : `from-emerald-500 to-teal-500 shadow-emerald-500/20`,
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
        </motion.button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => {
          if (mode === 'work') setMode('shortBreak')
          else setMode('work')
        }}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Session Progress Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              i < (sessionsCompleted % settings.longBreakInterval)
                ? 'bg-amber-500 scale-110'
                : 'bg-muted/30'
            )}
          />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">
          Next long break in {settings.longBreakInterval - (sessionsCompleted % settings.longBreakInterval)} sessions
        </span>
      </div>

      {/* Focus Plan */}
      <div className="w-full bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Focus Plan</h4>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5">
            {focusPlan.reduce((sum, p) => sum + p.estimatedPomodoros, 0)} pomodoros planned
          </Badge>
        </div>
        <div className="space-y-1.5">
          {focusPlan.length > 0 ? focusPlan.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(selectedPlanId === plan.id ? null : plan.id)}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all',
                selectedPlanId === plan.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/30',
              )}
            >
              <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{plan.taskTitle}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: plan.estimatedPomodoros }).map((_, i) => (
                      <div key={i} className={cn(
                        'w-3 h-1.5 rounded-full',
                        i < plan.completedPomodoros ? 'bg-amber-500' : 'bg-muted/30'
                      )} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{plan.completedPomodoros}/{plan.estimatedPomodoros}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); setMode('work'); start() }}>
                <Play className="w-2.5 h-2.5" />
                Start
              </Button>
            </div>
          )) : (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
              <p className="text-xs">Add tasks to build your focus plan</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 space-y-3">
              <h4 className="text-xs font-semibold">Timer Settings</h4>
              {[
                { label: 'Focus Duration', key: 'workDuration' as const, value: settings.workDuration, unit: 'min' },
                { label: 'Short Break', key: 'shortBreakDuration' as const, value: settings.shortBreakDuration, unit: 'min' },
                { label: 'Long Break', key: 'longBreakDuration' as const, value: settings.longBreakDuration, unit: 'min' },
                { label: 'Sessions Until Long Break', key: 'longBreakInterval' as const, value: settings.longBreakInterval, unit: '' },
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{setting.label}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateSettings({ [setting.key]: Math.max(1, setting.value - 1) })}>
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center tabular-nums">{setting.value}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateSettings({ [setting.key]: setting.value + 1 })}>
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    {setting.unit && <span className="text-[10px] text-muted-foreground">{setting.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowSettings(!showSettings)}>
        <Settings2 className="w-3 h-3" />
        {showSettings ? 'Hide Settings' : 'Timer Settings'}
      </Button>
    </div>
  )
}
