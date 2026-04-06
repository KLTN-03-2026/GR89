import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Vocabulary } from '@/features/reading/types'
import { deleteReadingVocabulary } from '@/features/reading/services/api'
import { DialogUpdateReadingVocabulary } from '../dialogs/DialogUpdateReadingVocabulary'


interface Props {
  readingId: string
  vocabIndex: number
  vocab: Vocabulary
  callback: () => void
}

export default function ActionsCell({ readingId, vocab, callback }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    await deleteReadingVocabulary(readingId, vocab._id || '')
      .then(() => {
        toast.success(`Đã xóa từ '${vocab.word}'`)
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })

  }

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        
        <DialogUpdateReadingVocabulary readingId={readingId} vocab={vocab} callback={callback} />

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


