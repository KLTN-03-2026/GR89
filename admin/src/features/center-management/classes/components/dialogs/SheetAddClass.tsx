'use client'

import React, { useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lock, Calendar, Clock, GraduationCap } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SheetAddClassProps {
  onClose: () => void
  callback?: () => void
}

export function SheetAddClass({ onClose, callback }: SheetAddClassProps) {
  const [scheduleType, setScheduleType] = useState<'fixed' | 'flexible'>('fixed')

  const handleSave = () => {
    console.log('Saving new class...')
    if (callback) callback()
    onClose()
  }

  const daysOfWeek = [
    { label: 'Thứ 2', value: 'mon' },
    { label: 'Thứ 3', value: 'tue' },
    { label: 'Thứ 4', value: 'wed' },
    { label: 'Thứ 5', value: 'thu' },
    { label: 'Thứ 6', value: 'fri' },
    { label: 'Thứ 7', value: 'sat' },
    { label: 'CN', value: 'sun' },
  ]

  return (
    <SheetContent className="sm:max-w-4xl w-full p-0 flex flex-col h-full border-none shadow-2xl">
      <SheetHeader className="p-8 pb-6 bg-indigo-50/30 border-b border-indigo-100/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <SheetTitle className="text-2xl font-black text-gray-900">Tạo lớp học mới</SheetTitle>
            <SheetDescription className="font-bold text-indigo-600/70 uppercase tracking-widest text-[10px]">
              Thiết lập thông tin và lịch học cho lớp mới
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 w-full overflow-auto">
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên lớp học</Label>
              <Input placeholder="Ví dụ: IELTS Fighter 05" className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Danh mục</Label>
                <Select>
                  <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100">
                    <SelectItem value="kids" className="rounded-xl font-bold">Kids Academy</SelectItem>
                    <SelectItem value="teenager" className="rounded-xl font-bold">IELTS Fighter</SelectItem>
                    <SelectItem value="adult" className="rounded-xl font-bold">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Giảng viên</Label>
                <Input placeholder="Tên giáo viên" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Ngày khai giảng
                </Label>
                <Input type="date" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Mật khẩu lớp
                </Label>
                <Input type="password" placeholder="Mật khẩu (nếu có)" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <Label className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-4 block">Cấu hình lịch học</Label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                <Button
                  variant={scheduleType === 'fixed' ? 'white' as any : 'ghost'}
                  size="sm"
                  className={`rounded-xl text-xs font-bold h-10 ${scheduleType === 'fixed' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  onClick={() => setScheduleType('fixed')}
                >
                  Cố định hàng tuần
                </Button>
                <Button
                  variant={scheduleType === 'flexible' ? 'white' as any : 'ghost'}
                  size="sm"
                  className={`rounded-xl text-xs font-bold h-10 ${scheduleType === 'flexible' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  onClick={() => setScheduleType('flexible')}
                >
                  Linh hoạt
                </Button>
              </div>

              {scheduleType === 'fixed' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all">
                        <Checkbox id={day.value} className="rounded-md border-gray-300" />
                        <label htmlFor={day.value} className="text-xs font-black text-gray-600 cursor-pointer select-none">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Giờ bắt đầu
                      </Label>
                      <Input type="time" className="h-11 rounded-xl border-white bg-white shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Giờ kết thúc
                      </Label>
                      <Input type="time" className="h-11 rounded-xl border-white bg-white shadow-sm font-bold" />
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'flexible' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú lịch học</Label>
                  <Input placeholder="Ví dụ: Theo thỏa thuận với học viên" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={onClose}>Hủy</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100" onClick={handleSave}>Lưu lớp học</Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
