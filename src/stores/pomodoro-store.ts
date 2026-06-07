import { create } from 'zustand'
import { firestoreCreate, firestoreGetAll, firestoreSetPreferences, firestoreGetPreferences, isUserAuthenticated } from '@/lib/firestore-service'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
}

interface PomodoroSession {
  id: string
  type: string
  duration: number
  completed: boolean
  startedAt: string
  completedAt: string
}

interface PomodoroState {
  mode: TimerMode
  timeLeft: number
  totalTime: number
  isRunning: boolean
  sessionsCompleted: number
  todayFocusMinutes: number
  todaySessions: number
  settings: PomodoroSettings
  recentSessions: PomodoroSession[]
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => boolean
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: Partial<PomodoroSettings>) => void
  completeSession: () => void
  loadSessions: () => Promise<void>
  loadSettings: () => Promise<void>
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
}

const getDuration = (mode: TimerMode, settings: PomodoroSettings) => {
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
  todayFocusMinutes: 0,
  todaySessions: 0,
  settings: DEFAULT_SETTINGS,
  recentSessions: [],

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
        set({ sessionsCompleted: newSessions, todaySessions: get().todaySessions + 1, todayFocusMinutes: get().todayFocusMinutes + settings.workDuration })

        // Save session to Firestore
        if (isUserAuthenticated()) {
          firestoreCreate('sessions', {
            type: 'work',
            duration: settings.workDuration,
            completed: true,
            startedAt: new Date(Date.now() - settings.workDuration * 60 * 1000).toISOString(),
            completedAt: new Date().toISOString(),
          }).catch(err => console.error('[Pomodoro] Failed to save session:', err))
        }

        if (newSessions % settings.longBreakInterval === 0) {
          const duration = settings.longBreakDuration * 60
          set({ mode: 'longBreak', timeLeft: duration, totalTime: duration })
        } else {
          const duration = settings.shortBreakDuration * 60
          set({ mode: 'shortBreak', timeLeft: duration, totalTime: duration })
        }
      } else {
        // Save break session
        if (isUserAuthenticated()) {
          const breakDuration = mode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration
          firestoreCreate('sessions', {
            type: mode,
            duration: breakDuration,
            completed: true,
            startedAt: new Date(Date.now() - breakDuration * 60 * 1000).toISOString(),
            completedAt: new Date().toISOString(),
          }).catch(err => console.error('[Pomodoro] Failed to save break session:', err))
        }

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

    // Save to Firestore
    if (isUserAuthenticated()) {
      firestoreSetPreferences('pomodoroSettings', settings).catch(err =>
        console.error('[Pomodoro] Failed to save settings:', err)
      )
    }
  },

  completeSession: () => {
    const { mode, settings, sessionsCompleted } = get()
    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1
      set({ sessionsCompleted: newSessions, todaySessions: get().todaySessions + 1, todayFocusMinutes: get().todayFocusMinutes + settings.workDuration })

      if (isUserAuthenticated()) {
        firestoreCreate('sessions', {
          type: 'work',
          duration: settings.workDuration,
          completed: true,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }).catch(err => console.error('[Pomodoro] Failed to save session:', err))
      }
    }
  },

  loadSessions: async () => {
    if (!isUserAuthenticated()) return
    try {
      const sessions = await firestoreGetAll<PomodoroSession>('sessions', 'completedAt', 'desc')
      const today = new Date().toISOString().split('T')[0]
      const todaySessions = sessions.filter(s => s.completedAt?.startsWith(today) && s.type === 'work')
      const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      set({
        recentSessions: sessions.slice(0, 50),
        todaySessions: todaySessions.length,
        todayFocusMinutes,
      })
    } catch (error) {
      console.error('[Pomodoro] Failed to load sessions:', error)
    }
  },

  loadSettings: async () => {
    if (!isUserAuthenticated()) return
    try {
      const savedSettings = await firestoreGetPreferences<PomodoroSettings>('pomodoroSettings')
      if (savedSettings) {
        const settings = { ...DEFAULT_SETTINGS, ...savedSettings }
        const { mode } = get()
        const duration = getDuration(mode, settings)
        set({ settings, timeLeft: duration, totalTime: duration })
      }
    } catch (error) {
      console.error('[Pomodoro] Failed to load settings:', error)
    }
  },
}))
