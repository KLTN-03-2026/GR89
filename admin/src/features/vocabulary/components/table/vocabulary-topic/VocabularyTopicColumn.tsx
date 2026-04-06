"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import ActionsCell from "./ActionsCell"
import { ClickableImage, CreatorBadge } from "@/components/common"
import { VocabularyTopic } from "@/features/vocabulary/types"

export const columnsVocabularyTopic = (callback: () => void, topics: VocabularyTopic[], onSwap?: (topicId: string, direction: 'up' | 'down') => void): ColumnDef<VocabularyTopic>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    id: "Tên chủ đề",
    accessorKey: "name",
    header: "Tên chủ đề",
    cell: ({ row }) => {
      return <div>{row.original.name}</div>
    }
  },
  {
    id: "Level",
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
  },
  {
    accessorKey: "Hình ảnh",
    header: "Hình ảnh",
    cell: ({ row }) => {
      return <ClickableImage
        src={row.original.image.url}
        alt={row.original.name}
        width={80}
        height={80}
        className="max-w-[50px] max-h-[50px] aspect-square object-cover border-gray-200"
      />
    }
  },
  {
    id: "Trạng thái",
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <div >
        {row.original.isActive ? <Badge variant="secondary">Hoạt động</Badge> : <Badge variant="destructive">Không hoạt động</Badge>}
      </div>
    }
  },

  {
    accessorKey: "isVipRequired",
    header: () => <div className="text-center">VIP</div>,
    cell: ({ row }) => {
      return <div className="text-center">
        {row.original.isVipRequired ? (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">VIP</Badge>
        ) : (
          <Badge variant="secondary">Thường</Badge>
        )}
      </div>
    }
  },

  {
    accessorKey: "Người tạo",
    header: () => <div>Người tạo</div>,
    cell: ({ row }) => {
      const topic = row.original
      if (!topic.createdBy) {
        return <div>-</div>
      }
      return (<CreatorBadge createdBy={topic.createdBy} />)
    }
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell topic={row.original} allTopics={topics} callback={callback} onSwap={onSwap} />
  },
]