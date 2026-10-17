"use client"

import { useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function HustleAudioToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState(false)

  async function toggleSound() {
    const audio = audioRef.current
    if (!audio) return

    if (enabled) {
      audio.pause()
      audio.currentTime = 0
      setEnabled(false)
      return
    }

    setEnabled(true)
    audio.currentTime = 0
    try {
      await audio.play()
    } catch {
      setEnabled(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/hustle-intro.wav" preload="none" loop />
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={enabled}
        aria-label={enabled ? "Stop looping brand intro audio" : "Play looping brand intro audio"}
        title={enabled ? "Stop looping brand intro audio" : "Play looping brand intro audio"}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#8358c9]/35 bg-[#8358c9]/5 px-2.5 text-[10px] font-bold text-[#e5c7ff] transition hover:bg-[#8358c9]/12 sm:px-3 sm:text-xs"
      >
        {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{enabled ? "Sound on · Loop" : "Play intro audio"}</span>
      </button>
    </>
  )
}
