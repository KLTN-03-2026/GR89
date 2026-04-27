import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog"
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  selectedRows: string[]
  setSelectedRows: (selectedRows: string[]) => void
  isPublishing: boolean
  confirmPublishMultiple: () => void
  loadingAction: boolean
}
export default function DialogConfirmPublishMutiple({ open, setOpen, selectedRows, setSelectedRows, isPublishing, confirmPublishMultiple, loadingAction }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPublishing ? 'Xuất bản' : 'Ẩn'} nhiều IPA</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn {isPublishing ? 'xuất bản' : 'ẩn'} <strong>{selectedRows.length}</strong> IPA đã chọn không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setSelectedRows([])
            }}
            disabled={loadingAction}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={confirmPublishMultiple}
            disabled={loadingAction}
          >
            {loadingAction ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                {isPublishing ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Xuất bản
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ẩn
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
