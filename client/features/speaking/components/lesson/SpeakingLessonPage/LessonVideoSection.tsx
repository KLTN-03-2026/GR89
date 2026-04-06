'use client'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { MediaSubtitlePreviewEntry } from '@/types/speaking'
import { VideoLearningSection } from '@/components/common/medias'

interface LessonVideoSectionProps {
  subtitle: MediaSubtitlePreviewEntry | null
  videoSrc?: string
  replayTrigger: number
  setReplayTrigger: (value: number | ((prev: number) => number)) => void
}



export function LessonVideoSection({ subtitle, videoSrc, replayTrigger, setReplayTrigger }: LessonVideoSectionProps) {
  const handleReplay = () => {
    setReplayTrigger(prev => prev + 1)
  }
  if (!subtitle || !videoSrc) {
    return (
      <div className="bg-black aspect-video relative flex items-center justify-center text-white">
        <p>Không có video hoặc subtitle</p>
      </div>
    )
  }

  return (
    <div className="aspect-video relative">
      <VideoLearningSection
        key={`video-${subtitle._id}-${subtitle.start ?? 0}-${subtitle.end ?? 0}`}
        src={videoSrc}
        startTime={subtitle.start as number}
        endTime={subtitle.end as number}
        className="w-full h-full"
        replayTrigger={replayTrigger}
      />
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleReplay}
          variant="secondary"
          size="sm"
          className="bg-black/60 hover:bg-black/80 text-white border-0 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Nghe lại</span>
        </Button>
      </div>
    </div>
  )
}

