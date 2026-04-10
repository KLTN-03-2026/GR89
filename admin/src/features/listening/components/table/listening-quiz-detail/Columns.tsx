'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { ListeningQuizDoc } from '@/features/listening/services/api'
import ActionsCell from './ActionsCell'

export type ListeningQuizRow = ListeningQuizDoc & { _index: number }

export const columnsListeningQuizDetail = (
  listeningId: string,
  callback: () => void
): ColumnDef<ListeningQuizRow>[] => [
  {
    id: 'index',
    header: '#',
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original._index + 1}</span>,
    size: 48,
  },
  {
    accessorKey: 'question',
    header: 'Câu hỏi',
    cell: ({ row }) => (
      <div className="max-w-[420px] line-clamp-2" title={row.original.question}>
        {row.original.question}
      </div>
    ),
  },
  {
    accessorKey: 'answer',
    header: 'Đáp án đúng',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium text-primary" title={row.original.answer}>
        {row.original.answer}
      </div>
    ),
  },
  {
    id: 'optionsList',
    header: 'Lựa chọn',
    cell: ({ row }) => {
      const options = (row.original.options || []).filter((o) => (o || '').trim() !== '')
      return <span className="text-sm text-muted-foreground">[{options.join(', ')}]</span>
    },
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => (
      <ActionsCell listeningId={listeningId} row={row.original} callback={callback} />
    ),
  },
]
