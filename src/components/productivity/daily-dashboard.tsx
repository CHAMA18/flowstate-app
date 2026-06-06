'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroStore } from '@/stores/pomodoro-store'
import { useTaskStore } from '@/stores/task-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useWaitingForStore } from '@/stores/waiting-for-store'
import { useReflectionStore } from '@/stores/reflection-store'
import { useQuickCaptureStore } from '@/stores/quick-capture-store'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard, Flame, CheckCircle2, Circle, Calendar,
  Clock, ArrowRight, Sparkles, TrendingUp, Target,
  Timer, Sun, Zap, ListTodo, AlertTriangle, Users, Hourglass
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DailyDashboard() {
  const { sessionsCompleted, mode, timeLeft, isRunning } = usePomodoroStore()
  const { tasks } = useTaskStore()
  const { events, getEventsForDate } = useCalendarStore()
  const { items: waitingItems, getOverdue } = useWaitingForStore()
  const { entries } = useReflectionStore()
  const { captures } = useQuickCaptureStore()

  const today = new Date().toISOString().split('T')[0]
  const completedTasks = tasks.filter(t => t.completed)
  const todayEvents = getEventsForDate(today)
  const overdue = getOverdue()
  const unprocessedCaptures = captures.filter(c => !c.processed)
  const todayEntry = entries.find(e => e.date === today)
  const todaysReflection = !!todayEntry

  const stats = {
    focusMinutes: sessionsCompleted * 25,
    focusGoal: 240,
    tasksCompleted: completedTasks.length,
    tasksTotal: tasks.length,
    sessionsCompleted,
    capturesUnprocessed: unprocessedCaptures.length,
    eventsToday: todayEvents.length,
    waitingItems: waitingItems.filter(i => i.status === 'waiting').length,
    overdueItems: overdue.length,
  }

  const focusProgress = Math.min((stats.focusMinutes / stats.focusGoal) * 100, 100)
  const taskProgress = stats.tasksTotal > 0 ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0

  const activeTasks = tasks.filter(t => !t.completed).slice(0, 5)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <ScrollArea className="h-full">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-5 max-w-4xl mx-auto"
      >
        {/* Greeting + Date */}
        <motion.div variants={item}>
          <h2 className="text-xl font-bold">{greeting} ✨</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Stats Cards Row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Focus Progress */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[10px] text-muted-foreground">of {stats.focusGoal}m goal</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.focusMinutes}<span className="text-sm text-muted-foreground font-normal">m</span></div>
            <Progress value={focusProgress} className="h-1.5 mt-2" />
          </div>

          {/* Tasks Completed */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground">{stats.tasksTotal} total</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.tasksCompleted}<span className="text-sm text-muted-foreground font-normal">/{stats.tasksTotal}</span></div>
            <Progress value={taskProgress} className="h-1.5 mt-2" />
          </div>

          {/* Sessions */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              {isRunning && (
                <Badge className="text-[8px] h-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  Active
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.sessionsCompleted}<span className="text-sm text-muted-foreground font-normal"> sessions</span></div>
            {isRunning && (
              <div className="text-xs text-primary font-mono mt-2">{timerDisplay} — {mode === 'work' ? 'Focus' : 'Break'}</div>
            )}
          </div>

          {/* Waiting */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Hourglass className="w-4 h-4 text-purple-500" />
              </div>
              {stats.overdueItems > 0 && (
                <Badge className="text-[8px] h-4 bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20">
                  {stats.overdueItems} overdue
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold tabular-nums">{stats.waitingItems}<span className="text-sm text-muted-foreground font-normal"> waiting</span></div>
          </div>
        </motion.div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Today's Schedule */}
          <motion.div variants={item} className="lg:col-span-2 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Today&apos;s Schedule</h4>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5">{todayEvents.length} events</Badge>
            </div>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: event.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {event.startTime ? `${event.startTime}${event.endTime ? ` — ${event.endTime}` : ''}` : 'All day'} · {event.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No events scheduled today</p>
              </div>
            )}
          </motion.div>

          {/* Quick Stats + Reflection */}
          <motion.div variants={item} className="space-y-3">
            {/* Unprocessed captures */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold">Inbox</h4>
              </div>
              <p className="text-2xl font-bold">{stats.capturesUnprocessed}</p>
              <p className="text-[10px] text-muted-foreground">unprocessed captures</p>
            </div>

            {/* Reflection check */}
            <div className={cn(
              "bg-card/50 backdrop-blur-sm rounded-xl p-4 border",
              todaysReflection ? "border-emerald-500/20" : "border-border/40"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Daily Reflection</h4>
              </div>
              {todaysReflection ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Completed today</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not done yet. Take a moment to reflect.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Active Tasks */}
        <motion.div variants={item} className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">Active Tasks</h4>
            </div>
            <Badge variant="secondary" className="text-[10px] h-5">{activeTasks.length} remaining</Badge>
          </div>
          {activeTasks.length > 0 ? (
            <div className="space-y-1.5">
              {activeTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{task.title}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5",
                    task.priority === 'high' && "border-rose-500/30 text-rose-600 dark:text-rose-400",
                    task.priority === 'medium' && "border-amber-500/30 text-amber-600 dark:text-amber-400",
                    task.priority === 'low' && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                  )}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
              <p className="text-xs">All caught up! No active tasks.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </ScrollArea>
  )
}
