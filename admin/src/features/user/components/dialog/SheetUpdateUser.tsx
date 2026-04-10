'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Activity, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Info,
  History
} from "lucide-react"
import { updateUser } from "../../services/api"
import { toast } from "react-toastify"
import { User } from "../../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface SheetUpdateUserProps {
  user: User
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  callback: () => void
}

export function SheetUpdateUser({ user, isOpen, setIsOpen, callback }: SheetUpdateUserProps) {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.isActive)

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName)
      setEmail(user.email)
      setRole(user.role)
      setIsActive(user.isActive)
    }
  }, [isOpen, user])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await updateUser(user._id, {
        fullName,
        email,
        role,
        isActive
      })

      if (response.success) {
        toast.success('Cập nhật người dùng thành công')
        setIsOpen(false)
        callback()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="h-full sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Hiệu Chỉnh Tài Khoản</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Cập nhật thông tin định danh và quyền hạn cho: <span className="text-blue-600 font-bold">{user.fullName}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="w-4 h-4" />
                Thông Tin Định Danh
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="fullname-edit" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Họ và Tên <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fullname-edit"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email-edit" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Địa chỉ Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="email-edit"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Permissions & Status */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <ShieldCheck className="w-4 h-4" />
                Quyền Hạn & Trạng Thái
              </div>

              <div className="grid grid-cols-2 gap-6 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Vai Trò Hệ Thống
                  </Label>
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="admin" className="rounded-xl font-bold text-rose-600">Quản trị viên (Admin)</SelectItem>
                      <SelectItem value="content" className="rounded-xl font-bold text-indigo-600">Biên tập viên (Content)</SelectItem>
                      <SelectItem value="user" className="rounded-xl font-bold text-gray-700">Học viên (User)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Trạng Thái Tài Khoản
                  </Label>
                  <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="active" className="rounded-xl font-bold text-emerald-600">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive" className="rounded-xl font-bold text-rose-600">Tạm khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Section: Metadata */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-slate-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <History className="w-4 h-4" />
                Lịch Sử Hoạt Động
              </div>
              
              <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Activity className="w-3 h-3" /> Đăng nhập lần cuối
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Chưa từng đăng nhập'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Ngày tham gia
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi }) : '---'}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
                disabled={loading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button 
              onClick={handleUpdate} 
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 font-black transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Đang Xử Lý...' : 'Lưu Thay Đổi'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
