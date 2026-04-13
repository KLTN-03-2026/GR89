'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateListening, DataListening } from '@/features/listening/services/api'
import { Music, FileText, Info, Layers, Save, CheckCircle2, Edit3, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Media } from '@/features/Media/types'
import { DialogSelectAudio } from './DialogSelectAudio'
import { Listening } from '@/features/listening/types'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { SheetFooter } from '@/components/ui/sheet'

interface Props {
  listening: Listening
  callback: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function DialogUpdateListening({ listening, callback, isOpen, setIsOpen }: Props) {
  const countSubtitleLines = (text: string) =>
    String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length
  const [data, setData] = useState({
    title: "",
    description: "",
    audio: "",
    subtitle: "",
    subtitleVi: "",
    level: "A1",
  })
  const [selectedAudio, setSelectedAudio] = useState<Media | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (listening) {
      setData({
        title: listening.title || "",
        description: listening.description || "",
        audio: typeof listening.audio === 'string' ? listening.audio : listening.audio?._id || "",
        subtitle: listening.subtitle || "",
        subtitleVi: listening.subtitleVi || "",
        level: listening.level || "A1",
      })
      // Set selectedAudio if audio is an object, otherwise null
      if (typeof listening.audio === 'object' && listening.audio) {
        setSelectedAudio(listening.audio as Media)
      } else {
        setSelectedAudio(null)
      }
    }
  }, [listening])

  const handleSelectAudio = (audio: Media) => {
    setSelectedAudio(audio)
    setData(prev => ({ ...prev, audio: audio._id }))
  }

  const handleUpdateListening = async () => {
    if (!data.title.trim() || !data.description.trim() || !selectedAudio || !data.subtitle.trim() || !data.subtitleVi.trim() || !data.level) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    if (countSubtitleLines(data.subtitle) !== countSubtitleLines(data.subtitleVi)) {
      toast.error('Số lượng dòng phụ đề tiếng Anh và tiếng Việt phải bằng nhau')
      return
    }

    setLoading(true)
    try {
      await updateListening(listening._id, {
        title: data.title,
        description: data.description,
        subtitle: data.subtitle,
        subtitleVi: data.subtitleVi,
        level: data.level as DataListening['level'],
        audio: selectedAudio._id
      })
      callback()
      toast.success('Cập nhật bài nghe thành công')
      setIsOpen(false)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l overflow-hidden">
        <SheetHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-900">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-zinc-900">Cập Nhật Bài Nghe</SheetTitle>
              <SheetDescription className="text-zinc-500 text-sm mt-1">
                Chỉnh sửa bài nghe <span className="font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">{listening._id}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {/* Thông tin cơ bản */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                <Info className="h-4 w-4" />
                Thông Tin Cơ Bản
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase">
                    Tiêu đề bài nghe <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="VD: English Conversation at the Airport..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-11 bg-white border-zinc-200 rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase">
                    Trình độ <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value })}>
                    <SelectTrigger className="h-11 bg-white border-zinc-200 rounded-lg font-medium">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase">
                    Mô tả bài nghe <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Nhập mô tả ngắn gọn..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="bg-white border-zinc-200 rounded-lg font-medium min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Audio Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                <Music className="h-4 w-4" />
                Tệp Âm Thanh
              </div>
              <div className="p-6 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-col items-center gap-4">
                <DialogSelectAudio onSelect={handleSelectAudio}>
                  <Button variant="outline" className="h-11 px-6 rounded-lg border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-bold gap-2">
                    <Music className="w-4 h-4" />
                    {selectedAudio ? "Thay Đổi Âm Thanh" : "Chọn Audio Từ Thư Viện"}
                  </Button>
                </DialogSelectAudio>

                {selectedAudio && (
                  <div className="flex flex-col items-center gap-3 w-full max-w-md">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-zinc-200 w-full overflow-hidden">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-zinc-600 truncate">{selectedAudio.publicId || selectedAudio.url.split('/').pop()}</p>
                    </div>
                    <audio src={selectedAudio.url} controls className="w-full h-10" />
                  </div>
                )}
              </div>
            </section>

            {/* Subtitle Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                <Layers className="h-4 w-4" />
                Phụ Đề & Kịch Bản
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Nội dung phụ đề (.SRT / .VTT) <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  placeholder="1&#10;00:00:00,000 --> 00:00:02,000&#10;Hello, welcome to English class!"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  className="min-h-[300px] font-mono text-sm bg-zinc-50 border-zinc-200 rounded-lg p-4 resize-y"
                />
                <Label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Phụ đề tiếng Việt <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  placeholder="Xin chào, chào mừng bạn đến với lớp tiếng Anh!"
                  value={data.subtitleVi}
                  onChange={(e) => setData({ ...data, subtitleVi: e.target.value })}
                  className="min-h-[200px] font-mono text-sm bg-zinc-50 border-zinc-200 rounded-lg p-4 resize-y"
                />

                <p className="text-xs text-zinc-500 leading-relaxed rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 p-3">
                  Quiz trắc nghiệm (lượt 1) quản lý tại trang riêng: menu hành động (⋮) trên danh sách bài nghe → <strong>Quiz lượt 1</strong>.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator />

        <SheetFooter className="p-6 bg-white border-t">
          <div className="flex items-center justify-end gap-3 w-full">
            <SheetClose asChild>
              <Button variant="outline" className="h-11 px-6 rounded-lg font-bold" disabled={loading}>
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button className="h-11 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold" onClick={handleUpdateListening} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Đang Xử Lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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