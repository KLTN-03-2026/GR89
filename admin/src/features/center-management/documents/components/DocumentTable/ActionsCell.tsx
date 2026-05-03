'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IGlobalDocument } from '../../type'

interface Props {
  document: IGlobalDocument
  callback: () => void
}

export default function ActionsCell({ document, callback }: Props) {
  const [openDelete, setOpenDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    // Placeholder for actual delete API
    setTimeout(() => {
      toast.success('Xóa tài liệu thành công')
      callback()
      setOpenDelete(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-zinc-900">Xác nhận xóa tài liệu</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">
              Bạn có chắc chắn muốn xóa tài liệu <strong>"{document.name}"</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={isLoading}
              className="rounded-xl font-bold border-zinc-200"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-lg">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-zinc-100 shadow-xl p-1.5">
          <DropdownMenuLabel className="text-[11px] font-black uppercase text-zinc-400 tracking-wider px-2 py-1.5">
            Thao tác
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/center-management/documents/${document._id}`)}
            className="rounded-lg font-bold text-zinc-600 focus:text-zinc-900 focus:bg-zinc-50 cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg font-bold text-zinc-600 focus:text-zinc-900 focus:bg-zinc-50 cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-50" />
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="rounded-lg font-bold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa tài liệu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
