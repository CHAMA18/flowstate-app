import { create } from 'zustand'
import { firestoreGetAll, firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

export interface Task {
  id: string
  title: string
  completed: boolean
  category: string
  priority: 'low' | 'medium' | 'high'
  pomodorosEstimated: number
  pomodorosCompleted: number
  createdAt: string
  completedAt?: string
  updatedAt?: string
}

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  filter: 'all' | 'active' | 'completed'
  unsubscribe: (() => void) | null
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  incrementPomodoro: (id: string) => Promise<void>
  setFilter: (filter: TaskState['filter']) => void
  setLoading: (loading: boolean) => void
  initialize: () => () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filter: 'all',
  unsubscribe: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: async (taskData) => {
    // Optimistic update
    const tempId = `temp_${Date.now()}`
    const tempTask: Task = { ...taskData, id: tempId, createdAt: new Date().toISOString() }
    set({ tasks: [tempTask, ...get().tasks] })

    try {
      const id = await firestoreCreate('tasks', {
        ...taskData,
        completed: false,
        pomodorosEstimated: taskData.pomodorosEstimated || 1,
        pomodorosCompleted: 0,
      })
      // Replace temp with real (snapshot listener will also update)
      set({ tasks: get().tasks.map(t => t.id === tempId ? { ...t, id } : t) })
    } catch (error) {
      console.error('[TaskStore] Failed to add task:', error)
      // Revert optimistic
      set({ tasks: get().tasks.filter(t => t.id !== tempId) })
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const completed = !task.completed
    const completedAt = completed ? new Date().toISOString() : undefined

    // Optimistic
    set({ tasks: get().tasks.map(t => t.id === id ? { ...t, completed, completedAt } : t) })

    try {
      await firestoreUpdate('tasks', id, { completed, completedAt })
    } catch (error) {
      console.error('[TaskStore] Failed to toggle task:', error)
      // Revert
      set({ tasks: get().tasks.map(t => t.id === id ? { ...t, completed: !completed, completedAt: task.completedAt } : t) })
    }
  },

  deleteTask: async (id) => {
    const previous = get().tasks
    set({ tasks: previous.filter(t => t.id !== id) })

    try {
      await firestoreDelete('tasks', id)
    } catch (error) {
      console.error('[TaskStore] Failed to delete task:', error)
      set({ tasks: previous })
    }
  },

  incrementPomodoro: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const newCount = task.pomodorosCompleted + 1

    set({ tasks: get().tasks.map(t => t.id === id ? { ...t, pomodorosCompleted: newCount } : t) })

    try {
      await firestoreUpdate('tasks', id, { pomodorosCompleted: newCount })
    } catch (error) {
      console.error('[TaskStore] Failed to increment pomodoro:', error)
    }
  },

  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}

    set({ isLoading: true })

    const unsub = firestoreSubscribe<Task>(
      'tasks',
      'createdAt',
      'desc',
      (tasks) => {
        set({ tasks, isLoading: false })
      },
      () => {
        set({ isLoading: false })
      }
    )

    set({ unsubscribe: unsub })
    return unsub
  },
}))
