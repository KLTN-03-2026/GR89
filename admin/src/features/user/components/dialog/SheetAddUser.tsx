import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CheckCircle2, Info, Key, Loader2, Mail, Shield, UserPlus, Users } from 'lucide-react'
import React from 'react'
import { toast } from 'react-toastify'
import { createUser } from '../../services/api'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  openAdd: boolean
  setOpenAdd: (open: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  callback: () => void
}

export default function SheetAddUser({ openAdd, setOpenAdd, isLoading, setIsLoading, callback }: Props) {
  return (
    <Sheet open={openAdd} onOpenChange={setOpenAdd}>
      <SheetContent className="h-full sm:max-w-xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thêm Nhân Viên</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉ tạo tài khoản với vai trò &quot;Quản lý nội dung&quot; (Content Manager).
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <form
            id="form-add-user"
            className="p-8 space-y-8"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const formData = new FormData(form)
              const email = (formData.get('email') as string)?.trim() || ''
              const fullName = (formData.get('fullname') as string)?.trim() || ''
              const password = (formData.get('password') as string)?.trim() || ''

              // Regex chuẩn xác hơn để validate email (Hỗ trợ các ký tự số ở bất cứ đâu)
              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,}$/

              if (!emailRegex.test(email)) {
                toast.error('Email không hợp lệ')
                form.querySelector<HTMLInputElement>('#email')?.focus()
                return
              }

              setIsLoading(true)
              try {
                const response = await createUser({ fullName, email, password, role: 'content' })
                if (response.success) {
                  toast.success('Tạo tài khoản thành công')
                  callback()
                  setOpenAdd(false)
                  form.reset()
                } else {
                  toast.error(response.message || 'Có lỗi xảy ra')
                }
              } finally {
                setIsLoading(false)
              }
            }}
          >
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-rose-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="w-4 h-4" />
                Thông Tin Tài Khoản
              </div>

              <div className="grid gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Họ và Tên *</Label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <Input
                      id="fullname"
                      name="fullname"
                      placeholder="Nguyễn Văn A"
                      required
                      className="h-12 pl-10 pr-4 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Email Đăng Nhập *</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <Input id="email" name="email" type="email" placeholder="user@example.com" required className="h-12 pl-10 pr-4 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold shadow-sm transition-all" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Mật Khẩu Khởi Tạo *</Label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 pl-10 pr-4 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold shadow-sm transition-all" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Shield className="w-4 h-4" />
                Phân Quyền Hệ Thống
              </div>

              <div className="bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-900">Quản lý nội dung</p>
                  <p className="text-[11px] text-amber-700 font-bold opacity-70 uppercase tracking-tighter mt-0.5">Content Manager Role</p>
                </div>
                <div className="bg-amber-100 text-amber-700 p-2 rounded-xl shadow-inner">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </section>
          </form>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <Button variant="outline" onClick={() => setOpenAdd(false)} className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 active:scale-95 transition-all">
              Hủy Bỏ
            </Button>
            <Button type="submit" form="form-add-user" disabled={isLoading} className="h-12 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 font-black active:scale-95 transition-all">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tạo Tài Khoản'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
