import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter, DialogHeader, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import React from 'react'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  selectedRows: string[]
  setSelectedRows: (selectedRows: string[]) => void
  isDeleting: boolean
  confirmDeleteMultiple: () => void
}
export default function DialogConfirmDeleteMutiple({ open, setOpen, selectedRows, setSelectedRows, isDeleting, confirmDeleteMultiple }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa nhiều IPA</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> IPA đã chọn không?
            Hành động này sẽ xóa cả các ví dụ liên quan và không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setSelectedRows([])
            }}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeleteMultiple}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang xóa...</>) :
              (<><Trash2 className="h-4 w-4 mr-2" />Xóa</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
