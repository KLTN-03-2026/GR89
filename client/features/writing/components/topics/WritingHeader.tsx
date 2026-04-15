'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { PenTool, FileText, Brain, Target, Clock } from 'lucide-react'
import { WritingOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface WritingHeaderProps {
  overview: WritingOverview
}

export function WritingHeader({ overview }: WritingHeaderProps) {
  const descriptions: IDescription[] = [
    { text: 'Luyện kỹ năng viết tiếng Anh với các chủ đề đa dạng. Từ đoạn văn đến bài luận, nâng cao khả năng diễn đạt.' }
  ]

  // Tính phần trăm hoàn thành dựa trên tổng số bài có trong hệ thống
  const totalAvailable = overview?.totalAvailable ?? 0
  const completed = overview?.completed ?? 0
  const completionPercent = totalAvailable > 0
    ? Math.round((completed / totalAvailable) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '✍️',
    title: 'Tiến độ viết',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: completionPercent,
    progressDescription: totalAvailable > 0
      ? `Đã hoàn thành ${completed}/${totalAvailable} bài viết`
      : 'Chưa có bài viết nào',
    color: 'from-teal-500 to-teal-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-teal-600',
    Icon: PenTool,
    title: 'Luyện Viết',
    titleHighlight: 'Tiếng Anh',
    badge: ' Sáng tạo',
    badge2: `✍️ Hoàn thành ${completionPercent}%`,
    descriptions,
    background: 'from-teal-500 via-cyan-500 to-blue-200'
  }

  const statsOverview: IStatsOverview[] = [
    {
      title: 'Bài viết',
      value: `${completed}/${totalAvailable}`,
      change: '',
      Icon: FileText,
      color: 'from-teal-500 to-teal-400'
    },
    {
      title: 'Điểm trung bình',
      value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`,
      change: '',
      Icon: Brain,
      color: 'from-cyan-500 to-cyan-400'
    },
    {
      title: 'Tổng điểm',
      value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`,
      change: '',
      Icon: Target,
      color: 'from-blue-500 to-blue-400'
    },
    {
      title: 'Thời gian học',
      value: formatStudyTime(overview?.totalTime || 0),
      change: '',
      Icon: Clock,
      color: 'from-slate-500 to-slate-400'
    },
  ]

  return (
    <WelcomeSection
      welcomeContent={welcomeContent}
      statsOverview={statsOverview}
      streakCard={streakCard}
    />
  )
}

