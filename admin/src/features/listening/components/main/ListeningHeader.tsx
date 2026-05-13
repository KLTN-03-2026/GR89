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
              icon: Headphones
            },
            {
              title: "Tổng Người Học",
              value: data?.totalUsers?.toString() || '0',
              icon: Users
            },
            {
              title: "Tỉ Lệ Hoàn Thành",
              value: `${data && data?.completionRate}%`,
              icon: Eye
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
        <StatsGrid stats={stats} columns={3}/>
      )}
    </header>
  );
}
