'use client'
import { DataTable, PageHeader } from "@/components/common"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { columnsRole } from "../table/RoleColumn"
import { Role } from "@/features/role/types"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, Info, FileText, Lock, Plus, Save, X } from "lucide-react"
import { createRole, getRoleList } from "../../services/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export function RoleMain() {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [refresh, setRefresh] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: '',
  })

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true)
      const res = await getRoleList()
      setRoles(res.data || [])
      setIsLoading(false)
    }
    fetchRoles()
  }, [refresh])

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vai Trò & Quyền</h1>
          </div>
          <p className="text-gray-500 font-medium">Quản lý các cấp độ truy cập và phân quyền hệ thống.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Vai Trò
        </Button>
      </div>

      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
          <SheetHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thêm Vai Trò Mới</SheetTitle>
                <SheetDescription className="text-gray-500 font-medium mt-1">
                  Định nghĩa cấp độ truy cập mới cho nhân viên hoặc người dùng.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Separator className="bg-gray-100" />

          <ScrollArea className="flex-1 min-h-0">
            <form
              id="form-add-role"
              className="p-8 space-y-8"
              onSubmit={async (e) => {
                e.preventDefault()
                setIsLoading(true)
                try {
                  await createRole({
                    name: newRole.name.trim(),
                    description: newRole.description.trim(),
                    permissions: newRole.permissions
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean),
                  })
                  setRefresh(v => !v)
                  setOpenAdd(false)
                  setNewRole({ name: '', description: '', permissions: '' })
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              {/* Basic Info */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <Info className="w-4 h-4" />
                  Thông Tin Cơ Bản
                </div>
                
                <div className="grid gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1">Tên Vai Trò *</Label>
                    <Input
                      placeholder="VD: Content Moderator, Support..."
                      value={newRole.name}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Mô Tả
                    </Label>
                    <Textarea
                      placeholder="Mô tả ngắn gọn về phạm vi của vai trò này..."
                      value={newRole.description}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Permissions Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <Lock className="w-4 h-4" />
                  Phân Quyền Chi Tiết
                </div>
                
                <div className="space-y-4 bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Danh Sách Quyền (Cách nhau bởi dấu phẩy)</Label>
                  <Textarea
                    placeholder="users:read, users:write, roles:manage..."
                    value={newRole.permissions}
                    onChange={(e) => setNewRole((prev) => ({ ...prev, permissions: e.target.value }))}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-mono text-sm px-4 py-4 min-h-[120px] shadow-sm leading-relaxed"
                  />
                  <div className="flex items-start gap-2 text-[11px] text-amber-700 font-bold bg-amber-100/50 p-3 rounded-xl">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Mẹo: Sử dụng định dạng resource:action để dễ quản lý. VD: content:edit, stats:view.
                  </div>
                </div>
              </section>
            </form>
          </ScrollArea>

          <Separator className="bg-gray-100" />

          <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
            <div className="flex items-center justify-end gap-4 w-full">
              <Button 
                variant="outline" 
                onClick={() => setOpenAdd(false)} 
                className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
              >
                Hủy Bỏ
              </Button>
              <Button 
                type="submit" 
                form="form-add-role" 
                disabled={isLoading} 
                className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lưu Vai Trò'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columnsRole(() => setRefresh(!refresh))}
            data={roles}
            isLoading={isLoading}
            columnNameSearch="name"
          />
        </CardContent>
      </Card>
    </div>
  )
}


