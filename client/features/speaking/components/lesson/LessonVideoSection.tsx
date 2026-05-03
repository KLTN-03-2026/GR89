'use client'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { subtitle } from '@/features/speaking/types'
import { VideoLearningSection } from '@/components/common/medias'
import { parseSrtTimestamp } from './utils'
import { useState } from 'react'

interface LessonVideoSectionProps {
  subtitle: subtitle | null
  videoUrl: string
}

export function LessonVideoSection({ subtitle, videoUrl, }: LessonVideoSectionProps) {
  const [replayTrigger, setReplayTrigger] = useState(0)

  if (!subtitle || !videoUrl) {
    return (
      <div className="bg-black aspect-video relative flex items-center justify-center text-white">
        <p>Không có video hoặc subtitle</p>
      </div>
    )
  }

  return (
    <div className="aspect-video relative">
      <VideoLearningSection
        key={`video-${subtitle._id}-${subtitle.start}-${subtitle.end}`}
        src={videoUrl}
        startTime={parseSrtTimestamp(subtitle.start)}
        endTime={parseSrtTimestamp(subtitle.end)}
        className="w-full h-full"
        replayTrigger={replayTrigger}
      />
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => setReplayTrigger(prev => prev + 1)}
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

