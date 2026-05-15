'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { Bookmark, Users, TrendingUp, LucideIcon, Download } from 'lucide-react'
import { exportGrammarExcel, getGrammarOverviewStats } from '../../services/api'
import { GrammarStatsSkeleton } from '@/components/common/Skeletons/GrammarStatsSkeleton'
import { GrammarSheetImport } from '../GrammarSheetImport/GrammarSheetImport'
import { SheetAddGrammarTopic } from '../dialogs'

interface Props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string
  value: string
  icon: LucideIcon
}

export default function GrammarTopicHeader({ callback }: Props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchGrammarStats = async () => {
      setLoading(true)
      await getGrammarOverviewStats()
        .then((res) => {
          const data = res.data
          setStats([
            {
              title: 'Tổng Chủ Đề Ngữ Pháp',
              value: data?.totalTopics?.toString() || '0',
              icon: Bookmark
            },
            {
              title: 'Tổng Bài Học',
              value: data?.totalLessons?.toString() || '0',
              icon: Users
            },
            {
              title: 'Tỷ Lệ Hoàn Thành',
              value: `${data && data?.completionRate}%`,
              icon: TrendingUp
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchGrammarStats()
  }, [])

  return (
    <header>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Ngữ Pháp" subtitle="Quản lý chủ đề ngữ pháp" />

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            onClick={async () => {
              const blob = await exportGrammarExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'grammar_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>

          <GrammarSheetImport callback={callback} />

          <SheetAddGrammarTopic callback={callback} />
        </div>
      </div>

      {loading ? <GrammarStatsSkeleton /> : <StatsGrid stats={stats} columns={3}/>}
    </header>
  )
}

