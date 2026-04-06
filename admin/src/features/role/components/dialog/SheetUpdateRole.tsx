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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ShieldCheck, 
  Type, 
  FileText, 
  Key, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Info,
  ShieldAlert,
  Zap
} from "lucide-react"
import { updateRole, RolePayload } from "../../services/api"
import { toast } from "react-toastify"
import { Role } from "../../types"
import { Badge } from "@/components/ui/badge"

interface SheetUpdateRoleProps {
  role: Role
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  callback: () => void
}

export function SheetUpdateRole({ role, isOpen, setIsOpen, callback }: SheetUpdateRoleProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description)
  const [permissions, setPermissions] = useState(role.permissions?.join(", ") || "")

  useEffect(() => {
    if (isOpen) {
      setName(role.name)
      setDescription(role.description)
      setPermissions(role.permissions?.join(", ") || "")
    }
  }, [isOpen, role])

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên vai trò')
      return
    }

    setLoading(true)
    try {
      const payload: RolePayload = {
        name,
        description,
        permissions: permissions.split(',').map(p => p.trim()).filter(p => p !== "")
      }
      
      const response = await updateRole(role._id, payload)
      if (response.success) {
        toast.success('Cập nhật vai trò thành công')
        setIsOpen(false)
        callback()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật vai trò')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Quản Trị Vai Trò</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Thiết lập quyền hạn cho nhóm: <span className="text-indigo-600 font-bold">{role.name}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="w-4 h-4" />
                Thông Tin Cơ Bản
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="rolename-edit" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tên Vai Trò <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="rolename-edit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Quản trị viên, Biên tập viên..."
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="roledesc-edit" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mô Tả Chức Năng
                  </Label>
                  <Input
                    id="roledesc-edit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Có quyền truy cập toàn bộ hệ thống..."
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Permissions */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-rose-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Key className="w-4 h-4" />
                Danh Mục Quyền Hạn
              </div>

              <div className="bg-rose-50/30 p-6 rounded-[2rem] border border-rose-100/50 space-y-4">
                <div className="space-y-2.5">
                  <Label htmlFor="permissions-edit" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Chuỗi Quyền (Phân tách bằng dấu phẩy)
                  </Label>
                  <Input
                    id="permissions-edit"
                    value={permissions}
                    onChange={(e) => setPermissions(e.target.value)}
                    placeholder="VD: users:read, users:write, content:all..."
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-mono text-xs px-4 shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {permissions.split(',').map(p => p.trim()).filter(p => p !== "").map((p, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-white border-rose-100 text-rose-600 font-mono text-[10px] px-2 py-1 rounded-lg">
                      {p}
                    </Badge>
                  ))}
                  {permissions.split(',').filter(p => p.trim() !== "").length === 0 && (
                    <span className="text-[10px] text-rose-400 italic font-medium">Chưa có quyền nào được thiết lập.</span>
                  )}
                </div>
              </div>
            </section>

            {/* Note Section */}
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start pb-10">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Cảnh báo bảo mật</h4>
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed mt-1">
                  Việc thay đổi quyền hạn sẽ ảnh hưởng ngay lập tức đến tất cả người dùng thuộc vai trò này. Hãy kiểm tra kỹ các chuỗi quyền trước khi lưu.
                </p>
              </div>
            </div>
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
              className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Đang Xử Lý...' : 'Lưu Vai Trò'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
