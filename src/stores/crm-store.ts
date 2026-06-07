import { create } from 'zustand'
import { firestoreCreate, firestoreUpdate, firestoreDelete, firestoreSubscribe, isUserAuthenticated } from '@/lib/firestore-service'

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
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
  removeContact: (id: string) => Promise<void>
  addNote: (contactId: string, note: ContactNote) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterTag: (tag: string | null) => void
  setFilterRelationship: (rel: string | null) => void
  getOverdueFollowUps: () => Contact[]
  initialize: () => () => void
}

export const useCRMStore = create<CRMState>((set, get) => ({
  contacts: [],
  searchQuery: '',
  filterTag: null,
  filterRelationship: null,

  addContact: async (contactData) => {
    const tempId = `temp_${Date.now()}`
    const now = new Date().toISOString()
    const tempContact: Contact = { ...contactData, id: tempId, createdAt: now, updatedAt: now }
    set({ contacts: [tempContact, ...get().contacts] })

    try {
      await firestoreCreate('contacts', contactData)
    } catch (error) {
      console.error('[CRM] Failed to add contact:', error)
      set({ contacts: get().contacts.filter(c => c.id !== tempId) })
    }
  },

  updateContact: async (id, updates) => {
    const previous = get().contacts
    set({ contacts: previous.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) })

    try {
      await firestoreUpdate('contacts', id, updates)
    } catch (error) {
      console.error('[CRM] Failed to update contact:', error)
      set({ contacts: previous })
    }
  },

  removeContact: async (id) => {
    const previous = get().contacts
    set({ contacts: previous.filter(c => c.id !== id) })

    try {
      await firestoreDelete('contacts', id)
    } catch (error) {
      console.error('[CRM] Failed to remove contact:', error)
      set({ contacts: previous })
    }
  },

  addNote: async (contactId, note) => {
    const previous = get().contacts
    set({ contacts: previous.map(c =>
      c.id === contactId ? { ...c, notes: [note, ...c.notes], updatedAt: new Date().toISOString() } : c
    )})

    try {
      const contact = get().contacts.find(c => c.id === contactId)
      if (contact) {
        await firestoreUpdate('contacts', contactId, { notes: contact.notes })
      }
    } catch (error) {
      console.error('[CRM] Failed to add note:', error)
      set({ contacts: previous })
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setFilterRelationship: (filterRelationship) => set({ filterRelationship }),
  getOverdueFollowUps: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().contacts.filter(c => c.followUpDate && c.followUpDate <= today)
  },

  initialize: () => {
    if (!isUserAuthenticated()) return () => {}
    const unsub = firestoreSubscribe<Contact>('contacts', 'createdAt', 'desc', (contacts) => {
      set({ contacts })
    })
    return unsub
  },
}))
