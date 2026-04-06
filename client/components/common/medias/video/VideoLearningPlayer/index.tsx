'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useVideoPlayer } from './hooks/useVideoPlayer'
import { useYouTubePlayer } from './hooks/useYouTubePlayer'
import { VideoSection } from '../VideoSection'
import SubtitleOverlay from './SubtitleOverlay'
import VideoControls from './VideoControls'
import SubtitleList from './SubtitleList'
import type { Subtitle } from './utils'

interface VideoLearningPlayerProps {
  src: string
  poster?: string
  subtitles: Subtitle[]
}

export default function VideoLearningPlayer({ src, poster, subtitles }: VideoLearningPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showSub, setShowSub] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)

      // Khi exit fullscreen, luôn hiển thị controls
      if (!isNowFullscreen) {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Logic để tự động ẩn/hiện controls - CHỈ áp dụng khi fullscreen
  useEffect(() => {
    // Chỉ áp dụng auto-hide khi ở fullscreen mode
    if (!isFullscreen) {
      setShowControls(true)
      return
    }

    const container = containerRef.current
    if (!container) return

    const resetControlsTimeout = () => {
      // Hiển thị controls khi di chuột
      setShowControls(true)

      // Xóa timeout cũ nếu có
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      // Ẩn controls sau 3 giây nếu không có tương tác
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && isFullscreen) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseMove = () => {
      resetControlsTimeout()
    }

    const handleMouseLeave = () => {
      // Ẩn controls khi chuột rời khỏi container (chỉ khi fullscreen)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (isPlaying && isFullscreen) {
        setShowControls(false)
      }
    }

    // Hiển thị controls khi pause
    if (!isPlaying) {
      setShowControls(true)
    } else {
      resetControlsTimeout()
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, isFullscreen])

  const { videoRef, shouldUseYouTube, youtubeVideoId } = useVideoPlayer({
    src,
    onTimeUpdate: setCurrentTime,
    onDurationChange: setDuration
  })

  const { youtubePlayerRef, youtubeContainerRef, youtubeReady } = useYouTubePlayer({
    youtubeVideoId,
    onTimeUpdate: setCurrentTime,
    onDurationChange: setDuration,
    setIsPlaying,
    duration
  })

  const currentSubtitle = useMemo(() => {
    return subtitles.find(s => currentTime >= s.start && currentTime < s.end) || null
  }, [currentTime, subtitles])

  const togglePlay = () => {
    // Hiển thị controls khi click vào video (chỉ khi fullscreen)
    if (isFullscreen) {
      setShowControls(true)
    }

    if (shouldUseYouTube) {
      const player = youtubePlayerRef.current
      if (!player || !youtubeReady) return
      try {
        const YT = (window as any).YT // eslint-disable-line @typescript-eslint/no-explicit-any
        const state = player.getPlayerState?.()
        if (state === YT.PlayerState.PLAYING) {
          player.pauseVideo()
          setIsPlaying(false)
        } else {
          player.playVideo()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('YouTube play toggle failed:', error)
      }
      return
    }

    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    } else {
      el.pause()
      setIsPlaying(false)
    }
  }

  const seek = (time: number) => {
    if (shouldUseYouTube) {
      const player = youtubePlayerRef.current
      if (!player || !youtubeReady) return
      try {
        player.seekTo(Math.max(0, Math.min(time, duration)), true)
        setCurrentTime(Math.max(0, Math.min(time, duration)))
      } catch (error) {
        console.error('YouTube seek failed:', error)
      }
      return
    }

    const el = videoRef.current
    if (!el) return
    if (duration > 0) {
      el.currentTime = Math.max(0, Math.min(time, duration))
    } else {
      el.currentTime = Math.max(0, time)
    }
  }

  const skip = (delta: number) => seek(currentTime + delta)

  const jumpToLine = (s: Subtitle) => {
    seek(s.start + 0.01)
  }

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-5 gap-2 lg:auto-rows-fr">
      <div className="z-10 col-span-1 xl:col-span-3 flex flex-col gap-3 h-full">
        <div ref={containerRef} className={`@container relative ${isFullscreen ? 'rounded-none' : 'rounded-2xl'} overflow-hidden bg-black shadow-lg`}>
          <VideoSection
            src={src}
            poster={poster}
            controls={false}
            autoPlay={false}
            className="aspect-video"
            provider={shouldUseYouTube ? 'youtube' : 'html5'}
            useCustomControls
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            youtubeContainerRef={youtubeContainerRef as React.RefObject<HTMLDivElement>}
            onVideoClick={togglePlay}
            onVideoPlay={() => setIsPlaying(true)}
            onVideoPause={() => setIsPlaying(false)}
          />
          
          <SubtitleOverlay
            show={showSub}
            subtitle={currentSubtitle}
            isControlsVisible={showControls && isFullscreen}
            isFullscreen={isFullscreen}
          />

          {/* VideoControls inside container for fullscreen mode */}
          {isFullscreen && (
            <div className={`absolute bottom-0 left-0 right-0 p-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className={`bg-gradient-to-t from-black/90 via-black/70 to-transparent -mx-4 -mb-4 px-4 pb-4 pt-8 ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <VideoControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  muted={muted}
                  showSub={showSub}
                  shouldUseYouTube={shouldUseYouTube}
                  youtubeReady={youtubeReady}
                  onTogglePlay={togglePlay}
                  onSkip={skip}
                  onSeek={seek}
                  onVolumeChange={(vol, m) => {
                    setVolume(vol)
                    setMuted(m)
                  }}
                  onToggleSubtitle={() => setShowSub(v => !v)}
                  videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                  youtubePlayerRef={youtubePlayerRef}
                  containerRef={containerRef}
                />
              </div>
            </div>
          )}
        </div>

        {/* VideoControls outside container for normal mode - luôn hiển thị */}
        {!isFullscreen && (
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            muted={muted}
            showSub={showSub}
            shouldUseYouTube={shouldUseYouTube}
            youtubeReady={youtubeReady}
            onTogglePlay={togglePlay}
            onSkip={skip}
            onSeek={seek}
            onVolumeChange={(vol, m) => {
              setVolume(vol)
              setMuted(m)
            }}
            onToggleSubtitle={() => setShowSub(v => !v)}
            videoRef={videoRef as React.RefObject<HTMLVideoElement>}
            youtubePlayerRef={youtubePlayerRef}
            containerRef={containerRef}
          />
        )}
      </div>

      {!isFullscreen && (
        <div className='col-span-1 xl:col-span-2 scroll-pt-3 aspect-[32/27]'>
          <SubtitleList
            subtitles={subtitles}
            currentSubtitle={currentSubtitle}
            onJumpToLine={jumpToLine}
          />
        </div>
      )}
    </div>
  )
}

