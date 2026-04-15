'use client'

import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { BookOpen, Brain, Target, Clock } from 'lucide-react'
import { VocabularyOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface VocabularyHeaderProps {
  overview: VocabularyOverview
}

export function VocabularyHeader({ overview }: VocabularyHeaderProps) {
  const descriptions: IDescription[] = [
    { text: 'Mở rộng vốn từ vựng tiếng Anh một cách có hệ thống. Học từ vựng theo chủ đề, ngữ cảnh và áp dụng vào thực tế.' }
  ]

  const completionPercent = overview && overview.totalTopics > 0
    ? Math.round(((overview.completedTopics / overview.totalTopics) * 100))
    : 0

  const streakCard: IStreakCardProps = {
    icon: '📚',
    title: 'Tiến độ từ vựng',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: 100,
    progressDescription: 'Dự kiến hoàn thành: 1 tháng nữa',
    color: 'from-emerald-500 to-emerald-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-emerald-600',
    Icon: BookOpen,
    title: 'Học Từ Vựng',
    titleHighlight: 'Tiếng Anh',
    badge: ' Hệ thống',
    badge2: `📚 Hoàn thành ${completionPercent}%`,
    descriptions,
    background: 'from-emerald-500 via-green-400 to-teal-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Chủ đề hoàn thành', value: `${overview?.completedTopics ?? 0}/${overview?.totalTopics ?? 0}`, change: '', Icon: BookOpen, color: 'from-emerald-500 to-emerald-400' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgScore ?? 0).toFixed(2)}`, change: '', Icon: Brain, color: 'from-green-500 to-green-400' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-teal-500 to-teal-400' },
    { title: 'Thời gian học', value: formatStudyTime(overview?.totalTime || 0), change: '', Icon: Clock, color: 'from-slate-500 to-slate-400' },
  ]

  return (
    <WelcomeSection
      welcomeContent={welcomeContent}
      statsOverview={statsOverview}
      streakCard={streakCard}
    />
  )
}

