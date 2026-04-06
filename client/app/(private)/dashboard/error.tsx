'use client'

import { ContentStateDisplay, ContentStateType } from '@/components/common/ContentStateDisplay'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const router = useRouter()

  const getType = (): ContentStateType => {
    const errorMessage = error.message || 'Đã xảy ra lỗi không xác định'

    if (errorMessage.includes('Bạn cần nâng cấp tài khoản để sử dụng nội dung này')) {
      return 'vip'
    }

    if (errorMessage.includes('Bạn chưa unlock content này')) {
      return 'locked'
    }

    return 'error'
  }

  const type = getType()

  const getErrorMessage = () => {
    const errorMessage = error.message || 'Đã xảy ra lỗi không xác định'

    if (errorMessage.includes('API Error') || errorMessage.includes('fetch')) {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.'
    }

    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('410')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    }

    if (errorMessage.includes('404')) {
      return 'Không tìm thấy dữ liệu. Vui lòng quay lại sau.'
    }

    if (errorMessage.includes('500') || errorMessage.includes('503')) {
      return 'Server đang gặp sự cố. Vui lòng thử lại sau một chút.'
    }

    if (errorMessage.includes('Bạn chưa unlock content này')) {
      return 'Bạn chưa mở khóa content này. Vui lòng mở khóa content để sử dụng.'
    }

    if (errorMessage.includes('Bạn cần nâng cấp tài khoản để sử dụng nội dung này')) {
      return 'Bạn cần nâng cấp tài khoản để sử dụng nội dung này. Vui lòng nâng cấp tài khoản để sử dụng.'
    }

    return 'Đã xảy ra lỗi khi tải trang. Vui lòng thử lại.'
  }

  const handleRetry = () => {
    reset()
    router.refresh()
  }

  return (
    <ContentStateDisplay
      type={type}
      title="Không thể tải Dashboard"
      message={getErrorMessage()}
      icon={<AlertCircle className="w-16 h-16 text-red-500" />}
      showRetryButton={true}
      onRetry={handleRetry}
      showBackButton={true}
      backUrl="/dashboard"
      actions={[
        {
          label: 'Thử lại vào Dashboard',
          onClick: () => {
            window.location.href = '/dashboard'
          },
          variant: 'default',
        },
      ]}
    />
  )
}

