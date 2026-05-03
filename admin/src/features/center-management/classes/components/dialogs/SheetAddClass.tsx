'use client'

import React, { useState, useEffect } from 'react'
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
import { Lock, Calendar, Clock, GraduationCap, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'react-toastify'
import { createCenterClass } from '../../services/api'
import { getAllUsersPaginated } from '@/features/user/services/api'
import { User } from '@/features/user/types'
import { useRouter } from 'next/navigation'

interface SheetAddClassProps {
  onClose: () => void
}

export function SheetAddClass({ onClose }: SheetAddClassProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<User[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'kids' as 'kids' | 'teenager' | 'adult',
    teacher: '',
    startDate: '',
    password: '',
    schedule: '',
  })

  const [scheduleType, setScheduleType] = useState<'fixed' | 'flexible'>('fixed')
  const [fixedSchedule, setFixedSchedule] = useState({
    days: [] as string[],
    startTime: '18:00',
    endTime: '20:00'
  })

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true)
     await getAllUsersPaginated({ limit: 100, role: 'content' })
      .then(res => {
        setTeachers([...res.data])
      })
      .finally(() => setLoadingTeachers(false))
    }
    fetchTeachers()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.teacher || !formData.startDate) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc')
      return
    }

    let finalSchedule = formData.schedule
    if (scheduleType === 'fixed') {
      if (fixedSchedule.days.length === 0) {
        toast.error('Vui lòng chọn ít nhất một ngày trong tuần')
        return
      }
      const dayLabels: Record<string, string> = {
        mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', 
        fri: 'Thứ 6', sat: 'Thứ 7', sun: 'CN'
      }
      const days = fixedSchedule.days.map(d => dayLabels[d]).join(', ')
      finalSchedule = `${days} (${fixedSchedule.startTime} - ${fixedSchedule.endTime})`
    }

    setLoading(true)
    await createCenterClass({ ...formData, schedule: finalSchedule})
      .then(() => {
        toast.success('Tạo lớp học thành công')
        router.refresh()
        onClose()
      })
      .finally(() => setLoading(false))
  }

  const toggleDay = (day: string) => {
    setFixedSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }))
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
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên lớp học *</Label>
              <Input 
                placeholder="Ví dụ: IELTS Fighter 05" 
                className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Danh mục *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v: 'kids' | 'teenager' | 'adult') => setFormData(prev => ({ ...prev, category: v }))}
                >
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
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Giảng viên *</Label>
                <Select 
                  value={formData.teacher} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, teacher: v }))}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                    <SelectValue placeholder={loadingTeachers ? "Đang tải..." : "Chọn giáo viên"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100">
                    {teachers.map(t => (
                      <SelectItem key={t._id} value={t._id} className="rounded-xl font-bold">
                        {t.fullName} ({t.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Ngày khai giảng *
                </Label>
                <Input 
                  type="date" 
                  className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" 
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Mật khẩu lớp
                </Label>
                <Input 
                  type="password" 
                  placeholder="Mật khẩu (nếu có)" 
                  className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <Label className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-4 block">Cấu hình lịch học</Label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                <Button
                  size="sm"
                  type="button"
                  className={`rounded-xl text-xs font-bold h-10 ${scheduleType === 'fixed' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                  onClick={() => setScheduleType('fixed')}
                >
                  Cố định hàng tuần
                </Button>
                <Button
                  size="sm"
                  type="button"
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
                        <Checkbox 
                          id={day.value} 
                          className="rounded-md border-gray-300" 
                          checked={fixedSchedule.days.includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                        <label htmlFor={day.value} className="text-xs font-black text-gray-600 cursor-pointer select-none">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Giờ bắt đầu
                      </Label>
                      <Input 
                        type="time" 
                        className="h-11 rounded-xl border-white bg-white shadow-sm font-bold" 
                        value={fixedSchedule.startTime}
                        onChange={(e) => setFixedSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Giờ kết thúc
                      </Label>
                      <Input 
                        type="time" 
                        className="h-11 rounded-xl border-white bg-white shadow-sm font-bold" 
                        value={fixedSchedule.endTime}
                        onChange={(e) => setFixedSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'flexible' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ghi chú lịch học</Label>
                  <Input 
                    placeholder="Ví dụ: Theo thỏa thuận với học viên" 
                    className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold" 
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Lưu lớp học
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
