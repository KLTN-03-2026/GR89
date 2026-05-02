'use client'

import React from 'react'
import { FileText, MoreVertical, Clock, User, Download, Eye, Trash2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IGlobalDocument } from '@/features/center-management/types'

interface DocumentCardProps {
  document: IGlobalDocument
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  onSelect?: (document: IGlobalDocument) => void
  selectable?: boolean
  isSelected?: boolean
}

export function DocumentCard({
  document,
  onDelete,
  onView,
  onSelect,
  selectable,
  isSelected
}: DocumentCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (selectable) {
      onSelect?.(document)
    } else {
      router.push(`/center-management/documents/${document.id}`)
    }
  }

  return (
    <div className={`group relative bg-white rounded-3xl border ${isSelected ? 'border-zinc-900 ring-2 ring-zinc-900/10' : 'border-zinc-100'} p-5 hover:shadow-xl hover:shadow-zinc-100 transition-all cursor-pointer overflow-hidden`}>
      {/* Extension Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-zinc-100 shadow-sm text-[10px] font-black text-zinc-900 uppercase">
          English
        </div>
      </div>

      {/* Actions */}
      {!selectable && (
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border-none shadow-sm hover:bg-white">
                <MoreVertical className="w-4 h-4 text-zinc-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 w-40 border-zinc-100 shadow-xl">
              <DropdownMenuItem className="rounded-xl cursor-pointer font-bold text-zinc-600 focus:bg-zinc-50 focus:text-zinc-900" onClick={() => router.push(`/center-management/documents/${document.id}`)}>
                <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer font-bold text-zinc-600 focus:bg-zinc-50 focus:text-zinc-900">
                <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer font-bold text-zinc-600 focus:bg-zinc-50 focus:text-zinc-900">
                <Download className="w-4 h-4 mr-2" /> Tải về
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl text-rose-600 cursor-pointer font-bold focus:bg-rose-50 focus:text-rose-700" onClick={() => onDelete?.(document.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Xóa tài liệu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Visual representation */}
      <div className="aspect-[4/3] rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-100 transition-colors">
        <div className="relative">
          <FileText className="w-16 h-16 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3
          className="font-extrabold text-zinc-900 line-clamp-1 group-hover:text-zinc-600 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          {document.name}
        </h3>

        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {document.owner}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {document.updatedAt}
          </div>
        </div>
      </div>

      {/* Selection Overlay */}
      {selectable && isSelected && (
        <div className="absolute inset-0 bg-zinc-900/10 pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-lg">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  )
}
