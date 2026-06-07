import { create } from 'zustand'
import { firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

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
  createdAt?: string
  updatedAt?: string
}

interface CalendarState {
  events: CalendarEvent[]
  selectedDate: string // YYYY-MM-DD
  view: 'month' | 'week' | 'day'
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  setSelectedDate: (date: string) => void
  setView: (view: CalendarState['view']) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  getEventsForWeek: (weekStart: string) => CalendarEvent[]
  initialize: () => () => void
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

  addEvent: async (eventData) => {
    const tempId = `temp_${Date.now()}`
    const tempEvent: CalendarEvent = { ...eventData, id: tempId, createdAt: new Date().toISOString() }
    set({ events: [...get().events, tempEvent] })

    try {
      await firestoreCreate('events', eventData)
    } catch (error) {
      console.error('[Calendar] Failed to add event:', error)
      set({ events: get().events.filter(e => e.id !== tempId) })
    }
  },

  updateEvent: async (id, updates) => {
    const previous = get().events
    set({ events: previous.map(e => e.id === id ? { ...e, ...updates } : e) })

    try {
      await firestoreUpdate('events', id, updates)
    } catch (error) {
      console.error('[Calendar] Failed to update event:', error)
      set({ events: previous })
    }
  },

  removeEvent: async (id) => {
    const previous = get().events
    set({ events: previous.filter(e => e.id !== id) })

    try {
      await firestoreDelete('events', id)
    } catch (error) {
      console.error('[Calendar] Failed to remove event:', error)
      set({ events: previous })
    }
  },

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

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}
    const unsub = firestoreSubscribe<CalendarEvent>('events', 'date', 'desc', (events) => {
      set({ events })
    })
    return unsub
  },
}))

export { EVENT_COLORS }
