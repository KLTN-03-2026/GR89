"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import ActionsCell from "./ActionsCell"
import { ClickableImage, CreatorBadge } from "@/components/common/"
import { Vocabulary } from "@/features/vocabulary/types"

export const columnsVocabulary = (callback: () => void): ColumnDef<Vocabulary>[] => [
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
    id: "Từ vựng",
    accessorKey: "word",
    header: () => <div className="text-center">Từ vựng</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.word}</div>
    }
  },
  {
    id: "Phiên âm",
    accessorKey: "transcription",
    header: "Phiên âm",
    cell: ({ row }) => {
      return <div>{row.original.transcription}</div>
    }
  },

  {
    accessorKey: "Từ loại",
    header: "Từ loại",
    cell: ({ row }) => {
      return <div>{row.original.partOfSpeech}</div>
    }
  },

  {
    accessorKey: "Định nghĩa",
    header: "Định nghĩa",
    cell: ({ row }) => {
      return <div>{row.original.definition}</div>
    }
  },

  {
    accessorKey: "Nghĩa tiếng Việt",
    header: "Nghĩa tiếng Việt",
    cell: ({ row }) => {
      return <div>{row.original.vietnameseMeaning}</div>
    }
  },

  {
    accessorKey: "Ví dụ",
    header: "Ví dụ",
    cell: ({ row }) => {
      return <div>{row.original.example}</div>
    }
  },

  {
    accessorKey: "Hình ảnh",
    header: "Hình ảnh",
    cell: ({ row }) => {
      const imageUrl = typeof row.original.image === 'string'
        ? row.original.image
        : row.original.image.url || ""
      return <ClickableImage
        src={imageUrl}
        alt={row.original.word ?? "image"}
        width={80}
        height={80}
        className="w-full h-full max-w-[50px] max-h-[50px] aspect-square object-cover border-gray-200"
        fallbackSrc="/images/logo.png"
      />
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
      const vocabulary = row.original
      if (!vocabulary.createdBy) {
        return <div className="text-center text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <CreatorBadge
            createdBy={vocabulary.createdBy}
            createdAt={vocabulary.createdAt}
          />
        </div>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell vacabulary={row.original} callback={callback} />
  },
]