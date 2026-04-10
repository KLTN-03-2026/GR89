'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateSpeaking } from '@/features/speaking/services/api'
import { Video, Mic2, Info, Film, CheckCircle2, X, Save, Edit3, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Speaking } from '@/features/speaking/types'
import { DialogVideoToMedia } from '@/components/common/dialog/DialogVideoToMedia'
import { Media } from '@/features/Media/types'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { SheetFooter } from '@/components/ui/sheet'

interface Props {
  speaking: Speaking
  callback: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function DialogUpdateSpeaking({ speaking, callback, isOpen, setIsOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    level: "A1",
    isActive: true
  })
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (speaking) {
      setData({
        title: speaking.title || "",
        description: speaking.description || "",
        videoUrl: typeof speaking.videoUrl === 'string' ? speaking.videoUrl : speaking.videoUrl?._id || "",
        level: speaking.level || "A1",
        isActive: speaking.isActive !== undefined ? speaking.isActive : true
      })
      // Set selected video URL if exists
      if (typeof speaking.videoUrl === 'object' && speaking.videoUrl?.url) {
        setSelectedVideoUrl(speaking.videoUrl.url)
      }
    }
  }, [speaking])


  const handleUpdateSpeaking = async () => {
    if (!data.title.trim() || !data.description.trim() || !data.videoUrl.trim() || !data.level) {
      toast.error('Vui lòng điền đầy đủ thông tin và chọn video')
      return
    }

    setIsLoading(true)
    try {
      await updateSpeaking(speaking._id, data as any)
      callback()
      toast.success('Cập nhật bài nói thành công')
      setIsOpen(false)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Cập Nhật Bài Nói</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉnh sửa bài nói <span className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{speaking._id}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Thông tin cơ bản */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-primary font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="h-4 w-4" />
                Thông Tin Cơ Bản
              </div>
              <div className="grid grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="col-span-3 space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tiêu đề bài nói <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Practicing English Vowels..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Trình độ <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value as Speaking['level'] })}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl} className="rounded-xl font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Mô tả / Hướng dẫn chi tiết <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Textarea
                    placeholder="Nhập yêu cầu hoặc hướng dẫn chi tiết cho bài tập nói này..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-primary font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Video Section */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Film className="h-4 w-4" />
                Video Hướng Dẫn
              </div>
              <div className="p-10 bg-blue-50/30 rounded-[2.5rem] border border-dashed border-blue-200/50 flex flex-col items-center gap-6 transition-all hover:bg-blue-50/50 group">
                <DialogVideoToMedia onSelect={(video: Media) => {
                  setData({ ...data, videoUrl: video._id })
                  setSelectedVideoUrl(video.url)
                }} />

                {data.videoUrl && selectedVideoUrl ? (
                  <div className="w-full space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video đã chọn:</p>
                          <p className="text-sm font-bold text-emerald-700 truncate">{data.videoUrl}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        onClick={() => {
                          setData({ ...data, videoUrl: "" })
                          setSelectedVideoUrl(null)
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Gỡ bỏ
                      </Button>
                    </div>
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-black group/video">
                      <video
                        src={selectedVideoUrl}
                        className="w-full h-full object-contain"
                        controls
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                      <Video className="h-10 w-10 text-blue-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-base font-black text-gray-700">Chưa có video hướng dẫn</p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Vui lòng chọn video từ thư viện Media để tiếp tục</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <Button variant="outline" className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95" disabled={isLoading} onClick={() => setIsOpen(false)}>
              Hủy Bỏ
            </Button>
            <Button className="h-12 px-10 rounded-2xl bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200 font-black transition-all active:scale-95 text-white" onClick={handleUpdateSpeaking} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Đang Cập Nhật...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu Thay Đổi
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
