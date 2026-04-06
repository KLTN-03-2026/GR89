'use client'
import { useState, useEffect } from 'react'
import { DialogAddReading } from "@/features/reading/components/dialogs";
import { PageHeader, StatsGrid } from "@/components/common"
import { BookOpen, Users, Eye, TrendingUp, LucideIcon, Download } from "lucide-react";
import { getReadingOverviewStats, exportReadingExcel } from "@/features/reading/services/api";
import { ReadingStatsSkeleton } from "@/components/common/Skeletons/ReadingStatsSkeleton";
import { ReadingSheetImport } from '@/features/reading/components/ReadingSheetImport'

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

export default function ReadingHeader({ callback }: props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReadingStats = async () => {
      setLoading(true);
      await getReadingOverviewStats()
        .then(res => {
          const data = res.data;
          setStats([
            {
              title: "Tổng Bài Đọc",
              value: data?.totalLessons?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 5) + 1} so với tháng trước`,
                isPositive: true
              },
              icon: BookOpen
            },
            {
              title: "Tổng Người Học",
              value: data?.totalUsers?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 40) + 15} trong tháng này`,
                isPositive: true
              },
              icon: Users
            },
            {
              title: "Tỷ Lệ Hoàn Thành",
              value: `${data && data?.completionRate}%`,
              change: {
                value: `${data && data?.monthlyChange >= 0 ? '+' : ''}${data?.monthlyChange}% so với tháng trước`,
                isPositive: data && data?.monthlyChange >= 0 || false
              },
              icon: Eye
            },
            {
              title: "Lượt Học Tháng",
              value: `${data && (data?.monthlyLearns / 1000).toFixed(1)}K`,
              change: {
                value: `+${Math.floor(Math.random() * 12) + 8}%`,
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

    fetchReadingStats();
  }, []);

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Bài Đọc"
          subtitle="Quản lý bài tập đọc hiểu tiếng Anh"
        />
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              const blob = await exportReadingExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'reading_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <ReadingSheetImport callback={callback} />
          <DialogAddReading callback={callback} />
        </div>
      </div>

      {loading ? (
        <ReadingStatsSkeleton />
      ) : (
        <StatsGrid stats={stats} />
      )}
    </header>
  );
}