'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { Users, ArrowLeft, UserPlus, UserCheck, UserMinus, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { columnsStudents } from '../StudentsTable/StudentsColumn'
import { SheetAddStudent } from '../dialogs/SheetAddStudent'
import { MOCK_CENTER_CLASSES } from '@/features/center-management/mockData'
import { StatsGrid } from '@/components/common/shared/StatsGrid'

export function StudentsMain() {
  const params = useParams()
  const router = useRouter()
  const classId = params?._id as string
  const [refresh, setRefresh] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const classData = useMemo(() => {
    return MOCK_CENTER_CLASSES.find(c => c.id === classId)
  }, [classId])

  const stats = useMemo(() => {
    if (!classData) return []
    const total = classData.students.length
    const active = classData.students.filter(s => s.status === 'active').length
    const inactive = total - active
    return [
      { title: 'Tổng học viên', value: String(total), icon: Users, color: 'from-blue-500 to-indigo-600' },
      { title: 'Đang học', value: String(active), icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
      { title: 'Nghỉ học', value: String(inactive), icon: UserMinus, color: 'from-orange-500 to-red-600' },
    ]
  }, [classData])

  const handleBack = () => {
    router.push('/center-management/classes')
  }

  if (!classData) {
    return (
      <AdminPageShell>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">Không tìm thấy lớp học</h2>
          <Button onClick={handleBack} variant="link">Quay lại danh sách</Button>
        </div>
      </AdminPageShell>
    )
  }

  const columns = columnsStudents(() => setRefresh(!refresh))

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Học viên: ${classData.name}`}
        subtitle={`Quản lý danh sách học viên trực tiếp của lớp ${classData.name}`}
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
              <SheetAddStudent onClose={() => setIsAddModalOpen(false)} callback={() => setRefresh(!refresh)} />
            </Sheet>
          </div>
        }
      />

      <div className="space-y-8">
        <StatsGrid stats={stats} columns={3} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classData.students.map((student) => (
            <div key={student.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner">
                {student.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-gray-900 text-lg line-clamp-1">{student.name}</h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-1">{student.email}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{student.phone}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge className={`rounded-full font-bold text-[10px] px-3 py-1 ${student.status === 'active' ? 'bg-emerald-500 text-emerald-600' : 'bg-orange-500 text-orange-600'}`}>
                  {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                </Badge>
                <Badge className={`rounded-full border-gray-100 text-gray-400 font-bold text-[10px] px-3 py-1 ${student.status === 'active' ? 'bg-emerald-500 text-emerald-600' : 'bg-orange-500 text-orange-600'}`}>
                  {student.joinDate}
                </Badge>
              </div>
            </div>
          ))}

          {classData.students.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Users className="w-10 h-10 text-gray-200" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Trống trải quá...</p>
                <p className="text-gray-400 text-sm">Chưa có học viên nào tham gia lớp học này.</p>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-8"
              >
                Thêm học viên ngay
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}
