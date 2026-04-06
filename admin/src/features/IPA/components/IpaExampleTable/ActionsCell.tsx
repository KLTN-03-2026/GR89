'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from 'react'
import { deleteExampleIpa } from '@/features/IPA/services/api'
import { Example } from '@/features/IPA/types'
import { toast } from 'react-toastify'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DialogUpdateIpaExample } from '../dialogs'

interface ActionsCellProps {
  ipaId: string
  example: Example
  callback: () => void
}

export default function ActionsCell({ ipaId, example, callback }: ActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (!example._id) {
      toast.error('Không tìm thấy ID ví dụ')
      return
    }

    setIsLoading(true)
    try {
      await deleteExampleIpa(ipaId, example._id)
      toast.success('Xóa ví dụ thành công')
      callback()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Xóa ví dụ thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>

              <DialogUpdateIpaExample ipaId={ipaId} example={example} callback={callback} />

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onSelect={(e) => {
                  e.preventDefault()
                  setIsDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa ví dụ?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa ví dụ &quot;{example.word}&quot;? Thao tác không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
