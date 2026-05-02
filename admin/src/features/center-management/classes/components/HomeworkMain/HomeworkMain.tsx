'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { DataTable } from '@/components/common'
import { BookOpenCheck, ArrowLeft, Plus, FileCheck, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { columnsHomeworkList } from '../HomeworkTable/HomeworkListColumn'
import { HomeworkSubmissionsSheet } from './HomeworkSubmissionsSheet'
import { SheetAssignHomework } from '../dialogs/SheetAssignHomework'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { MOCK_CENTER_CLASSES } from '@/features/center-management/mockData'

export function HomeworkMain() {
  const params = useParams()
  const router = useRouter()
  const classId = params?._id as string

  const [refresh, setRefresh] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const classData = useMemo(() => {
    return MOCK_CENTER_CLASSES.find(c => c.id === classId)
  }, [classId])

  // Mock homework list for this class
  const homeworkList = useMemo(() => {
    // In reality, this would be a separate mock or API call
    return [
      { id: 'h1', title: 'Writing Task 1 - Line Graph', startDate: '10/05/2024 08:00', dueDate: '15/05/2024 23:59', submissionCount: 12 },
      { id: 'h2', title: 'Vocabulary Exercise Unit 4', startDate: '12/05/2024 09:30', dueDate: '18/05/2024 18:00', submissionCount: 8 },
      { id: 'h3', title: 'Reading Comprehension - Tech', startDate: '14/05/2024 07:00', dueDate: '20/05/2024 23:59', submissionCount: 5 },
    ]
  }, [])

  const stats = useMemo(() => {
    return [
      { title: 'Tổng bài giao', value: String(homeworkList.length), icon: FileCheck, color: 'from-blue-500 to-indigo-600' },
      { title: 'Chờ chấm', value: '14', icon: Clock, color: 'from-amber-500 to-orange-600' },
      { title: 'Hoàn thành', value: '25', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    ]
  }, [homeworkList])

  const handleBack = () => {
    router.push('/center-management/classes')
  }

  const handleViewSubmissions = (homework: any) => {
    setSelectedHomework(homework)
    setIsSheetOpen(true)
  }

  if (!classData) {
    return (
      <AdminPageShell>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Không tìm thấy lớp học</h2>
          <Button onClick={handleBack} variant="link" className="mt-4 text-indigo-600">Quay lại danh sách</Button>
        </div>
      </AdminPageShell>
    )
  }

  const columns = columnsHomeworkList(handleViewSubmissions)

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Bài tập: ${classData.name}`}
        subtitle={`Giao bài và chấm điểm bài tập về nhà cho lớp ${classData.name}`}
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
              <SheetAssignHomework onClose={() => setIsAssignModalOpen(false)} callback={() => setRefresh(!refresh)} />
            </Sheet>
          </div>
        }
      />

      <div className="space-y-8">
        <StatsGrid stats={stats} columns={3} />

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-6">
          <DataTable
            columns={columns}
            data={homeworkList}
            isLoading={false}
            columnNameSearch="title"
          />
        </div>
      </div>

      <HomeworkSubmissionsSheet
        homework={selectedHomework}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </AdminPageShell>
  )
}
