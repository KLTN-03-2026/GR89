import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from 'react'
import { toast } from 'react-toastify'
import { VocabularyTopic } from '@/features/vocabulary/types'

interface Props {
  topic: VocabularyTopic
  callback: () => void
}

export default function ActionsCell({ topic, callback }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      toast.info(`Xóa quiz trong chủ đề '${topic.name}' (chưa triển khai API)`) // TODO: wire API
      callback()
    } finally {
      setIsLoading(false)
    }
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
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toast.info('Chức năng sửa sẽ sớm có.') }}>
          <Pencil className="h-4 w-4" />
          Sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


