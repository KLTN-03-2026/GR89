'use client'
import { useRouter } from 'next/navigation'
import SummaryResults from '../quizz/components/SummaryResults'
import { IQuizResult } from '@/features/quizz/types'

interface ResultPageProps {
  _id: string
  type: 'vocabulary' | 'reading' | 'grammar'
  results: IQuizResult[]
}

export function ResultPage({ _id, type, results }: ResultPageProps) {
  const router = useRouter()

  const onRetry = () => {
    switch (type) {
      case "vocabulary":
        router.push(`/quizz/${_id}?type=vocabulary`)
        break
      case "grammar":
        router.push(`/quizz/${_id}?type=grammar`)
        break
      case "reading":
        router.push(`/skills/reading/${_id}`)
        break
    }
  }

  return (
    <SummaryResults
      onRetry={onRetry}
      results={results || []}
      type={type}
    />
  )
}
