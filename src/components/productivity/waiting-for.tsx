'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaitingForStore, WaitingItem } from '@/stores/waiting-for-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Hourglass, Plus, Trash2, Bell, CheckCircle2,
  User, Calendar, AlertTriangle, Send, Clock, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  waiting: { label: 'Waiting', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Hourglass },
  reminded: { label: 'Reminded', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Bell },
  received: { label: 'Received', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: X },
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  medium: { label: 'Med', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
}

export function WaitingForList() {
  const { items, filter, addItem, markReceived, markReminded, removeItem, setFilter, getOverdue } = useWaitingForStore()
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '', requestedFrom: '', expectedDate: '',
    priority: 'medium' as WaitingItem['priority'], description: '',
  })

  const handleAdd = () => {
    if (!newItem.title.trim() || !newItem.requestedFrom.trim()) return
    addItem({
      id: `wait-${Date.now()}`,
      title: newItem.title.trim(),
      description: newItem.description || undefined,
      requestedFrom: newItem.requestedFrom.trim(),
      requestedDate: new Date().toISOString().split('T')[0],
      expectedDate: newItem.expectedDate || undefined,
      priority: newItem.priority,
      status: 'waiting',
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setNewItem({ title: '', requestedFrom: '', expectedDate: '', priority: 'medium', description: '' })
    setShowForm(false)
  }

  const overdue = getOverdue()
  const filteredItems = items.filter(i => {
    if (filter === 'waiting') return i.status === 'waiting'
    if (filter === 'received') return i.status === 'received'
    if (filter === 'overdue') return overdue.some(o => o.id === i.id)
    return true
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hourglass className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Waiting For</h3>
          <Badge variant="secondary" className="text-[10px] h-5">{items.filter(i => i.status === 'waiting').length} pending</Badge>
        </div>
        {overdue.length > 0 && (
          <Badge className="text-[10px] h-5 bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> {overdue.length} overdue
          </Badge>
        )}
      </div>

      {/* Add button */}
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-fit" onClick={() => setShowForm(!showForm)}>
        <Plus className="w-3.5 h-3.5" />
        Add Item
      </Button>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input placeholder="What are you waiting for? *" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input placeholder="Requested from * (person/team)" value={newItem.requestedFrom} onChange={e => setNewItem({ ...newItem, requestedFrom: e.target.value })} className="h-8 text-xs flex-1" />
                <Input type="date" value={newItem.expectedDate} onChange={e => setNewItem({ ...newItem, expectedDate: e.target.value })} className="h-8 text-xs w-36" />
              </div>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewItem({ ...newItem, priority: p })}
                    className={cn('text-[10px] font-medium px-2 py-1 rounded-md transition-all border', newItem.priority === p ? PRIORITY_CONFIG[p].color : 'text-muted-foreground border-transparent')}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" className="h-7 text-xs" onClick={handleAdd}>Add</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-muted/30">
        {[
          { key: 'all' as const, label: 'All', count: items.length },
          { key: 'waiting' as const, label: 'Waiting', count: items.filter(i => i.status === 'waiting').length },
          { key: 'overdue' as const, label: 'Overdue', count: overdue.length },
          { key: 'received' as const, label: 'Received', count: items.filter(i => i.status === 'received').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-1 text-[10px] font-medium py-1.5 px-1.5 rounded-md transition-all',
              filter === f.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/70'
            )}
          >
            {f.label} <span className="opacity-50">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-450px)]">
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => {
              const statusConfig = STATUS_CONFIG[item.status]
              const isOverdue = item.status === 'waiting' && item.expectedDate && item.expectedDate < today
              const StatusIcon = statusConfig.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className={cn(
                    'group flex items-start gap-3 p-3 rounded-xl transition-all',
                    'bg-card/50 border hover:bg-card/80',
                    isOverdue ? 'border-rose-500/30' : 'border-border/40'
                  )}
                >
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border', statusConfig.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" /> {item.requestedFrom}
                      </span>
                      {item.expectedDate && (
                        <span className={cn(
                          'text-[10px] flex items-center gap-0.5',
                          isOverdue ? 'text-rose-500' : 'text-muted-foreground'
                        )}>
                          <Calendar className="w-2.5 h-2.5" /> {item.expectedDate}
                        </span>
                      )}
                      <Badge className={cn('text-[8px] h-4 border', PRIORITY_CONFIG[item.priority].color)}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status === 'waiting' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markReminded(item.id)} title="Send reminder">
                          <Bell className="w-3 h-3 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markReceived(item.id)} title="Mark received">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Hourglass className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">
                {filter === 'overdue' ? 'No overdue items! 🎉' : 'Nothing waiting right now'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
