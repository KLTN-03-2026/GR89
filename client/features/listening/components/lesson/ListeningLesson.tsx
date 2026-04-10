'use client'
import HeaderLesson from './HeaderLesson'
import { DictationStepWithVi } from './DictationStepWithVi'
import { IListening } from '@/features/listening/types'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'

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
        <DictationStepWithVi
          lessonId={listening._id}
          audioUrl={listening?.audio || ''}
          subtitleEn={listening?.subtitle || ''}
          subtitleVi={listening?.subtitleVi || ''}
          title={listening?.title || 'Luyện nghe chép chính tả'}
          onComplete={() => {
            // Bước này hiện chỉ hiển thị kết quả trong UI, chưa cần xử lý thêm ở parent.
          }}
        />
      </div>
    </div>
  )
}
