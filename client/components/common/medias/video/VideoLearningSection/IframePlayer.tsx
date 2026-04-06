'use client'
import React from 'react'
import { extractYouTubeId, extractVimeoId } from './videoUrlUtils'

interface IframePlayerProps {
  src: string
  provider: 'youtube' | 'vimeo'
  className?: string
  allowFullScreen?: boolean
}

export const IframePlayer: React.FC<IframePlayerProps> = ({
  src,
  provider,
  className,
  allowFullScreen = true
}) => {
  let embedSrc = src

  if (provider === 'youtube') {
    const id = extractYouTubeId(src)
    if (id) {
      embedSrc = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1&playsinline=1`
    }
  }

  if (provider === 'vimeo') {
    const id = extractVimeoId(src)
    if (id) {
      embedSrc = `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`
    }
  }

  return (
    <iframe
      src={embedSrc}
      className={className ?? 'absolute inset-0 h-full w-full'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen={allowFullScreen}
      frameBorder={0}
    />
  )
}


