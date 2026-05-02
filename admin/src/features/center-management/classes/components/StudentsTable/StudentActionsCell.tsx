'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Loader2, UserMinus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '../dialogs/ActionConfirmDialog'
import { IStudent } from '@/features/center-management/types'

interface StudentActionsCellProps {
  student: IStudent
  callback: () => void
}

export function StudentActionsCell({ student, callback }: StudentActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleRemoveFromClass = () => {
    setIsLoading(true)
    // Mock API call
    setTimeout(() => {
      console.log('Remove student from class:', student.id)
      setIsLoading(false)
      setOpenDelete(false)
      callback()
    }, 500)
  }

  return (
    <>
      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa học viên"
        description={`Bạn có chắc chắn muốn xóa học viên "${student.name}" khỏi lớp học này?`}
        onConfirm={handleRemoveFromClass}
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

          <DropdownMenuItem className="rounded-xl cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa thông tin
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-50" />

          <DropdownMenuItem className="rounded-xl text-red-600 cursor-pointer" onClick={() => setOpenDelete(true)}>
            <UserMinus className="w-4 h-4 mr-2" /> Xóa khỏi lớp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
