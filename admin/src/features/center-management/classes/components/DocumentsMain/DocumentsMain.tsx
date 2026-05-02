'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { DataTable } from '@/components/common'
import { FileText, ArrowLeft, Plus, FileUp, FileCheck, FileArchive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { columnsDocuments } from '../DocumentsTable/DocumentsColumn'
import { DialogAddDocument } from '../dialogs/DialogAddDocument'
import { MOCK_CENTER_CLASSES } from '@/features/center-management/mockData'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { ColumnDef } from '@tanstack/react-table'

export function DocumentsMain() {
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
    const total = classData.documents.length
    const pdfs = classData.documents.filter(d => d.type === 'pdf').length
    const docs = classData.documents.filter(d => d.type === 'doc').length
    return [
      { title: 'Tổng tài liệu', value: String(total), icon: FileText, color: 'from-blue-500 to-indigo-600' },
      { title: 'Tài liệu PDF', value: String(pdfs), icon: FileArchive, color: 'from-emerald-500 to-teal-600' },
      { title: 'Tài liệu Word', value: String(docs), icon: FileCheck, color: 'from-orange-500 to-red-600' },
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

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Tài liệu: ${classData.name}`}
        subtitle={`Quản lý kho tài liệu nội bộ dành riêng cho lớp ${classData.name}`}
        icon={FileText}
        tone="emerald"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-100">
                  <Plus className="w-4 h-4 mr-2" /> Thêm tài liệu
                </Button>
              </DialogTrigger>
              <DialogAddDocument onClose={() => setIsAddModalOpen(false)} callback={() => setRefresh(!refresh)} />
            </Dialog>
          </div>
        }
      />

      <div className="space-y-8">
        <StatsGrid stats={stats} columns={3} />

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-6">
          <DataTable
            columns={columnsDocuments(() => setRefresh(!refresh)) as ColumnDef<{ _id: string }, unknown>[]}
            data={classData.documents.map(d => ({ _id: d.id, ...d }))}
            isLoading={false}
            columnNameSearch="name"
          />
        </div>
      </div>
    </AdminPageShell>
  )
}
