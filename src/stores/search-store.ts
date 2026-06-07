import { create } from 'zustand'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'task' | 'capture' | 'event' | 'contact' | 'reflection' | 'waiting' | 'note'
  badge: string
  date: string
  path?: string
}

interface SearchState {
  query: string
  results: SearchResult[]
  isOpen: boolean
  isSearching: boolean
  recentSearches: string[]
  setQuery: (query: string) => void
  setResults: (results: SearchResult[]) => void
  setOpen: (open: boolean) => void
  setSearching: (searching: boolean) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  search: (query: string, stores: {
    tasks: any[]
    captures: any[]
    events: any[]
    contacts: any[]
    reflections: any[]
    waitingItems: any[]
  }) => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isOpen: false,
  isSearching: false,
  recentSearches: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setOpen: (isOpen) => set({ isOpen }),
  setSearching: (isSearching) => set({ isSearching }),
  addRecentSearch: (query) => {
    if (!query.trim()) return
    const recent = [query, ...get().recentSearches.filter(s => s !== query)].slice(0, 10)
    set({ recentSearches: recent })
  },
  clearRecentSearches: () => set({ recentSearches: [] }),
  search: (query, stores) => {
    const q = query.toLowerCase().trim()
    if (!q) { set({ results: [], isSearching: false }); return }

    set({ isSearching: true })
    const results: SearchResult[] = []

    // Search tasks
    stores.tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
        results.push({
          id: t.id, title: t.title,
          description: `${t.category} · ${t.priority} priority · ${t.completed ? 'Done' : 'Active'}`,
          type: 'task', badge: 'Task', date: t.createdAt
        })
      }
    })

    // Search captures
    stores.captures.forEach(c => {
      if (c.content.toLowerCase().includes(q)) {
        results.push({
          id: c.id, title: c.content.slice(0, 60),
          description: `${c.type} · ${c.tags.join(', ')}`,
          type: 'capture', badge: 'Capture', date: c.createdAt
        })
      }
    })

    // Search events
    stores.events.forEach(e => {
      if (e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)) {
        results.push({
          id: e.id, title: e.title,
          description: `${e.type} · ${e.date}`,
          type: 'event', badge: 'Event', date: e.date
        })
      }
    })

    // Search contacts
    stores.contacts.forEach(c => {
      if (c.name.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)) {
        results.push({
          id: c.id, title: c.name,
          description: `${c.role || 'No role'} at ${c.company || 'N/A'} · ${c.relationship}`,
          type: 'contact', badge: 'Contact', date: c.updatedAt
        })
      }
    })

    // Search reflections
    stores.reflections.forEach(r => {
      const allText = [...r.wins, ...r.challenges, ...r.learnings, ...r.gratitude, r.notes || ''].join(' ').toLowerCase()
      if (allText.includes(q) || r.date.includes(q)) {
        results.push({
          id: r.id, title: `Reflection — ${r.date}`,
          description: `Mood: ${r.mood}/5 · Energy: ${r.energyLevel}/5`,
          type: 'reflection', badge: 'Reflection', date: r.date
        })
      }
    })

    // Search waiting items
    stores.waitingItems.forEach(w => {
      if (w.title.toLowerCase().includes(q) || w.requestedFrom.toLowerCase().includes(q)) {
        results.push({
          id: w.id, title: w.title,
          description: `From ${w.requestedFrom} · ${w.status}`,
          type: 'waiting', badge: 'Waiting', date: w.requestedDate
        })
      }
    })

    set({ results, isSearching: false })
  },
}))
