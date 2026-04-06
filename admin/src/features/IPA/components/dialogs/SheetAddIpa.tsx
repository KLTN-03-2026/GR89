'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Languages, 
  Info, 
  Type, 
  Video, 
  CheckCircle2, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Play,
  FileText
} from "lucide-react"
import { createIpa, IIpaCreateData } from '@/features/IPA/services/api'
import { DialogVideoToMedia } from '@/components/common/dialog/DialogVideoToMedia'
import { toast } from 'react-toastify'

type MediaRef = { _id: string; url: string }

interface SheetAddIpaProps {
  callback: () => void
}

export function SheetAddIpa({ callback }: SheetAddIpaProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mouthShapeVideoUrl, setMouthShapeVideoUrl] = useState<string | null>(null)
  const [lectureVideoUrl, setLectureVideoUrl] = useState<string | null>(null)
  const [data, setData] = useState({
    sound: "",
    soundType: "" as 'vowel' | 'consonant' | 'diphthong' | '',
    image: "",
    video: "",
    description: ""
  })

  const handleCreate = async () => {
    if (!data.sound.trim() || !data.soundType || !data.video.trim() || !data.description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setIsLoading(true)
    try {
      await createIpa(data as IIpaCreateData)
      toast.success('Tạo IPA thành công')
      callback()
      setOpen(false)
      setData({
        sound: "",
        soundType: "",
        image: "",
        video: "",
        description: "",
      })
      setMouthShapeVideoUrl(null)
      setLectureVideoUrl(null)
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMouthShapeVideoSelect = (video: MediaRef) => {
    setData(prev => ({
      ...prev,
      image: video._id
    }))
    setMouthShapeVideoUrl(video.url)
  }

  const handleLectureVideoSelect = (video: MediaRef) => {
    setData(prev => ({
      ...prev,
      video: video._id
    }))
    setLectureVideoUrl(video.url)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Thêm IPA mới
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Khai Báo Âm Mới</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Thiết lập âm IPA mới với hướng dẫn chi tiết.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="w-4 h-4" />
                Thông Tin Cơ Bản
              </div>
              
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="sound" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Âm IPA <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="sound"
                    placeholder="Ví dụ: /æ/, /ʃ/..."
                    value={data.sound}
                    onChange={(e) => setData(prev => ({ ...prev, sound: e.target.value }))}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-black px-4 shadow-sm text-lg font-serif"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="soundType" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Loại Âm <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={data.soundType}
                    onValueChange={(value: 'vowel' | 'consonant' | 'diphthong') =>
                      setData(prev => ({ ...prev, soundType: value }))
                    }
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn loại âm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="vowel" className="rounded-xl font-bold">Nguyên âm (Vowel)</SelectItem>
                      <SelectItem value="consonant" className="rounded-xl font-bold">Phụ âm (Consonant)</SelectItem>
                      <SelectItem value="diphthong" className="rounded-xl font-bold">Nguyên âm đôi (Diphthong)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5 col-span-2">
                  <Label htmlFor="description" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mô Tả Khẩu Hình <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết cách phát âm, vị trí lưỡi, môi..."
                    value={data.description}
                    onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Media */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Video className="h-4 h-4" />
                Video Hướng Dẫn
              </div>

              <div className="grid grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50">
                {/* Mouth Shape Video */}
                <div className="space-y-4">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Khẩu Hình Miệng <span className="text-rose-500">*</span>
                  </Label>
                  
                  {data.image && mouthShapeVideoUrl ? (
                    <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-black">
                      <video src={mouthShapeVideoUrl} className="w-full h-full object-contain" muted />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                        <DialogVideoToMedia onSelect={handleMouthShapeVideoSelect}>
                          <Button size="sm" variant="secondary" className="rounded-full font-bold h-8 text-[10px] uppercase">Thay đổi</Button>
                        </DialogVideoToMedia>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="rounded-full font-bold h-8 text-[10px] uppercase"
                          onClick={() => { setData(prev => ({ ...prev, image: "" })); setMouthShapeVideoUrl(null) }}
                        >Gỡ bỏ</Button>
                      </div>
                    </div>
                  ) : (
                    <DialogVideoToMedia onSelect={handleMouthShapeVideoSelect}>
                      <div className="aspect-video border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-100/50 hover:border-blue-400 transition-all cursor-pointer group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-blue-500 fill-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Chọn Video Khẩu Hình</span>
                      </div>
                    </DialogVideoToMedia>
                  )}
                </div>

                {/* Lecture Video */}
                <div className="space-y-4">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Bài Giảng (Video) <span className="text-rose-500">*</span>
                  </Label>
                  
                  {data.video && lectureVideoUrl ? (
                    <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-black">
                      <video src={lectureVideoUrl} className="w-full h-full object-contain" muted />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                        <DialogVideoToMedia onSelect={handleLectureVideoSelect}>
                          <Button size="sm" variant="secondary" className="rounded-full font-bold h-8 text-[10px] uppercase">Thay đổi</Button>
                        </DialogVideoToMedia>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="rounded-full font-bold h-8 text-[10px] uppercase"
                          onClick={() => { setData(prev => ({ ...prev, video: "" })); setLectureVideoUrl(null) }}
                        >Gỡ bỏ</Button>
                      </div>
                    </div>
                  ) : (
                    <DialogVideoToMedia onSelect={handleLectureVideoSelect}>
                      <div className="aspect-video border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-100/50 hover:border-blue-400 transition-all cursor-pointer group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          <Video className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Chọn Video Bài Giảng</span>
                      </div>
                    </DialogVideoToMedia>
                  )}
                </div>
              </div>
            </section>

            {/* Note Section */}
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex gap-4 items-start pb-10">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Lưu ý chuyên môn</h4>
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed mt-1">
                  Đảm bảo video khẩu hình miệng quay cận cảnh, rõ ràng và có chất lượng ánh sáng tốt để học viên có thể quan sát kỹ thuật phát âm.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
                disabled={isLoading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button 
              onClick={handleCreate}
              disabled={isLoading} 
              className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Đang Xử Lý...' : 'Lưu IPA'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
