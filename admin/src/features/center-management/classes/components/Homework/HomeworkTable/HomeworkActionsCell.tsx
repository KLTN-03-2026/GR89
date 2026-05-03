'use client'

import React, { useState } from 'react'
import { Eye, Trash2, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '../../dialogs/ActionConfirmDialog'
import { IHomework } from '../../../type'
import { toast } from 'react-toastify'
import { useParams } from 'next/navigation'
import { Sheet } from '@/components/ui/sheet'
import { SheetUpdateHomework } from '../../dialogs/SheetUpdateHomework'
import { deleteHomeworkForClass } from '../../../services/api'

interface HomeworkActionsCellProps {
  homework: IHomework
  onViewSubmissions: (homework: IHomework) => void
  callback: () => void
}

export function HomeworkActionsCell({ homework, onViewSubmissions, callback }: HomeworkActionsCellProps) {
  const params = useParams()
  const classId = params?._id as string
  const [isDeleting, setIsDeleting] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!classId) return
    setIsDeleting(true)
    try {
      const res = await deleteHomeworkForClass(classId, homework._id)
      if (res.success) toast.success('Xóa bài tập thành công')
      callback()
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setIsDeleting(false)
      setOpenDelete(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa bài tập"
        description={`Bạn có chắc chắn muốn xóa bài tập "${homework.title}"?`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      <Sheet open={openUpdate} onOpenChange={setOpenUpdate}>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-gray-100 text-gray-700 hover:bg-gray-50 h-9 px-4 font-bold text-xs shadow-sm"
          onClick={() => setOpenUpdate(true)}
          disabled={isDeleting}
        >
          <Pencil className="w-4 h-4 mr-2" /> Sửa
        </Button>
        <SheetUpdateHomework
          open={openUpdate}
          onOpenChange={setOpenUpdate}
          homework={homework}
          callback={callback}
        />
      </Sheet>

      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-9 px-4 font-bold text-xs shadow-sm"
        onClick={() => onViewSubmissions(homework)}
        disabled={isDeleting}
      >
        <Eye className="w-4 h-4 mr-2" /> Xem bài nộp
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 h-9 px-4 font-bold text-xs shadow-sm"
        onClick={() => setOpenDelete(true)}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
        Xóa
      </Button>
    </div>
  )
}
