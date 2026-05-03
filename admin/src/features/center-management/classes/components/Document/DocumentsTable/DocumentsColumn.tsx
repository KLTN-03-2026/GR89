'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileText, Video, Music } from 'lucide-react'
import { DocumentActionsCell } from './DocumentActionsCell'
import { IGlobalDocument } from '@/features/center-management/documents/type'

const getIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('video')) return <Video className="w-4 h-4" />
  if (name.includes('audio') || name.includes('music')) return <Music className="w-4 h-4" />
  return <FileText className="w-4 h-4" />
}

export const columnsDocuments = (
  callback: () => void,
): ColumnDef<IGlobalDocument>[] => [
    {
      accessorKey: 'name',
      header: 'Tên tài liệu',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            {getIcon(row.original.category?.name || '')}
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-gray-900 line-clamp-1">{row.original.name}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              {row.original.category?.name || 'Tài liệu'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tải lên',
      cell: ({ row }) => <span className="text-gray-500 text-xs font-medium">{new Date(row.original.createdAt).toLocaleDateString('vi-VN')}</span>
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <DocumentActionsCell document={row.original} callback={callback} />
      )
    }
  ]
