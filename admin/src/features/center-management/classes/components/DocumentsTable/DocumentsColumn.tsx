'use client'

import { ColumnDef } from '@tanstack/react-table'
import { FileText, Video, Music, Link as LinkIcon } from 'lucide-react'
import { DocumentActionsCell } from './DocumentActionsCell'
import { IClassDocument } from '@/features/center-management/types'

const getIcon = (type: string) => {
  switch (type) {
    case 'pdf':
    case 'doc': return <FileText className="w-4 h-4" />
    case 'video': return <Video className="w-4 h-4" />
    case 'audio': return <Music className="w-4 h-4" />
    default: return <LinkIcon className="w-4 h-4" />
  }
}

export const columnsDocuments = (
  callback: () => void,
): ColumnDef<IClassDocument>[] => [
    {
      accessorKey: 'title',
      header: 'Tên tài liệu',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            {getIcon(row.original.type)}
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-gray-900 line-clamp-1">{row.original.title}</div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{row.original.type} {row.original.size ? `• ${row.original.size}` : ''}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Ngày tải lên',
      cell: ({ row }) => <span className="text-gray-500 text-xs font-medium">{row.original.uploadedAt}</span>
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => (
        <DocumentActionsCell document={row.original} callback={callback} />
      )
    }
  ]
