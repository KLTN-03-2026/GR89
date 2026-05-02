'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileCheck, Calendar, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const columnsHomeworkList = (
  onViewSubmissions: (homework: any) => void,
): ColumnDef<any>[] => [
    {
      accessorKey: 'title',
      header: 'Tên bài tập',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="font-bold text-gray-900 line-clamp-1">{row.original.title}</div>
        </div>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Thời gian',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            <Calendar className="w-3 h-3" />
            Bắt đầu: {row.original.startDate || '10/05/2024 08:00'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Kết thúc: {row.original.dueDate || '15/05/2024 23:59'}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Tỷ lệ nộp',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                U
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600">+{row.original.submissionCount || 12} bài</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-9 px-4 font-bold text-xs shadow-sm"
            onClick={() => onViewSubmissions(row.original)}
          >
            <Eye className="w-4 h-4 mr-2" /> Xem bài nộp
          </Button>
        </div>
      )
    }
  ]
