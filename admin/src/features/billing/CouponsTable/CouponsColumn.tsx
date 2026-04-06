"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Coupon } from "@/lib/apis/api"
import { ActionCell } from "./ActionCell"

export const columnsCoupons = (
  onEdit: (row: Coupon) => void,
  onDelete: (row: Coupon) => void,
  onRefresh: () => void
): ColumnDef<Coupon>[] => [
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
    accessorKey: "code", 
    header: "Mã", 
    cell: ({ row }) => (
      <span className="font-mono font-bold text-blue-600">{row.original.code}</span>
    )
  },
  { 
    accessorKey: "name", 
    header: "Tên",
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
    accessorKey: "discountType",
    header: "Loại giảm giá",
    cell: ({ row }) => {
      const coupon = row.original
      return (
        <div>
          <Badge className={coupon.discountType === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
            {coupon.discountType === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
          </Badge>
          <div className="mt-1 font-semibold">
            {coupon.discountType === 'percentage' 
              ? `${coupon.discountValue}%`
              : `${coupon.discountValue.toLocaleString('vi-VN')}đ`
            }
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "usage",
    header: "Sử dụng",
    cell: ({ row }) => {
      const coupon = row.original
      return (
        <div>
          <div className="text-sm">
            {coupon.usedCount} / {coupon.usageLimit || '∞'}
          </div>
          {coupon.usageLimit && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
              />
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "validFrom",
    header: "Thời hạn",
    cell: ({ row }) => {
      const coupon = row.original
      const now = new Date()
      const validFrom = new Date(coupon.validFrom)
      const validTo = new Date(coupon.validTo)
      const isExpired = now > validTo
      const isNotStarted = now < validFrom
      
      return (
        <div>
          <div className="text-xs text-gray-600">
            Từ: {validFrom.toLocaleDateString('vi-VN')}
          </div>
          <div className="text-xs text-gray-600">
            Đến: {validTo.toLocaleDateString('vi-VN')}
          </div>
          {isExpired && <Badge className="mt-1 bg-red-100 text-red-700 text-xs">Hết hạn</Badge>}
          {isNotStarted && <Badge className="mt-1 bg-yellow-100 text-yellow-700 text-xs">Chưa bắt đầu</Badge>}
          {!isExpired && !isNotStarted && <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Đang hoạt động</Badge>}
        </div>
      )
    }
  },
  {
    accessorKey: "applicablePlans",
    header: "Áp dụng cho",
    cell: ({ row }) => {
      const plans = row.original.applicablePlans || []
      return (
        <div>
          {plans.length === 0 ? (
            <span className="text-sm text-gray-500">Tất cả gói</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {plans.map((plan, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {plan}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    }
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
      <ActionCell coupon={row.original} onEdit={onEdit} onDelete={onDelete} onRefresh={onRefresh} />
    )
  }
]

