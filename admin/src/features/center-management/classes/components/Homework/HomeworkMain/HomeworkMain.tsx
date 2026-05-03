'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { DataTable } from '@/components/common'
import { BookOpenCheck, ArrowLeft, Plus, FileCheck, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { HomeworkSubmissionsSheet } from './HomeworkSubmissionsSheet'
import { SheetAssignHomework } from '../../dialogs/SheetAssignHomework'
import { columnsHomeworkList } from '../HomeworkTable/HomeworkListColumn'
import { ICenterClass, IHomework } from '../../../type'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { ColumnDef } from '@tanstack/react-table'

interface HomeworkMainProps {
  initialData: ICenterClass | null
}

export function HomeworkMain({ initialData }: HomeworkMainProps) {
  const router = useRouter()

  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const classData = initialData

  // Lấy danh sách bài tập từ classData
  const homeworkList = useMemo(() => {
    return classData?.homeworks || []
  }, [classData])

  const stats = useMemo(() => {
    const total = homeworkList.length
    // Chờ chấm: số lượng submission có status pending trong tất cả homeworks
    const pending = homeworkList.reduce((acc, hw) => {
      return acc + (hw.submissions?.filter(s => s.status === 'pending').length || 0)
    }, 0)
    // Hoàn thành: số lượng submission có status graded
    const graded = homeworkList.reduce((acc, hw) => {
      return acc + (hw.submissions?.filter(s => s.status === 'graded').length || 0)
    }, 0)
    
    return [
      { title: 'Tổng bài giao', value: String(total), icon: FileCheck, color: 'from-blue-500 to-indigo-600' },
      { title: 'Chờ chấm', value: String(pending), icon: Clock, color: 'from-amber-500 to-orange-600' },
      { title: 'Hoàn thành', value: String(graded), icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    ]
  }, [homeworkList])

  const handleBack = () => {
    router.push('/center-management/classes')
  }

  const handleViewSubmissions = (homework: IHomework) => {
    setSelectedHomeworkId(homework._id)
    setIsSheetOpen(true)
  }

  const selectedHomework = useMemo(() => {
    if (!selectedHomeworkId) return null
    return (classData?.homeworks || []).find(h => h._id === selectedHomeworkId) || null
  }, [classData, selectedHomeworkId])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={classData ? `Bài tập: ${classData.name}` : 'Quản lý bài tập'}
        subtitle={classData ? `Giao bài và chấm điểm bài tập về nhà cho lớp ${classData.name}` : 'Chưa lấy được thông tin lớp học. Bạn vẫn có thể giao bài nếu mã lớp chính xác.'}
        icon={BookOpenCheck}
        tone="indigo"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="rounded-2xl border-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <Sheet open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
              <SheetTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100">
                  <Plus className="w-4 h-4 mr-2" /> Giao bài tập
                </Button>
              </SheetTrigger>
              <SheetAssignHomework onClose={() => setIsAssignModalOpen(false)} callback={() => router.refresh()} />
            </Sheet>
          </div>
        }
      />

      <div className="space-y-8 relative">
        {classData && <StatsGrid stats={stats} columns={3} />}

        {!classData ? (
          <div className="p-20 text-center space-y-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <BookOpenCheck className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Chưa có thông tin lớp học</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Chưa lấy được dữ liệu lớp học. Bạn vẫn có thể giao bài nếu mã lớp chính xác.</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleBack} variant="outline" className="rounded-2xl px-10 h-12 font-bold border-gray-200 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-12 font-bold shadow-lg shadow-indigo-100"
              >
                <Plus className="w-4 h-4 mr-2" /> Giao bài tập ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-6">
            {homeworkList.length > 0 ? (
              <DataTable
                columns={columnsHomeworkList(handleViewSubmissions, () => router.refresh()) as ColumnDef<IHomework, unknown>[]}
                data={homeworkList}
                isLoading={false}
                columnNameSearch="title"
              />
            ) : (
              <div className="py-20 text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpenCheck className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Chưa có bài tập nào</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Hãy bắt đầu bằng cách giao bài tập đầu tiên cho lớp học này.</p>
                </div>
                <Button 
                  onClick={() => setIsAssignModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-14 font-bold shadow-lg shadow-indigo-100"
                >
                  <Plus className="w-5 h-5 mr-2" /> Giao bài tập ngay
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <HomeworkSubmissionsSheet
        homework={selectedHomework}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </AdminPageShell>
  )
}
