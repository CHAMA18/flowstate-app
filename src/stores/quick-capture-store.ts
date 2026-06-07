import { create } from 'zustand'
import { firestoreGetAll, firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

export interface QuickCapture {
  id: string
  content: string
  type: 'thought' | 'task' | 'note' | 'link'
  tags: string[]
  createdAt: string
  processed: boolean
}

interface QuickCaptureState {
  captures: QuickCapture[]
  isOpen: boolean
  addCapture: (capture: Omit<QuickCapture, 'id' | 'createdAt'>) => Promise<void>
  removeCapture: (id: string) => Promise<void>
  processCapture: (id: string) => Promise<void>
  setOpen: (open: boolean) => void
  clearProcessed: () => Promise<void>
  initialize: () => () => void
}

export const useQuickCaptureStore = create<QuickCaptureState>((set, get) => ({
  captures: [],
  isOpen: false,

  addCapture: async (captureData) => {
    const tempId = `temp_${Date.now()}`
    const tempCapture: QuickCapture = { ...captureData, id: tempId, createdAt: new Date().toISOString() }
    set({ captures: [tempCapture, ...get().captures] })

    try {
      await firestoreCreate('captures', {
        ...captureData,
        processed: false,
      })
    } catch (error) {
      console.error('[QuickCapture] Failed to add:', error)
      set({ captures: get().captures.filter(c => c.id !== tempId) })
    }
  },

  removeCapture: async (id) => {
    const previous = get().captures
    set({ captures: previous.filter(c => c.id !== id) })

    try {
      await firestoreDelete('captures', id)
    } catch (error) {
      console.error('[QuickCapture] Failed to remove:', error)
      set({ captures: previous })
    }
  },

  processCapture: async (id) => {
    set({ captures: get().captures.map(c => c.id === id ? { ...c, processed: true } : c) })

    try {
      await firestoreUpdate('captures', id, { processed: true })
    } catch (error) {
      console.error('[QuickCapture] Failed to process:', error)
      set({ captures: get().captures.map(c => c.id === id ? { ...c, processed: false } : c) })
    }
  },

  setOpen: (isOpen) => set({ isOpen }),

  clearProcessed: async () => {
    const processed = get().captures.filter(c => c.processed)
    set({ captures: get().captures.filter(c => !c.processed) })

    try {
      for (const c of processed) {
        await firestoreDelete('captures', c.id)
      }
    } catch (error) {
      console.error('[QuickCapture] Failed to clear processed:', error)
    }
  },

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}
    const unsub = firestoreSubscribe<QuickCapture>('captures', 'createdAt', 'desc', (captures) => {
      set({ captures })
    })
    return unsub
  },
}))
