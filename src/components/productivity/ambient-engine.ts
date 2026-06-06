'use client'

import { useCallback, useRef, useEffect } from 'react'
import { SoundType } from '@/stores/music-store'

// Audio generation using Web Audio API
class AmbientAudioEngine {
  private context: AudioContext | null = null
  private nodes: Map<SoundType, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode; lfo?: OscillatorNode }> = new Map()
  private masterGain: GainNode | null = null

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext()
    }
    if (this.context.state === 'suspended') {
      this.context.resume()
    }
    return this.context
  }

  private createNoiseBuffer(duration: number = 2): AudioBuffer {
    const ctx = this.getContext()
    const sampleRate = ctx.sampleRate
    const length = sampleRate * duration
    const buffer = ctx.createBuffer(2, length, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1)
      }
    }
    return buffer
  }

  private createFilteredNoise(
    type: SoundType,
    gainNode: GainNode
  ): AudioBufferSourceNode {
    const ctx = this.getContext()

    const noiseBuffer = this.createNoiseBuffer(4)
    const source = ctx.createBufferSource()
    source.buffer = noiseBuffer
    source.loop = true

    const filter = ctx.createBiquadFilter()

    switch (type) {
      case 'rain':
        filter.type = 'bandpass'
        filter.frequency.value = 3000
        filter.Q.value = 0.5
        // Add subtle modulation
        const rainLfo = ctx.createOscillator()
        const rainLfoGain = ctx.createGain()
        rainLfo.frequency.value = 0.3
        rainLfoGain.gain.value = 500
        rainLfo.connect(rainLfoGain)
        rainLfoGain.connect(filter.frequency)
        rainLfo.start()
        break

      case 'forest':
        filter.type = 'bandpass'
        filter.frequency.value = 1500
        filter.Q.value = 0.8
        const forestLfo = ctx.createOscillator()
        const forestLfoGain = ctx.createGain()
        forestLfo.frequency.value = 0.15
        forestLfoGain.gain.value = 300
        forestLfo.connect(forestLfoGain)
        forestLfoGain.connect(filter.frequency)
        forestLfo.start()
        break

      case 'ocean':
        filter.type = 'lowpass'
        filter.frequency.value = 800
        filter.Q.value = 0.3
        const oceanLfo = ctx.createOscillator()
        const oceanLfoGain = ctx.createGain()
        oceanLfo.frequency.value = 0.08
        oceanLfoGain.gain.value = 400
        oceanLfo.connect(oceanLfoGain)
        oceanLfoGain.connect(filter.frequency)
        oceanLfo.start()
        break

      case 'fire':
        filter.type = 'bandpass'
        filter.frequency.value = 500
        filter.Q.value = 0.6
        const fireLfo = ctx.createOscillator()
        const fireLfoGain = ctx.createGain()
        fireLfo.frequency.value = 2
        fireLfoGain.gain.value = 0.15
        fireLfo.connect(fireLfoGain)
        fireLfoGain.connect(gainNode.gain)
        fireLfo.start()
        break

      case 'cafe':
        filter.type = 'bandpass'
        filter.frequency.value = 2000
        filter.Q.value = 0.4
        const cafeLfo = ctx.createOscillator()
        const cafeLfoGain = ctx.createGain()
        cafeLfo.frequency.value = 0.1
        cafeLfoGain.gain.value = 200
        cafeLfo.connect(cafeLfoGain)
        cafeLfoGain.connect(filter.frequency)
        cafeLfo.start()
        break

      case 'wind':
        filter.type = 'lowpass'
        filter.frequency.value = 600
        filter.Q.value = 0.2
        const windLfo = ctx.createOscillator()
        const windLfoGain = ctx.createGain()
        windLfo.frequency.value = 0.05
        windLfoGain.gain.value = 300
        windLfo.connect(windLfoGain)
        windLfoGain.connect(filter.frequency)
        windLfo.start()
        break

      case 'thunder':
        filter.type = 'lowpass'
        filter.frequency.value = 300
        filter.Q.value = 0.5
        const thunderLfo = ctx.createOscillator()
        const thunderLfoGain = ctx.createGain()
        thunderLfo.frequency.value = 0.03
        thunderLfoGain.gain.value = 0.3
        thunderLfo.connect(thunderLfoGain)
        thunderLfoGain.connect(gainNode.gain)
        thunderLfo.start()
        break

      case 'whitenoise':
        filter.type = 'allpass'
        break
    }

    source.connect(filter)
    filter.connect(gainNode)

    return source
  }

  play(type: SoundType, volume: number) {
    const ctx = this.getContext()

    if (!this.masterGain) {
      this.masterGain = ctx.createGain()
      this.masterGain.connect(ctx.destination)
    }

    // Stop existing sound of same type
    this.stop(type)

    const gainNode = ctx.createGain()
    gainNode.gain.value = 0
    gainNode.connect(this.masterGain)

    const source = this.createFilteredNoise(type, gainNode)
    source.start()

    // Fade in
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5)

    this.nodes.set(type, { source, gain: gainNode })
  }

  stop(type: SoundType) {
    const node = this.nodes.get(type)
    if (node) {
      try {
        const ctx = this.getContext()
        node.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
        setTimeout(() => {
          try {
            node.source.stop()
          } catch (e) {
            // Already stopped
          }
        }, 350)
      } catch (e) {
        // Handle gracefully
      }
      this.nodes.delete(type)
    }
  }

  setVolume(type: SoundType, volume: number) {
    const node = this.nodes.get(type)
    if (node) {
      const ctx = this.getContext()
      node.gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
    }
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      const ctx = this.getContext()
      this.masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
    }
  }

  stopAll() {
    this.nodes.forEach((_, type) => this.stop(type))
  }

  destroy() {
    this.stopAll()
    if (this.context) {
      this.context.close()
      this.context = null
    }
    this.masterGain = null
  }
}

// Singleton engine
let engine: AmbientAudioEngine | null = null

export function getAudioEngine(): AmbientAudioEngine {
  if (!engine) {
    engine = new AmbientAudioEngine()
  }
  return engine
}

export function useAudioEngine() {
  const engineRef = useRef<AmbientAudioEngine | null>(null)

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [])

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = getAudioEngine()
    }
    return engineRef.current
  }, [])

  return { getEngine }
}
