import { ResultSpeakingPage, getSpeakingResult } from '@/features/speaking'
import type { ISpeakingResult } from '@/features/speaking/types'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  try {
    const result = await getSpeakingResult(_id)
    return <ResultSpeakingPage result={result} />
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string } }
      message?: string
    }
    const status = axiosError?.response?.status
    const errorMessage = axiosError?.response?.data?.message || axiosError?.message || ''

    let errorType: 'vip' | 'locked' | 'error' = 'error'
    if (status === 403) {
      if (errorMessage.includes('VIP') || errorMessage.includes('nâng cấp')) {
        errorType = 'vip'
      } else if (
        errorMessage.includes('mở khóa') ||
        errorMessage.includes('unlock') ||
        errorMessage.includes('chưa')
      ) {
        errorType = 'locked'
      }
    }

    return (
      <ResultSpeakingPage
        result={null as unknown as ISpeakingResult}
        error={{
          type: errorType,
          message: errorMessage || 'Không thể tải thành tích bài nói',
        }}
      />
    )
  }
}
