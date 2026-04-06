'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { DialogAddWriting } from '@/features/writing'
import { PenTool, Users, Eye, TrendingUp, LucideIcon, Download } from 'lucide-react'
import { getWritingOverviewStats, exportWritingExcel } from '@/features/writing/services/api'
import { WritingStatsSkeleton } from '@/components/common/Skeletons/WritingStatsSkeleton'
import { WritingSheetImport } from '../WritingSheetImport'

interface props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string
  value: string
  change: {
    value: string
    isPositive: boolean
  }
  icon: LucideIcon
}

export default function WritingHeader({ callback }: props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchWritingStats = async () => {
      setLoading(true)
      await getWritingOverviewStats()
        .then((res) => {
          const data = res.data
          setStats([
            {
              title: 'Tổng Bài Viết',
              value: data?.totalLessons?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 4) + 1} so với tháng trước`,
                isPositive: true,
              },
              icon: PenTool,
            },
            {
              title: 'Tổng Người Học',
              value: data?.totalUsers?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 35) + 12} trong tháng này`,
                isPositive: true,
              },
              icon: Users,
            },
            {
              title: 'Tỷ Lệ Hoàn Thành',
              value: `${data && data?.completionRate}%`,
              change: {
                value: `${data && data?.monthlyChange >= 0 ? '+' : ''}${data?.monthlyChange}% so với tháng trước`,
                isPositive: (data && data?.monthlyChange >= 0) || false,
              },
              icon: Eye,
            },
            {
              title: 'Điểm Trung Bình',
              value: `${data && data?.avgWritingScore}%`,
              change: {
                value: `+${Math.floor(Math.random() * 10) + 5}%`,
                isPositive: true,
              },
              icon: TrendingUp,
            },
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchWritingStats()
  }, [])

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Bài Viết" subtitle="Quản lý bài tập viết" />
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              const blob = await exportWritingExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'writing_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <WritingSheetImport callback={callback} />
          <DialogAddWriting callback={callback} />
        </div>
      </div>

      {loading ? <WritingStatsSkeleton /> : <StatsGrid stats={stats} />}
    </header>
  )
}
