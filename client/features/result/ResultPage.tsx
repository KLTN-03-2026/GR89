'use client'
import { useRouter } from 'next/navigation'
import SummaryResults from '../quizz/components/SummaryResults'
import { IQuizResult } from '@/features/quizz/types'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'

interface ResultPageProps {
  _id: string
  type: 'vocabulary' | 'reading' | 'grammar'
  results: IQuizResult[]
  error?: { type: ContentStateType, message?: string } | null
}

export function ResultPage({ _id, type, results, error }: ResultPageProps) {
  const router = useRouter()

  const onRetry = () => {
    router.push(`/quizz/${_id}?type=${type}`)
  }

  if (error) {
    const backUrl = type === 'vocabulary' ? '/study/vocabulary' : type === 'grammar' ? '/study/grammar' : '/skills/reading'
    return (
      <ContentStateDisplay
        type={error.type}
        message={error.message}
        onUpgradeSuccess={() => {
          window.location.reload()
        }}
        backUrl={backUrl}
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  if (!results || results.length === 0) {
    const backUrl = type === 'vocabulary' ? '/study/vocabulary' : type === 'grammar' ? '/study/grammar' : '/skills/reading'
    return (
      <ContentStateDisplay
        type="empty"
        message="Không có kết quả quiz"
        backUrl={backUrl}
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <SummaryResults
      onRetry={onRetry}
      results={results || []}
      type={type}
    />
  )
}
