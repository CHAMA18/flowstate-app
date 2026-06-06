'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchStore, SearchResult } from '@/stores/search-store'
import { useTaskStore } from '@/stores/task-store'
import { useQuickCaptureStore } from '@/stores/quick-capture-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useCRMStore } from '@/stores/crm-store'
import { useReflectionStore } from '@/stores/reflection-store'
import { useWaitingForStore } from '@/stores/waiting-for-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, X, Clock, ListTodo, Zap, Calendar,
  Users, Sun, Hourglass, FileText, ArrowRight, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  task: { label: 'Task', icon: ListTodo, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  capture: { label: 'Capture', icon: Zap, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  event: { label: 'Event', icon: Calendar, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  contact: { label: 'Contact', icon: Users, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  reflection: { label: 'Reflection', icon: Sun, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  waiting: { label: 'Waiting', icon: Hourglass, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  note: { label: 'Note', icon: FileText, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
}

export function SmartSearch() {
  const { query, results, isOpen, isSearching, recentSearches, setQuery, setOpen, search, addRecentSearch, clearRecentSearches } = useSearchStore()
  const { tasks } = useTaskStore()
  const { captures } = useQuickCaptureStore()
  const { events } = useCalendarStore()
  const { contacts } = useCRMStore()
  const { entries } = useReflectionStore()
  const { items: waitingItems } = useWaitingForStore()

  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    if (q.trim().length > 0) {
      search(q, { tasks, captures, events, contacts, reflections: entries, waitingItems })
    }
  }, [tasks, captures, events, contacts, entries, waitingItems, setQuery, search])

  const handleSelect = (result: SearchResult) => {
    addRecentSearch(query)
    // Could navigate to the relevant panel here
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(Math.min(selectedIdx + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(Math.max(selectedIdx - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Search everything..."
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-transparent h-8 text-sm focus-visible:ring-0 px-0"
                />
                {query && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
                <kbd className="text-[9px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-muted/50 border border-border/30">
                  ESC
                </kbd>
              </div>

              <ScrollArea className="max-h-[60vh]">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : query ? (
                  results.length > 0 ? (
                    <div className="py-2">
                      {Object.entries(groupedResults).map(([type, typeResults]) => {
                        const config = TYPE_CONFIG[type]
                        if (!config) return null
                        const Icon = config.icon
                        return (
                          <div key={type}>
                            <div className="flex items-center gap-2 px-4 py-1.5">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{config.label}s</span>
                            </div>
                            {typeResults.map((result, i) => {
                              const globalIdx = results.indexOf(result)
                              return (
                                <button
                                  key={result.id}
                                  onClick={() => handleSelect(result)}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                    selectedIdx === globalIdx ? 'bg-primary/5' : 'hover:bg-muted/30'
                                  )}
                                >
                                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', config.color)}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{result.title}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{result.description}</p>
                                  </div>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Search className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No results for &quot;{query}&quot;</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Try different keywords</p>
                    </div>
                  )
                ) : (
                  /* Recent searches */
                  <div className="py-2">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 py-1.5">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</span>
                          <Button variant="ghost" size="sm" className="h-5 text-[9px] text-muted-foreground" onClick={clearRecentSearches}>
                            Clear
                          </Button>
                        </div>
                        {recentSearches.slice(0, 5).map((search, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(search)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/30 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">{search}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</span>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm">Quick Capture</p>
                        <p className="text-[10px] text-muted-foreground">Capture a thought instantly</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ListTodo className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm">New Task</p>
                        <p className="text-[10px] text-muted-foreground">Add a task to your list</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Sun className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm">Daily Reflection</p>
                        <p className="text-[10px] text-muted-foreground">Reflect on your day</p>
                      </div>
                    </button>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 text-[9px] text-muted-foreground/50">
                <div className="flex items-center gap-3">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
