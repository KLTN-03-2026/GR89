'use client'
import HeaderLesson from './HeaderLesson'
import TranscriptListeningLesson from './TranscriptListeningLesson'
import { IListening } from '@/types'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'
import { AudioSection } from '@/components/common/medias'

interface ListeningLessonProps {
  listening: IListening
  error?: { type: ContentStateType, message?: string } | null
}

export function ListeningLesson({ listening, error }: ListeningLessonProps) {
  if (error) {
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl="/skills/listening"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!listening) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy bài nghe"
        backUrl="/skills/listening"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <div>
      <HeaderLesson
        title={listening?.title || ''}
        description={listening?.description || ''}
      />

      <div className='space-y-4'>
        <AudioSection audioUrl={listening?.audio || ''} />
        <TranscriptListeningLesson subtitle={listening?.subtitle} _id={listening._id} />
      </div>
    </div>
  )
}
