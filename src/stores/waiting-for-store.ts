import { create } from 'zustand'

export interface WaitingItem {
  id: string
  title: string
  description?: string
  requestedFrom: string // Person or team
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
  addItem: (item: WaitingItem) => void
  updateItem: (id: string, updates: Partial<WaitingItem>) => void
  removeItem: (id: string) => void
  markReceived: (id: string) => void
  markReminded: (id: string) => void
  setFilter: (filter: WaitingForState['filter']) => void
  getOverdue: () => WaitingItem[]
}

export const useWaitingForStore = create<WaitingForState>((set, get) => ({
  items: [],
  filter: 'all',
  addItem: (item) => set({ items: [item, ...get().items] }),
  updateItem: (id, updates) => set({
    items: get().items.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i)
  }),
  removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  markReceived: (id) => set({
    items: get().items.map(i => i.id === id ? { ...i, status: 'received' as const, updatedAt: new Date().toISOString() } : i)
  }),
  markReminded: (id) => set({
    items: get().items.map(i => i.id === id ? { ...i, status: 'reminded' as const, remindDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() } : i)
  }),
  setFilter: (filter) => set({ filter }),
  getOverdue: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().items.filter(i => i.status === 'waiting' && i.expectedDate && i.expectedDate < today)
  },
}))
