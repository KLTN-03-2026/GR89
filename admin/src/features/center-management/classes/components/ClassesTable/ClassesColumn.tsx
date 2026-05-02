'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ClassActionsCell } from './ClassActionsCell'
import { Calendar, Clock, Lock } from 'lucide-react'
import { ICenterClass } from '@/features/center-management/types'

export const columnsClasses = (
  callback: () => void,
): ColumnDef<ICenterClass>[] => [
    {
      accessorKey: 'name',
      header: 'Tên lớp học',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-extrabold text-gray-900 line-clamp-1">{row.original.name}</div>
          <div className="text-xs text-gray-500 font-medium">GV: {row.original.teacherName}</div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => {
        const categoryLabels = {
          kids: { label: 'Kids Academy', color: 'bg-amber-100 text-amber-700' },
          teenager: { label: 'IELTS Fighter', color: 'bg-blue-100 text-blue-700' },
          adult: { label: 'Professional', color: 'bg-red-100 text-red-700' },
        }
        const cat = categoryLabels[row.original.category]
        return (
          <Badge className={`${cat.color} border-none font-bold px-2.5 py-0.5 rounded-full text-[10px]`}>
            {cat.label}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'schedule',
      header: 'Lịch học',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 line-clamp-1">
            <Calendar className="w-3 h-3 text-indigo-500" />
            {row.original.startDate}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 line-clamp-1">
            <Clock className="w-3 h-3" />
            {row.original.schedule}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const statusLabels = {
          opening: { label: 'Đang tuyển', color: 'bg-blue-50 text-blue-600 border-blue-100' },
          ongoing: { label: 'Đang dạy', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          finished: { label: 'Kết thúc', color: 'bg-gray-50 text-gray-400 border-gray-100' },
        }
        const status = statusLabels[row.original.status]
        return (
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={`${status.color} font-bold px-2 rounded-full text-[10px]`}>
              {status.label}
            </Badge>
            {!row.original.isActive && (
              <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-100 font-bold px-2 rounded-full text-[10px]">
                Đang ẩn
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'password',
      header: 'Bảo mật',
      cell: ({ row }) => (
        row.original.password ? (
          <Badge variant="outline" className="border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full bg-indigo-50/50 text-[10px]">
            <Lock className="w-2.5 h-2.5 mr-1" /> Khóa
          </Badge>
        ) : (
          <span className="text-gray-300 text-[10px] font-bold uppercase tracking-wider">Mở</span>
        )
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ClassActionsCell classData={row.original} callback={callback} />
        </div>
      )
    }
  ]
