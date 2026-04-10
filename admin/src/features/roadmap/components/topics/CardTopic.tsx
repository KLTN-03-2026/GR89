'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, Lock, Unlock, Edit, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SheetUpdateTopic } from "./SheetUpdateTopic";
import AlertDialogConfirmDelete from "./AlertDialogConfirmDelete";
import { useState } from "react";
import { RoadmapTopic } from "@/features/roadmap/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateRoadmapTopicVisibility } from "@/features/roadmap/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CardTopicProps {
  topic: RoadmapTopic,
  index: number,
  isSelected: boolean,
  onSelect: (topicId: string) => void
}

export default function CardTopic({
  topic,
  index,
  isSelected,
  onSelect,
}: CardTopicProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isVisibilityConfirmOpen, setIsVisibilityConfirmOpen] = useState(false)
  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const router = useRouter()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const handleConfirmVisibility = async () => {
    const nextActive = !topic.isActive
    setVisibilityLoading(true)
    try {
      const res = await updateRoadmapTopicVisibility(topic._id, nextActive)
      if (res.success) {
        toast.success(res.message || "Cập nhật trạng thái chủ đề thành công")
        setIsVisibilityConfirmOpen(false)
        router.refresh()
      } else {
        toast.error(res.message || "Cập nhật trạng thái chủ đề thất bại")
      }
    } catch {
      toast.error("Cập nhật trạng thái chủ đề thất bại")
    } finally {
      setIsVisibilityConfirmOpen(false)
      setVisibilityLoading(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "p-4 cursor-pointer relative group rounded-2xl border transition-all duration-300",
          isSelected
            ? "border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-100/50 -translate-y-0.5"
            : "border-gray-100 bg-white hover:border-amber-200 hover:bg-gray-50/30"
        )}
        onClick={() => onSelect(topic._id)}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-gray-100 rounded-lg transition-colors"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Icon emoji */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-300 shadow-sm",
              isSelected
                ? "bg-white border-amber-200 scale-110 rotate-3"
                : "bg-gray-50 border-gray-100 group-hover:bg-white group-hover:scale-105"
            )}>
              {topic.icon || '📚'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isSelected ? "text-amber-600" : "text-gray-400"
              )}>
                Chặng {index}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-amber-100 hover:text-amber-600"
                  onClick={() => setIsVisibilityConfirmOpen(true)}
                  disabled={visibilityLoading}
                >
                  {topic.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-blue-100 hover:text-blue-600"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-rose-100 hover:text-rose-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <h3 className={cn(
              "font-black text-sm line-clamp-1 tracking-tight transition-colors",
              isSelected ? "text-amber-900" : "text-gray-700"
            )}>
              {topic.title}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">
              {(typeof topic.lessonsCount === 'number' ? topic.lessonsCount : (topic.lessons || []).length) || 0} bài học
            </p>
          </div>
        </div>
      </div>

      <SheetUpdateTopic
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        topic={topic}
      />

      <AlertDialogConfirmDelete
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        topic={topic}
      />

      <AlertDialog open={isVisibilityConfirmOpen} onOpenChange={setIsVisibilityConfirmOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader className="pt-8 px-8">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner",
              topic.isActive ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {topic.isActive ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <AlertDialogTitle className="text-xl font-black text-gray-900">
              {topic.isActive ? "Xác nhận ẩn chặng" : "Xác nhận xuất bản chặng"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium pt-2">
              {topic.isActive
                ? `Bạn có chắc chắn muốn ẩn chặng "${topic.title}"? Chặng này sẽ không còn hiển thị với người học trên ứng dụng.`
                : `Bạn có chắc chắn muốn xuất bản chặng "${topic.title}"? Chặng này sẽ bắt đầu hiển thị với người học.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
            <AlertDialogCancel
              disabled={visibilityLoading}
              className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
            >
              Hủy Bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVisibility}
              disabled={visibilityLoading}
              className={cn(
                "h-11 px-6 rounded-xl font-black shadow-lg transition-all",
                topic.isActive
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              )}
            >
              {visibilityLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang Xử Lý...
                </>
              ) : (
                topic.isActive ? "Xác Nhận Ẩn" : "Xác Nhận Xuất Bản"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
