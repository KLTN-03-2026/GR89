'use client'

import { ColumnDef } from '@tanstack/react-table'
import ActionsCell from './ActionsCell'
import { FileText, User, Calendar } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { IGlobalDocument } from '@/features/center-management/types'

export const columnsDocument = (callback: () => void): ColumnDef<IGlobalDocument>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="rounded-md border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded-md border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
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
        <div className="p-2 bg-zinc-50 rounded-lg text-zinc-900 shadow-inner">
          <FileText className="w-4 h-4" />
        </div>
        <span className="font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
          {row.original.name}
        </span>
      </div>
    )
  },
  {
    id: 'Người soạn',
    accessorKey: 'owner',
    header: 'Người soạn',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-zinc-600 font-medium">
        <User className="w-3.5 h-3.5 opacity-50" />
        {row.original.owner}
      </div>
    )
  },
  {
    id: 'Cập nhật',
    accessorKey: 'updatedAt',
    header: 'Cập nhật',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
        <Calendar className="w-3.5 h-3.5 opacity-50" />
        {row.original.updatedAt}
      </div>
    )
  },
  {
    id: 'Thao tác',
    cell: ({ row }) => <ActionsCell document={row.original} callback={callback} />,
    enableHiding: false
  }
]
