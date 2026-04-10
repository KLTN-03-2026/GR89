'use client'
import { useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CompactTimerProps {
  isActive: boolean
  onTimeUpdate: (seconds: number) => void
  className?: string
  duration: number
}

export default function CompactTimer({ isActive, onTimeUpdate, className = '', duration }: CompactTimerProps) {

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        onTimeUpdate(duration + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, onTimeUpdate, duration])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatTime(duration)}
        </span>
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

