import { ResultWritingPage, getWritingResult } from '@/features/writing'
import type { resultWriting } from '@/features/writing/types'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  try {
    const result = await getWritingResult(_id)

    return (
      <div className="max-w-7xl mx-auto">
        <ResultWritingPage result={result} />
      </div>
    )
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
    const status = axiosError?.response?.status
    const errorMessage = axiosError?.response?.data?.message || axiosError?.message || ''

    let errorType: 'vip' | 'locked' | 'error' = 'error'
    if (status === 403) {
      if (errorMessage.includes('VIP') || errorMessage.includes('nâng cấp')) {
        errorType = 'vip'
      } else if (errorMessage.includes('mở khóa') || errorMessage.includes('unlock') || errorMessage.includes('chưa')) {
        errorType = 'locked'
      }
    }

    return (
      <div className="max-w-7xl mx-auto">
        <ResultWritingPage
          result={null as unknown as resultWriting}
          error={{
            type: errorType,
            message: errorMessage || 'Không thể tải kết quả bài viết'
          }}
        />
      </div>
    )
  }
}
