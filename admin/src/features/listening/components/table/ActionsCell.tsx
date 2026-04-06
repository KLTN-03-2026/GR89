'use client'
import { Listening } from '@/features/listening/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, Crown } from "lucide-react"
import { deleteListening, toggleListeningVipStatus, updateListeningStatus } from '@/features/listening/services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { DialogUpdateListening } from '@/features/listening/components/dialog/DialogUpdateListening'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrderIndexCell from './OrderIndexCell'

interface props {
  listening: Listening
  allListenings: Listening[]
  callback: () => void
  onSwap?: (listeningId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ listening, allListenings, callback, onSwap }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdateListening, setIsOpenUpdateListening] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handlePublishListening = () => {
    setIsLoading(true)
    updateListeningStatus(listening._id)
      .then(() => {
        callback()
        toast.success(listening.isActive ? 'Ẩn bài nghe thành công' : 'Xuất bản bài nghe thành công')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDeleteListening = () => {
    setIsLoading(true)
    deleteListening(listening._id)
      .then(() => {
        callback()
        toast.success('Xóa bài nghe thành công')
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleListeningVipStatus(listening._id)
      toast.success(`Đã ${listening.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
      callback()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cập nhật VIP thất bại'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DialogUpdateListening
        callback={callback}
        listening={listening}
        isOpen={isOpenUpdateListening}
        setIsOpen={setIsOpenUpdateListening}
      />

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài nghe</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài nghe <strong>`&quot;`{listening.title}`&quot;`</strong> không?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteListening} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <OrderIndexCell listening={listening} allListenings={allListenings} callback={callback} onSwap={onSwap} />
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
              onSelect={(e) => { e.preventDefault(); setIsOpenUpdateListening(true) }}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handlePublishListening}
              disabled={isLoading}
            >
              {!listening.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {!listening.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="h-4 w-4" />
              {listening.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
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