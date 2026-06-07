'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReflectionStore, ReflectionEntry } from '@/stores/reflection-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sun, Moon, Plus, X, Sparkles, Heart, Brain,
  Target, TrendingUp, ArrowRight, Flame, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOOD_EMOJIS = ['', '😫', '😕', '😐', '😊', '🤩']
const MOOD_LABELS = ['', 'Terrible', 'Not great', 'Okay', 'Good', 'Amazing']

const ENERGY_LABELS = ['', 'Depleted', 'Low', 'Moderate', 'High', 'Supercharged']

export function DailyReflection() {
  const { entries, addEntry, getEntryForDate, getStreak } = useReflectionStore()
  const today = new Date().toISOString().split('T')[0]
  const existingEntry = getEntryForDate(today)
  const streak = getStreak()

  const [isCreating, setIsCreating] = useState(!existingEntry)
  const [draft, setDraft] = useState<Partial<ReflectionEntry>>(existingEntry || {
    date: today,
    wins: [],
    challenges: [],
    learnings: [],
    gratitude: [],
    tomorrowPlan: [],
    mood: 3,
    energyLevel: 3,
    focusScore: 3,
  })

  const [newItemText, setNewItemText] = useState('')
  const [activeSection, setActiveSection] = useState<'wins' | 'challenges' | 'learnings' | 'gratitude' | 'tomorrowPlan'>('wins')

  const addItem = () => {
    if (!newItemText.trim()) return
    const section = activeSection
    const currentItems = (draft[section] as string[]) || []
    setDraft({ ...draft, [section]: [...currentItems, newItemText.trim()] })
    setNewItemText('')
  }

  const removeItem = (section: keyof ReflectionEntry, index: number) => {
    const items = [...(draft[section] as string[])]
    items.splice(index, 1)
    setDraft({ ...draft, [section]: items })
  }

  const handleSave = () => {
    addEntry({
      id: existingEntry?.id || `ref-${Date.now()}`,
      date: today,
      wins: (draft.wins as string[]) || [],
      challenges: (draft.challenges as string[]) || [],
      learnings: (draft.learnings as string[]) || [],
      gratitude: (draft.gratitude as string[]) || [],
      tomorrowPlan: (draft.tomorrowPlan as string[]) || [],
      mood: (draft.mood as 1 | 2 | 3 | 4 | 5) || 3,
      energyLevel: (draft.energyLevel as 1 | 2 | 3 | 4 | 5) || 3,
      focusScore: (draft.focusScore as 1 | 2 | 3 | 4 | 5) || 3,
      notes: draft.notes || undefined,
      completedAt: new Date().toISOString(),
    })
    setIsCreating(false)
  }

  const sections = [
    { key: 'wins' as const, label: 'What went well', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', placeholder: 'A win, achievement, or something positive...' },
    { key: 'challenges' as const, label: 'Challenges', icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10', placeholder: 'What was difficult or could be improved...' },
    { key: 'learnings' as const, label: 'Key learnings', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10', placeholder: 'What did you learn today...' },
    { key: 'gratitude' as const, label: 'Gratitude', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/10', placeholder: 'What are you grateful for...' },
    { key: 'tomorrowPlan' as const, label: 'Tomorrow', icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-500/10', placeholder: 'What do you want to focus on tomorrow...' },
  ]

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Daily Reflection</h3>
          {streak > 0 && (
            <Badge className="text-[10px] h-5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <Flame className="w-2.5 h-2.5 mr-0.5" /> {streak} day streak
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="text-[10px] h-5">{today}</Badge>
      </div>

      {existingEntry && !isCreating ? (
        /* Show completed reflection */
        <ScrollArea className="flex-1 max-h-[calc(100vh-250px)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Reflection completed!</p>
                <p className="text-[10px] text-muted-foreground">Great job taking time to reflect today.</p>
              </div>
            </div>

            {/* Mood/Energy/Focus scores */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="text-2xl">{MOOD_EMOJIS[existingEntry.mood]}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Mood</p>
                <p className="text-xs font-medium">{MOOD_LABELS[existingEntry.mood]}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="text-2xl">{existingEntry.energyLevel >= 4 ? '⚡' : existingEntry.energyLevel >= 3 ? '🔋' : '🪫'}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Energy</p>
                <p className="text-xs font-medium">{ENERGY_LABELS[existingEntry.energyLevel]}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="text-2xl">{existingEntry.focusScore >= 4 ? '🎯' : existingEntry.focusScore >= 3 ? '👁️' : '🌀'}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Focus</p>
                <p className="text-xs font-medium">{existingEntry.focusScore}/5</p>
              </div>
            </div>

            {/* Section summaries */}
            {sections.map(section => {
              const items = existingEntry[section.key] as string[]
              if (!items || items.length === 0) return null
              const Icon = section.icon
              return (
                <div key={section.key}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className={cn('w-3.5 h-3.5', section.color)} />
                    <span className="text-xs font-medium">{section.label}</span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {items.map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed">• {item}</p>
                    ))}
                  </div>
                </div>
              )
            })}

            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setIsCreating(true)}>
              Edit Reflection
            </Button>
          </div>
        </ScrollArea>
      ) : (
        /* Creation form */
        <ScrollArea className="flex-1 max-h-[calc(100vh-250px)]">
          <div className="space-y-4">
            {/* Mood / Energy / Focus */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'mood' as const, label: 'Mood', value: draft.mood || 3 },
                { key: 'energyLevel' as const, label: 'Energy', value: draft.energyLevel || 3 },
                { key: 'focusScore' as const, label: 'Focus', value: draft.focusScore || 3 },
              ].map(metric => (
                <div key={metric.key} className="text-center p-3 rounded-xl bg-card/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground mb-1.5">{metric.label}</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setDraft({ ...draft, [metric.key]: n })}
                        className={cn(
                          'w-5 h-5 rounded-full transition-all text-[10px] font-medium flex items-center justify-center',
                          n <= (metric.value)
                            ? 'bg-primary text-primary-foreground scale-105'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {metric.key === 'mood' ? MOOD_LABELS[metric.value] :
                     metric.key === 'energyLevel' ? ENERGY_LABELS[metric.value] :
                     `${metric.value}/5`}
                  </p>
                </div>
              ))}
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {sections.map(section => {
                const Icon = section.icon
                const count = ((draft[section.key] as string[]) || []).length
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap border',
                      activeSection === section.key
                        ? `${section.bg} ${section.color} border-current/20`
                        : 'text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {section.label}
                    {count > 0 && <span className="opacity-60">({count})</span>}
                  </button>
                )
              })}
            </div>

            {/* Add item input */}
            <div className="flex gap-2">
              <Input
                placeholder={sections.find(s => s.key === activeSection)?.placeholder}
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem() }}
                className="h-8 text-xs flex-1"
              />
              <Button type="button" size="sm" className="h-8 text-xs gap-1" onClick={addItem}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>

            {/* Items list */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {((draft[activeSection] as string[]) || []).map((item, i) => (
                  <motion.div
                    key={`${activeSection}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/40"
                  >
                    <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                    <p className="text-xs flex-1">{item}</p>
                    <button onClick={() => removeItem(activeSection, i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Notes */}
            <Textarea
              placeholder="Additional thoughts or notes..."
              value={draft.notes || ''}
              onChange={e => setDraft({ ...draft, notes: e.target.value })}
              className="min-h-[60px] text-xs resize-none"
            />

            {/* Save */}
            <Button className="w-full gap-1.5" onClick={handleSave}>
              <CheckCircle2 className="w-4 h-4" />
              Save Reflection
            </Button>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
