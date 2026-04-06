"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Play } from "lucide-react"
import { useState } from "react"
import { Listening } from "@/features/listening/types"
import ActionsCell from "./ActionsCell"
import { CreatorBadge } from "@/components/common/shared/CreatorInfo"

function AudioPreview({ audioUrl, title }: { audioUrl: string; title: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className="group mx-auto flex items-center justify-center w-[40px] h-[40px] border border-gray-200 rounded"
        onClick={() => setOpen(true)}
        aria-label="Open audio"
        title={`Nghe: ${title}`}
      >
        <Play className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[600px] w-[90vw]">
          <div className="space-y-3">
            <div className="font-medium">{title}</div>
            <audio controls className="w-full">
              <source src={audioUrl} />
              Trình duyệt của bạn không hỗ trợ audio.
            </audio>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columnsListening = (callback: () => void, listenings: Listening[], onSwap?: (listeningId: string, direction: 'up' | 'down') => void): ColumnDef<Listening>[] => [
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
    id: "Tiêu đề",
    accessorKey: "title",
    header: () => <div>Tiêu đề</div>,
    cell: ({ row }) => <div className="line-clamp-1">{row.original.title}</div>
  },

  {
    id: "Mô tả",
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => <div className="line-clamp-1" title={row.original.description}>{row.original.description}</div>
  },

  {
    id: "Level",
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
  },

  {
    accessorKey: "Nghe",
    header: () => <div className="text-center">Nghe</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <AudioPreview audioUrl={typeof row.original.audio === 'string' ? row.original.audio : row.original.audio?.url || ''} title={row.original.title} />
      </div>
    )
  },

  {
    accessorKey: "Phụ đề",
    header: "Phụ đề",
    cell: ({ row }) => (
      <div className="line-clamp-1" title={row.original.subtitle}>
        {row.original.subtitle || 'Chưa có phụ đề'}
      </div>
    )
  },

  {
    accessorKey: "Trạng thái",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <div>
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
    header: () => <div className="text-center">Người tạo</div>,
    cell: ({ row }) => {
      const listening = row.original
      if (!listening.createdBy) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <CreatorBadge createdBy={listening.createdBy} />
        </div>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell listening={row.original} allListenings={listenings} callback={callback} onSwap={onSwap} />
  },
]


