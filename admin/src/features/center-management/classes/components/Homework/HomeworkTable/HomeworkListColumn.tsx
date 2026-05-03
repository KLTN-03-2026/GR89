'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Calendar, Clock, FileCheck } from 'lucide-react'

import { IHomework } from '../../../type'
import { HomeworkActionsCell } from './HomeworkActionsCell'

export const columnsHomeworkList = (
  onViewSubmissions: (homework: IHomework) => void,
  callback?: () => void,
): ColumnDef<IHomework>[] => [
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
      accessorKey: 'submittedAt',
      header: 'Thời gian',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            <Calendar className="w-3 h-3" />
            Bắt đầu: {new Date(row.original.submittedAt).toLocaleString('vi-VN')}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Hạn nộp: {new Date(row.original.deadline).toLocaleString('vi-VN')}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Số lượng nộp',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {(row.original.submissions || []).slice(0, 3).map((s) => (
              <div key={s._id} className="h-6 w-6 rounded-full ring-2 ring-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                {s.user?.fullName?.charAt(0) || 'U'}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600">
            {(row.original.submissions || []).length} bài nộp
          </span>
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <HomeworkActionsCell
          homework={row.original}
          onViewSubmissions={onViewSubmissions}
          callback={callback || (() => {})}
        />
      )
    }
  ]
