'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Captions,
  Maximize,
  Minimize
} from 'lucide-react'
import { formatTime } from './utils'

interface YouTubePlayer {
  mute: () => void
  unMute: () => void
  setVolume: (volume: number) => void
}

interface DocumentWithFullscreen extends Document {
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  showSub: boolean
  shouldUseYouTube: boolean
  youtubeReady: boolean
  onTogglePlay: () => void
  onSkip: (delta: number) => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number, muted: boolean) => void
  onToggleSubtitle: () => void
  videoRef: React.RefObject<HTMLVideoElement>
  youtubePlayerRef: React.RefObject<YouTubePlayer | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  showSub,
  shouldUseYouTube,
  youtubeReady,
  onTogglePlay,
  onSkip,
  onSeek,
  onVolumeChange,
  onToggleSubtitle,
  videoRef,
  youtubePlayerRef,
  containerRef
}: VideoControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setIsToggling(false)
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

  const toggleFullscreen = async () => {
    if (isToggling) return

    const container = containerRef.current
    if (!container) return

    setIsToggling(true)

    try {
      const isCurrentlyFullscreen = !!document.fullscreenElement

      const doc = document as DocumentWithFullscreen
      const el = container as ElementWithFullscreen

      if (isCurrentlyFullscreen) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
      } else {
        if (el.requestFullscreen) {
          await el.requestFullscreen()
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen()
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen()
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
      setIsToggling(false)
    }
  }

  const handleVolumeChange = (v: number[]) => {
    const vol = (v[0] ?? 0) / 100
    const newMuted = vol === 0
    onVolumeChange(vol, newMuted)

    if (shouldUseYouTube) {
      const player = youtubePlayerRef.current
      if (!player || !youtubeReady) return
      try {
        if (vol === 0) {
          player.mute()
        } else {
          player.unMute()
          player.setVolume(vol * 100)
        }
      } catch (error) {
        console.error('YouTube volume error:', error)
      }
      return
    }

    const el = videoRef.current
    if (!el) return
    el.volume = vol
    el.muted = newMuted
  }

  const container = containerRef.current
  const isContainerFullscreen = container && document.fullscreenElement === container

  const sliderClass = 'flex-1 min-w-0'

  return (
    <div
      className={
        isContainerFullscreen
          ? 'flex flex-nowrap items-center gap-2 bg-black/70 backdrop-blur-md rounded-lg px-3 py-2'
          : 'space-y-2 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 px-3 py-3 shadow-lg md:px-4 md:py-3'
      }
    >
      {isContainerFullscreen ? (
        /* Fullscreen: tất cả trên 1 dòng */
        <>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onSkip(-5)} className="h-8 w-8 rounded-full text-white/80 hover:text-white" aria-label="Tua lại 5 giây">
              <Rewind className="h-4 w-4" />
            </Button>
            <Button onClick={onTogglePlay} className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90" aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onSkip(5)} className="h-8 w-8 rounded-full text-white/80 hover:text-white" aria-label="Tua tiếp 5 giây">
              <FastForward className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-[10px] font-medium tabular-nums text-white/80 shrink-0 min-w-[2.25rem]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={(v) => onSeek(duration * ((v[0] ?? 0) / 100))}
            className="flex-1 min-w-0"
          />
          <span className="text-[10px] font-medium tabular-nums text-white/80 shrink-0 min-w-[2.25rem] text-right">
            {formatTime(duration)}
          </span>
          <div className="flex items-center gap-1 shrink-0 w-20">
            <button type="button" onClick={() => handleVolumeChange(muted || volume === 0 ? [50] : [0])} className="p-1 text-white/80 hover:text-white" aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <Slider value={[muted ? 0 : Math.round(volume * 100)]} onValueChange={handleVolumeChange} className="flex-1 min-w-0" />
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleSubtitle} className={`h-7 px-2 rounded shrink-0 ${showSub ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'}`} aria-label={showSub ? 'Tắt phụ đề' : 'Bật phụ đề'}>
            <Captions className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} disabled={isToggling} className="h-7 w-7 rounded text-white/80 hover:text-white shrink-0" aria-label="Thoát toàn màn hình">
            <Minimize className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
      {/* Progress bar - full width */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-[10px] md:text-xs font-medium tabular-nums text-muted-foreground min-w-[2.5rem] md:min-w-[3rem]">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
          onValueChange={(v) => {
            const percent = v[0] ?? 0
            onSeek(duration * (percent / 100))
          }}
          className={sliderClass}
        />
        <span className="text-[10px] md:text-xs font-medium tabular-nums text-muted-foreground min-w-[2.5rem] md:min-w-[3rem] text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Playback controls */}
        <div className="flex items-center gap-1 md:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSkip(-5)}
            className="h-9 w-9 rounded-full md:h-10 md:w-10 text-muted-foreground hover:text-foreground"
            aria-label="Tua lại 5 giây"
          >
            <Rewind className="h-4 w-4 md:h-4" />
          </Button>
          <Button
            onClick={onTogglePlay}
            className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-md"
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSkip(5)}
            className="h-9 w-9 rounded-full md:h-10 md:w-10 text-muted-foreground hover:text-foreground"
            aria-label="Tua tiếp 5 giây"
          >
            <FastForward className="h-4 w-4 md:h-4" />
          </Button>
        </div>

        {/* Volume - collapse on very small, expand on sm+ */}
        <div className="flex items-center gap-1.5 md:gap-2 md:w-24 lg:w-28">
          <button
            type="button"
            onClick={() => handleVolumeChange(muted || volume === 0 ? [50] : [0])}
            className="flex-shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4 md:h-4" />
            ) : (
              <Volume2 className="h-4 w-4 md:h-4" />
            )}
          </button>
          <div className="hidden sm:flex flex-1 min-w-0">
            <Slider
              value={[muted ? 0 : Math.round(volume * 100)]}
              onValueChange={handleVolumeChange}
              className={sliderClass}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 md:gap-1.5 ml-auto">
          <Button
            variant={showSub ? 'default' : 'ghost'}
            size="sm"
            onClick={onToggleSubtitle}
            className="h-8 gap-1.5 px-2.5 md:px-3 rounded-lg"
            aria-label={showSub ? 'Tắt phụ đề' : 'Bật phụ đề'}
          >
            <Captions className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline text-xs">Sub</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            disabled={isToggling}
            className="h-8 w-8 md:h-9 md:w-9 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

