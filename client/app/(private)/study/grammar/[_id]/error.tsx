'use client'

import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GrammarLessonError({ error, reset }: ErrorProps) {
  const router = useRouter()

  const getType = (): ContentStateType => {
    const errorMessage = error.message || 'Đã xảy ra lỗi không xác định'
    if (errorMessage.includes('Bạn cần nâng cấp tài khoản')) return 'vip'
    if (errorMessage.includes('unlock') || errorMessage.includes('mở khóa')) return 'locked'
    return 'error'
  }

  const getErrorMessage = () => {
    const msg = error.message || 'Đã xảy ra lỗi không xác định'
    if (msg.includes('API Error') || msg.includes('fetch')) return 'Không thể kết nối đến server. Vui lòng kiểm tra mạng và thử lại.'
    if (msg.includes('401') || msg.includes('403')) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    if (msg.includes('404')) return 'Không tìm thấy bài học. Vui lòng quay lại danh sách.'
    if (msg.includes('500') || msg.includes('503')) return 'Server đang gặp sự cố. Vui lòng thử lại sau.'
    if (msg.includes('Bạn cần nâng cấp')) return 'Bạn cần nâng cấp tài khoản để sử dụng nội dung này.'
    return 'Đã xảy ra lỗi khi tải bài học. Vui lòng thử lại.'
  }

  return (
    <ContentStateDisplay
      type={getType()}
      title="Không thể tải bài học ngữ pháp"
      message={getErrorMessage()}
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      showRetryButton
      onRetry={() => {
        reset()
        router.refresh()
      }}
      showBackButton
      backUrl="/study/grammar"
      actions={[
        {
          label: 'Quay về danh sách bài học',
          onClick: () => router.push('/study/grammar'),
          variant: 'default'
        }
      ]}
    />
  )
}
