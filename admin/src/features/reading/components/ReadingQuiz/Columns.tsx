"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Reading } from "@/features/reading/types"
import ActionsCell from './ActionsCell'

type TQuiz = Reading['quizzes'][number]

export const columnsReadingQuizDetail = (readingId: string, callback: () => void): ColumnDef<TQuiz>[] => [
  {
    accessorKey: 'question', header: 'Câu hỏi',
    cell: ({ row }) => (
      <div className="max-w-[420px] truncate" title={row.original.question}>{row.original.question}</div>
    )
  },
  { accessorKey: 'type', header: 'Loại' },
  {
    accessorKey: 'options',
    header: 'Số lựa chọn',
    cell: ({ row }) => <Badge variant="secondary">{row.original.options?.length || 0}</Badge>
  },
  {
    accessorKey: 'answer', header: 'Đáp án',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.original.answer}>{row.original.answer}</div>
    )
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <ActionsCell readingId={readingId} quiz={row.original} callback={callback} />
  }
]


