'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Trash2, Eye, EyeOff, Crown } from "lucide-react"
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteIpa, toggleIpaVipStatus, updateIpaStatus } from '@/features/IPA/services/api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { SheetUpdateIpa } from '@/features/IPA/components/dialogs/SheetUpdateIpa'
import { Ipa } from '../../types'

interface ActionsCellProps {
  ipa: Ipa
  callback: () => void
}

export default function ActionsCell({ ipa, callback }: ActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter()
  const handleDelete = async () => {
    setIsLoading(true)
    await deleteIpa(ipa._id)
      .then(() => {
        toast.success('Xóa IPA thành công')
        callback()
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      await updateIpaStatus(ipa._id)
      toast.success(`Đã ${ipa.isActive ? 'ẩn' : 'xuất bản'} IPA thành công`)
      callback()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cập nhật trạng thái thất bại'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleIpaVipStatus(ipa._id)
      toast.success(`Đã ${ipa.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
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
      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc chắn muốn xóa IPA <span className="text-rose-600 font-bold">"{ipa.sound}"</span>?
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
              onClick={handleDelete}
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

          <SheetUpdateIpa ipa={ipa} callback={callback} />

          <DropdownMenuItem onClick={() => router.push(`/content/ipa/examples/${ipa._id}`)}>
            Danh sách ví dụ
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isLoading}
          >
            {ipa.isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ẩn
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Xuất bản
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleVip}
            disabled={isLoading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {ipa.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
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
    </>
  )
}
