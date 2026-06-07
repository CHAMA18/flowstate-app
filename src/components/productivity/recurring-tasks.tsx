'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RefreshCw, Plus, Trash2, CheckCircle2, Circle,
  Calendar, Clock, Zap, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecurringTask {
  id: string
  title: string
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  streak: number
  lastCompleted?: string
  isActive: boolean
}

const FREQUENCY_CONFIG = {
  daily: { label: 'Daily', icon: '🔄', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  weekly: { label: 'Weekly', icon: '📅', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  monthly: { label: 'Monthly', icon: '🗓️', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  medium: { label: 'Med', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function RecurringTasks() {
  const [tasks, setTasks] = useState<RecurringTask[]>([
    { id: 'rt-1', title: 'Morning standup notes', frequency: 'daily', time: '09:00', category: 'work', priority: 'medium', streak: 12, isActive: true },
    { id: 'rt-2', title: 'Weekly planning session', frequency: 'weekly', dayOfWeek: 1, time: '10:00', category: 'work', priority: 'high', streak: 4, isActive: true },
    { id: 'rt-3', title: 'Monthly review', frequency: 'monthly', dayOfMonth: 1, category: 'personal', priority: 'high', streak: 2, isActive: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '', frequency: 'daily' as RecurringTask['frequency'],
    dayOfWeek: 1, dayOfMonth: 1, time: '09:00',
    category: 'general', priority: 'medium' as RecurringTask['priority'],
  })

  const handleAdd = () => {
    if (!newTask.title.trim()) return
    const task: RecurringTask = {
      id: `rt-${Date.now()}`,
      title: newTask.title.trim(),
      frequency: newTask.frequency,
      dayOfWeek: newTask.frequency === 'weekly' ? newTask.dayOfWeek : undefined,
      dayOfMonth: newTask.frequency === 'monthly' ? newTask.dayOfMonth : undefined,
      time: newTask.time,
      category: newTask.category,
      priority: newTask.priority,
      streak: 0,
      isActive: true,
    }
    setTasks([task, ...tasks])
    setNewTask({ title: '', frequency: 'daily', dayOfWeek: 1, dayOfMonth: 1, time: '09:00', category: 'general', priority: 'medium' })
    setShowForm(false)
  }

  const handleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, streak: t.streak + 1, lastCompleted: new Date().toISOString().split('T')[0] } : t))
  }

  const handleToggle = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t))
  }

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const activeTasks = tasks.filter(t => t.isActive)
  const totalStreak = tasks.reduce((sum, t) => sum + t.streak, 0)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Recurring Tasks</h3>
          <Badge variant="secondary" className="text-[10px] h-5">{activeTasks.length} active</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[10px] h-5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            <Zap className="w-2.5 h-2.5 mr-0.5" /> {totalStreak} total streak
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input placeholder="Recurring task name" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="h-8 text-sm" />
              <div className="flex gap-2">
                {Object.entries(FREQUENCY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setNewTask({ ...newTask, frequency: key as RecurringTask['frequency'] })}
                    className={cn(
                      'text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-all border',
                      newTask.frequency === key ? config.color : 'text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
              {newTask.frequency === 'weekly' && (
                <div className="flex gap-1">
                  {DAY_NAMES.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setNewTask({ ...newTask, dayOfWeek: i })}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded-md transition-all',
                        newTask.dayOfWeek === i ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
              {newTask.frequency === 'monthly' && (
                <Input type="number" min={1} max={31} value={newTask.dayOfMonth} onChange={e => setNewTask({ ...newTask, dayOfMonth: parseInt(e.target.value) || 1 })} className="h-8 text-xs w-24" placeholder="Day of month" />
              )}
              <Input type="time" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })} className="h-8 text-xs w-32" />
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewTask({ ...newTask, priority: p })}
                    className={cn('text-[10px] font-medium px-2 py-1 rounded-md transition-all border', newTask.priority === p ? PRIORITY_CONFIG[p].color : 'text-muted-foreground border-transparent')}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" className="h-7 text-xs" onClick={handleAdd}>Add Task</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-350px)]">
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => {
              const freqConfig = FREQUENCY_CONFIG[task.frequency]
              const priorityConfig = PRIORITY_CONFIG[task.priority]
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-xl transition-all',
                    'bg-card/50 border border-border/40 hover:bg-card/80',
                    !task.isActive && 'opacity-50'
                  )}
                >
                  <button onClick={() => handleComplete(task.id)} className="flex-shrink-0">
                    <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary/60 transition-colors" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn('text-[8px] h-4 border', freqConfig.color)}>{task.frequency}</Badge>
                      {task.time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {task.time}
                        </span>
                      )}
                      {task.frequency === 'weekly' && task.dayOfWeek !== undefined && (
                        <span className="text-[10px] text-muted-foreground">{DAY_NAMES[task.dayOfWeek]}</span>
                      )}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">{task.streak}</span>
                  </div>

                  {/* Actions */}
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No recurring tasks yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Set up habits and routines</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
