"use client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, UserCheck, UserX, Eye, Pencil, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/features/user/types"
import { updateUserStatus } from "@/features/user/services/api"
import { toast } from "react-toastify"
import { SheetUpdateUser } from '../../dialog/SheetUpdateUser'
import { SheetViewUserDetail } from '../../dialog/SheetViewUserDetail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function ActionsCell({ user }: { user: User }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openToggleStatus, setOpenToggleStatus] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    window.location.reload()
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
          <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-3 py-2">Quản lý học viên</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenView(true)} className="rounded-lg font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 cursor-pointer">
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="rounded-lg font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenToggleStatus(true)}
            className={cn(
              "rounded-lg font-bold cursor-pointer",
              user.isActive ? "text-rose-600 focus:bg-rose-50 focus:text-rose-600" : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"
            )}
          >
            {user.isActive ? (
              <>
                <UserX className="w-4 h-4 mr-2" />
                Khóa tài khoản
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Kích hoạt tài khoản
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Sheet */}
      <SheetViewUserDetail user={user} isOpen={openView} setIsOpen={setOpenView} />

      {/* Edit Sheet */}
      <SheetUpdateUser user={user} isOpen={openEdit} setIsOpen={setOpenEdit} callback={handleRefresh} />

      {/* Toggle Status Confirmation Dialog */}
      <Dialog open={openToggleStatus} onOpenChange={setOpenToggleStatus}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner",
              user.isActive ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {user.isActive ? <UserX className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">
              {user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              {user.isActive
                ? `Bạn có chắc muốn khóa tài khoản của ${user.fullName}? Người dùng sẽ không thể đăng nhập vào ứng dụng.`
                : `Bạn có chắc muốn kích hoạt lại tài khoản cho ${user.fullName}?`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-black text-gray-400 border border-gray-100">
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs font-medium text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
            <Button
              variant="outline"
              onClick={() => setOpenToggleStatus(false)}
              disabled={loading}
              className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
            >
              Hủy Bỏ
            </Button>
            <Button
              variant={user.isActive ? "destructive" : "default"}
              onClick={async () => {
                setLoading(true)
                try {
                  const response = await updateUserStatus(user._id, !user.isActive)
                  if (response.success) {
                    toast.success(`Đã ${!user.isActive ? 'kích hoạt' : 'khóa'} tài khoản thành công`)
                    setOpenToggleStatus(false)
                    handleRefresh()
                  } else {
                    toast.error(response.message || 'Có lỗi xảy ra')
                  }
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || 'Có lỗi xảy ra')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className={cn(
                "h-11 px-6 rounded-xl font-black shadow-lg transition-all",
                user.isActive
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (user.isActive ? 'Khóa Tài Khoản' : 'Kích Hoạt')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
