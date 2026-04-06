import { useEffect, useRef, useState } from 'react'
import { isYouTubeUrl, extractYouTubeId } from '../utils'

interface UseVideoPlayerProps {
  src: string
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
}

export function useVideoPlayer({ src, onTimeUpdate, onDurationChange }: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const shouldUseYouTube = isYouTubeUrl(src)
  const youtubeVideoId = shouldUseYouTube ? extractYouTubeId(src) : null

  useEffect(() => {
    if (shouldUseYouTube) return
    const el = videoRef.current
    if (!el) return
    const onTime = () => onTimeUpdate(el.currentTime)
    const onLoaded = () => onDurationChange(el.duration || 0)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [shouldUseYouTube, onTimeUpdate, onDurationChange])

  return {
    videoRef,
    shouldUseYouTube,
    youtubeVideoId
  }
}

