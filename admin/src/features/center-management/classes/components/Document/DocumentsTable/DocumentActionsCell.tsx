'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Trash2, Loader2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ActionConfirmDialog } from '../../dialogs/ActionConfirmDialog'
import { IGlobalDocument } from '@/features/center-management/documents/type'
import { DialogPreviewDocument } from '@/features/center-management/documents/components/dialogs/DialogPreviewDocument'
import { useParams } from 'next/navigation'
import { removeDocumentFromClass } from '../../../services/api'
import { toast } from 'react-toastify'

interface DocumentActionsCellProps {
  document: IGlobalDocument
  callback: () => void
}

export function DocumentActionsCell({ document, callback }: DocumentActionsCellProps) {
  const params = useParams()
  const classId = params?._id as string
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!classId) return
    setIsLoading(true)
    try {
      const res = await removeDocumentFromClass(classId, document._id)
      if (res.success) toast.success('Đã xóa tài liệu khỏi lớp')
      callback()
    } catch {
      toast.error('Không thể xóa tài liệu')
    } finally {
      setIsLoading(false)
      setOpenDelete(false)
    }
  }

  return (
    <>
      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa tài liệu"
        description={`Bạn có chắc chắn muốn xóa tài liệu "${document.name}" không?`}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-end gap-2">
        <DialogPreviewDocument open={openPreview} onOpenChange={setOpenPreview} document={document} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Hành động</DropdownMenuLabel>
            
            <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setOpenPreview(true)}>
              <Eye className="w-4 h-4 mr-2" /> Xem tài liệu
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-gray-50" />

            <DropdownMenuItem className="rounded-xl text-red-600 cursor-pointer" onClick={() => setOpenDelete(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Xóa tài liệu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
