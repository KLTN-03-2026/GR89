import { ResultListeningPage, getListeningResult } from '@/features/listening'
import type { IListeningProgress } from '@/types/listening'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  try {
    const result = await getListeningResult(_id)

    return <ResultListeningPage result={result} />
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
      <ResultListeningPage
        result={null as unknown as IListeningProgress}
        error={{
          type: errorType,
          message: errorMessage || 'Không thể tải kết quả bài nghe'
        }}
      />
    )
  }
}
