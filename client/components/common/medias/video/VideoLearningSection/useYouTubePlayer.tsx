import { useEffect } from 'react'

interface UseYouTubePlayerParams {
  enabled: boolean
  videoId: string | null
  startTime: number
  endTime?: number
  autoPlay: boolean
  muted: boolean
  isMuted: boolean
  volume: number
  onEndReached?: () => void
  replayTrigger?: number
  // refs & state setters
  youtubeContainerRef: React.RefObject<HTMLDivElement | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  youtubePlayerRef: React.MutableRefObject<any>
  setIsPlaying: (value: boolean) => void
  setVideoEnded: (value: boolean) => void
  setReady: (value: boolean) => void
}

// Tách toàn bộ logic YouTube ra hook riêng để file component gọn hơn
export function useYouTubePlayer({
  enabled,
  videoId,
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
  setReady
}: UseYouTubePlayerParams) {
  // Load YouTube IFrame API + init player
  useEffect(() => {
    if (!enabled || !videoId) return

    let mounted = true
    let checkInterval: NodeJS.Timeout | null = null

    const initializeYouTubePlayer = () => {
      if (!youtubeContainerRef.current || !videoId || !mounted) return

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        youtubePlayerRef.current = new (window as any).YT.Player(youtubeContainerRef.current, {
          videoId,
          playerVars: {
            start: Math.floor(startTime || 0),
            end: endTime ? Math.floor(endTime) : undefined,
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            mute: muted || isMuted ? 1 : 0,
            noloading: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : ''
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (event: any) => {
              if (!mounted) return
              setVideoEnded(false)
              setReady(true)
              // Set volume
              if (event.target.setVolume) {
                event.target.setVolume(volume * 100)
              }
              if (autoPlay && event.target.playVideo) {
                event.target.playVideo()
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (event: any) => {
              if (!mounted) return
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const YT = (window as any).YT
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) {
                setIsPlaying(false)
                if (endTime && youtubePlayerRef.current?.getCurrentTime) {
                  const currentTime = youtubePlayerRef.current.getCurrentTime()
                  if (currentTime >= endTime - 0.5 && onEndReached) {
                    onEndReached()
                  }
                }
              } else if (event.data === YT.PlayerState.ENDED) {
                setIsPlaying(false)
                setVideoEnded(true)
                if (onEndReached) {
                  onEndReached()
                }
              }
            },
            onError: () => {
              console.error('YouTube player error')
            }
          }
        })

        if (endTime) {
          checkInterval = setInterval(() => {
            if (!mounted || !youtubePlayerRef.current) return
            try {
              const currentTime = youtubePlayerRef.current.getCurrentTime()
              if (currentTime >= endTime - 0.1) {
                youtubePlayerRef.current.pauseVideo()
                setVideoEnded(true)
                setIsPlaying(false)
                if (onEndReached) {
                  onEndReached()
                }
              }
              if (currentTime > endTime) {
                youtubePlayerRef.current.seekTo(endTime, true)
              }
            } catch {
              // ignore
            }
          }, 50)
        }
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error)
      }
    }

    const loadYouTubeAPI = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).YT?.Player) {
        initializeYouTubePlayer()
        return
      }

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (window as any).onYouTubeIframeAPIReady = () => {
          if (mounted) {
            initializeYouTubePlayer()
          }
        }
    }

    setReady(false)
    loadYouTubeAPI()

    return () => {
      mounted = false
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      if (youtubePlayerRef.current?.destroy) {
        try {
          youtubePlayerRef.current.destroy()
        } catch {
          // ignore
        }
      }
      setReady(false)
    }
  }, [
    enabled,
    videoId,
    startTime,
    endTime,
    autoPlay,
    muted,
    isMuted,
    volume,
    onEndReached,
    youtubeContainerRef,
    youtubePlayerRef,
    setIsPlaying,
    setVideoEnded,
    setReady
  ])

  // Handle replay trigger cho YouTube
  useEffect(() => {
    if (!enabled || !replayTrigger || replayTrigger <= 0) return

    // Đợi player sẵn sàng trước khi replay
    if (!youtubePlayerRef.current) {
      // Nếu player chưa sẵn sàng, đợi một chút rồi thử lại
      const checkPlayer = setInterval(() => {
        if (youtubePlayerRef.current) {
          clearInterval(checkPlayer)
          if (youtubePlayerRef.current.seekTo) {
            youtubePlayerRef.current.seekTo(startTime || 0, true)
          }
          if (youtubePlayerRef.current.playVideo) {
            youtubePlayerRef.current.playVideo()
          }
          setIsPlaying(true)
          setVideoEnded(false)
        }
      }, 100)

      // Timeout sau 5 giây
      setTimeout(() => {
        clearInterval(checkPlayer)
      }, 5000)

      return () => {
        clearInterval(checkPlayer)
      }
    }

    // Player đã sẵn sàng, replay ngay
    if (youtubePlayerRef.current.seekTo) {
      youtubePlayerRef.current.seekTo(startTime || 0, true)
    }
    if (youtubePlayerRef.current.playVideo) {
      youtubePlayerRef.current.playVideo()
    }
    setIsPlaying(true)
    setVideoEnded(false)
  }, [enabled, replayTrigger, startTime, setIsPlaying, setVideoEnded, youtubePlayerRef])

  const handleYouTubePlay = () => {
    if (!youtubePlayerRef.current) {
      // Player chưa sẵn sàng → không làm gì, overlay sẽ chỉ hiện khi setReady(true)
      return
    }
    setVideoEnded(false)
    if (youtubePlayerRef.current.seekTo) {
      youtubePlayerRef.current.seekTo(startTime || 0, true)
    }
    youtubePlayerRef.current.playVideo?.()
    setIsPlaying(true)
  }

  return { handleYouTubePlay }
}


