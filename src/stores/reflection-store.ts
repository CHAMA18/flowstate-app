import { create } from 'zustand'
import { firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

export interface ReflectionEntry {
  id: string
  date: string // YYYY-MM-DD
  wins: string[]
  challenges: string[]
  learnings: string[]
  gratitude: string[]
  tomorrowPlan: string[]
  mood: 1 | 2 | 3 | 4 | 5
  energyLevel: 1 | 2 | 3 | 4 | 5
  focusScore: 1 | 2 | 3 | 4 | 5
  notes?: string
  completedAt: string
}

interface ReflectionState {
  entries: ReflectionEntry[]
  currentDraft: Partial<ReflectionEntry> | null
  setCurrentDraft: (draft: Partial<ReflectionEntry> | null) => void
  addEntry: (entry: Omit<ReflectionEntry, 'id'>) => Promise<void>
  updateEntry: (id: string, updates: Partial<ReflectionEntry>) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  getEntryForDate: (date: string) => ReflectionEntry | undefined
  getRecentEntries: (count: number) => ReflectionEntry[]
  getStreak: () => number
  initialize: () => () => void
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  entries: [],
  currentDraft: null,

  setCurrentDraft: (currentDraft) => set({ currentDraft }),

  addEntry: async (entryData) => {
    const tempId = `temp_${Date.now()}`
    const tempEntry: ReflectionEntry = { ...entryData, id: tempId }
    set({ entries: [tempEntry, ...get().entries] })

    try {
      await firestoreCreate('reflections', entryData, entryData.date) // Use date as doc ID for uniqueness
    } catch (error) {
      console.error('[Reflection] Failed to add:', error)
      set({ entries: get().entries.filter(e => e.id !== tempId) })
    }
  },

  updateEntry: async (id, updates) => {
    const previous = get().entries
    set({ entries: previous.map(e => e.id === id ? { ...e, ...updates } : e) })

    try {
      await firestoreUpdate('reflections', id, updates)
    } catch (error) {
      console.error('[Reflection] Failed to update:', error)
      set({ entries: previous })
    }
  },

  removeEntry: async (id) => {
    const previous = get().entries
    set({ entries: previous.filter(e => e.id !== id) })

    try {
      await firestoreDelete('reflections', id)
    } catch (error) {
      console.error('[Reflection] Failed to remove:', error)
      set({ entries: previous })
    }
  },

  getEntryForDate: (date) => get().entries.find(e => e.date === date),
  getRecentEntries: (count) => get().entries.slice(0, count),

  getStreak: () => {
    const entries = get().entries.sort((a, b) => b.date.localeCompare(a.date))
    if (entries.length === 0) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      if (entries.find(e => e.date === dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  },

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}
    const unsub = firestoreSubscribe<ReflectionEntry>('reflections', 'date', 'desc', (entries) => {
      set({ entries })
    })
    return unsub
  },
}))
