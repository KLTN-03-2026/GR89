import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import { Ipa } from '../../types'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  ipa: Ipa
  handleDelete: () => void
  isLoading: boolean
}

export default function DialogConfirmDelete({ open, setOpen, ipa, handleDelete, isLoading }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="pt-8 px-8">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium pt-2">
            Bạn có chắc chắn muốn xóa IPA <span className="text-rose-600 font-bold">`&quot;`{ipa.sound}`&quot;`</span>?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 font-black"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Xác Nhận Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
