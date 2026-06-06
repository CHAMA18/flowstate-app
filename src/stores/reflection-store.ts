import { create } from 'zustand'

export interface ReflectionEntry {
  id: string
  date: string // YYYY-MM-DD
  wins: string[] // What went well
  challenges: string[] // What could be improved
  learnings: string[] // Key insights
  gratitude: string[] // Gratitude items
  tomorrowPlan: string[] // Plans for tomorrow
  mood: 1 | 2 | 3 | 4 | 5 // 1=terrible, 5=amazing
  energyLevel: 1 | 2 | 3 | 4 | 5
  focusScore: 1 | 2 | 3 | 4 | 5
  notes?: string
  completedAt: string
}

interface ReflectionState {
  entries: ReflectionEntry[]
  currentDraft: Partial<ReflectionEntry> | null
  setCurrentDraft: (draft: Partial<ReflectionEntry> | null) => void
  addEntry: (entry: ReflectionEntry) => void
  updateEntry: (id: string, updates: Partial<ReflectionEntry>) => void
  removeEntry: (id: string) => void
  getEntryForDate: (date: string) => ReflectionEntry | undefined
  getRecentEntries: (count: number) => ReflectionEntry[]
  getStreak: () => number
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  entries: [],
  currentDraft: null,
  setCurrentDraft: (currentDraft) => set({ currentDraft }),
  addEntry: (entry) => set({ entries: [entry, ...get().entries] }),
  updateEntry: (id, updates) => set({
    entries: get().entries.map(e => e.id === id ? { ...e, ...updates } : e)
  }),
  removeEntry: (id) => set({ entries: get().entries.filter(e => e.id !== id) }),
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
}))
