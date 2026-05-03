'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Pencil, Eye, EyeOff, Trash2, Loader2, Users, FileText, BookOpenCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '../../dialogs/ActionConfirmDialog'
import { SheetUpdateClass } from '../../dialogs/SheetUpdateClass'
import { Sheet } from '@/components/ui/sheet'
import { ICenterClass } from '../../../type'
import { deleteCenterClass, updateCenterClassActive } from '../../../services/api'
import { toast } from 'react-toastify'

interface ClassActionsCellProps {
  classData: ICenterClass
}

export function ClassActionsCell({ classData }: ClassActionsCellProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openToggleActive, setOpenToggleActive] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const handleToggleActiveConfirm = async () => {
    setIsLoading(true)
    try {
      const response = await updateCenterClassActive(classData._id, !classData.isActive)
      if (response.success) {
        toast.success(`${classData.isActive ? 'Khóa' : 'Kích hoạt'} lớp học thành công`)
        router.refresh()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
      }
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setIsLoading(false)
      setOpenToggleActive(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setIsLoading(true)
    try {
      const response = await deleteCenterClass(classData._id)
      if (response.success) {
        toast.success('Xóa lớp học thành công')
        router.refresh()
      } else {
        toast.error(response.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
      }
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setIsLoading(false)
      setOpenDelete(false)
    }
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
          <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Hành động</DropdownMenuLabel>

          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => router.push(`/center-management/classes/students/${classData._id}`)}>
            <Users className="w-4 h-4 mr-2" /> Quản lý học viên
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => router.push(`/center-management/classes/documents/${classData._id}`)}>
            <FileText className="w-4 h-4 mr-2" /> Quản lý tài liệu
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => router.push(`/center-management/classes/homework/${classData._id}`)}>
            <BookOpenCheck className="w-4 h-4 mr-2" /> Quản lý bài tập
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-50" />

          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setIsUpdateModalOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
          </DropdownMenuItem>

          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setOpenToggleActive(true)}>
            {classData.isActive ? (
              <><EyeOff className="w-4 h-4 mr-2" /> Ẩn lớp học</>
            ) : (
              <><Eye className="w-4 h-4 mr-2" /> Hiện lớp học</>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-50" />

          <DropdownMenuItem className="rounded-xl text-red-600 cursor-pointer" onClick={() => setOpenDelete(true)}>
            <Trash2 className="w-4 h-4 mr-2" /> Xóa lớp học
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
