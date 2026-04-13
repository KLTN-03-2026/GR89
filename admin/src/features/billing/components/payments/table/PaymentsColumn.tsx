"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2, Clock, XCircle, AlertCircle, RotateCcw } from "lucide-react"
import { Payment } from "@/lib/apis/api"

export type PaymentRow = Payment & {
  id?: string // For backward compatibility
  user?: string // For backward compatibility
}

const StatusBadge = ({ status }: { status: PaymentRow["status"] }) => {
  const badges = {
    paid: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs"><CheckCircle2 className="w-3.5 h-3.5" />Đã thanh toán</span>,
    pending: <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs"><Clock className="w-3.5 h-3.5" />Đang xử lý</span>,
    failed: <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs"><XCircle className="w-3.5 h-3.5" />Thất bại</span>,
    refunded: <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs"><RotateCcw className="w-3.5 h-3.5" />Đã hoàn tiền</span>,
    cancelled: <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs"><AlertCircle className="w-3.5 h-3.5" />Đã hủy</span>,
  }
  return badges[status] || badges.pending
}

export const columnsPayments: ColumnDef<PaymentRow>[] = [
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
    accessorKey: "_id",
    header: "Mã GD",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original._id}</span>
    )
  },
  {
    accessorKey: "userId",
    header: "Người dùng",
    cell: ({ row }) => {
      const user = row.original.userId
      if (typeof user === 'object' && user) {
        return <div>
          <div className="font-medium">{user.fullName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{user.email || ''}</div>
        </div>
      }
      return <span>{typeof user === 'string' ? user : 'N/A'}</span>
    }
  },
  {
    accessorKey: "planId",
    header: "Gói",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.planId}</span>
    )
  },
  {
    accessorKey: "amount",
    header: "Số tiền",
    cell: ({ row }) => {
      const payment = row.original
      const roundedAmount = Math.round(payment.amount || 0)
      const roundedDiscount = payment.discountAmount ? Math.round(payment.discountAmount) : 0
      return (
        <div>
          <div className="font-medium">
            {roundedAmount.toLocaleString('vi-VN')} đ
          </div>
          {roundedDiscount > 0 ? (
            <div className="text-xs text-gray-500">
              Giảm: {roundedDiscount.toLocaleString('vi-VN')} đ
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              Không giảm
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "provider",
    header: "Cổng",
    cell: ({ row }) => (
      <span className="uppercase font-medium">{row.original.provider}</span>
    )
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />
  },
  {
    accessorKey: "paymentDate",
    header: "Ngày thanh toán",
    cell: ({ row }) => {
      const date = row.original.paymentDate
      if (!date) return <span className="text-gray-400">-</span>
      return <span>{new Date(date).toLocaleString('vi-VN')}</span>
    }
  },
  {
    accessorKey: "createdAt",
    header: "Thời gian tạo",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {new Date(row.original.createdAt).toLocaleString('vi-VN')}
      </span>
    )
  },
]
