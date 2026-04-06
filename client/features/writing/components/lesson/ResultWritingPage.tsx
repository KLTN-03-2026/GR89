'use client'
import { resultWriting } from '@/types'
import ResultCard from './ResultCard'
import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'

interface ResultWritingPageProps {
  result: resultWriting
  error?: { type: ContentStateType, message?: string } | null
}

export function ResultWritingPage({ result, error }: ResultWritingPageProps) {
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

  if (!result || !(result as any).result) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không tìm thấy kết quả"
        backUrl="/skills/writing"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return <ResultCard result={(result as any).result} />
}

