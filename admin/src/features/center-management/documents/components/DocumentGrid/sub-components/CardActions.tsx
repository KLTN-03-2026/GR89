'use client'

import React from 'react'
import { MoreVertical, Eye, Pencil, Download, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from '@/components/ui/separator'
import { IGlobalDocument } from '../../../type'

interface CardActionsProps {
  document: IGlobalDocument
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onExport: (e: React.MouseEvent) => void
  isExporting: boolean
}

export function CardActions({
  document,
  onEdit,
  onDelete,
  onExport,
  isExporting
}: CardActionsProps) {
  const router = useRouter()

  return (
    <div className="absolute top-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="icon" className="w-10 h-10 rounded-2xl bg-white shadow-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <DropdownMenuItem
            className="rounded-xl cursor-pointer py-3 font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 transition-colors"
            onClick={() => router.push(`/center-management/documents/${document._id}`)}
          >
            <Eye className="w-4 h-4 mr-3" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl cursor-pointer py-3 font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(document._id)
            }}
          >
            <Pencil className="w-4 h-4 mr-3" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl cursor-pointer py-3 font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 transition-colors"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Download className="w-4 h-4 mr-3" />}
            Tải về .docx
          </DropdownMenuItem>
          <Separator className="my-1 opacity-50" />
          <DropdownMenuItem
            className="rounded-xl text-rose-500 py-3 cursor-pointer font-bold focus:bg-rose-50 focus:text-rose-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(document._id)
            }}
          >
            <Trash2 className="w-4 h-4 mr-3" /> Xóa tài liệu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
