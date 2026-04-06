'use client'
import { GrammarTopic } from '@/features/grammar/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Info, Loader2, MoreHorizontal, Pencil, Trash2, Crown } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteGrammarTopic, updateIsActiveGrammarTopic, toggleGrammarTopicVipStatus } from '../../services/api'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import OrderIndexCell from './OrderIndexCell'
import { SheetUpdateGrammarTopic } from '../dialogs'

interface Props {
  topic: GrammarTopic
  allTopics: GrammarTopic[]
  callback: () => void
  onSwap?: (topicId: string, direction: 'up' | 'down') => void
}

export default function ActionsCell({ topic, allTopics, callback, onSwap }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteGrammarTopic(topic._id)
      .then(() => {
        toast.success('Xóa chủ đề thành công')
        callback()
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleUpdateIsActive = async () => {
    setIsLoading(true)
    await updateIsActiveGrammarTopic(topic._id)
      .then(() => {
        toast.success('Cập nhật trạng thái thành công')
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    try {
      await toggleGrammarTopicVipStatus(topic._id)
      toast.success(`Đã ${topic.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
      callback()
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cập nhật VIP thất bại'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
      <SheetUpdateGrammarTopic topic={topic} open={isOpen} setOpen={setIsOpen} callback={callback} />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc chắn muốn xóa chủ đề ngữ pháp <span className="text-rose-600 font-bold">"{topic.title}"</span>?
              Hành động này sẽ xóa tất cả bài học trong chủ đề và không thể hoàn tác.
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
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/content/grammar/lesson/${topic._id}`)} disabled={isLoading}>
              <Info className="h-4 w-4 " />
              Chi tiết
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setIsOpen(true)
              }}
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleUpdateIsActive} disabled={isLoading}>
              {!topic.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {!topic.isActive ? 'Xuất bản' : 'Ẩn'}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="h-4 w-4" />
              {topic.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-600" onClick={() => setOpenDelete(true)} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

