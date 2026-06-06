'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, CheckCircle2, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
  today: {
    pomodorosCompleted: number
    focusMinutes: number
    tasksCompleted: number
    tasksCreated: number
  }
  totalTasks: number
  completedTasks: number
  totalSessions: number
  weekly: Array<{
    date: string
    pomodorosCompleted: number
    focusMinutes: number
    tasksCompleted: number
    tasksCreated: number
  }>
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error('Failed to load stats')
      }
    }
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const statItems = [
    {
      icon: <Flame className="w-4 h-4" />,
      value: stats.today.pomodorosCompleted,
      label: 'Pomodoros',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      value: stats.today.focusMinutes,
      label: 'Focus Min',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: stats.today.tasksCompleted,
      label: 'Done Today',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      value: stats.totalSessions,
      label: 'Total Sessions',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ]

  // Weekly activity bars
  const maxPomodoros = Math.max(...(stats.weekly.map(w => w.pomodorosCompleted) || [1]), 1)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl',
              'bg-card/50 border border-border/30',
              'hover:border-border/60 transition-all'
            )}
          >
            <div className={cn('p-2 rounded-lg', item.bg)}>
              <div className={item.color}>{item.icon}</div>
            </div>
            <div>
              <div className="text-lg font-semibold leading-none">{item.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly chart */}
      {stats.weekly.length > 0 && (
        <div className="bg-card/50 border border-border/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">This Week</span>
            <span className="text-[10px] text-muted-foreground">Pomodoros / day</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {stats.weekly.map((day, i) => {
              const height = day.pomodorosCompleted > 0
                ? Math.max(8, (day.pomodorosCompleted / maxPomodoros) * 100)
                : 4
              const dayDate = new Date(day.date)
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-md bg-gradient-to-t from-primary/80 to-primary/40"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {dayLabels[dayDate.getDay()]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
