'use client'

import { ColumnDef } from '@tanstack/react-table'
import { IClassStudent } from '../../../type'
import { StudentActionsCell } from './StudentActionsCell'

export const columnsStudents = (): ColumnDef<IClassStudent>[] => [
    {
      accessorKey: 'user.fullName',
      header: 'Tên học viên',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {row.original.user.fullName.charAt(0)}
          </div>
          <span className="font-bold text-gray-900 line-clamp-1">{row.original.user.fullName}</span>
        </div>
      )
    },
    {
      accessorKey: 'user.email',
      header: 'Email / Số điện thoại',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-gray-600 font-medium line-clamp-1">{row.original.user.email}</div>
          <div className="text-gray-400 text-[10px] font-bold tracking-wider">{row.original.user.phoneNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      accessorKey: 'joinDate',
      header: 'Ngày nhập học',
      cell: ({ row }) => <span className="text-gray-500 font-medium text-xs">{new Date(row.original.joinDate).toLocaleDateString('vi-VN')}</span>
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <StudentActionsCell student={row.original} />
    }
  ]
