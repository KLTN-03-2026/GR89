import { useEffect, useRef, useState } from 'react'

interface UseYouTubePlayerProps {
  youtubeVideoId: string | null
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
  duration: number
}

export function useYouTubePlayer({
  youtubeVideoId,
  onTimeUpdate,
  onDurationChange,
  setIsPlaying,
  duration
}: UseYouTubePlayerProps) {
  const youtubePlayerRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null)
  const youtubeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [youtubeReady, setYoutubeReady] = useState(false)

  useEffect(() => {
    if (!youtubeVideoId) return
    let mounted = true
    const clearTrackingInterval = () => {
      if (youtubeIntervalRef.current) {
        clearInterval(youtubeIntervalRef.current)
        youtubeIntervalRef.current = null
      }
    }

    const startInterval = () => {
      clearTrackingInterval()
      youtubeIntervalRef.current = setInterval(() => {
        const player = youtubePlayerRef.current
        if (!player) return
        try {
          const time = player.getCurrentTime?.()
          if (typeof time === 'number') {
            onTimeUpdate(time)
          }
        } catch {
          // ignore
        }
      }, 200)
    }

    const initializePlayer = () => {
      if (!youtubeContainerRef.current || !youtubeVideoId || !mounted) return
      try {
        youtubePlayerRef.current = new (window as any).YT.Player(youtubeContainerRef.current, { // eslint-disable-line @typescript-eslint/no-explicit-any
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            // Tắt closed captions mặc định của YouTube.
            cc_load_policy: 0,
            playsinline: 1
          },
          events: {
            onReady: (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              if (!mounted) return
              setYoutubeReady(true)
              try {
                const dur = event.target.getDuration?.()
                if (typeof dur === 'number' && !Number.isNaN(dur)) {
                  onDurationChange(dur)
                }
              } catch {
                // ignore
              }
            },
            onStateChange: (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              if (!mounted) return
              const YT = (window as any).YT // eslint-disable-line @typescript-eslint/no-explicit-any
              switch (event.data) {
                case YT.PlayerState.PLAYING:
                  setIsPlaying(true)
                  startInterval()
                  break
                case YT.PlayerState.PAUSED:
                  setIsPlaying(false)
                  clearTrackingInterval()
                  break
                case YT.PlayerState.ENDED:
                  setIsPlaying(false)
                  clearTrackingInterval()
                  onTimeUpdate(duration)
                  break
                default:
                  break
              }
            }
          }
        })
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error)
      }
    }

    const loadYouTubeAPI = () => {
      if ((window as any).YT?.Player) { // eslint-disable-line @typescript-eslint/no-explicit-any
        initializePlayer()
        return
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      const firstScript = document.getElementsByTagName('script')[0]
      firstScript?.parentNode?.insertBefore(tag, firstScript)
        ; (window as any).onYouTubeIframeAPIReady = () => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (mounted) initializePlayer()
        }
    }

    loadYouTubeAPI()

    return () => {
      mounted = false
      clearTrackingInterval()
      youtubePlayerRef.current?.destroy?.()
      youtubePlayerRef.current = null
      setYoutubeReady(false)
      setIsPlaying(false)
    }
  }, [youtubeVideoId, duration, onTimeUpdate, onDurationChange, setIsPlaying])

  return {
    youtubePlayerRef,
    youtubeContainerRef,
    youtubeReady
  }
}

