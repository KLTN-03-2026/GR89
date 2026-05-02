'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { columnsIpaExample } from '../IpaExampleTable/IpaExampleColumn'
import { useState } from 'react'
import { deleteMultipleExamplesIpa } from '@/features/IPA/services/api'
import { Ipa, Example } from '@/features/IPA/types'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'react-toastify'
import { DialogAddIpaExample } from '../dialogs'

import { useRouter } from 'next/navigation'

interface Props {
  _id: string
  initialData: Ipa
}

export function IpaExampleMain({ _id, initialData }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [ipa, setIpa] = useState<Ipa>(initialData)
  const [selectedExamples, setSelectedExamples] = useState<Example[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Syncing state with props
  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setIpa(initialData)
    setPrevInitialData(initialData)
  }

  const handleDeleteSelected = async () => {
    const ids = selectedExamples
      .map(ex => ex._id)
      .filter((id): id is string => Boolean(id))

    if (ids.length === 0) {
      setIsDeleteDialogOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      await deleteMultipleExamplesIpa(_id, ids)
      toast.success(`Đã xóa ${ids.length} ví dụ`)
      router.refresh()
      setSelectedExamples([])
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Xóa ví dụ thất bại')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!ipa) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy IPA</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/content/ipa">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Ví dụ cho âm /{ipa.sound}/</h1>
            <p className="text-muted-foreground">Quản lý các từ ví dụ minh họa cho âm tiết</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedExamples.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Xóa {selectedExamples.length} mục đã chọn
            </Button>
          )}
          <DialogAddIpaExample
            ipaId={_id}
            callback={() => router.refresh()}
          />
        </div>
      </div>

      <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden mt-6">
        <CardContent className="p-0">
          <DataTable
            columns={columnsIpaExample(_id, () => router.refresh())}
            data={ipa.examples || []}
            isLoading={isLoading}
            columnNameSearch="word"
            onSelectedRowsChange={(rows) => setSelectedExamples(rows as Example[])}
          />
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa các ví dụ đã chọn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa {selectedExamples.length} ví dụ. Thao tác không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
