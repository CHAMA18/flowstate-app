import { create } from 'zustand'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // ISO date string
  startTime?: string
  endTime?: string
  type: 'task' | 'meeting' | 'focus' | 'reminder' | 'personal'
  color: string
  linkedTaskId?: string
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
}

interface CalendarState {
  events: CalendarEvent[]
  selectedDate: string // YYYY-MM-DD
  view: 'month' | 'week' | 'day'
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  setSelectedDate: (date: string) => void
  setView: (view: CalendarState['view']) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  getEventsForWeek: (weekStart: string) => CalendarEvent[]
}

const EVENT_COLORS = [
  'oklch(0.78 0.16 65)',  // amber
  'oklch(0.72 0.16 160)', // emerald
  'oklch(0.68 0.20 300)', // purple
  'oklch(0.72 0.20 10)',  // rose
  'oklch(0.70 0.15 220)', // blue
]

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedDate: new Date().toISOString().split('T')[0],
  view: 'month',
  addEvent: (event) => set({ events: [...get().events, event] }),
  updateEvent: (id, updates) => set({
    events: get().events.map(e => e.id === id ? { ...e, ...updates } : e)
  }),
  removeEvent: (id) => set({ events: get().events.filter(e => e.id !== id) }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setView: (view) => set({ view }),
  getEventsForDate: (date) => get().events.filter(e => e.date === date),
  getEventsForWeek: (weekStart) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const endStr = end.toISOString().split('T')[0]
    return get().events.filter(e => e.date >= weekStart && e.date < endStr)
  },
}))

export { EVENT_COLORS }
