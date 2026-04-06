
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Info, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from 'react'
import { deleteVocabularyTopic, updateIsActiveVocabularyTopic, toggleVocabularyTopicVipStatus } from '@/features/vocabulary/services/api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { SheetUpdateVocabularyTopic } from '@/features/vocabulary/components/dialog/SheetUpdateVocabularyTopic'
import OrderIndexCell from './OrderIndexCell'
import { VocabularyTopic } from '@/features/vocabulary/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface props {
  topic: VocabularyTopic
  allTopics: VocabularyTopic[]
  callback: () => void
  onSwap?: (topicId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ topic, allTopics, callback, onSwap }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter()
  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteVocabularyTopic(topic._id)
      toast.success('Xóa chủ đề từ vựng thành công')
      callback()
      setOpenDelete(false)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateIsAciveTopicVocabulary = async () => {
    setIsLoading(true)
    try {
      await updateIsActiveVocabularyTopic(topic._id)
      toast.success('Cập nhật trạng thái xuất bản thành công')
      callback()
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleVocabularyTopicVipStatus(topic._id)
      toast.success(`Đã ${topic.isVipRequired ? 'tắt' : 'bật'} VIP cho chủ đề từ vựng này`)
      callback()
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Sheet open={openEdit} onOpenChange={setOpenEdit}>
        <SheetUpdateVocabularyTopic callback={callback} topic={topic} />
      </Sheet>

      {/* Dialog xác nhận xóa vẫn giữ là Dialog vì nó là cảnh báo ngắn */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa chủ đề</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc chắn muốn xóa chủ đề <span className="text-rose-600 font-bold">"{topic.name}"</span>?
              Hành động này sẽ xóa tất cả dữ liệu liên quan và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
            <Button 
              variant="outline" 
              onClick={() => setOpenDelete(false)} 
              disabled={isLoading}
              className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
            >
              Hủy Bỏ
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 font-black"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <OrderIndexCell topic={topic} allTopics={allTopics} callback={callback} onSwap={onSwap} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/content/vocabulary/${topic._id}`)}>
              <Info className="h-4 w-4 " />
              Danh sách từ vựng
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push(`/content/vocabulary/quiz/${topic._id}`)}>
              <Info className="h-4 w-4 " />
              Quản lý quiz
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setOpenEdit(true) }}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleUpdateIsAciveTopicVocabulary}
              disabled={isLoading}
            >
              {!topic.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {!topic.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Info className="h-4 w-4" />
              {topic.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-600" onClick={() => setOpenDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
