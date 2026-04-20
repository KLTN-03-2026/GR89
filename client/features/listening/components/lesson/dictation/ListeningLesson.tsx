'use client'
import HeaderLesson from '../core/HeaderLesson'
import { DictationStepWithVi } from './DictationStepWithVi'
import { IListening } from '@/features/listening/types'

interface ListeningLessonProps {
  listening: IListening
  formDataDictationResult: {
    index: number
    text: string
    isCorrect: boolean
  }[]
  setFormDataDictationResult: (formDataDictationResult: {
    index: number
    text: string
    isCorrect: boolean
  }[]) => void
  handleSubmit: () => void
  onRetry?: () => void
}

export function ListeningLesson({ listening, formDataDictationResult, setFormDataDictationResult, handleSubmit, onRetry }: ListeningLessonProps) {
  return (
    <div>
      <HeaderLesson
        title={listening?.title || ''}
        description={listening?.description || ''}
      />

      <div className='space-y-4'>
        <DictationStepWithVi
          listeningId={listening._id}
          audioUrl={listening?.audio || ''}
          subtitleEn={listening?.subtitle || ''}
          subtitleVi={listening?.subtitleVi || ''}
          title={listening?.title || 'Luyện nghe chép chính tả'}
          formDataDictationResult={formDataDictationResult}
          setFormDataDictationResult={setFormDataDictationResult}
          handleSubmit={handleSubmit}
          onRetry={onRetry}
        />
      </div>
    </div>
  )
}

