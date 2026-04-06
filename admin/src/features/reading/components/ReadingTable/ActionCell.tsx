'use client'
import { Reading } from '@/features/reading/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, Crown } from "lucide-react"
import { deleteReading, updateReadingStatus, toggleReadingVipStatus } from '@/features/reading/services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrderIndexCell from './OrderIndexCell'
import { DialogUpdateReading } from '../dialogs'

interface props {
  reading: Reading
  allReadings: Reading[]
  callback: () => void
  onSwap?: (readingId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ reading, allReadings, callback, onSwap }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdateReading, setIsOpenUpdateReading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handlePublishReading = () => {
    setIsLoading(true)
    updateReadingStatus(reading._id)
      .then(() => {
        callback()
        toast.success(reading.isActive ? 'Ẩn bài đọc thành công' : 'Xuất bản bài đọc thành công')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDeleteReading = () => {
    setIsLoading(true)
    deleteReading(reading._id)
      .then(() => {
        callback()
        toast.success('Xóa bài đọc thành công')
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    await toggleReadingVipStatus(reading._id)
      .then(() => {
        toast.success(`Đã ${reading.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <>
      <DialogUpdateReading
        callback={callback}
        reading={reading}
        isOpen={isOpenUpdateReading}
        setIsOpen={setIsOpenUpdateReading}
      />

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài đọc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài đọc <strong>`&quot;`{reading.title}`&quot;`</strong> không?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteReading} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <OrderIndexCell reading={reading} allReadings={allReadings} callback={callback} onSwap={onSwap} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setIsOpenUpdateReading(true) }}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handlePublishReading}
              disabled={isLoading}
            >
              {!reading.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {!reading.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="h-4 w-4" />
              {reading.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setOpenDelete(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
