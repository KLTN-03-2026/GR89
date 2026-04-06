'use client'
import { DataTable } from '@/components/common'
import { Card, CardContent } from '@/components/ui/card'
import { columnsIpaExample } from '../IpaExampleTable/IpaExampleColumn'
import { useState, useEffect } from 'react'
import { deleteMultipleExamplesIpa, getIpaById } from '@/features/IPA/services/api'
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

interface Props {
  ipaId: string
}

export function IpaExampleMain({ ipaId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [ipa, setIpa] = useState<Ipa | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [selectedExamples, setSelectedExamples] = useState<Example[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchIpa = async () => {
      setIsLoading(true)
      await getIpaById(ipaId)
        .then(res => {
          const ipaData = res.data as Ipa

          const formattedExamples = (ipaData.examples || []).map((example: Example, index: number) => ({
            ...example,
            _id: example._id || `temp-${index}`,
            word: example.word || '',
            phonetic: example.phonetic || '',
            vietnamese: example.vietnamese || ''
          }))

          setIpa({
            ...ipaData,
            examples: formattedExamples
          })
        })
        .finally(() => setIsLoading(false))
    }

    fetchIpa()
  }, [ipaId, refresh])

  const handleRefresh = () => {
    setRefresh(prev => !prev)
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
      await deleteMultipleExamplesIpa(ipaId, ids)
      toast.success(`Đã xóa ${ids.length} ví dụ`)
      handleRefresh()
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
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <Link href="/content/ipa">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <header>
            <h1 className='text-2xl font-bold'>Ví dụ về âm {ipa.sound}:</h1>
            <span className='text-sm text-gray-500'>Quản lý danh sách từ vựng</span>
          </header>
        </div>

        <DialogAddIpaExample ipaId={ipaId} callback={handleRefresh} />
      </div>

      <Card>
        <CardContent>
          {(!ipa.examples || ipa.examples.length === 0) && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có ví dụ nào cho âm này.</p>
              <p className="text-sm mt-2">Nhấn &quot;Thêm ví dụ&quot; để bắt đầu.</p>
            </div>
          ) : (
            <DataTable
              columns={columnsIpaExample(ipaId, handleRefresh)}
              data={ipa.examples || []}
              isLoading={isLoading}
              columnNameSearch="word"
              maxHeight="600px"
              handleDeleteMultiple={(ids) => {
                if (!ids || ids.length === 0) return
                setIsDeleteDialogOpen(true)
              }}
              onSelectedRowsChange={setSelectedExamples}
            />
          )}
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
