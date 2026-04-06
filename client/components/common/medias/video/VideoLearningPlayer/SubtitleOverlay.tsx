'use client'
import type { Subtitle } from './utils'

interface SubtitleOverlayProps {
  show: boolean
  subtitle: Subtitle | null
  isControlsVisible?: boolean
  isFullscreen?: boolean
}

export default function SubtitleOverlay({ show, subtitle, isControlsVisible = false, isFullscreen = false }: SubtitleOverlayProps) {
  if (!show || !subtitle) return null

  // Điều chỉnh bottom để không bị che bởi thanh công cụ
  // Khi controls hiển thị (cao khoảng 80px), subtitle cần ở trên
  const bottomPosition = isControlsVisible ? 'bottom-28' : 'bottom-8'

  const fontSizeClass = isFullscreen ? 'text-[clamp(8px,2cqw,28px)]' : 'text-[12px] lg:text-[16px]'
  return (
    <div className={`absolute ${bottomPosition} ${fontSizeClass} left-1/2 -translate-x-1/2 px-2 py-1 bg-black/20 text-white rounded-xl text-nowrap text-center leading-relaxed space-y-1 shadow z-10 transition-all duration-300`}>
      <p className='text-yellow-500 font-semibold'>{subtitle.en}</p>
      <p className="text-gray-200">{subtitle.vi}</p>
    </div>
  )
}

