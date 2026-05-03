'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Loader2, UserMinus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '../../dialogs/ActionConfirmDialog'
import { IClassStudent } from '../../../type'
import { removeStudentFromClass } from '../../../services/api'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'

interface StudentActionsCellProps {
  student: IClassStudent
}

export function StudentActionsCell({ student }: StudentActionsCellProps) {
  const params = useParams()
  const classId = params?._id as string
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter()

  const handleRemoveFromClass = async () => {
    setIsLoading(true)
    await removeStudentFromClass(classId, student.user._id)
      .then(() => {
        toast.success('Xóa học viên khỏi lớp thành công')
        router.refresh()
      })
      .finally(() => {
        setIsLoading(false)
        setOpenDelete(false)
      })
  }

  return (
    <>
      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa học viên"
        description={`Bạn có chắc chắn muốn xóa học viên "${student.user.fullName}" khỏi lớp học này?`}
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

          <DropdownMenuItem className="rounded-xl text-red-600 cursor-pointer" onClick={() => setOpenDelete(true)}>
            <UserMinus className="w-4 h-4 mr-2" /> Xóa khỏi lớp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
