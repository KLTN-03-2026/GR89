'use client'

import React, { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { playAudio } from '@/libs/utils'
import { cn } from '@/libs/utils'

interface PlayAudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
}

export function PlayAudioButton({ text, className, ...props }: PlayAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPlaying) return
    setIsPlaying(true)
    try {
      await playAudio(text)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <button
      onClick={handlePlayAudio}
      disabled={isPlaying}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full outline-none transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed group",
        className
      )}
      title="Nghe mẫu"
      {...props}
    >
      {isPlaying ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Volume2 className="h-5 w-5 transition-transform group-hover:rotate-6" />
      )}
    </button>
  )
}
