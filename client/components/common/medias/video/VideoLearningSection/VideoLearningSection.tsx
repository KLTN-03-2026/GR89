'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/libs/utils'
import { OverlayPlayButton } from './OverlayPlayButton'
import { ControlsBar } from './ControlsBar'
import { isYouTubeUrl, isVimeoUrl, extractYouTubeId, extractVimeoId } from './videoUrlUtils'
import { useYouTubePlayer } from './useYouTubePlayer'
import { useVimeoPlayer } from './useVimeoPlayer'
import type { VideoLearningSectionProps } from './types'

export function VideoLearningSection({
  src,
  poster,
  startTime = 0,
  endTime,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  aspect = { w: 16, h: 9 },
  provider = 'auto',
  onEndReached,
  replayTrigger
}: VideoLearningSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const youtubePlayerRef = useRef(null)
  const vimeoPlayerRef = useRef(null)
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null)
  const vimeoContainerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isYouTubeReady, setIsYouTubeReady] = useState(false)
  const [isVimeoReady, setIsVimeoReady] = useState(false)
  const paddingTopPercent = (aspect.h / aspect.w) * 100

  const shouldUseYouTube = provider === 'youtube' || (provider === 'auto' && isYouTubeUrl(src))
  const shouldUseVimeo = provider === 'vimeo' || (provider === 'auto' && !shouldUseYouTube && isVimeoUrl(src))
  const youtubeVideoId = shouldUseYouTube ? extractYouTubeId(src) : null
  const vimeoVideoId = shouldUseVimeo ? extractVimeoId(src) : null

  // Dùng hook để setup YouTube player (chỉ là iframe ẩn controls)
  const { handleYouTubePlay } = useYouTubePlayer({
    enabled: shouldUseYouTube,
    videoId: youtubeVideoId,
    startTime,
    endTime,
    autoPlay,
    muted,
    isMuted,
    volume,
    onEndReached,
    replayTrigger,
    youtubeContainerRef,
    youtubePlayerRef,
    setIsPlaying,
    setVideoEnded,
    setReady: setIsYouTubeReady
  })

  // Dùng hook để setup Vimeo player
  const { handleVimeoPlay } = useVimeoPlayer({
    enabled: shouldUseVimeo,
    videoId: vimeoVideoId,
    startTime,
    endTime,
    autoPlay,
    muted,
    isMuted,
    volume,
    onEndReached,
    replayTrigger,
    vimeoContainerRef,
    vimeoPlayerRef,
    setIsPlaying,
    setVideoEnded,
    setReady: setIsVimeoReady
  })

  // Xử lý start/end cho HTML5 video (video tự host)
  useEffect(() => {
    if (shouldUseYouTube || shouldUseVimeo || !videoRef.current) return

    const video = videoRef.current

    const handleLoadedMetadata = () => {
      if (startTime > 0) {
        video.currentTime = startTime
      }
    }

    const handleTimeUpdate = () => {
      if (endTime && video.currentTime >= endTime) {
        video.pause()
        setIsPlaying(false)
        setVideoEnded(true)
        video.currentTime = endTime
        if (onEndReached) {
          onEndReached()
        }
      }
    }

    const handleSeeking = () => {
      if (startTime >= 0 && video.currentTime < startTime) {
        video.currentTime = startTime
      }
      if (endTime && video.currentTime > endTime) {
        video.currentTime = endTime
      }
    }

    const handleSeeked = () => {
      if (startTime >= 0 && video.currentTime < startTime) {
        video.currentTime = startTime
      }
      if (endTime && video.currentTime > endTime) {
        video.currentTime = endTime
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('seeked', handleSeeked)

    if (video.readyState >= 1 && startTime > 0) {
      video.currentTime = startTime
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('seeked', handleSeeked)
    }
  }, [startTime, endTime, shouldUseYouTube, shouldUseVimeo, onEndReached])

  const togglePlay = () => {
    if (shouldUseYouTube) {
      handleYouTubePlay()
      return
    }
    if (shouldUseVimeo) {
      handleVimeoPlay()
      return
    }
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      if (startTime >= 0 && video.currentTime < startTime) {
        video.currentTime = startTime
      }
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleManualPlay = () => {
    if (shouldUseYouTube) {
      handleYouTubePlay()
      return
    }
    if (shouldUseVimeo) {
      handleVimeoPlay()
      return
    }
    const video = videoRef.current
    if (!video) return

    setVideoEnded(false)
    setIsPlaying(true)
    if (startTime >= 0 && video.currentTime < startTime) {
      video.currentTime = startTime
    }
    video
      .play()
      .catch(() => {
        setIsPlaying(false)
      })
  }

  const toggleMute = () => {
    if (shouldUseYouTube || shouldUseVimeo) return // Mute xử lý trong player API
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (shouldUseYouTube || shouldUseVimeo) return // Volume xử lý trong player API
    const video = videoRef.current
    if (!video) return
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    video.volume = newVolume
    setIsMuted(newVolume === 0)
    video.muted = newVolume === 0
  }

  return (
    <div className={cn('w-screen', className)}>
      <div className="relative w-full overflow-hidden rounded-md border border-white/15 shadow-[0_20px_60px_rgba(15,23,42,0.45)] bg-black aspect-video group">
        <div style={{ paddingTop: `${paddingTopPercent}%` }} />

        {shouldUseYouTube && (
          <>
            <div ref={youtubeContainerRef} className="absolute inset-0 h-full w-full overflow-hidden video-fill-frame" />
            {isYouTubeReady && (!isPlaying || videoEnded) && (
              <OverlayPlayButton
                label={videoEnded ? 'Replay & Refine' : 'Focus & Speak'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleManualPlay()
                }}
              />
            )}
          </>
        )}

        {shouldUseVimeo && !shouldUseYouTube && (
          <>
            <div ref={vimeoContainerRef} className="absolute inset-0 h-full w-full overflow-hidden video-fill-frame"></div>
            {isVimeoReady && (!isPlaying || videoEnded) && (
              <OverlayPlayButton
                label={videoEnded ? 'Replay & Refine' : 'Focus & Speak'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleManualPlay()
                }}
              />
            )}
          </>
        )}

        {!shouldUseYouTube && !shouldUseVimeo && (
          <>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay={autoPlay}
              muted={isMuted}
              loop={loop}
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              controls={false}
              onClick={videoEnded ? togglePlay : undefined}
              onPlay={() => {
                setIsPlaying(true)
                setVideoEnded(false)
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false)
                setVideoEnded(true)
                if (onEndReached) {
                  onEndReached()
                }
              }}
            />

            {!isPlaying && (
              <OverlayPlayButton
                label={videoEnded ? 'Replay & Refine' : 'Focus & Speak'}
                ariaLabel={videoEnded ? 'Replay video' : 'Play video'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleManualPlay()
                }}
              />
            )}

            <ControlsBar
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              onTogglePlay={togglePlay}
              onToggleMute={toggleMute}
              onVolumeChange={handleVolumeChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default VideoLearningSection


