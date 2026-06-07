'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCRMStore, Contact, ContactNote } from '@/stores/crm-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users, Plus, Trash2, Mail, Phone, Building2,
  Search, Calendar, MessageSquare, PhoneCall, Coffee,
  ChevronDown, X, Star, Heart, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const RELATIONSHIP_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  lead: { label: 'Lead', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: ArrowRight },
  prospect: { label: 'Prospect', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Search },
  client: { label: 'Client', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Star },
  partner: { label: 'Partner', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: Heart },
  mentor: { label: 'Mentor', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Coffee },
  friend: { label: 'Friend', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: Heart },
}

const NOTE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  note: { label: 'Note', icon: MessageSquare, color: 'text-muted-foreground' },
  call: { label: 'Call', icon: PhoneCall, color: 'text-blue-500' },
  email: { label: 'Email', icon: Mail, color: 'text-emerald-500' },
  meeting: { label: 'Meeting', icon: Coffee, color: 'text-amber-500' },
  'follow-up': { label: 'Follow-up', icon: Calendar, color: 'text-purple-500' },
}

const WARMTH_LABELS = ['', 'Cold', 'Cool', 'Warm', 'Hot', 'On fire']

export function PersonalCRM() {
  const {
    contacts, searchQuery, filterRelationship,
    addContact, updateContact, removeContact, addNote,
    setSearchQuery, setFilterRelationship,
  } = useCRMStore()
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newContact, setNewContact] = useState({
    name: '', email: '', phone: '', company: '', role: '',
    relationship: 'prospect' as Contact['relationship'],
    followUpDate: '',
  })
  const [newNote, setNewNote] = useState({ content: '', type: 'note' as ContactNote['type'] })
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null)

  const handleAddContact = () => {
    if (!newContact.name.trim()) return
    addContact({
      id: `contact-${Date.now()}`,
      name: newContact.name.trim(),
      email: newContact.email || undefined,
      phone: newContact.phone || undefined,
      company: newContact.company || undefined,
      role: newContact.role || undefined,
      tags: [],
      notes: [],
      followUpDate: newContact.followUpDate || undefined,
      relationship: newContact.relationship,
      warmth: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setNewContact({ name: '', email: '', phone: '', company: '', role: '', relationship: 'prospect', followUpDate: '' })
    setShowForm(false)
  }

  const handleAddNote = (contactId: string) => {
    if (!newNote.content.trim()) return
    addNote(contactId, {
      id: `note-${Date.now()}`,
      content: newNote.content.trim(),
      type: newNote.type,
      createdAt: new Date().toISOString(),
    })
    setNewNote({ content: '', type: 'note' })
    setShowNoteForm(null)
  }

  const filtered = contacts.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRel = !filterRelationship || c.relationship === filterRelationship
    return matchesSearch && matchesRel
  })

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">People</h3>
          <Badge variant="secondary" className="text-[10px] h-5">{contacts.length} contacts</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-8 text-xs pl-8"
          />
        </div>
        <div className="flex gap-1">
          {Object.entries(RELATIONSHIP_CONFIG).slice(0, 4).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterRelationship(filterRelationship === key ? null : key)}
              className={cn(
                'text-[9px] font-medium px-2 py-1 rounded-md transition-all border',
                filterRelationship === key ? config.color : 'text-muted-foreground border-transparent hover:bg-muted/50'
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Contact Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-2">
              <Input placeholder="Name *" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} className="h-8 text-xs flex-1" />
                <Input placeholder="Phone" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} className="h-8 text-xs flex-1" />
              </div>
              <div className="flex gap-2">
                <Input placeholder="Company" value={newContact.company} onChange={e => setNewContact({ ...newContact, company: e.target.value })} className="h-8 text-xs flex-1" />
                <Input placeholder="Role" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} className="h-8 text-xs flex-1" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setNewContact({ ...newContact, relationship: key as Contact['relationship'] })}
                    className={cn(
                      'text-[10px] font-medium px-2 py-1 rounded-md transition-all border',
                      newContact.relationship === key ? config.color : 'text-muted-foreground border-transparent'
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
              <Input type="date" value={newContact.followUpDate} onChange={e => setNewContact({ ...newContact, followUpDate: e.target.value })} className="h-8 text-xs w-40" placeholder="Follow-up date" />
              <div className="flex gap-2">
                <Button type="button" size="sm" className="h-7 text-xs" onClick={handleAddContact}>Add Contact</Button>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact List */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-400px)]">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(contact => {
              const relConfig = RELATIONSHIP_CONFIG[contact.relationship]
              const isExpanded = expandedId === contact.id
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/40 overflow-hidden"
                >
                  {/* Contact header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <span className="text-xs font-bold text-primary">{contact.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <Badge className={cn('text-[8px] h-4 border', relConfig.color)}>{relConfig.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {contact.company && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Building2 className="w-2.5 h-2.5" /> {contact.company}
                          </span>
                        )}
                        {contact.followUpDate && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {contact.followUpDate}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Warmth indicator */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={cn('w-1.5 h-4 rounded-full', i < contact.warmth ? 'bg-amber-500' : 'bg-muted/30')} />
                      ))}
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                  </button>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-3">
                          <div className="flex gap-3 text-[10px] text-muted-foreground">
                            {contact.email && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> {contact.email}</span>}
                            {contact.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {contact.phone}</span>}
                          </div>

                          {/* Notes */}
                          {contact.notes.length > 0 && (
                            <div className="space-y-1">
                              {contact.notes.slice(0, 3).map(note => {
                                const noteConfig = NOTE_TYPE_CONFIG[note.type]
                                const NoteIcon = noteConfig?.icon || MessageSquare
                                return (
                                  <div key={note.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                                    <NoteIcon className={cn('w-3 h-3 mt-0.5', noteConfig?.color)} />
                                    <div>
                                      <p className="text-xs">{note.content}</p>
                                      <p className="text-[9px] text-muted-foreground mt-0.5">{noteConfig?.label} · {new Date(note.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Add note */}
                          {showNoteForm === contact.id ? (
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {Object.entries(NOTE_TYPE_CONFIG).map(([key, config]) => {
                                  const Icon = config.icon
                                  return (
                                    <button
                                      key={key}
                                      onClick={() => setNewNote({ ...newNote, type: key as ContactNote['type'] })}
                                      className={cn(
                                        'text-[9px] px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5',
                                        newNote.type === key ? config.color + ' bg-muted/30' : 'text-muted-foreground'
                                      )}
                                    >
                                      <Icon className="w-2.5 h-2.5" /> {config.label}
                                    </button>
                                  )
                                })}
                              </div>
                              <Textarea
                                placeholder="Add a note..."
                                value={newNote.content}
                                onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                                className="min-h-[40px] text-xs resize-none"
                              />
                              <div className="flex gap-2">
                                <Button type="button" size="sm" className="h-6 text-[10px]" onClick={() => handleAddNote(contact.id)}>Save</Button>
                                <Button type="button" size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setShowNoteForm(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setShowNoteForm(contact.id)}>
                              <MessageSquare className="w-2.5 h-2.5" /> Add note
                            </Button>
                          )}

                          <div className="flex gap-2 pt-1">
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive gap-1" onClick={() => removeContact(contact.id)}>
                              <Trash2 className="w-2.5 h-2.5" /> Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No contacts yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Track relationships and follow-ups</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
