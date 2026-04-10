'use client'

import { useState } from 'react'
import { Coupon, updateCouponStatus } from '@/lib/apis/api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'react-toastify'
import { MoreHorizontal, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'

interface ActionCellProps {
  coupon: Coupon
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
  onRefresh: () => void
}

export function ActionCell({ coupon, onEdit, onDelete, onRefresh }: ActionCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleToggleStatus = () => {
    setIsLoading(true)
    updateCouponStatus(coupon._id)
      .then(() => {
        toast.success(coupon.isActive ? 'Đã tạm tắt mã' : 'Đã kích hoạt mã')
        onRefresh()
      })
      .catch((error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái')
      })
      .finally(() => setIsLoading(false))
  }

  const handleDelete = () => {
    setOpenDelete(false)
    onDelete(coupon)
  }

  return (
    <>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa mã giảm giá</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xóa mã <strong>{coupon.code}</strong>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onEdit(coupon)
            }}
            disabled={isLoading}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isLoading}>
            {coupon.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {coupon.isActive ? 'Tạm tắt' : 'Kích hoạt'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setOpenDelete(true)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

