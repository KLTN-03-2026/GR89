'use client'

import type { IListening } from '@/features/listening/types'
import ListeningQuizGuide from './ListeningQuizGuide'
import ListeningQuizShow from './ListeningQuizShow'
import { IQuizResultData } from '@/features/quizz/types'

interface Props {
  listening: IListening,
  onComplete: (page: 'dictation' | 'quiz') => void
  setFormDataQuizResult: (formDataQuizResult: IQuizResultData[]) => void
  formDataQuizResult: IQuizResultData[]
}

export function ListeningGistQuizPage({ listening, onComplete, formDataQuizResult, setFormDataQuizResult }: Props) {
  return (
    <div className="space-y-5">
      <ListeningQuizGuide listening={listening} />

      <ListeningQuizShow
        questions={listening.quizzes}
        onComplete={onComplete}
        formDataQuizResult={formDataQuizResult}
        setFormDataQuizResult={setFormDataQuizResult as React.Dispatch<React.SetStateAction<IQuizResultData[]>>}
      />
    </div>
  )
}

