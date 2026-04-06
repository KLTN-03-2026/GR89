"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const columnsReadingVocabularyTopic: ColumnDef<Reading>[] = [
  { accessorKey: "title", header: "Tiêu đề" },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <div className="max-w-[360px] truncate" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "vocabulary",
    header: "Số từ vựng",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.vocabulary?.length || 0}</Badge>
    ),
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/content/reading/vocabulary/${row.original._id}`}>
          <Button size="sm" variant="outline">Xem Từ vựng</Button>
        </Link>
        <Link href={`/content/reading`}>
          <Button size="sm" variant="ghost">Chi tiết Reading</Button>
        </Link>
      </div>
    ),
  },
]

// Columns for a single reading's vocabulary list
type TVocab = Reading['vocabulary'][number]

import ActionsCell from './ActionsCell'
import { Reading } from "@/features/reading/types"

export const columnsReadingVocabulary = (readingId: string, callback: () => void): ColumnDef<TVocab>[] => [
  { accessorKey: 'word', header: 'Từ vựng' },
  { accessorKey: 'phonetic', header: 'Phiên âm' },
  { accessorKey: 'vietnamese', header: 'Nghĩa' },
  {
    accessorKey: 'definition',
    header: 'Định nghĩa',
    cell: ({ row }) => (
      <div className="max-w-[360px] truncate" title={row.original.definition}>
        {row.original.definition}
      </div>
    ),
  },
  {
    accessorKey: 'example',
    header: 'Ví dụ',
    cell: ({ row }) => (
      <div className="max-w-[360px] truncate" title={row.original.example}>
        {row.original.example}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <ActionsCell readingId={readingId} vocabIndex={row.index} vocab={row.original} callback={callback} />
  }
]


