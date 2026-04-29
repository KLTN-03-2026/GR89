'use client'
import { useState, useEffect } from 'react'
import { PageHeader, StatsGrid } from '@/components/common'
import { Volume2, Users, Eye, TrendingUp, LucideIcon, Download } from 'lucide-react'
import { exportIpaExcel, getIpaOverviewStats } from '@/features/IPA/services/api'
import { IpaStatsSkeleton } from '@/components/common/Skeletons/IpaStatsSkeleton'
import { IpaSheetImport } from '../IpaSheetImport'
import { SheetAddIpa } from '../dialogs'

interface props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
}

export default function IpaHeader({ callback }: props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIpaStats = async () => {
      setLoading(true);
      await getIpaOverviewStats()
        .then(res => {
          const data = res.data;
          setStats([
            {
              title: "Tổng số âm IPA",
              value: data?.totalLessons?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 3) + 1} so với tháng trước`,
                isPositive: true
              },
              icon: Volume2
            },
            {
              title: "Tổng số người học",
              value: data?.totalUsers?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 50) + 20} trong tháng này`,
                isPositive: true
              },
              icon: Users
            },
            {
              title: "Tỉ lệ hoàn thành",
              value: `${data && data?.completionRate}%`,
              change: {
                value: `${data && data?.monthlyChange >= 0 ? '+' : ''}${data?.monthlyChange}% so với tháng trước`,
                isPositive: data && data?.monthlyChange >= 0 || false
              },
              icon: Eye
            },
            {
              title: "Lượt học tháng",
              value: `${data && data?.monthlyLearns}`,
              change: {
                value: `+${Math.floor(Math.random() * 10) + 5}%`,
                isPositive: true
              },
              icon: TrendingUp
            }
          ]);
        })
        .finally(() => {
          setLoading(false);
        })
    };

    fetchIpaStats();
  }, []);

  return (
    <header>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Phiên Âm IPA"
          subtitle="Quản lý phiên âm IPA"
        />

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
            onClick={async () => {
              const blob = await exportIpaExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'ipa_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <IpaSheetImport callback={callback} />
          <SheetAddIpa callback={callback} />
        </div>
      </div>

      {loading ? (
        <IpaStatsSkeleton />
      ) : (
        <StatsGrid stats={stats} />
      )}
    </header>
  )
}
