'use client'

import { useRef, useState, useEffect } from 'react'
import { Pause, Play, Headphones } from 'lucide-react'

interface AudioPlayerPauseOnlyProps {
  audioUrl: string
  className?: string
}

export function AudioPlayerPauseOnly({ audioUrl, className = '' }: AudioPlayerPauseOnlyProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration || 0)
  }, [audioUrl])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Headphones className="w-4 h-4 text-indigo-600" />
          Nghe audio (chỉ phát / tạm dừng)
        </div>
      </div>
      <div className="p-5 flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 active:scale-95 shrink-0"
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
