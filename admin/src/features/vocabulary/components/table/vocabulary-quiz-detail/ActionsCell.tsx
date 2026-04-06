import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Quiz } from '@/types'
import { deleteVocabularyQuiz } from '@/features/vocabulary/services/api'
import { DialogUpdateVocabularyQuiz } from '@/features/vocabulary/components/dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  topicId: string
  quiz: Quiz
  callback: () => void
}

export default function ActionsCell({ topicId, quiz, callback }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    await deleteVocabularyQuiz(topicId, quiz._id)
      .then(() => {
        toast.success('Đã xóa câu hỏi')
        callback()
        setOpenDelete(false)
      }).finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <>
      <DialogUpdateVocabularyQuiz quiz={quiz} isOpen={openEdit} setIsOpen={setOpenEdit} onSuccess={callback} />

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onOpenChange={(open) => {
        setOpenDelete(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa câu hỏi</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi này không?
              Hành động này không thể hoàn tác.
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpenEdit(true) }}>
            <Pencil className="h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => {
            setOpenDelete(true)
          }}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}


