"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plan } from "@/lib/apis/api"
import ActionCell from "./ActionCell"

export type PlanRow = Plan & {
  active?: boolean // For backward compatibility
}

export const columnsPlans = (callback: () => void): ColumnDef<PlanRow>[] => [
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
    header: "Tên gói",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.description && (
          <div className="text-xs text-gray-500 mt-0.5">{row.original.description}</div>
        )}
      </div>
    )
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ row }) => {
      const plan = row.original
      const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price
      return (
        <div>
          {hasDiscount && plan.originalPrice !== undefined && (
            <div className="text-xs text-gray-400 line-through">
              {Math.round(plan.originalPrice || 0).toLocaleString('vi-VN')}đ
            </div>
          )}
          <div className={hasDiscount ? "text-red-600 font-semibold" : ""}>
            {Math.round(plan.price || 0).toLocaleString('vi-VN')}đ
          </div>
          {plan.discountPercent && (
            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">
              -{plan.discountPercent}%
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "billingCycle",
    header: "Chu kỳ",
    cell: ({ row }) => {
      const cycle = row.original.billingCycle
      const labels: Record<string, string> = {
        monthly: "Hàng tháng",
        yearly: "Hàng năm",
        lifetime: "Trọn đời"
      }
      return <span>{labels[cycle] || cycle}</span>
    }
  },
  {
    accessorKey: "displayType",
    header: "Loại hiển thị",
    cell: ({ row }) => {
      const type = row.original.displayType
      const badges: Record<string, { label: string; className: string }> = {
        default: { label: "Mặc định", className: "bg-gray-100 text-gray-700" },
        vip: { label: "VIP", className: "bg-purple-100 text-purple-700" },
        premium: { label: "Premium", className: "bg-yellow-100 text-yellow-700" }
      }
      const badge = badges[type] || badges.default
      return <Badge className={badge.className}>{badge.label}</Badge>
    }
  },
  {
    accessorKey: "features",
    header: "Tính năng",
    cell: ({ row }) => (
      <div className="max-w-xs">
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
          {row.original.features.slice(0, 3).map((f, i) => (
            <li key={i} className="truncate">{f}</li>
          ))}
        </ul>
        {row.original.features.length > 3 && (
          <span className="text-xs text-gray-400">+{row.original.features.length - 3} tính năng khác</span>
        )}
      </div>
    )
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge className={row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
        {row.original.isActive ? 'Đang bật' : 'Tạm tắt'}
      </Badge>
    )
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ActionCell plan={row.original} callback={callback} />
    )
  }
]
