'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Writing } from '@/features/writing/types'
import ActionsCell from './ActionCell'
import { CreatorBadge } from '@/components/common/shared/CreatorInfo'

export const columnsWriting = (
  callback: () => void,
  writings: Writing[],
  onSwap?: (writingId: string, direction: 'up' | 'down') => void
): ColumnDef<Writing>[] => [
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
      id: 'Tiêu đề',
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => {
        return <div className="line-clamp-1">{row.original.title}</div>
      },
    },
    {
      id: 'Level',
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
    },
    {
      id: 'Mô tả',
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => {
        return <div className="line-clamp-1">{row.original.description}</div>
      },
    },
    {
      accessorKey: 'Số từ tối thiểu',
      header: 'Số từ tối thiểu',
      cell: ({ row }) => {
        return <div className="text-center">{row.original.minWords}</div>
      },
    },
    {
      accessorKey: 'Số từ tối đa',
      header: 'Số từ tối đa',
      cell: ({ row }) => {
        return <div className="text-center">{row.original.maxWords}</div>
      },
    },
    {
      accessorKey: 'Thời gian',
      header: 'Thời gian (phút)',
      cell: ({ row }) => {
        return <div className="text-center">{row.original.duration}</div>
      },
    },
    {
      accessorKey: 'Từ vựng gợi ý',
      header: 'Từ vựng gợi ý',
      cell: ({ row }) => {
        return <div className="line-clamp-1">{row.original.suggestedVocabulary.join(', ')}</div>
      },
    },
    {
      accessorKey: 'Cấu trúc gợi ý',
      header: 'Cấu trúc gợi ý',
      cell: ({ row }) => {
        return (
          <div>
            {row.original.suggestedStructure.map((structure, index) => (
              <span key={index} className="line-clamp-1 text-left">
                {structure.step}. {structure.description}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'Trạng thái',
      header: 'Trạng thái',
      cell: ({ row }) => {
        return (
          <div>
            {row.original.isActive ? (
              <Badge variant="secondary">Hoạt động</Badge>
            ) : (
              <Badge variant="destructive">Không hoạt động</Badge>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: 'isVipRequired',
      header: () => <div className="text-center">VIP</div>,
      cell: ({ row }) => {
        return (
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
    },

    {
      accessorKey: 'Người tạo',
      header: () => <div className="text-center">Người tạo</div>,
      cell: ({ row }) => {
        const writing = row.original
        if (!writing.createdBy) {
          return <div className="text-center text-muted-foreground">-</div>
        }
        return (
          <div className="flex justify-center">
            <CreatorBadge createdBy={writing.createdBy} />
          </div>
        )
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionsCell writing={row.original} allWritings={writings} callback={callback} onSwap={onSwap} />
      ),
    },
  ]
