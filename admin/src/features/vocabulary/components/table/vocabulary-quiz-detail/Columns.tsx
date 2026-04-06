"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Quiz } from "@/types"
import ActionsCell from './ActionsCell'

export const columnsVocabularyQuizDetail = (topicId: string, callback: () => void): ColumnDef<Quiz>[] => [
  {
    id: 'assignment',
    header: 'Đề bài',
    cell: ({ row }) => row.original.type === 'Fill in the blank' ? 'Điền từ còn thiếu vào chỗ trống' : 'Chọn đáp án chính xác',
  },
  {
    accessorKey: 'question',
    header: 'Câu hỏi',
    cell: ({ row }) => (
      <div className="max-w-[420px] truncate" title={row.original.question}>{row.original.question}</div>
    ),
  },
  {
    accessorKey: 'answer',
    header: 'Đáp án',
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.original.answer}>{row.original.answer}</div>
    ),
  },
  {
    id: 'optionsList',
    header: 'Lựa chọn',
    cell: ({ row }) => {
      const options = (row.original.options || []).filter(o => (o || '').trim() !== '')
      if (row.original.type === 'Fill in the blank' || options.length === 0) return <i>Không có</i>
      return <span>[{options.join(', ')}]</span>
    },
  },
  {
    accessorKey: 'type',
    header: 'Loại câu hỏi',
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <ActionsCell topicId={topicId} quiz={row.original} callback={callback} />,
  },
]


