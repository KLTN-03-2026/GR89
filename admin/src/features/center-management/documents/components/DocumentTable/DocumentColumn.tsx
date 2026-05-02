'use client'

import { ColumnDef } from '@tanstack/react-table'
import ActionsCell from './ActionsCell'
import { FileText, User, Calendar } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { IGlobalDocument } from '../../type'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const columnsDocument = (callback: () => void): ColumnDef<IGlobalDocument>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="rounded-md border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded-md border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'Tên tài liệu',
    accessorKey: 'name',
    header: 'Tên tài liệu',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shadow-sm border border-blue-100">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {row.original.name}
          </span>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            {typeof row.original.category === 'object' ? row.original.category?.name : 'None'}
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'Người soạn',
    accessorKey: 'owner',
    header: 'Người soạn',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-gray-600 font-bold text-xs uppercase tracking-wider">
        <User className="w-3.5 h-3.5 text-blue-400" />
        {typeof row.original.owner === 'object' ? row.original.owner?.fullName : 'N/A'}
      </div>
    )
  },
  {
    id: 'Cập nhật',
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
        {row.original.updatedAt ? format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
      </div>
    )
  },
  {
    id: 'Thao tác',
    cell: ({ row }) => <ActionsCell document={row.original} callback={callback} />,
    enableHiding: false
  }
]
