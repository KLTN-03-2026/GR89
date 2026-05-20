"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Quiz } from "@/types"
import ActionsCell from './ActionsCell'

export const columnsVocabularyQuizDetail = (topicId: string, callback: () => void): ColumnDef<Quiz>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Đề bài",
    header: () => <div className="text-center">Đề bài</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.type === 'Fill in the blank' ? 'Điền từ còn thiếu vào chỗ trống' : 'Chọn đáp án chính xác'}
      </div>
    ),
  },
  {
    id: "Câu hỏi",
    accessorKey: 'question',
    header: () => <div className="text-center">Câu hỏi</div>,
    cell: ({ row }) => (
      <div className="max-w-[520px] truncate text-center" title={row.original.question}>
        {row.original.question}
      </div>
    ),
  },
  {
    id: "Loại câu hỏi",
    accessorKey: 'type',
    header: () => <div className="text-center">Loại câu hỏi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.type === 'Multiple Choice' ? (
          <Badge variant="secondary">Trắc nghiệm</Badge>
        ) : (
          <Badge variant="outline">Điền chỗ trống</Badge>
        )}
      </div>
    ),
  },
  {
    id: "Lựa chọn",
    header: () => <div className="text-center">Lựa chọn</div>,
    cell: ({ row }) => {
      const options = (row.original.options || []).map((o) => String(o || '').trim()).filter(Boolean)
      if (row.original.type === 'Fill in the blank' || options.length === 0) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="max-w-[520px] truncate text-center" title={options.join(' | ')}>
          {options.join(' | ')}
        </div>
      )
    },
  },
  {
    id: "Đáp án",
    accessorKey: 'answer',
    header: () => <div className="text-center">Đáp án</div>,
    cell: ({ row }) => (
      <div className="max-w-[320px] truncate text-center" title={row.original.answer}>
        {row.original.answer}
      </div>
    ),
  },
  {
    id: "Giải thích",
    accessorKey: 'explanation',
    header: () => <div className="text-center">Giải thích</div>,
    cell: ({ row }) => (
      <div className="max-w-[520px] truncate text-center" title={row.original.explanation}>
        {row.original.explanation}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row }) => <ActionsCell topicId={topicId} quiz={row.original} callback={callback} />,
  },
]

