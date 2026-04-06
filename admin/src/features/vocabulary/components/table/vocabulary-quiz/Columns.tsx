"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import ActionsCell from './ActionsCell'
import { VocabularyTopic } from "@/features/vocabulary/types"

export const columnsVocabularyQuiz = (callback: () => void): ColumnDef<VocabularyTopic>[] => [
  { accessorKey: "name", header: "Chủ đề" },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      row.original.isActive ? <Badge variant="secondary">Hoạt động</Badge> : <Badge variant="destructive">Không hoạt động</Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <ActionsCell topic={row.original} callback={callback} />
  },
]


