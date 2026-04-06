'use client'

import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RoadmapError({ error, reset }: ErrorProps) {
  const router = useRouter()

  const getType = (): ContentStateType => {
    const msg = error.message || ''
    if (msg.includes('Bạn cần nâng cấp tài khoản để sử dụng nội dung này')) return 'vip'
    if (msg.includes('Bạn chưa unlock content này')) return 'locked'
    return 'error'
  }

  const getErrorMessage = () => {
    const msg = error.message || ''
    if (msg.includes('API Error') || msg.includes('fetch')) return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.'
    if (msg.includes('401') || msg.includes('403') || msg.includes('410')) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    if (msg.includes('404')) return 'Không tìm thấy dữ liệu roadmap. Vui lòng quay lại sau.'
    if (msg.includes('500') || msg.includes('503')) return 'Server đang gặp sự cố. Vui lòng thử lại sau một chút.'
    if (msg.includes('Bạn chưa unlock content này')) return 'Bạn chưa mở khóa nội dung này. Vui lòng mở khóa để tiếp tục.'
    if (msg.includes('Bạn cần nâng cấp tài khoản để sử dụng nội dung này')) return 'Bạn cần nâng cấp tài khoản để sử dụng nội dung này.'
    return 'Đã xảy ra lỗi khi tải lộ trình học. Vui lòng thử lại.'
  }

  const handleRetry = () => {
    reset()
    router.refresh()
  }

  return (
    <ContentStateDisplay
      type={getType()}
      title="Không thể tải Lộ trình học"
      message={getErrorMessage()}
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      showRetryButton={true}
      onRetry={handleRetry}
      showBackButton={true}
      backUrl="/dashboard"
      actions={[
        {
          label: 'Quay về Dashboard',
          onClick: () => { window.location.href = '/dashboard' },
          variant: 'default',
        },
      ]}
    />
  )
}
