"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Example } from '@/features/IPA/types'
import ActionsCell from "./ActionsCell"

export const columnsIpaExample = (ipaId: string, callback: () => void): ColumnDef<Example>[] => [
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
    accessorKey: "word",
    header: () => <div className="text-center">Từ vựng</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.word}</div>
    }
  },
  {
    accessorKey: "phonetic",
    header: () => <div className="text-center">Phiên âm</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.phonetic}</div>
    }
  },

  {
    accessorKey: "vietnamese",
    header: () => <div className="text-center">Nghĩa tiếng Việt</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.vietnamese}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell ipaId={ipaId} example={row.original} callback={callback} />
  },
]