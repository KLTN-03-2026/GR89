export type Subtitle = {
  start: number // seconds
  end: number   // seconds
  en: string
  vi: string
}

export const isYouTubeUrl = (url: string) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)

export const extractYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('?')[0]
    }
    if (parsed.pathname.includes('/watch')) {
      return parsed.searchParams.get('v')
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/shorts/')[1]?.split('?')[0] || null
    }
    if (parsed.pathname.includes('/embed/')) {
      return parsed.pathname.split('/embed/')[1]?.split('?')[0] || null
    }
  } catch {
    return null
  }
  return null
}

export const formatTime = (t: number) => {
  const mm = Math.floor(t / 60)
  const ss = Math.floor(t % 60)
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

