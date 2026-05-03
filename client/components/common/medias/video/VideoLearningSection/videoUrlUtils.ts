export const isYouTubeUrl = (url: string) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)

export const isVimeoUrl = (url: string) =>
  /^(https?:\/\/)?(www\.)?(player\.)?vimeo\.com\//i.test(url)

export const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1).split('?')[0]
    }
    if (u.pathname.includes('/watch')) {
      return u.searchParams.get('v')
    }
    if (u.pathname.startsWith('/shorts/')) {
      return u.pathname.split('/shorts/')[1]?.split('?')[0] || null
    }
    if (u.pathname.includes('/embed/')) {
      return u.pathname.split('/embed/')[1]?.split('?')[0] || null
    }
  } catch {
    return null
  }
  return null
}

export const extractVimeoId = (url: string): string | null => {
  // Hỗ trợ cả vimeo.com và player.vimeo.com với nhiều dạng đường dẫn
  const regex =
    /(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/|channels\/[\w]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/|)(\d+)/
  const match = url.match(regex)
  return match && match[1] ? match[1] : null
}

