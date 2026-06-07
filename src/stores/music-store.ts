import { create } from 'zustand'

export type SoundType = 'rain' | 'forest' | 'ocean' | 'fire' | 'cafe' | 'wind' | 'thunder' | 'whitenoise'

interface AmbientSound {
  id: SoundType
  name: string
  icon: string
  color: string
  volume: number
  isPlaying: boolean
}

const SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', icon: '🌧️', color: 'oklch(0.65 0.12 220)', volume: 0.5, isPlaying: false },
  { id: 'forest', name: 'Forest', icon: '🌲', color: 'oklch(0.65 0.16 150)', volume: 0.5, isPlaying: false },
  { id: 'ocean', name: 'Ocean', icon: '🌊', color: 'oklch(0.60 0.15 220)', volume: 0.5, isPlaying: false },
  { id: 'fire', name: 'Fire', icon: '🔥', color: 'oklch(0.70 0.18 40)', volume: 0.5, isPlaying: false },
  { id: 'cafe', name: 'Cafe', icon: '☕', color: 'oklch(0.65 0.12 60)', volume: 0.5, isPlaying: false },
  { id: 'wind', name: 'Wind', icon: '💨', color: 'oklch(0.70 0.06 200)', volume: 0.5, isPlaying: false },
  { id: 'thunder', name: 'Thunder', icon: '⛈️', color: 'oklch(0.55 0.10 270)', volume: 0.5, isPlaying: false },
  { id: 'whitenoise', name: 'White Noise', icon: '📻', color: 'oklch(0.60 0.05 0)', volume: 0.5, isPlaying: false },
]

interface MusicState {
  sounds: AmbientSound[]
  masterVolume: number
  isAnyPlaying: boolean
  toggleSound: (id: SoundType) => void
  setVolume: (id: SoundType, volume: number) => void
  setMasterVolume: (volume: number) => void
  stopAll: () => void
}

export const useMusicStore = create<MusicState>((set, get) => ({
  sounds: SOUNDS,
  masterVolume: 0.7,
  isAnyPlaying: false,
  toggleSound: (id) => {
    const sounds = get().sounds.map(s =>
      s.id === id ? { ...s, isPlaying: !s.isPlaying } : s
    )
    const isAnyPlaying = sounds.some(s => s.isPlaying)
    set({ sounds, isAnyPlaying })
  },
  setVolume: (id, volume) => {
    const sounds = get().sounds.map(s =>
      s.id === id ? { ...s, volume } : s
    )
    set({ sounds })
  },
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  stopAll: () => {
    const sounds = get().sounds.map(s => ({ ...s, isPlaying: false }))
    set({ sounds, isAnyPlaying: false })
  },
}))
