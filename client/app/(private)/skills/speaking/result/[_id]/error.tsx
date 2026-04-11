'use client'

import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SpeakingResultError({ error, reset }: ErrorProps) {
  const router = useRouter()

  const getType = (): ContentStateType => {
    const errorMessage = error.message || ''
    if (errorMessage.includes('nâng cấp tài khoản')) return 'vip'
    if (errorMessage.includes('unlock')) return 'locked'
    return 'error'
  }

  return (
    <ContentStateDisplay
      type={getType()}
      title="Không thể tải thành tích Speaking"
      message={error.message || 'Đã xảy ra lỗi.'}
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      showRetryButton
      onRetry={() => {
        reset()
        router.refresh()
      }}
      showBackButton
      backUrl="/skills/speaking"
    />
  )
}
