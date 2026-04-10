"use client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "@/features/role/types"
import { useState } from "react"

import { SheetUpdateRole } from '../dialog/SheetUpdateRole'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteRole } from '../../services/api'
import { toast } from "react-toastify"

export default function ActionsCell({ role, callback }: { role: Role, callback: () => void }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await deleteRole(role._id)
      if (response.success) {
        toast.success('Xóa vai trò thành công')
        setOpenDelete(false)
        callback()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra')
      }
    } catch {
      toast.error('Có lỗi xảy ra khi xóa vai trò')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl w-48">
          <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-3 py-2">Quản lý vai trò</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="rounded-lg font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDelete(true)} className="rounded-lg font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa vai trò
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Sheet */}
      <SheetUpdateRole role={role} isOpen={openEdit} setIsOpen={setOpenEdit} callback={callback} />

      {/* Delete Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc muốn xóa vai trò <span className="text-rose-600 font-bold">&quot;{role.name}&quot;</span>?
              Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các người dùng hiện tại.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
            <Button 
              variant="outline" 
              onClick={() => setOpenDelete(false)} 
              disabled={loading}
              className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 font-black"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


