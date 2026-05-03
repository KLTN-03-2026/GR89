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
import { Eye, EyeOff, Info, Loader2, MoreHorizontal, Pencil, Trash2, Crown, BookOpen } from 'lucide-react'
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa chủ đề</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa chủ đề ngữ pháp <strong>"{topic.title}"</strong>?
              Hành động này sẽ xóa tất cả bài học trong chủ đề và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Xóa
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
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpen(true) }} disabled={isLoading}>
              <Pencil className="mr-2 h-4 w-4" />
              Sửa chủ đề
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/content/grammar/lesson/${topic._id}`)} disabled={isLoading}>
              <BookOpen className="mr-2 h-4 w-4" />
              Quản lý bài học
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUpdateIsActive} disabled={isLoading}>
              {topic.isActive ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Ẩn chủ đề
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Xuất bản
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleVip} disabled={isLoading}>
              <Crown className="mr-2 h-4 w-4" />
              {topic.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onSelect={(e) => { e.preventDefault(); setOpenDelete(true) }} disabled={isLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa chủ đề
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

