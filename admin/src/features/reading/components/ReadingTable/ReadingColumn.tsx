"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Reading } from "@/features/reading/types"
import ActionsCell from "./ActionCell"
import { ChevronRight } from "lucide-react"
import { ClickableImage } from "@/components/common"
import { CreatorBadge } from "@/components/common/shared/CreatorInfo"

export const columnsReading = (callback: () => void, router: { push: (path: string) => void }, readings: Reading[], onSwap?: (readingId: string, direction: 'up' | 'down') => void): ColumnDef<Reading>[] => [
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
    id: "Hình ảnh",
    accessorKey: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const imageField = row.original?.image

      return (
        <ClickableImage
          src={imageField?.url}
          alt={row.original.title ?? 'image'}
          width={80}
          height={80}
          className="w-full h-full max-w-[50px] max-h-[50px] aspect-square object-cover border-gray-200"
          fallbackSrc="/images/logo.png"
        />
      )
    }
  },
  {
    id: "Tiêu đề",
    accessorKey: "title",
    header: "Tiêu đề",
    cell: ({ row }) => {
      return <div className="line-clamp-1">{row.original.title}</div>
    }
  },
  {
    id: "Level",
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => <Badge variant="outline">{row.original.level}</Badge>
  },
  {
    id: "Mô tả",
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      return <div className="line-clamp-1" title={row.original.description}>
        {row.original.description}
      </div>
    }
  },
  {
    accessorKey: "Đoạn văn tiếng Anh",
    header: "Đoạn văn tiếng Anh",
    cell: ({ row }) => {
      return <div className="line-clamp-1" title={row.original.paragraphEn}>
        {row.original.paragraphEn}
      </div>
    }
  },
  {
    accessorKey: "Đoạn văn tiếng Việt",
    header: "Đoạn văn tiếng Việt",
    cell: ({ row }) => {
      return <div className="line-clamp-1" title={row.original.paragraphVi}>
        {row.original.paragraphVi}
      </div>
    }
  },
  {
    accessorKey: "Từ vựng",
    header: () => <div className="text-center">Từ vựng</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Badge
            role="button"
            tabIndex={0}
            title="Xem danh sách từ vựng"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/content/reading/vocabulary/${row.original._id}`) } }}
            onClick={() => router.push(`/content/reading/vocabulary/${row.original._id}`)}
            className="inline-flex items-center gap-1.5 cursor-pointer transition hover:opacity-90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            variant="secondary"
          >
            {row.original.vocabulary?.length || 0} từ
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "Câu hỏi",
    header: () => <div className="text-center">Câu hỏi</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Badge
            role="button"
            tabIndex={0}
            title="Xem danh sách câu hỏi"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/content/reading/quiz/${row.original._id}`) } }}
            onClick={() => router.push(`/content/reading/quiz/${row.original._id}`)}
            className="inline-flex items-center gap-1.5 cursor-pointer transition hover:opacity-90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            variant="secondary"
          >
            {row.original.quizzes?.length || 0} câu
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </Badge>
        </div>
      )
    }
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
      const reading = row.original
      if (!reading.createdBy) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <CreatorBadge createdBy={reading.createdBy} />
        </div>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell reading={row.original} allReadings={readings} callback={callback} onSwap={onSwap} />
  },
]
