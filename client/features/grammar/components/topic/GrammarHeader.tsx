import { WelcomeSection } from '@/components/common/WelcomeSection'
import { IButton, IDescription, IStatsOverview, IStreakCardProps, IWelcomeContentProps } from '@/types'
import { BookOpen, Play, Brain, Target, Clock } from 'lucide-react'
import { GrammarOverview } from '@/libs/apis/api'
import { formatStudyTime } from '@/libs/utils/formatStudyTime'

interface Props {
  overview: GrammarOverview
}

export function GrammarHeader({ overview }: Props) {
  const buttons: IButton[] = [
    { type: 'default', text: 'Bắt đầu học', icon: Play },
    { type: 'outline', text: 'Xem lộ trình', icon: BookOpen }
  ]

  const descriptions: IDescription[] = [
    { text: 'Chinh phục hệ thống ngữ pháp tiếng Anh từ A-Z với lộ trình bài bản, ví dụ trực quan và bài tập thực hành chuyên sâu.' }
  ]

  const completionPercent = overview && overview.total > 0
    ? Math.round((overview.completed / overview.total) * 100)
    : 0

  const streakCard: IStreakCardProps = {
    icon: '📚',
    title: 'Tiến độ học',
    value: completionPercent,
    valueText: `${completionPercent}%`,
    progress: 100,
    progressDescription: 'Dự kiến hoàn thành: 1.5 tháng nữa',
    color: 'from-purple-500 to-purple-400'
  }

  const welcomeContent: IWelcomeContentProps = {
    hightlightColor: 'text-purple-600',
    Icon: BookOpen,
    title: 'Học Ngữ Pháp',
    titleHighlight: 'Tiếng Anh',
    badge: ' Bài bản',
    badge2: `📚 Hoàn thành ${completionPercent}%`,
    descriptions,
    buttons,
    background: 'from-purple-500 via-indigo-500 to-blue-200'
  }

  const statsOverview: IStatsOverview[] = [
    { title: 'Bài học', value: `${overview?.completed ?? 0}/${overview?.totalAvailable ?? 0}`, change: '', Icon: BookOpen, color: 'from-purple-500 to-purple-400' },
    { title: 'Điểm trung bình', value: `${Number(overview?.avgProgress ?? 0).toFixed(2)}`, change: '', Icon: Brain, color: 'from-indigo-500 to-indigo-400' },
    { title: 'Tổng điểm', value: `${Number(overview?.totalScore ?? 0).toFixed(2)}`, change: '', Icon: Target, color: 'from-blue-500 to-blue-400' },
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


