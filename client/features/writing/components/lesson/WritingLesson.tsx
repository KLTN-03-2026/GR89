'use client'
import { writing } from '@/types'
import { WritingLessonMain } from './WritingLessonMain'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'

interface WritingLessonProps {
  writingData: writing
  error?: { type: ContentStateType, message?: string } | null
}

export function WritingLesson({ writingData, error }: WritingLessonProps) {
  if (error) {
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl="/skills/writing"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!writingData) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy bài viết"
        backUrl="/skills/writing"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <WritingLessonMain writingData={writingData} />
  )
}

