'use client'
import { Writing } from '@/features/writing/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, Crown } from 'lucide-react'
import { deleteWriting, updateWritingStatus, toggleWritingVipStatus } from '@/features/writing/services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { DialogUpdateWriting } from '@/features/writing'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrderIndexCell from './OrderIndexCell'

interface props {
  writing: Writing
  allWritings: Writing[]
  callback: () => void
  onSwap?: (writingId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ writing, allWritings, callback, onSwap }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdateWriting, setIsOpenUpdateWriting] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const handlePublishWriting = () => {
    setIsLoading(true)
    updateWritingStatus(writing._id)
      .then(() => {
        callback()
        toast.success(writing.isActive ? 'Ẩn bài viết thành công' : 'Xuất bản bài viết thành công')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDeleteWriting = () => {
    setIsLoading(true)
    deleteWriting(writing._id)
      .then(() => {
        callback()
        toast.success('Xóa bài viết thành công')
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleWritingVipStatus(writing._id)
      toast.success(`Đã ${writing.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
      callback()
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cập nhật VIP thất bại'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <DialogUpdateWriting
        callback={callback}
        writing={writing}
        isOpen={isOpenUpdateWriting}
        setIsOpen={setIsOpenUpdateWriting}
      />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài viết <strong>&quot;{writing.title}&quot;</strong> không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteWriting} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <OrderIndexCell writing={writing} allWritings={allWritings} callback={callback} onSwap={onSwap} />
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
              onSelect={(e) => {
                e.preventDefault()
                setIsOpenUpdateWriting(true)
              }}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handlePublishWriting} disabled={isLoading}>
              {!writing.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {!writing.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="h-4 w-4" />
              {writing.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-600" onClick={() => setOpenDelete(true)} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
