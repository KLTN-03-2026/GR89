'use client'

import React from 'react'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SheetAddStudentProps {
  onClose: () => void
  callback?: () => void
}

export function SheetAddStudent({ onClose, callback }: SheetAddStudentProps) {
  const handleSave = () => {
    console.log('Adding new student...')
    if (callback) callback()
    onClose()
  }

  return (
    <SheetContent className="sm:max-w-[450px] w-full p-0 flex flex-col h-full border-none shadow-2xl">
      <SheetHeader className="p-8 pb-6 bg-indigo-50/30 border-b border-indigo-100/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <SheetTitle className="text-2xl font-black text-gray-900">Thêm học viên</SheetTitle>
            <SheetDescription className="font-bold text-indigo-600/70 uppercase tracking-widest text-[10px]">
              Mời học viên tham gia lớp học qua Email
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 w-full overflow-auto">
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email học viên</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="student@example.com"
                className="h-12 pl-11 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium px-1 italic">
              * Học viên sẽ nhận được thông báo mời vào lớp sau khi bạn xác nhận.
            </p>
          </div>

          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
            <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
              Lưu ý: Chỉ những email đã đăng ký tài khoản trên hệ thống mới có thể được thêm trực tiếp vào lớp học.
            </p>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={onClose}>Hủy</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-100" onClick={handleSave}>Thêm vào lớp</Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
