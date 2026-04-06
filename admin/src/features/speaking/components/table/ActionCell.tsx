'use client'
import { Speaking } from '@/features/speaking/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, Crown } from "lucide-react"
import { deleteSpeaking, updateSpeakingStatus, toggleSpeakingVipStatus } from '@/features/speaking/services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { DialogUpdateSpeaking } from '@/components/common'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrderIndexCell from './OrderIndexCell'

interface props {
  speaking: Speaking
  allSpeakings: Speaking[]
  callback: () => void
  onSwap?: (speakingId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ speaking, allSpeakings, callback, onSwap }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdateSpeaking, setIsOpenUpdateSpeaking] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handlePublishSpeaking = () => {
    setIsLoading(true)
    updateSpeakingStatus(speaking._id)
      .then(() => {
        callback()
        toast.success(speaking.isActive ? 'Ẩn bài nói thành công' : 'Xuất bản bài nói thành công')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDeleteSpeaking = () => {
    setIsLoading(true)
    deleteSpeaking(speaking._id)
      .then(() => {
        callback()
        toast.success('Xóa bài nói thành công')
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleSpeakingVipStatus(speaking._id)
      toast.success(`Đã ${speaking.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
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
      <DialogUpdateSpeaking
        callback={callback}
        speaking={speaking}
        isOpen={isOpenUpdateSpeaking}
        setIsOpen={setIsOpenUpdateSpeaking}
      />

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài nói</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài nói <strong>`&quot;`{speaking.title}`&quot;`</strong> không?
              Hành động này sẽ xóa tất cả transcriptions và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteSpeaking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <OrderIndexCell speaking={speaking} allSpeakings={allSpeakings} callback={callback} onSwap={onSwap} />
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
              onSelect={(e) => { e.preventDefault(); setIsOpenUpdateSpeaking(true) }}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handlePublishSpeaking}
              disabled={isLoading}
            >
              {!speaking.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {!speaking.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="h-4 w-4" />
              {speaking.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
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
