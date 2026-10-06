"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Sparkles, Radio } from "lucide-react"

interface AudioBriefingPlayerProps {
  brandName: string
  summaryText: string
  rankSummary: string
}

export function AudioBriefingPlayer({ brandName, summaryText, rankSummary }: AudioBriefingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(32) // 32 seconds simulated
  const [currentTime, setCurrentTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Speech synthesis ref
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.pause()
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsPlaying(false)
    } else {
      setIsPlaying(true)

      // Use browser SpeechSynthesis if available for real audible voice briefing
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const textToSpeak = `Executive AI Search Briefing for ${brandName}. ${rankSummary}. In summary: ${summaryText}`
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = 1.05
        utterance.pitch = 1.0

        // Select an English natural voice if present
        const voices = window.speechSynthesis.getVoices()
        const enVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha")))
        if (enVoice) utterance.voice = enVoice

        utterance.onend = () => {
          setIsPlaying(false)
          setCurrentTime(duration)
          setProgress(100)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }

        utterance.onerror = () => {
          setIsPlaying(false)
        }

        speechRef.current = utterance
        window.speechSynthesis.speak(utterance)
      }

      // Smooth progress timer
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            clearInterval(intervalRef.current!)
            setIsPlaying(false)
            return 0
          }
          const next = prev + 1
          setProgress(Math.round((next / duration) * 100))
          return next
        })
      }, 1000)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="w-full rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs p-4 sm:p-5 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
            <Radio className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="text-xs font-bold text-foreground font-sans uppercase tracking-wider">
            Synthesized AI Executive Briefing
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {isPlaying ? "Live Playing" : "Ready"}
          </span>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground">
          Voice Model: Claude Synthesizer
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play Button & Waveform */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
            title={isPlaying ? "Pause Briefing" : "Play Executive Briefing"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          {/* Animated Waveform Equalizer */}
          <div className="flex items-center gap-1 h-8 px-2 rounded-lg bg-muted/40 border border-border/50 flex-1 sm:w-48 justify-between">
            {[40, 70, 90, 60, 30, 85, 100, 45, 65, 80, 50, 95, 35, 75, 55, 85].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-foreground transition-all duration-150 ${
                  isPlaying ? "animate-pulse" : "opacity-30"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * Math.sin(i + currentTime * 2)) % 100)}%` : `${h * 0.25}%`,
                }}
              />
            ))}
          </div>

          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Live Audio Transcript Preview */}
        <div className="text-xs text-muted-foreground font-serif leading-snug line-clamp-2 max-w-md w-full border-l-2 border-border/70 pl-3">
          &ldquo;{summaryText}&rdquo;
        </div>
      </div>
    </div>
  )
}
