'use client'
import { useState, useEffect } from 'react'
import { DialogAddReading } from "@/features/reading/components/dialogs";
import { PageHeader, StatsGrid } from "@/components/common"
import { BookOpen, Users, Eye, LucideIcon, Download } from "lucide-react";
import { getReadingOverviewStats, exportReadingExcel } from "@/features/reading/services/api";
import { ReadingStatsSkeleton } from "@/components/common/Skeletons/ReadingStatsSkeleton";
import { ReadingSheetImport } from '@/features/reading/components/ReadingSheetImport'

interface props {
  callback: () => void
}

interface IStatsOverviewProps {
  title: string;
  value: string;
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
              icon: BookOpen
            },
            {
              title: "Tổng Người Học",
              value: data?.totalUsers?.toString() || '0',
              icon: Users
            },
            {
              title: "Tỷ Lệ Hoàn Thành",
              value: `${data && data?.completionRate}%`,
              icon: Eye
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