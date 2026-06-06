'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMusicStore, SoundType } from '@/stores/music-store'
import { useAudioEngine } from './ambient-engine'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Waves, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

function VisualizerBar({ isActive, delay, maxHeight }: { isActive: boolean; delay: number; maxHeight: number }) {
  return (
    <motion.div
      className="w-1 rounded-full bg-gradient-to-t from-primary/60 to-primary"
      animate={isActive ? {
        height: [4, maxHeight, 4],
      } : { height: 4 }}
      transition={isActive ? {
        duration: 0.6 + Math.random() * 0.4,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut',
      } : { duration: 0.3 }}
    />
  )
}

export function MusicPlayer() {
  const { sounds, masterVolume, isAnyPlaying, toggleSound, setVolume, setMasterVolume, stopAll } = useMusicStore()
  const { getEngine } = useAudioEngine()
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    const count = sounds.filter(s => s.isPlaying).length
    setActiveCount(count)
  }, [sounds])

  const handleToggleSound = useCallback((id: SoundType) => {
    const sound = sounds.find(s => s.id === id)
    if (!sound) return

    toggleSound(id)

    const engine = getEngine()
    if (sound.isPlaying) {
      engine.stop(id)
    } else {
      engine.play(id, sound.volume * masterVolume)
    }
  }, [sounds, masterVolume, toggleSound, getEngine])

  const handleVolumeChange = useCallback((id: SoundType, value: number[]) => {
    const volume = value[0]
    setVolume(id, volume)
    const engine = getEngine()
    engine.setVolume(id, volume * masterVolume)
  }, [masterVolume, setVolume, getEngine])

  const handleMasterVolume = useCallback((value: number[]) => {
    const vol = value[0]
    setMasterVolume(vol)
    const engine = getEngine()
    engine.setMasterVolume(vol)
  }, [setMasterVolume, getEngine])

  const handleStopAll = useCallback(() => {
    stopAll()
    const engine = getEngine()
    engine.stopAll()
  }, [stopAll, getEngine])

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Waves className="w-5 h-5 text-primary" />
            {isAnyPlaying && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <h3 className="text-sm font-semibold">Ambient Sounds</h3>
        </div>
        <div className="flex items-center gap-2">
          {isAnyPlaying && (
            <span className="text-xs text-muted-foreground">{activeCount} active</span>
          )}
          {isAnyPlaying && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleStopAll}
            >
              <Pause className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Visualizer */}
      <div className="flex items-end justify-center gap-[3px] h-10">
        {Array.from({ length: 24 }).map((_, i) => (
          <VisualizerBar
            key={i}
            isActive={isAnyPlaying}
            delay={i * 0.05}
            maxHeight={12 + Math.random() * 20}
          />
        ))}
      </div>

      {/* Sound grid */}
      <div className="grid grid-cols-4 gap-2">
        {sounds.map((sound) => (
          <motion.button
            key={sound.id}
            onClick={() => handleToggleSound(sound.id)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300',
              'border border-transparent',
              sound.isPlaying
                ? 'bg-primary/10 border-primary/30 shadow-sm'
                : 'bg-muted/30 hover:bg-muted/50'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-xl">{sound.icon}</span>
            <span className={cn(
              'text-[10px] font-medium truncate w-full text-center',
              sound.isPlaying ? 'text-primary' : 'text-muted-foreground'
            )}>
              {sound.name}
            </span>
            {sound.isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary/20"
                layoutId="sound-active"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Active sound volumes */}
      <AnimatePresence>
        {sounds.filter(s => s.isPlaying).map((sound) => (
          <motion.div
            key={sound.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 py-1">
              <span className="text-base">{sound.icon}</span>
              <Slider
                value={[sound.volume]}
                max={1}
                step={0.01}
                onValueChange={(v) => handleVolumeChange(sound.id, v)}
                className="flex-1"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Master volume */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleMasterVolume([masterVolume > 0 ? 0 : 0.7])}
        >
          {masterVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Slider
          value={[masterVolume]}
          max={1}
          step={0.01}
          onValueChange={handleMasterVolume}
          className="flex-1"
        />
      </div>
    </div>
  )
}
