import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteMedia } from '@/features/Media/services/api'
import { Media } from '@/features/Media/types'
import { Copy, ExternalLink, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-toastify'

interface props {
  setImages: (images: Media[] | ((prev: Media[]) => Media[])) => void
  setSelectedIds: (selectedIds: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  setPreview: (preview: Media | null) => void
  preview: Media | null
}

export function DialogImageData({ setImages, setSelectedIds, setPreview, preview }: props) {
  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Xóa ảnh này?")) return

    await deleteMedia(id)
      .then(() => {
        setImages((prev: Media[]) => prev.filter(img => img._id !== id))
        setSelectedIds((prev: Set<string>) => {
          const next = new Set(prev);
          next.delete(id);
          return next
        })
        setPreview(null)
        toast.success("Đã xóa ảnh")
      })
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Đã sao chép ${label}`)
    } catch {
      toast.error("Không thể sao chép")
    }
  }
  function formatFileSize(bytes: number) {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
      {preview && (
        <DialogContent className="max-w-[960px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Chi tiết hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg overflow-hidden border bg-muted/20">
              <Image
                src={preview.url}
                alt={`preview-${preview._id}`}
                width={preview.width || 800}
                height={preview.height || 600}
                className="w-full h-full object-contain max-h-[60vh] bg-black/5"
              />
            </div>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">URL</div>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[360px]">{preview.url}</span>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(preview.url, 'URL')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <a href={preview.url} target="_blank" className="inline-flex">
                    <Button variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Public ID</div>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[360px]">{preview.publicId}</span>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(preview.publicId, 'Public ID')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">ID</div>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[360px]">{preview._id}</span>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(preview._id, 'ID')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Định dạng</div>
                  <div className="font-medium uppercase">{preview.format}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Kích thước tệp</div>
                  <div className="font-medium">{formatFileSize(preview.size)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Kích thước ảnh</div>
                  <div className="font-medium">{preview.width} × {preview.height}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ngày tạo</div>
                  <div className="font-medium">{new Date(preview.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="destructive" onClick={() => handleDeleteSingle(preview._id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa ảnh này
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
