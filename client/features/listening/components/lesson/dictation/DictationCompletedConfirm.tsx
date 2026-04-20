'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  handleRetry: () => void
  showCompleteConfirm: boolean
  setShowCompleteConfirm: (showCompleteConfirm: boolean) => void
  handleGoToResultPage: () => void
  isSavingResult: boolean
}
export default function DictationCompletedConfirm({
  handleRetry,
  showCompleteConfirm,
  setShowCompleteConfirm,
  handleGoToResultPage,
  isSavingResult
}: Props) {
  return (
    <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
      <DialogContent
        className="rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Bạn đã hoàn thành bài chép chính tả
          </DialogTitle>
          <DialogDescription>
            Bạn muốn sang trang kết quả hay làm lại bài này?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleRetry}>
            Làm lại
          </Button>

          <Button onClick={handleGoToResultPage} disabled={isSavingResult}>
            {isSavingResult ? 'Đang lưu...' : 'Sang kết quả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
