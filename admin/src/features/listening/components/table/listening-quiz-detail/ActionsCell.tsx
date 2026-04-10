'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { deleteListeningQuizItem, getListeningById } from '@/features/listening/services/api'
import type { Listening } from '@/features/listening/types'
import { SheetListeningQuiz } from '@/features/listening/components/dialog/SheetListeningQuiz'
import type { ListeningQuizRow } from './Columns'

interface Props {
  listeningId: string
  row: ListeningQuizRow
  callback: () => void
}

export default function ActionsCell({ listeningId, row, callback }: Props) {
  const [loading, setLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [listening, setListening] = useState<Listening | null>(null)

  const loadListening = async () => {
    const res = await getListeningById(listeningId)
    const data = res.data
    if (!data) {
      toast.error('Không tải được bài nghe')
      return null
    }
    setListening(data)
    return data
  }

  const handleOpenEdit = async () => {
    const l = await loadListening()
    if (l) setOpenEdit(true)
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteListeningQuizItem(listeningId, row._id)
      toast.success('Đã xóa câu hỏi')
      setOpenDelete(false)
      callback()
    } catch {
      toast.error('Không thể xóa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleOpenEdit()}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setOpenDelete(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {listening && (
        <SheetListeningQuiz
          listening={listening}
          listeningId={listeningId}
          open={openEdit}
          onOpenChange={(o) => {
            setOpenEdit(o)
            if (!o) setListening(null)
          }}
          onSuccess={() => {
            callback()
            setListening(null)
          }}
          mode="edit"
          quizId={row._id}
          initial={{
            question: row.question,
            options: row.options,
            answer: row.answer,
          }}
        />
      )}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa câu hỏi?</DialogTitle>
            <DialogDescription className="line-clamp-3">{row.question}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)} disabled={loading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
