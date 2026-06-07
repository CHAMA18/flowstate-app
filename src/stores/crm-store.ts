import { create } from 'zustand'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  avatar?: string
  tags: string[]
  notes: ContactNote[]
  lastContactDate?: string
  followUpDate?: string
  relationship: 'lead' | 'prospect' | 'client' | 'partner' | 'mentor' | 'friend'
  warmth: number // 1-5
  createdAt: string
  updatedAt: string
}

export interface ContactNote {
  id: string
  content: string
  createdAt: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'follow-up'
}

interface CRMState {
  contacts: Contact[]
  searchQuery: string
  filterTag: string | null
  filterRelationship: string | null
  addContact: (contact: Contact) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  removeContact: (id: string) => void
  addNote: (contactId: string, note: ContactNote) => void
  setSearchQuery: (query: string) => void
  setFilterTag: (tag: string | null) => void
  setFilterRelationship: (rel: string | null) => void
  getOverdueFollowUps: () => Contact[]
}

export const useCRMStore = create<CRMState>((set, get) => ({
  contacts: [],
  searchQuery: '',
  filterTag: null,
  filterRelationship: null,
  addContact: (contact) => set({ contacts: [contact, ...get().contacts] }),
  updateContact: (id, updates) => set({
    contacts: get().contacts.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  }),
  removeContact: (id) => set({ contacts: get().contacts.filter(c => c.id !== id) }),
  addNote: (contactId, note) => set({
    contacts: get().contacts.map(c =>
      c.id === contactId ? { ...c, notes: [note, ...c.notes], updatedAt: new Date().toISOString() } : c
    )
  }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setFilterRelationship: (filterRelationship) => set({ filterRelationship }),
  getOverdueFollowUps: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().contacts.filter(c => c.followUpDate && c.followUpDate <= today)
  },
}))
