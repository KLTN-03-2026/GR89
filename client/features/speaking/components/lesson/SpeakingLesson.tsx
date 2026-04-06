'use client'
import { Speaking } from '@/types/speaking'
import { SpeakingLessonPage } from './SpeakingLessonPage'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'

interface SpeakingLessonProps {
  speaking: Speaking
  error?: { type: ContentStateType, message?: string } | null
}

export function SpeakingLesson({ speaking, error }: SpeakingLessonProps) {
  if (error) {
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl="/skills/speaking"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!speaking) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy bài nói"
        backUrl="/skills/speaking"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <SpeakingLessonPage speaking={speaking} />
  )
}

