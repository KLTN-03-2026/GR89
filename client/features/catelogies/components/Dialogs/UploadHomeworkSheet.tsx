'use client'

import { RichEditor } from '@/components/common/editor/RichEditor'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { IHomework } from '@/features/catelogies/types'
import { Loader2, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface UploadHomeworkSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => Promise<void> | void
  currentHomework?: IHomework
  initialValue?: string
}

function toPlainText(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function UploadHomeworkSheet({
  isOpen,
  onClose,
  onSubmit,
  currentHomework,
  initialValue,
}: UploadHomeworkSheetProps) {
  const currentHomeworkContent = useMemo(() => currentHomework?.submissions?.[0]?.content ?? '', [currentHomework])
  
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setContent(initialValue ?? currentHomeworkContent ?? '')
  }, [isOpen, initialValue, currentHomeworkContent])

  const isEmpty = useMemo(() => toPlainText(content).length === 0, [content])

  const handleSubmit = async () => {
    if (isSubmitting || isEmpty) return
    if (currentHomework?.deadline && new Date() > new Date(currentHomework.deadline)) {
      alert('Bài tập đã hết hạn nộp.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(content)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
        <SheetHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <SheetTitle className="text-2xl font-bold">Nộp bài tập</SheetTitle>
          <SheetDescription className="text-blue-100/80">
            {currentHomework?.title ? 'Bài tập: ' + currentHomework.title : 'Soạn bài làm của bạn và nhấn "Nộp bài".'}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 flex-1 overflow-hidden bg-white">
          <RichEditor value={content} onChange={setContent} placeholder="Nhập bài làm của bạn..." />
        </div>

        <SheetFooter className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isEmpty}
            className="bg-blue-600 hover:bg-blue-700 font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
