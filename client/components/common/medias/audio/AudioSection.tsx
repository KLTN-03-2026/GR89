'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ChevronsLeft, ChevronsRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface props {
  audioUrl: string
}

export function AudioSection({ audioUrl }: props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hoverTime, setHoverTime] = useState<number>(0)
  const [showHoverTime, setShowHoverTime] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isVolume, setIsVolume] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Allow other components (e.g., the typing input) to control the audio via events
  useEffect(() => {
    const onToggle = () => {
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

    const onSeek = (e: Event) => {
      const audio = audioRef.current
      if (!audio) return
      const detail = (e as CustomEvent<{ delta: number }>).detail
      const delta = detail?.delta ?? 0
      const next = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + delta))
      audio.currentTime = next
      setCurrentTime(next)
    }

    window.addEventListener('audio:toggle', onToggle)
    window.addEventListener('audio:seek', onSeek as EventListener)
    return () => {
      window.removeEventListener('audio:toggle', onToggle)
      window.removeEventListener('audio:seek', onSeek as EventListener)
    }
  }, [])


  //Hàm lấy tổng thời gian
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0)
  }

  //useEffect lấy tổng thời gian
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    //gọi hàm lấy tổng thời gian
    handleLoadedMetadata()
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't hijack shortcuts while typing in inputs/textareas
    const target = e.target as HTMLElement | null
    const tag = target?.tagName?.toLowerCase()
    const isTypingTarget =
      tag === 'input' ||
      tag === 'textarea' ||
      (target instanceof HTMLElement && target.isContentEditable)
    if (isTypingTarget) return

    if (e.key === "ArrowRight") {
      handleIncreaseTime();
    } else if (e.key === "ArrowLeft") {
      handleDecreaseTime();
    } else if (e.key === "Control") {
      // use the same logic as the custom event
      window.dispatchEvent(new Event('audio:toggle'))
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
      else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  //Hàm cập nhật thời gian hiện tại
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0)
  }

  //Hàm Format thời giang dạng 00:00
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }


  //Hàm xử lý click vào progress
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  //Hàm xử lý hover vào progress
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const hoverX = e.clientX - rect.left
      const percentage = hoverX / rect.width
      const hoverTime = percentage * duration
      setHoverTime(hoverTime)
      setShowHoverTime(true)
    }
  }

  //Hàm xử lý rời khỏi progress
  const handleProgressLeave = () => {
    setShowHoverTime(false)
    setHoverTime(0)
  }

  //Hàm reset thời gian
  const handleResetTime = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  //Hàm tăng thời gian 5s
  const handleIncreaseTime = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 5
    }
  }

  //Hàm giảm thời gian 5s
  const handleDecreaseTime = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 5
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  //Hàm update volume
  const handleVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value
      setVolume(value)
    }
  }

  //Hàm click volume
  const handleVolumeClick = () => {
    if (audioRef.current) {
      audioRef.current.volume = isVolume ? volume : 0
      setIsVolume(!isVolume)
    }
  }

  // Hàm thay đổi tốc độ phát
  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  return (
    <Card className="border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Nghe đoạn văn</CardTitle>
          <button
            onClick={handlePlayPause}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <audio
          src={audioUrl}
          ref={audioRef}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}         /* Cập nhật thời gian hiện tại */
          onLoadedMetadata={handleLoadedMetadata} /* Lấy tổng thời gian */
          preload="metadata"
        />

        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs mt-1.5">
          <span className="tabular-nums">{formatTime(currentTime)}</span>
          <span className="tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Progress with hover preview */}
        <div className="relative mt-2.5">
          {showHoverTime && hoverTime !== 0 && (
            <div
              className="absolute -top-6 -translate-x-1/2 rounded-md bg-gray-800 text-white text-[10px] px-1.5 py-0.5 shadow"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          <div
            className="relative cursor-pointer"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            <Progress
              className="h-1.5 bg-gray-200 dark:bg-gray-800"
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
            />
            {showHoverTime && (
              <div
                className="absolute top-0 h-1.5 w-0.5 bg-indigo-400"
                style={{ left: `${(hoverTime / duration) * 100}%` }}
              />
            )}
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={handleResetTime}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={handleDecreaseTime}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={handleIncreaseTime}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={handleVolumeClick}>
              {isVolume ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              max={100}
              min={0}
              step={1}
              className="w-24"
              value={[volume * 100]}
              onValueChange={e => handleVolumeChange(e[0] / 100)}
            />
            {/* Playback speed */}
            <select
              className="ml-1 h-9 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm px-2"
              value={playbackRate}
              onChange={(e) => handleChangeRate(parseFloat(e.target.value))}
            >
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
              <option value={1.25}>1.25×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
