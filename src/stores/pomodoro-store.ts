import { create } from 'zustand'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroState {
  mode: TimerMode
  timeLeft: number
  totalTime: number
  isRunning: boolean
  sessionsCompleted: number
  settings: {
    workDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number
  }
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => boolean
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: Partial<PomodoroState['settings']>) => void
  completeSession: () => void
}

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
}

const getDuration = (mode: TimerMode, settings: PomodoroState['settings']) => {
  switch (mode) {
    case 'work': return settings.workDuration * 60
    case 'shortBreak': return settings.shortBreakDuration * 60
    case 'longBreak': return settings.longBreakDuration * 60
  }
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'work',
  timeLeft: DEFAULT_SETTINGS.workDuration * 60,
  totalTime: DEFAULT_SETTINGS.workDuration * 60,
  isRunning: false,
  sessionsCompleted: 0,
  settings: DEFAULT_SETTINGS,
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => {
    const { mode, settings } = get()
    const duration = getDuration(mode, settings)
    set({ timeLeft: duration, totalTime: duration, isRunning: false })
  },
  tick: () => {
    const { timeLeft, mode, settings, sessionsCompleted } = get()
    if (timeLeft <= 0) return true
    const newTime = timeLeft - 1
    set({ timeLeft: newTime })
    if (newTime <= 0) {
      set({ isRunning: false })
      if (mode === 'work') {
        const newSessions = sessionsCompleted + 1
        set({ sessionsCompleted: newSessions })
        if (newSessions % settings.longBreakInterval === 0) {
          const duration = settings.longBreakDuration * 60
          set({ mode: 'longBreak', timeLeft: duration, totalTime: duration })
        } else {
          const duration = settings.shortBreakDuration * 60
          set({ mode: 'shortBreak', timeLeft: duration, totalTime: duration })
        }
      } else {
        const duration = settings.workDuration * 60
        set({ mode: 'work', timeLeft: duration, totalTime: duration })
      }
      return true
    }
    return false
  },
  setMode: (mode) => {
    const { settings } = get()
    const duration = getDuration(mode, settings)
    set({ mode, timeLeft: duration, totalTime: duration, isRunning: false })
  },
  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    const { mode } = get()
    const duration = getDuration(mode, settings)
    set({ settings, timeLeft: duration, totalTime: duration, isRunning: false })
  },
  completeSession: () => {
    const { mode, settings, sessionsCompleted } = get()
    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1
      set({ sessionsCompleted: newSessions })
    }
  },
}))
