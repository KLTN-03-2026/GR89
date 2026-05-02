'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Send, Trash2, Loader2, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { IClassDocument } from '../../types'
import { ActionConfirmDialog } from '../dialogs/ActionConfirmDialog'

interface DocumentActionsCellProps {
  document: IClassDocument
  callback: () => void
}

export function DocumentActionsCell({ document, callback }: DocumentActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const handleDeleteConfirm = () => {
    setIsLoading(true)
    // Mock API call
    setTimeout(() => {
      console.log('Delete document:', document.id)
      setIsLoading(false)
      setOpenDelete(false)
      callback()
    }, 500)
  }

  return (
    <>
      <ActionConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Xác nhận xóa tài liệu"
        description={`Bạn có chắc chắn muốn xóa tài liệu "${document.title}" khỏi lớp học này?`}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-8 px-3 font-bold text-[10px] uppercase tracking-wider"
        >
          <Send className="w-3 h-3 mr-1.5" /> Gửi bài
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Hành động</DropdownMenuLabel>
            
            <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => window.open(document.url, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" /> Xem trên Drive
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
