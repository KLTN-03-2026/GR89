'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { DataTable } from '@/components/common'
import { FileText, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ICenterClass } from '../../../type'

import { columnsDocuments } from '../DocumentsTable/DocumentsColumn'
import { DialogAddDocument } from '../../dialogs/DialogAddDocument'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { ColumnDef } from '@tanstack/react-table'
import { IGlobalDocument } from '@/features/center-management/documents/type'

interface DocumentsMainProps {
  initialData: ICenterClass | null
}

export function DocumentsMain({ initialData }: DocumentsMainProps) {
  const router = useRouter()
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const classData = initialData

  const stats = useMemo(() => {
    const total = classData?.documents?.length || 0
    return [
      { title: 'Tổng tài liệu', value: String(total), icon: FileText, color: 'from-blue-500 to-indigo-600' },
    ]
  }, [classData])

  const handleBack = () => {
    router.push('/center-management/classes')
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={classData ? `Tài liệu: ${classData.name}` : 'Quản lý tài liệu'}
        subtitle={classData ? `Quản lý kho tài liệu nội bộ dành riêng cho lớp ${classData.name}` : 'Chưa lấy được thông tin lớp học. Bạn vẫn có thể thêm tài liệu nếu mã lớp chính xác.'}
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
              <DialogAddDocument open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            </Dialog>
          </div>
        }
      />

      <div className="space-y-8 relative">
        {classData && <StatsGrid stats={stats} columns={1} />}

        {!classData ? (
          <div className="p-20 text-center space-y-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Chưa có thông tin lớp học</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Chưa lấy được dữ liệu lớp học. Bạn vẫn có thể thêm tài liệu nếu mã lớp chính xác.</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleBack} variant="outline" className="rounded-2xl px-10 h-12 font-bold border-gray-200 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-10 h-12 font-bold shadow-lg shadow-emerald-100"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm tài liệu ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-6">
            {(classData.documents || []).length > 0 ? (
              <DataTable
                columns={columnsDocuments(() => router.refresh()) as ColumnDef<IGlobalDocument, unknown>[]}
                data={classData.documents || []}
                isLoading={false}
                columnNameSearch="name"
              />
            ) : (
              <div className="py-20 text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Chưa có tài liệu nào</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Hãy bắt đầu bằng cách đính kèm tài liệu học tập cho lớp học này.</p>
                </div>
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-10 h-14 font-bold shadow-lg shadow-emerald-100"
                >
                  <Plus className="w-5 h-5 mr-2" /> Thêm tài liệu ngay
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}
