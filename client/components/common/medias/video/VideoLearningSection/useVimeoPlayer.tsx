import { useEffect } from 'react'
import { toast } from 'react-toastify'

interface UseVimeoPlayerParams {
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
  vimeoContainerRef: React.RefObject<HTMLDivElement | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vimeoPlayerRef: React.RefObject<any>
  setIsPlaying: (value: boolean) => void
  setVideoEnded: (value: boolean) => void
  setReady: (value: boolean) => void
}

export function useVimeoPlayer({
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
  vimeoContainerRef,
  vimeoPlayerRef,
  setIsPlaying,
  setVideoEnded,
  setReady
}: UseVimeoPlayerParams) {
  useEffect(() => {
    if (!enabled || !videoId) return
    let mounted = true

    const initializeVimeoPlayer = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const VimeoPlayer = (window as any)?.Vimeo?.Player
      if (!VimeoPlayer || !vimeoContainerRef.current) return

      try {
        vimeoPlayerRef.current = new VimeoPlayer(vimeoContainerRef.current, {
          id: Number(videoId),
          autoplay: autoPlay ? 1 : 0,
          controls: 0,
          muted: muted || isMuted,
          loop: false,
          // Giúp iframe Vimeo tự co giãn theo container để fill khung
          responsive: true,
        })

        vimeoPlayerRef.current.on('loaded', () => {
          if (!mounted) return
          setVideoEnded(false)
          setReady(true)
          if (startTime > 0) {
            vimeoPlayerRef.current.setCurrentTime(startTime)
          }
          vimeoPlayerRef.current.setVolume(isMuted ? 0 : volume)
          if (autoPlay) {
            vimeoPlayerRef.current.play()
          }
        })

        vimeoPlayerRef.current.on('play', () => {
          if (!mounted) return
          setIsPlaying(true)
          setVideoEnded(false)
        })

        vimeoPlayerRef.current.on('pause', () => {
          if (!mounted) return
          setIsPlaying(false)
        })

        vimeoPlayerRef.current.on('ended', () => {
          if (!mounted) return
          setIsPlaying(false)
          setVideoEnded(true)
          if (onEndReached) {
            onEndReached()
          }
        })

        vimeoPlayerRef.current.on('timeupdate', ({ seconds }: { seconds: number }) => {
          if (!mounted || !endTime) return
          if (seconds >= endTime - 0.1) {
            vimeoPlayerRef.current.pause()
            setIsPlaying(false)
            setVideoEnded(true)
            if (onEndReached) {
              onEndReached()
            }
          }
        })
      } catch {
        toast.error('Video không khả dụng vui lòng thử lại')
      }
    }

    const loadVimeoAPI = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any)?.Vimeo?.Player) {
        initializeVimeoPlayer()
        return
      }
      const existingScript = document.getElementById('vimeo-player-js')
      if (existingScript) {
        existingScript.addEventListener('load', () => initializeVimeoPlayer(), { once: true })
        return
      }
      const script = document.createElement('script')
      script.id = 'vimeo-player-js'
      script.src = 'https://player.vimeo.com/api/player.js'
      script.async = true
      script.onload = initializeVimeoPlayer
      document.body.appendChild(script)
    }

    setReady(false)
    loadVimeoAPI()

    return () => {
      mounted = false
      if (vimeoPlayerRef.current?.unload) {
        vimeoPlayerRef.current.unload().catch(() => null)
        vimeoPlayerRef.current = null
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
    vimeoContainerRef,
    vimeoPlayerRef,
    setIsPlaying,
    setVideoEnded,
    setReady
  ])

  // Volume / mute cập nhật
  useEffect(() => {
    if (!enabled || !vimeoPlayerRef.current) return
    vimeoPlayerRef.current.setVolume(isMuted ? 0 : volume).catch(() => null)
  }, [enabled, isMuted, volume, vimeoPlayerRef])

  // Replay trigger
  useEffect(() => {
    if (!enabled || !replayTrigger || replayTrigger <= 0) return

    // Đợi player sẵn sàng trước khi replay
    if (!vimeoPlayerRef.current) {
      // Nếu player chưa sẵn sàng, đợi một chút rồi thử lại
      const checkPlayer = setInterval(() => {
        if (vimeoPlayerRef.current) {
          clearInterval(checkPlayer)
          setVideoEnded(false)
          vimeoPlayerRef.current.setCurrentTime(startTime || 0).then(() => {
            if (isMuted) {
              vimeoPlayerRef.current.setVolume(0)
            } else {
              vimeoPlayerRef.current.setVolume(volume)
            }
            vimeoPlayerRef.current.play()
            setIsPlaying(true)
          })
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
    setVideoEnded(false)
    vimeoPlayerRef.current.setCurrentTime(startTime || 0).then(() => {
      if (isMuted) {
        vimeoPlayerRef.current.setVolume(0)
      } else {
        vimeoPlayerRef.current.setVolume(volume)
      }
      vimeoPlayerRef.current.play()
      setIsPlaying(true)
    })
  }, [enabled, replayTrigger, startTime, isMuted, volume, setIsPlaying, setVideoEnded, vimeoPlayerRef])

  const handleVimeoPlay = () => {
    if (!vimeoPlayerRef.current) return

    setVideoEnded(false)

    // Set volume
    if (isMuted) {
      vimeoPlayerRef.current.setVolume(0)
    } else {
      vimeoPlayerRef.current.setVolume(volume)
    }

    // Seek và play (không đợi Promise)
    vimeoPlayerRef.current.setCurrentTime(startTime || 0).catch(() => { })
    vimeoPlayerRef.current.play().catch(() => { })
    setIsPlaying(true)
  }

  return { handleVimeoPlay }
}


