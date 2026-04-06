'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { RoadmapLesson } from '../../types'
import { deleteLesson } from '../../services/api'

interface AlertDialogConfirmDeleteLessonProps {
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  roadmapId: string
  lesson: RoadmapLesson
  onLessonsChange?: () => void
}

export default function AlertDialogConfirmDeleteLesson({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  roadmapId,
  lesson,
  onLessonsChange
}: AlertDialogConfirmDeleteLessonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteLesson(roadmapId, lesson._id)
      .then(() => {
        toast.success('Bài học đã được xóa thành công')
        setIsDeleteDialogOpen(false)
        onLessonsChange?.()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa bài học</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa bài học <strong>&quot;{lesson.title}&quot;</strong> không?
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

