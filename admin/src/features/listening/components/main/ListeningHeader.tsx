'use client'
import { useState, useEffect } from 'react'
import { Headphones, Users, Eye, TrendingUp, LucideIcon, Download } from "lucide-react";
import { exportListeningExcel, getListeningOverviewStats } from '@/features/listening/services/api'
import { ListeningStatsSkeleton } from "@/components/common/Skeletons/ListeningStatsSkeleton";
import { ListeningSheetImport } from '../ListeningSheetImport';
import { PageHeader, StatsGrid } from '@/components/common';
import { DialogAddListening } from '../dialog';

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

export default function ListeningHeader({ callback }: props) {
  const [stats, setStats] = useState<IStatsOverviewProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListeningStats = async () => {
      setLoading(true);
      await getListeningOverviewStats()
        .then(res => {
          const data = res.data;
          setStats([
            {
              title: "Tổng Bài Nghe",
              value: data?.totalLessons?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 5) + 1} so với tháng trước`,
                isPositive: true
              },
              icon: Headphones
            },
            {
              title: "Tổng Người Học",
              value: data?.totalUsers?.toString() || '0',
              change: {
                value: `+${Math.floor(Math.random() * 30) + 10} trong tháng này`,
                isPositive: true
              },
              icon: Users
            },
            {
              title: "Tỉ Lệ Hoàn Thành",
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
                value: `+${Math.floor(Math.random() * 15) + 5}%`,
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

    fetchListeningStats();
  }, []);

  return (
    <header>
      <div className="flex justify-between items-center">
        <PageHeader
          title="Listening"
          subtitle="Quản lý danh sách bài nghe"
        />
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={async () => {
              const blob = await exportListeningExcel()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'listening_export.xlsx'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <ListeningSheetImport callback={callback} />
          <DialogAddListening callback={callback} />
        </div>
      </div>

      {loading ? (
        <ListeningStatsSkeleton />
      ) : (
        <StatsGrid stats={stats} />
      )}
    </header>
  );
}
