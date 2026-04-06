export interface VideoLearningSectionProps {
  src: string
  poster?: string
  /** seconds - thời gian bắt đầu phát */
  startTime?: number
  /** seconds - thời gian kết thúc */
  endTime?: number
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  /** Tỉ lệ khung hình, mặc định 16:9 */
  aspect?: { w: number; h: number }
  /** Force provider. Mặc định: auto detect (youtube vs html5 video) */
  provider?: 'auto' | 'youtube' | 'vimeo' | 'html5'
  /** Callback khi video dừng ở endTime */
  onEndReached?: () => void
  /** Trigger từ component cha để replay */
  replayTrigger?: number
}


