'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { Users, ArrowLeft, UserPlus, UserCheck, UserMinus, Badge, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from "@/components/ui/sheet"

import { ICenterClass } from '../../../type'
import { SheetAddStudent } from '../../dialogs/SheetAddStudent'
import { StatsGrid } from '@/components/common/shared/StatsGrid'

interface StudentsMainProps {
  initialData: ICenterClass | null
  classId: string
}

export function StudentsMain({ initialData, classId }: StudentsMainProps) {
  const router = useRouter()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const classData = initialData

  const stats = useMemo(() => {
    const maxSize = 40
    const total = classData?.students?.length || 0
    const remaining = Math.max(0, maxSize - total)
    return [
      { title: 'Tổng học viên', value: String(total), icon: Users, color: 'from-blue-500 to-indigo-600' },
      { title: 'Sĩ số tối đa', value: String(maxSize), icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
      { title: 'Còn trống', value: String(remaining), icon: UserMinus, color: 'from-orange-500 to-red-600' },
    ]
  }, [classData])

  const handleBack = () => {
    router.push('/center-management/classes')
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={classData ? `Học viên: ${classData.name}` : 'Quản lý học viên'}
        subtitle={classData ? `Quản lý danh sách học viên trực tiếp của lớp ${classData.name}` : 'Chưa lấy được thông tin lớp học. Bạn vẫn có thể thêm học viên nếu mã lớp chính xác.'}
        icon={Users}
        tone="indigo"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="rounded-2xl border-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <SheetTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100">
                  <UserPlus className="w-4 h-4 mr-2" /> Thêm học viên
                </Button>
              </SheetTrigger>
              <SheetAddStudent classId={classId} onClose={() => setIsAddModalOpen(false)} />
            </Sheet>
          </div>
        }
      />

      <div className="space-y-8 relative">
        {classData && <StatsGrid stats={stats} columns={3} />}

        {!classData ? (
          <div className="p-20 text-center space-y-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Users className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Chưa có thông tin lớp học</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Chưa lấy được dữ liệu lớp học. Bạn vẫn có thể thêm học viên nếu mã lớp chính xác.</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleBack} variant="outline" className="rounded-2xl px-10 h-12 font-bold border-gray-200 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-12 font-bold shadow-lg shadow-indigo-100"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Thêm học viên ngay
              </Button>
            </div>
          </div>
        ) : (classData.students || []).length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-10 h-10 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Chưa có học viên nào</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Lớp học hiện tại đang trống. Hãy thêm học viên vào danh sách ngay.</p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-14 font-bold shadow-lg shadow-indigo-100"
            >
              <UserPlus className="w-5 h-5 mr-2" /> Thêm học viên ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(classData.students || []).map((student) => (
              <div key={student.user._id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner">
                  {student.user.fullName.charAt(0)}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-gray-900 text-lg line-clamp-1">{student.user.fullName}</h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1">{student.user.email}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{student.user.phoneNumber || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge className="rounded-full border-gray-100 text-gray-400 font-bold text-[10px] px-3 py-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(student.joinDate).toLocaleDateString('vi-VN')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}
