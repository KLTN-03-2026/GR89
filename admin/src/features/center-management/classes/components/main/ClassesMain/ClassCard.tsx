'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreVertical,
  Users,
  FileText,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  BookOpenCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { ICenterClass } from '../../../type'
import { SheetUpdateClass } from '../../dialogs/SheetUpdateClass'
import { ActionConfirmDialog } from '../../dialogs/ActionConfirmDialog'
import { deleteCenterClass, updateCenterClassActive } from '../../../services/api'
import { toast } from 'react-toastify'

interface ClassCardProps {
  classData: ICenterClass
}

export function ClassCard({ classData }: ClassCardProps) {
  const router = useRouter()
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openToggleActive, setOpenToggleActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const categoryLabels = {
    kids: { label: 'Kids Academy', color: 'bg-amber-100 text-amber-700' },
    teenager: { label: 'IELTS Fighter', color: 'bg-blue-100 text-blue-700' },
    adult: { label: 'Professional', color: 'bg-red-100 text-red-700' },
  }

  const handleManageStudents = () => {
    router.push(`/center-management/classes/students/${classData._id}`)
  }

  const handleManageDocuments = () => {
    router.push(`/center-management/classes/documents/${classData._id}`)
  }

  const handleManageHomework = () => {
    router.push(`/center-management/classes/homework/${classData._id}`)
  }

  const handleToggleActiveConfirm = async () => {
    setIsLoading(true)
    await updateCenterClassActive(classData._id, !classData.isActive)
      .then(() => {
        toast.success(`${classData.isActive ? 'Khóa' : 'Kích hoạt'} lớp học thành công`)
        router.refresh()
      })
      .finally(() => {
        setIsLoading(false)
        setOpenToggleActive(false)
      })
  }

  const handleDeleteConfirm = async () => {
    setIsLoading(true)
    await deleteCenterClass(classData._id)
      .then(() => {
        toast.success('Xóa lớp học thành công')
        router.refresh()
      })
    .finally(() => {
      setIsLoading(false)
      setOpenDelete(false)
    })
  }

  return (
    <>
      <Sheet open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <SheetUpdateClass
          classData={classData}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      </Sheet>

      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa lớp học"
        description={`Bạn có chắc chắn muốn xóa lớp học "${classData.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />

      <ActionConfirmDialog
        open={openToggleActive}
        onOpenChange={setOpenToggleActive}
        title={classData.isActive ? "Xác nhận ẩn lớp học" : "Xác nhận hiện lớp học"}
        description={classData.isActive
          ? `Lớp học "${classData.name}" sẽ không còn hiển thị với học viên.`
          : `Lớp học "${classData.name}" sẽ hiển thị trở lại với học viên.`}
        onConfirm={handleToggleActiveConfirm}
        variant={classData.isActive ? 'destructive' : 'default'}
        isLoading={isLoading}
      />

      <div className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative overflow-hidden">
        {!classData.isActive && (
          <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
            <Badge variant="outline" className="bg-white/80 border-gray-200 text-gray-400 font-bold px-4 py-2 rounded-full">
              <EyeOff className="w-4 h-4 mr-2" /> Đang ẩn
            </Badge>
          </div>
        )}

        <div className="absolute top-0 right-0 p-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
              <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={handleManageStudents}>
                <Users className="w-4 h-4 mr-2" /> Quản lý học viên
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={handleManageDocuments}>
                <FileText className="w-4 h-4 mr-2" /> Quản lý tài liệu
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={handleManageHomework}>
                <BookOpenCheck className="w-4 h-4 mr-2" /> Quản lý bài tập
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-50" />

              <Sheet open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <SheetTrigger asChild>
                  <DropdownMenuItem className="rounded-xl cursor-pointer" onSelect={(e) => e.preventDefault()}>
                    <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa lớp
                  </DropdownMenuItem>
                </SheetTrigger>
              </Sheet>

              <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setOpenToggleActive(true)}>
                {classData.isActive ? (
                  <><EyeOff className="w-4 h-4 mr-2" /> Ẩn lớp học</>
                ) : (
                  <><Eye className="w-4 h-4 mr-2" /> Hiện lớp học</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl text-red-600 cursor-pointer" onClick={() => setOpenDelete(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Xóa lớp học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <Badge className={`${categoryLabels[classData.category].color} border-none font-bold px-3 py-1 rounded-full`}>
              {categoryLabels[classData.category].label}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">{classData.name}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">GV: {classData.teacher?.fullName || 'Chưa phân công'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Khai giảng
              </p>
              <p className="text-sm font-bold text-gray-700">
                {new Date(classData.startDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Lịch học
              </p>
              <p className="text-sm font-bold text-gray-700 truncate">{classData.schedule}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-700">{classData.students?.length || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-700">{classData.documents?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
