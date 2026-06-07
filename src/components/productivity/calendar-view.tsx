'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCalendarStore, CalendarEvent, EVENT_COLORS } from '@/stores/calendar-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Clock, X, MapPin, Tag, Trash2, Edit2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  task: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  meeting: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  focus: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  reminder: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  personal: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function CalendarView() {
  const { events, selectedDate, view, addEvent, removeEvent, setSelectedDate, setView, getEventsForDate } = useCalendarStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', date: selectedDate, startTime: '09:00', endTime: '10:00',
    type: 'task' as CalendarEvent['type'], color: EVENT_COLORS[0],
  })

  const currentDate = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  }, [selectedDate])

  const navigateMonth = (direction: number) => {
    const d = new Date(currentDate.year, currentDate.month + direction, 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const daysInMonth = getDaysInMonth(currentDate.year, currentDate.month)
  const firstDay = getFirstDayOfMonth(currentDate.year, currentDate.month)
  const today = new Date().toISOString().split('T')[0]

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return
    addEvent({
      id: `evt-${Date.now()}`,
      ...newEvent,
      date: newEvent.date || selectedDate,
    })
    setNewEvent({ title: '', description: '', date: selectedDate, startTime: '09:00', endTime: '10:00', type: 'task', color: EVENT_COLORS[0] })
    setShowAddForm(false)
  }

  const dayEvents = (date: string) => getEventsForDate(date)
  const selectedDayEvents = getEventsForDate(selectedDate)

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [firstDay, daysInMonth])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'text-[10px] font-medium px-2.5 py-1 rounded-md transition-all capitalize',
                  view === v ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-3.5 h-3.5" />
            Event
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">
          {MONTHS[currentDate.month]} {currentDate.year}
        </h4>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setSelectedDate(today)}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="h-8 text-xs flex-1" />
                <Input type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} className="h-8 text-xs w-24" />
                <Input type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} className="h-8 text-xs w-24" />
              </div>
              <div className="flex gap-1.5">
                {Object.entries(EVENT_TYPE_COLORS).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setNewEvent({ ...newEvent, type: type as CalendarEvent['type'] })}
                    className={cn(
                      'text-[10px] font-medium px-2 py-1 rounded-md transition-all border',
                      newEvent.type === type ? `${config.bg} ${config.text} border-current/30` : 'text-muted-foreground border-transparent'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" size="sm" className="h-7 text-xs" onClick={handleAddEvent}>Add Event</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Grid */}
      <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/40 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/20">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="min-h-[72px] border-b border-r border-border/10 p-1" />
            const dateStr = `${currentDate.year}-${String(currentDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isSelected = dateStr === selectedDate
            const dayEvts = dayEvents(dateStr)

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'min-h-[72px] border-b border-r border-border/10 p-1 text-left transition-all hover:bg-muted/30',
                  isSelected && 'bg-primary/5',
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs mb-0.5',
                  isToday && 'bg-primary text-primary-foreground font-bold',
                  !isToday && isSelected && 'bg-primary/15 text-primary font-medium',
                )}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvts.slice(0, 2).map(evt => {
                    const config = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.task
                    return (
                      <div key={evt.id} className={cn('text-[8px] px-1 py-0.5 rounded truncate', config.bg, config.text)}>
                        {evt.title}
                      </div>
                    )
                  })}
                  {dayEvts.length > 2 && (
                    <div className="text-[8px] text-muted-foreground px-1">+{dayEvts.length - 2} more</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">
          {selectedDate === today ? 'Today' : selectedDate} — {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
        </h4>
        <AnimatePresence mode="popLayout">
          {selectedDayEvents.map(event => {
            const config = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.task
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:bg-card/80 transition-all"
              >
                <div className={cn('w-1.5 h-10 rounded-full', config.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.startTime && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {event.startTime}{event.endTime ? ` — ${event.endTime}` : ''}
                      </span>
                    )}
                    <Badge className={cn('text-[8px] h-4', config.bg, config.text, 'border-0')}>{event.type}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeEvent(event.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
