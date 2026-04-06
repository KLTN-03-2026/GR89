'use client'

import { Button } from '@/components/ui/button'
import { Lock, Crown, AlertCircle, Loader2, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UpgradeDialog } from '../upgrades'
import { useState } from 'react'

export type ContentStateType = 'vip' | 'locked' | 'empty' | 'error' | 'loading'

interface ContentStateDisplayProps {
  type: ContentStateType
  title?: string
  message?: string
  icon?: React.ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link'
  }>
  onUpgradeSuccess?: () => void
  backUrl?: string
  showBackButton?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
  children?: React.ReactNode
  variant?: 'card' | 'minimal' | 'fullscreen'
  className?: string
}

const defaultConfigs: Record<ContentStateType, {
  title: string
  message: string
  icon: React.ReactNode
  emoji: string
  accentColor: string
  iconBgColor: string
  iconColor: string
}> = {
  vip: {
    title: 'Nội dung VIP',
    message: 'Bạn cần nâng cấp tài khoản VIP để truy cập nội dung này',
    icon: <Crown className="w-12 h-12" />,
    emoji: '👑',
    accentColor: 'text-amber-600',
    iconBgColor: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  locked: {
    title: 'Bài học chưa mở khóa',
    message: 'Hãy hoàn thành các bài học trước đó để mở khóa nội dung này nhé! 💪',
    icon: <Lock className="w-12 h-12" />,
    emoji: '🔒',
    accentColor: 'text-blue-600',
    iconBgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  empty: {
    title: 'Chưa có nội dung',
    message: 'Hiện tại chưa có dữ liệu để hiển thị. Vui lòng quay lại sau nhé!',
    icon: <BookOpen className="w-12 h-12" />,
    emoji: '📚',
    accentColor: 'text-gray-600',
    iconBgColor: 'bg-gray-50',
    iconColor: 'text-gray-500'
  },
  error: {
    title: 'Ồ, có lỗi xảy ra',
    message: 'Không thể tải dữ liệu. Hãy thử lại sau một chút nhé!',
    icon: <AlertCircle className="w-12 h-12" />,
    emoji: '😅',
    accentColor: 'text-red-600',
    iconBgColor: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  loading: {
    title: 'Đang tải bài học...',
    message: 'Vui lòng đợi trong giây lát, chúng mình đang chuẩn bị nội dung cho bạn!',
    icon: <Loader2 className="w-12 h-12 animate-spin" />,
    emoji: '⏳',
    accentColor: 'text-blue-600',
    iconBgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  }
}

export function ContentStateDisplay({
  type,
  title,
  message,
  icon,
  actions,
  onUpgradeSuccess,
  backUrl,
  showBackButton = true,
  showRetryButton = false,
  onRetry,
  children,
  className = '',
}: ContentStateDisplayProps) {
  const router = useRouter()
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const config = defaultConfigs[type]
  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const displayIcon = icon || config.icon

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  const handleUpgradeClick = () => {
    setIsUpgradeDialogOpen(true)
  }

  const handleUpgradeSuccess = () => {
    setIsUpgradeDialogOpen(false)
    onUpgradeSuccess?.()
  }

  return (
    <>
      <div className={`w-full max-w-xl mx-auto bg-white ${className}`}>
        {/* Icon Section */}
        <div className="flex flex-col items-center justify-center px-8 pt-10 pb-6">
          <div className={`${config.iconBgColor} rounded-full p-5 mb-4 ${config.iconColor}`}>
            {displayIcon}
          </div>
          <div className="text-5xl mb-2">{config.emoji}</div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center justify-center px-8 pb-10 text-center">
          <h3 className={`text-2xl font-bold mb-3 ${config.accentColor}`}>{displayTitle}</h3>
          <p className="text-base text-gray-700 leading-relaxed mb-6 max-w-md">{displayMessage}</p>
          {children}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {type === 'vip' && (
              <Button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 rounded-xl px-8 py-6"
              >
                <Crown className="w-5 h-5 mr-2" />
                Nâng cấp VIP
              </Button>
            )}
            {showRetryButton && onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 rounded-xl px-6 py-6"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Thử lại
              </Button>
            )}
            {showBackButton && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-xl px-6 py-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </Button>
            )}
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="rounded-xl px-6 py-6"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <UpgradeDialog
        open={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </>
  )
}