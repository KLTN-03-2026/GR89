'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DialogAddAudio } from '@/components/common'
import { Media } from '@/features/Media/types'
import { getMediaList } from '@/features/Media/services/api'
import { Music2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { AudioCard } from './AudioCard'

interface Props {
  onSelect: (audio: Media) => void
  children: React.ReactNode
}

export function DialogSelectAudio({ onSelect, children }: Props) {
  const [open, setOpen] = useState(false)
  const [audioList, setAudioList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [currentSelected, setCurrentSelected] = useState<Media | null>(null)

  useEffect(() => {
    const fetchAudio = async () => {
      setLoading(true)
      try {
        const res = await getMediaList()
        const audioFiles = res.data?.filter(item => item.type === 'audio') || []
        setAudioList(audioFiles)
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Không thể tải danh sách audio')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch when dialog opens or refresh is triggered
    if (open || refresh) {
      fetchAudio()
    }
  }, [open, refresh])

  const handleSelect = () => {
    if (currentSelected) {
      onSelect(currentSelected)
      setOpen(false)
      toast.success('Đã chọn audio')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[800px] !max-w-[95vw] !max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            Chọn Audio từ thư viện
          </DialogTitle>
          <DialogDescription>
            Chọn file audio từ thư viện media hoặc tải lên audio mới
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 overflow-y-auto flex-1 p-2">
          {/* Add new audio card */}
          <DialogAddAudio callback={() => setRefresh(!refresh)} />
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Đang tải...</div>
            </div>
          ) : audioList.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
              <Music2 className="h-12 w-12 mb-2" />
              <p>Không có audio nào</p>
              <p className="text-sm">Thêm audio mới để bắt đầu</p>
            </div>
          ) : (
            audioList.map((audio) => (
              <AudioCard
                key={audio._id}
                audio={audio}
                isSelected={currentSelected?._id === audio._id}
                onSelect={(audio) => setCurrentSelected(audio)}
                onDeselect={() => setCurrentSelected(null)}
              />
            ))
          )}
        </div>

        <DialogFooter>
          {currentSelected && (
            <div className="border-t pt-4 mt-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded bg-blue-500 flex items-center justify-center text-white">
                    <Music2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium">Audio đã chọn</p>
                    <p className="text-sm text-gray-600">
                      {currentSelected.publicId || currentSelected.url.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentSelected.format?.toUpperCase()} • {currentSelected.size ? Math.round(currentSelected.size / 1024) + 'KB' : ''}
                    </p>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={handleSelect}>
                    Sử dụng audio này
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}