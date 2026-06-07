'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText, Plus, Users, Calendar, ListTodo, X,
  Sparkles, Trash2, ChevronDown, ArrowRight, StickyNote
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskStore } from '@/stores/task-store'

interface MeetingNote {
  id: string
  title: string
  date: string
  attendees: string[]
  notes: string
  actionItems: string[]
  createdAt: string
}

export function MeetingNotes() {
  const { addTask } = useTaskStore()
  const [meetings, setMeetings] = useState<MeetingNote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: '', date: new Date().toISOString().split('T')[0],
    attendees: '', notes: '', actionItems: '',
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newMeeting.title.trim()) return
    const meeting: MeetingNote = {
      id: `mtg-${Date.now()}`,
      title: newMeeting.title.trim(),
      date: newMeeting.date,
      attendees: newMeeting.attendees.split(',').map(s => s.trim()).filter(Boolean),
      notes: newMeeting.notes,
      actionItems: newMeeting.actionItems.split('\n').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }
    setMeetings([meeting, ...meetings])
    setNewMeeting({ title: '', date: new Date().toISOString().split('T')[0], attendees: '', notes: '', actionItems: '' })
    setShowForm(false)
  }

  const handleConvertToTask = (item: string) => {
    addTask({
      id: `task-${Date.now()}`,
      title: item,
      completed: false,
      category: 'work',
      priority: 'medium',
      pomodorosEstimated: 1,
      pomodorosCompleted: 0,
      createdAt: new Date().toISOString(),
    })
  }

  const handleDelete = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Meeting Notes</h3>
          <Badge variant="secondary" className="text-[10px] h-5">{meetings.length} notes</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" />
          New Note
        </Button>
      </div>

      {/* Add Meeting Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input placeholder="Meeting title" value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input type="date" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })} className="h-8 text-xs flex-1" />
                <Input placeholder="Attendees (comma separated)" value={newMeeting.attendees} onChange={e => setNewMeeting({ ...newMeeting, attendees: e.target.value })} className="h-8 text-xs flex-1" />
              </div>
              <Textarea placeholder="Meeting notes..." value={newMeeting.notes} onChange={e => setNewMeeting({ ...newMeeting, notes: e.target.value })} className="min-h-[80px] text-sm resize-none" />
              <Textarea placeholder="Action items (one per line)..." value={newMeeting.actionItems} onChange={e => setNewMeeting({ ...newMeeting, actionItems: e.target.value })} className="min-h-[60px] text-sm resize-none" />
              <div className="flex gap-2">
                <Button type="button" size="sm" className="h-7 text-xs gap-1" onClick={handleAdd}>
                  <Sparkles className="w-3 h-3" />
                  Save Note
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting List */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-350px)]">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {meetings.map(meeting => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group bg-card/50 backdrop-blur-sm rounded-xl border border-border/40 overflow-hidden"
              >
                {/* Meeting header */}
                <button
                  onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> {meeting.date}
                      </span>
                      {meeting.attendees.length > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" /> {meeting.attendees.length}
                        </span>
                      )}
                      {meeting.actionItems.length > 0 && (
                        <Badge variant="secondary" className="text-[8px] h-4">
                          <ListTodo className="w-2 h-2 mr-0.5" /> {meeting.actionItems.length} actions
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', expandedId === meeting.id && 'rotate-180')} />
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDelete(meeting.id) }}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedId === meeting.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-3 border-t border-border/20 pt-3">
                        {/* Attendees */}
                        {meeting.attendees.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> Attendees
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {meeting.attendees.map((a, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] h-5">{a}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {meeting.notes && (
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <StickyNote className="w-2.5 h-2.5" /> Notes
                            </p>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{meeting.notes}</p>
                          </div>
                        )}

                        {/* Action Items */}
                        {meeting.actionItems.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <ListTodo className="w-2.5 h-2.5" /> Action Items → Tasks
                            </p>
                            <div className="space-y-1">
                              {meeting.actionItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/20 transition-colors group/item">
                                  <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                                  <span className="text-xs flex-1">{item}</span>
                                  <Button variant="ghost" size="sm" className="h-5 text-[9px] gap-0.5 opacity-0 group-hover/item:opacity-100" onClick={() => handleConvertToTask(item)}>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                    Task
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {meetings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No meeting notes yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Capture notes and convert action items to tasks</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
