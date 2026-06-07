import { create } from 'zustand'
import { firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

export interface WaitingItem {
  id: string
  title: string
  description?: string
  requestedFrom: string
  requestedDate: string
  expectedDate?: string
  priority: 'low' | 'medium' | 'high'
  status: 'waiting' | 'received' | 'cancelled' | 'reminded'
  remindDate?: string
  linkedTaskId?: string
  notes: string[]
  createdAt: string
  updatedAt: string
}

interface WaitingForState {
  items: WaitingItem[]
  filter: 'all' | 'waiting' | 'received' | 'overdue'
  addItem: (item: Omit<WaitingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateItem: (id: string, updates: Partial<WaitingItem>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  markReceived: (id: string) => Promise<void>
  markReminded: (id: string) => Promise<void>
  setFilter: (filter: WaitingForState['filter']) => void
  getOverdue: () => WaitingItem[]
  initialize: () => () => void
}

export const useWaitingForStore = create<WaitingForState>((set, get) => ({
  items: [],
  filter: 'all',

  addItem: async (itemData) => {
    const tempId = `temp_${Date.now()}`
    const now = new Date().toISOString()
    const tempItem: WaitingItem = { ...itemData, id: tempId, createdAt: now, updatedAt: now }
    set({ items: [tempItem, ...get().items] })

    try {
      await firestoreCreate('waitingItems', itemData)
    } catch (error) {
      console.error('[WaitingFor] Failed to add:', error)
      set({ items: get().items.filter(i => i.id !== tempId) })
    }
  },

  updateItem: async (id, updates) => {
    const previous = get().items
    set({ items: previous.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i) })

    try {
      await firestoreUpdate('waitingItems', id, updates)
    } catch (error) {
      console.error('[WaitingFor] Failed to update:', error)
      set({ items: previous })
    }
  },

  removeItem: async (id) => {
    const previous = get().items
    set({ items: previous.filter(i => i.id !== id) })

    try {
      await firestoreDelete('waitingItems', id)
    } catch (error) {
      console.error('[WaitingFor] Failed to remove:', error)
      set({ items: previous })
    }
  },

  markReceived: async (id) => {
    const previous = get().items
    const now = new Date().toISOString()
    set({ items: previous.map(i => i.id === id ? { ...i, status: 'received' as const, updatedAt: now } : i) })

    try {
      await firestoreUpdate('waitingItems', id, { status: 'received' })
    } catch (error) {
      console.error('[WaitingFor] Failed to mark received:', error)
      set({ items: previous })
    }
  },

  markReminded: async (id) => {
    const previous = get().items
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    set({ items: previous.map(i => i.id === id ? { ...i, status: 'reminded' as const, remindDate: today, updatedAt: now } : i) })

    try {
      await firestoreUpdate('waitingItems', id, { status: 'reminded', remindDate: today })
    } catch (error) {
      console.error('[WaitingFor] Failed to mark reminded:', error)
      set({ items: previous })
    }
  },

  setFilter: (filter) => set({ filter }),
  getOverdue: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().items.filter(i => i.status === 'waiting' && i.expectedDate && i.expectedDate < today)
  },

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}
    const unsub = firestoreSubscribe<WaitingItem>('waitingItems', 'createdAt', 'desc', (items) => {
      set({ items })
    })
    return unsub
  },
}))
