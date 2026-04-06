'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteRoadmapTopic } from "@/features/roadmap/services/api";
import { useState } from "react";
import { RoadmapTopic } from "@/features/roadmap/types";
import { useRouter } from "next/navigation";

interface AlertDialogConfirmDeleteProps {
  topic: RoadmapTopic
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
}

export default function AlertDialogConfirmDelete({ isDeleteDialogOpen, setIsDeleteDialogOpen, topic }: AlertDialogConfirmDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteRoadmapTopic(topic._id)
      .then(() => {
        router.refresh()
        setIsDeleteDialogOpen(false)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription >
            Bạn có chắc chắn muốn xóa chủ đề &quot;{topic.title}&quot;? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
