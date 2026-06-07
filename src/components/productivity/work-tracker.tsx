'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useTaskStore, Task } from '@/stores/task-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus, Trash2, Flame, Target, ChevronDown,
  ListTodo, CheckCircle2, Circle, Timer, GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  medium: { label: 'Med', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
}

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '📋' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'personal', label: 'Personal', icon: '🏠' },
  { id: 'health', label: 'Health', icon: '💪' },
]

function TaskItem({ task, onToggle, onDelete }: {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      className="group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
        'bg-card/50 border border-border/40',
        'hover:bg-card/80 hover:border-border/60',
        'group-hover:shadow-sm',
        task.completed && 'opacity-60'
      )}>
        {/* Drag handle */}
        <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/40 hover:text-primary/60 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-sm font-medium transition-all',
            task.completed && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px]">{CATEGORIES.find(c => c.id === task.category)?.icon}</span>
            <span className="text-[10px] text-muted-foreground">{CATEGORIES.find(c => c.id === task.category)?.label}</span>
            {task.pomodorosEstimated > 0 && (
              <div className="flex items-center gap-0.5">
                <Timer className="w-2.5 h-2.5 text-muted-foreground/60" />
                <span className="text-[10px] text-muted-foreground">
                  {task.pomodorosCompleted}/{task.pomodorosEstimated}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border', priority.color)}>
          <div className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
          {priority.label}
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function WorkTracker() {
  const { tasks, filter, addTask, toggleTask, deleteTask, setFilter, setTasks } = useTaskStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('general')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks')
        if (res.ok) {
          const data = await res.json()
          setTasks(data)
        }
      } catch (e) {
        console.error('Failed to load tasks')
      }
      setIsLoading(false)
    }
    loadTasks()
  }, [setTasks])

  const handleAddTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return

    const tempId = `temp-${Date.now()}`
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle.trim(),
      completed: false,
      category: newTaskCategory,
      priority: newTaskPriority,
      pomodorosEstimated: 1,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
    }

    addTask(newTask)
    setNewTaskTitle('')
    setShowForm(false)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          category: newTask.category,
          priority: newTask.priority,
          pomodorosEstimated: newTask.pomodorosEstimated,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        // Replace temp task with saved one
        setTasks(useTaskStore.getState().tasks.map(t => t.id === tempId ? saved : t))
      }
    } catch (e) {
      console.error('Failed to save task')
    }
  }, [newTaskTitle, newTaskCategory, newTaskPriority, addTask, setTasks])

  const handleToggle = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    toggleTask(id)

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !task.completed }),
      })
    } catch (e) {
      console.error('Failed to update task')
    }
  }, [tasks, toggleTask])

  const handleDelete = useCallback(async (id: string) => {
    deleteTask(id)
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    } catch (e) {
      console.error('Failed to delete task')
    }
  }, [deleteTask])

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Tasks</h3>
          <Badge variant="secondary" className="text-[10px] h-5">
            {activeTasks.length} remaining
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="h-9 text-sm border-border/50"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewTaskCategory(cat.id)}
                      className={cn(
                        'text-xs px-2 py-1 rounded-md transition-all',
                        newTaskCategory === cat.id
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={cn(
                        'text-[10px] font-medium px-2 py-1 rounded-md transition-all border',
                        newTaskPriority === p
                          ? PRIORITY_CONFIG[p].color
                          : 'text-muted-foreground border-transparent hover:bg-muted/50'
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" className="h-7 text-xs" onClick={() => { handleAddTask() }}>
                  Add Task
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-muted/30">
        {[
          { key: 'all' as const, label: 'All', count: tasks.length },
          { key: 'active' as const, label: 'Active', count: activeTasks.length },
          { key: 'completed' as const, label: 'Done', count: completedTasks.length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all',
              filter === f.key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground/70'
            )}
          >
            {f.label} <span className="text-[10px] opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-500px)]">
        <Reorder.Group
          axis="y"
          values={filteredTasks}
          onReorder={setTasks}
          className="space-y-1.5 pr-1"
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {filteredTasks.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-muted-foreground"
          >
            <ListTodo className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">
              {filter === 'completed' ? 'No completed tasks yet' :
               filter === 'active' ? 'All tasks completed!' :
               'No tasks yet. Add one above!'}
            </p>
          </motion.div>
        )}
      </ScrollArea>

      {/* Quick stats */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
          <span>{completedTasks.length} of {tasks.length} completed</span>
          <div className="w-24 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
