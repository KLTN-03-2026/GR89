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
        <DialogContent className="rounded-4xl border-none shadow-2xl">
          <DialogHeader className="pt-8 px-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Bạn có chắc chắn muốn xóa câu hỏi{' '}
              <span className="text-rose-600 font-bold">`&quot;`{quiz.question}`&quot;`</span>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-4xl">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setOpenEdit(true)
            }}
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              setOpenDelete(true)
            }}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

