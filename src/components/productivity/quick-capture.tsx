'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuickCaptureStore, QuickCapture } from '@/stores/quick-capture-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Zap, Lightbulb, Link2, StickyNote, CheckSquare,
  X, ArrowRight, Tag, Sparkles, Inbox
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CAPTURE_TYPES = [
  { id: 'thought' as const, label: 'Thought', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'task' as const, label: 'Task', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'note' as const, label: 'Note', icon: StickyNote, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'link' as const, label: 'Link', icon: Link2, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
]

export function QuickCapture() {
  const { captures, addCapture, removeCapture, processCapture, clearProcessed } = useQuickCaptureStore()
  const [content, setContent] = useState('')
  const [type, setType] = useState<QuickCapture['type']>('thought')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const handleAdd = () => {
    if (!content.trim()) return
    addCapture({
      id: `cap-${Date.now()}`,
      content: content.trim(),
      type,
      tags,
      createdAt: new Date().toISOString(),
      processed: false,
    })
    setContent('')
    setTags([])
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const unprocessed = captures.filter(c => !c.processed)
  const processed = captures.filter(c => c.processed)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Quick Capture</h3>
          <Badge variant="secondary" className="text-[10px] h-5">
            {unprocessed.length} inbox
          </Badge>
        </div>
        {processed.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearProcessed}>
            Clear processed
          </Button>
        )}
      </div>

      {/* Capture Input */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-border/50 space-y-3">
        {/* Type selector */}
        <div className="flex gap-1.5">
          {CAPTURE_TYPES.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  type === t.id
                    ? `${t.bg} ${t.color}`
                    : 'text-muted-foreground border-transparent hover:bg-muted/50'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content input */}
        <Textarea
          placeholder="Capture a thought, idea, or anything..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="min-h-[60px] resize-none text-sm border-border/50"
          autoFocus
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] h-5 gap-1 pr-1">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
          <Input
            placeholder="Add tag (Enter)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="h-5 w-24 text-[10px] border-0 bg-transparent px-1 focus-visible:ring-0"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleAdd}>
            <Sparkles className="w-3 h-3" />
            Capture
          </Button>
          <span className="text-[10px] text-muted-foreground/50 self-center">Press Enter to capture</span>
        </div>
      </div>

      {/* Capture List */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-420px)]">
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {unprocessed.map(capture => {
              const typeConfig = CAPTURE_TYPES.find(t => t.id === capture.type)
              const Icon = typeConfig?.icon || Lightbulb
              return (
                <motion.div
                  key={capture.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:bg-card/80 transition-all"
                >
                  <div className={cn('flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center', typeConfig?.bg)}>
                    <Icon className={cn('w-3.5 h-3.5', typeConfig?.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{capture.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {capture.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground/40">
                        {new Date(capture.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => processCapture(capture.id)}>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCapture(capture.id)}>
                      <X className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {unprocessed.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-muted-foreground"
            >
              <Inbox className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Inbox is empty. Capture something!</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
