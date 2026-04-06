'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { GrammarTopic } from '@/features/grammar/types'
import ActionsCell from './ActionsCell'
import { CreatorBadge } from '@/components/common'

export const columnsGrammarTopic = (
  callback: () => void,
  topics: GrammarTopic[],
  onSwap?: (topicId: string, direction: 'up' | 'down') => void
): ColumnDef<GrammarTopic>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'Tên chủ đề',
      accessorKey: 'title',
      header: 'Tên chủ đề',
      cell: ({ row }) => <div className="line-clamp-1">{row.original.title}</div>
    },
    {
      id: 'Mô tả',
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => <div className="line-clamp-1">{row.original.description}</div>
    },
    {
      id: 'Level',
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
    },
    {
      id: 'Trạng thái',
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <div>{row.original.isActive ? <Badge variant="secondary">Hoạt động</Badge> : <Badge variant="destructive">Không hoạt động</Badge>}</div>
      )
    },
    {
      id: 'VIP',
      accessorKey: 'isVipRequired',
      header: () => <div className="text-center">VIP</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.isVipRequired ? (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              VIP
            </Badge>
          ) : (
            <Badge variant="secondary">Thường</Badge>
          )}
        </div>
      )
    },
    {
      id: 'lesson',
      header: 'Lesson',
      cell: ({ row }) => (
        <a href={`/content/grammar/lesson/${row.original._id}`} className="text-blue-600 hover:text-blue-800 underline">
          Quản lý Lesson
        </a>
      )
    },
    {
      accessorKey: 'Người tạo',
      header: () => <div className="text-center">Người tạo</div>,
      cell: ({ row }) => {
        const topic = row.original
        if (!topic.createdBy) {
          return <div className="text-center text-muted-foreground">-</div>
        }
        return (
          <div className="flex justify-center">
            <CreatorBadge createdBy={topic.createdBy} />
          </div>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell topic={row.original} allTopics={topics} callback={callback} onSwap={onSwap} />
    }
  ]

