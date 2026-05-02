'use client'

import React from 'react'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { GraduationCap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { SheetAddClass } from '../dialogs/SheetAddClass'

interface ClassesHeaderProps {
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  callback?: () => void
}

export function ClassesHeader({ isAddModalOpen, setIsAddModalOpen, callback }: ClassesHeaderProps) {
  return (
    <AdminPageHeader
      title="Quản lý Lớp học"
      subtitle="Quản lý danh sách lớp học, học viên và tài liệu nội bộ của trung tâm ActiveLearning."
      icon={GraduationCap}
      tone="indigo"
      actions={
        <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <SheetTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-2xl">
              <Plus className="w-4 h-4 mr-2" />
              Tạo lớp học mới
            </Button>
          </SheetTrigger>
          <SheetAddClass onClose={() => setIsAddModalOpen(false)} callback={callback} />
        </Sheet>
      }
    />
  )
}
