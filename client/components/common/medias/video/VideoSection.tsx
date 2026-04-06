'use client'

import { RefObject } from 'react'
import type { Config } from 'react-player'
import { cn } from '@/libs/utils'
import ReactPlayer from 'react-player'

interface VideoSectionProps {
  src: string
  poster?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  aspect?: { w: number; h: number }
  provider?: 'auto' | 'youtube' | 'html5'
  videoRef?: RefObject<HTMLVideoElement>
  youtubeContainerRef?: RefObject<HTMLDivElement>
  onVideoClick?: () => void
  onVideoPlay?: () => void
  onVideoPause?: () => void
  useCustomControls?: boolean
  playsInline?: boolean
  preload?: 'auto' | 'metadata' | 'none'
}

export function VideoSection({
  src,
  poster,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  aspect = { w: 16, h: 9 },
  provider = 'auto',
  videoRef,
  youtubeContainerRef,
  onVideoClick,
  onVideoPlay,
  onVideoPause,
  useCustomControls = false,
  playsInline = true,
  preload = 'metadata'
}: VideoSectionProps) {
  const paddingTopPercent = (aspect.h / aspect.w) * 100

  const isYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)

  const shouldUseYouTube = provider === 'youtube' || (provider === 'auto' && isYouTubeUrl(src))
  const baseMediaClass = 'absolute inset-0 h-full w-full'
  const videoClassName = `${baseMediaClass} object-cover`

  const youtubeConfig: NonNullable<Config['youtube']> = {
    rel: 0,
    iv_load_policy: 3,
    cc_load_policy: 0,
    hl: 'en',
    ...(typeof window !== 'undefined' && { origin: window.location.origin }),
    ...(!controls && { fs: 0 }),
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full overflow-hidden rounded-lg bg-black">
        <div style={{ paddingTop: `${paddingTopPercent}%` }} />
        {shouldUseYouTube ? (
          useCustomControls && youtubeContainerRef ? (
            <div ref={youtubeContainerRef} className={baseMediaClass} />
          ) : (
            <div className={baseMediaClass}>
              <ReactPlayer
                src={src}
                width="100%"
                height="100%"
                playing={autoPlay}
                muted={muted}
                controls={controls}
                loop={loop}
                playsInline={playsInline}
                pip={false}
                config={{ youtube: youtubeConfig }}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onClick={onVideoClick}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
          )
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls={useCustomControls ? false : controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            className={videoClassName}
            onClick={onVideoClick}
            onPlay={onVideoPlay}
            onPause={onVideoPause}
            playsInline={playsInline}
            preload={preload}
          />
        )}
      </div>
    </div>
  )
}