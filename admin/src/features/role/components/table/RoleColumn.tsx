"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Role } from "@/features/role/types"
import ActionsCell from "./ActionsCell"

export const columnsRole = (callback: () => void): ColumnDef<Role>[] => [
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
    accessorKey: "name",
    header: "Tên vai trò",
    cell: ({ row }) => <div className="font-bold text-gray-900">{row.original.name}</div>
  },

  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => <div className="text-gray-500 font-medium text-xs max-w-[200px] truncate">{row.original.description}</div>
  },

  {
    accessorKey: "permissions",
    header: () => <div className="text-center">Quyền hạn</div>,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 justify-center max-w-[300px]">
        {row.original.permissions?.length ? (
          row.original.permissions.slice(0, 3).map((p) => (
            <Badge key={p} variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-mono text-[9px] px-1.5 py-0">
              {p}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="text-[9px]">Trống</Badge>
        )}
        {row.original.permissions && row.original.permissions.length > 3 && (
          <Badge variant="outline" className="text-[9px] border-gray-200 text-gray-400">
            +{row.original.permissions.length - 3}
          </Badge>
        )}
      </div>
    )
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell role={row.original} callback={callback} />
  },
]


