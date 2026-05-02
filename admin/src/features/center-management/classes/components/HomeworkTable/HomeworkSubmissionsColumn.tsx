'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Send, CheckCircle2, Clock } from 'lucide-react'
import { IHomeworkSubmission } from '@/features/center-management/types'

export const columnsHomeworkSubmissions = (
  callback: () => void,
): ColumnDef<IHomeworkSubmission>[] => [
    {
      accessorKey: 'studentName',
      header: 'Học viên',
      cell: ({ row }) => (
        <div className="font-bold text-gray-900">{row.original.studentName}</div>
      )
    },
    {
      accessorKey: 'submittedAt',
      header: 'Thời gian nộp',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Clock className="w-3 h-3" />
          {row.original.submittedAt}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={row.original.status === 'corrected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
          {row.original.status === 'corrected' ? 'Đã sửa' : 'Chờ sửa'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 h-8 px-3 font-bold text-[10px]"
            onClick={() => window.open(row.original.driveLink, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1.5" /> Google Drive
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-8 px-3 font-bold text-[10px]"
          >
            <Send className="w-3 h-3 mr-1.5" /> Gửi bài giải
          </Button>
        </div>
      )
    }
  ]
