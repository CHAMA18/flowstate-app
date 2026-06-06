import { create } from 'zustand'

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
}

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  filter: 'all' | 'active' | 'completed'
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  incrementPomodoro: (id: string) => void
  setFilter: (filter: TaskState['filter']) => void
  setLoading: (loading: boolean) => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filter: 'all',
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set({ tasks: [task, ...get().tasks] }),
  toggleTask: (id) => {
    const tasks = get().tasks.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: t.completed ? undefined : new Date().toISOString() }
        : t
    )
    set({ tasks })
  },
  deleteTask: (id) => set({ tasks: get().tasks.filter(t => t.id !== id) }),
  incrementPomodoro: (id) => {
    const tasks = get().tasks.map(t =>
      t.id === id ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 } : t
    )
    set({ tasks })
  },
  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),
}))
