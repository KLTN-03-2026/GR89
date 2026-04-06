'use client'
import type { Entertainment } from '../../types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, Crown, PlayCircle } from 'lucide-react'
import { deleteEntertainment, toggleEntertainmentStatus, toggleEntertainmentVipStatus } from '../../services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SheetUpdateEntertainment } from '../dialog/SheetUpdateEntertainment'

interface Props {
  entertainment: Entertainment
  callback: () => void
  onManageEpisodes?: (parentId: string, title: string) => void
}

export default function ActionsCell({ entertainment, callback, onManageEpisodes }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdateEntertainment, setIsOpenUpdateEntertainment] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handlePublishEntertainment = () => {
    setIsLoading(true)
    toggleEntertainmentStatus(entertainment._id)
      .then(() => {
        callback()
        toast.success(entertainment.status ? 'Ẩn nội dung thành công' : 'Xuất bản nội dung thành công')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDeleteEntertainment = () => {
    setIsLoading(true)
    deleteEntertainment(entertainment._id)
      .then(() => {
        callback()
        toast.success('Xóa nội dung thành công')
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleEntertainmentVipStatus(entertainment._id)
      toast.success(`Đã ${entertainment.isVipRequired ? 'tắt' : 'bật'} VIP cho nội dung này`)
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
      <SheetUpdateEntertainment
        callback={callback}
        entertainment={entertainment}
        open={isOpenUpdateEntertainment}
        setOpen={setIsOpenUpdateEntertainment}
      />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc chắn muốn xóa nội dung <span className="text-rose-600 font-bold">"{entertainment.title}"</span>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
            <Button 
              variant="outline" 
              onClick={() => setOpenDelete(false)} 
              disabled={isLoading}
              className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
            >
              Hủy Bỏ
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEntertainment} 
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 font-black"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          {entertainment.type === 'series' && onManageEpisodes && (
            <DropdownMenuItem onSelect={() => onManageEpisodes(entertainment._id, entertainment.title)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Quản lý tập phim
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpenUpdateEntertainment(true) }} disabled={isLoading}>
            <Pencil className="h-4 w-4" />
            Sửa
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePublishEntertainment} disabled={isLoading}>
            {!entertainment.status ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {!entertainment.status ? 'Xuất bản' : 'Ẩn'}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
            <Crown className="h-4 w-4" />
            {entertainment.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-red-600" onClick={() => setOpenDelete(true)} disabled={isLoading}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

