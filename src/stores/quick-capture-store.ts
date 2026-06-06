import { create } from 'zustand'

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
  addCapture: (capture: QuickCapture) => void
  removeCapture: (id: string) => void
  processCapture: (id: string) => void
  setOpen: (open: boolean) => void
  clearProcessed: () => void
}

export const useQuickCaptureStore = create<QuickCaptureState>((set, get) => ({
  captures: [],
  isOpen: false,
  addCapture: (capture) => set({ captures: [capture, ...get().captures] }),
  removeCapture: (id) => set({ captures: get().captures.filter(c => c.id !== id) }),
  processCapture: (id) => set({
    captures: get().captures.map(c => c.id === id ? { ...c, processed: true } : c)
  }),
  setOpen: (isOpen) => set({ isOpen }),
  clearProcessed: () => set({ captures: get().captures.filter(c => !c.processed) }),
}))
