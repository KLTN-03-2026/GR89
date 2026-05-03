'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { IGlobalDocument } from '../../type'

interface DialogPreviewDocumentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: IGlobalDocument
}

export function DialogPreviewDocument({ open, onOpenChange, document }: DialogPreviewDocumentProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-black text-gray-900 line-clamp-2">{document.name}</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium mt-1">
                Xem nội dung tài liệu trực tiếp trong hệ thống.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 md:p-12 prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
            <div dangerouslySetInnerHTML={{ __html: document.content }} />
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100">
          <Button variant="outline" className="rounded-xl px-8" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

