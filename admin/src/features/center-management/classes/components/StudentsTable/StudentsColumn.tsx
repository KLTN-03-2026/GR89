'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { IStudent } from '@/features/center-management/types'

export const columnsStudents = (
  callback: () => void,
): ColumnDef<IStudent>[] => [
    {
      accessorKey: 'name',
      header: 'Tên học viên',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {row.original.name.charAt(0)}
          </div>
          <span className="font-bold text-gray-900 line-clamp-1">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email / Số điện thoại',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-gray-600 font-medium line-clamp-1">{row.original.email}</div>
          <div className="text-gray-400 text-[10px] font-bold tracking-wider">{row.original.phone}</div>
        </div>
      )
    },
    {
      accessorKey: 'joinDate',
      header: 'Ngày nhập học',
      cell: ({ row }) => <span className="text-gray-500 font-medium text-xs">{row.original.joinDate}</span>
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'secondary' : 'destructive'} className="rounded-full font-bold text-[10px] px-2.5 py-0.5">
          {row.original.status === 'active' ? 'Đang học' : 'Nghỉ học'}
        </Badge>
      )
    }
  ]
