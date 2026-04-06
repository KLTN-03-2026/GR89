'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
  FileText,
  Edit,
  History,
  User as UserIcon
} from "lucide-react"
import { updateIpa, IIpaUpdateData } from '@/features/IPA/services/api'
import { DialogVideoToMedia } from '@/components/common/dialog/DialogVideoToMedia'
import { Ipa } from '@/features/IPA/types'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'
import { format } from "date-fns"
import { vi } from "date-fns/locale"

type MediaRef = { _id: string; url: string }

interface SheetUpdateIpaProps {
  ipa: Ipa
  callback: () => void
}

export function SheetUpdateIpa({ ipa, callback }: SheetUpdateIpaProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mouthShapeVideoUrl, setMouthShapeVideoUrl] = useState<string | null>(null)
  const [lectureVideoUrl, setLectureVideoUrl] = useState<string | null>(null)
  const [data, setData] = useState({
    sound: "",
    soundType: "" as 'vowel' | 'consonant' | 'diphthong' | '',
    image: "",
    video: "",
    description: ""
  })

  useEffect(() => {
    if (ipa) {
      setData({
        sound: ipa.sound || "",
        soundType: ipa.soundType || "",
        image: ipa.image || "",
        video: ipa.video || "",
        description: ipa.description || ""
      })
      setMouthShapeVideoUrl(ipa.image || null)
      setLectureVideoUrl(ipa.video || null)
    }
  }, [ipa])

  const handleUpdate = async () => {
    if (!data.sound.trim() || !data.soundType || !data.image.trim() || !data.description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setIsLoading(true)
    try {
      await updateIpa(ipa._id, data as IIpaUpdateData)
      toast.success('Cập nhật IPA thành công')
      callback()
      setIsOpen(false)
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
    <>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpen(true) }}>
        <Edit className="h-4 w-4 mr-2" />
        Sửa IPA
      </DropdownMenuItem>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl">
          <SheetHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                <Languages className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Cập Nhật IPA</SheetTitle>
                <SheetDescription className="text-gray-500 font-medium mt-1">
                  Chỉnh sửa âm: <span className="text-indigo-600 font-bold font-serif">{ipa.sound}</span>
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
                    <Label htmlFor="sound-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                      Âm IPA <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="sound-update"
                      placeholder="Ví dụ: /æ/, /ʃ/..."
                      value={data.sound}
                      onChange={(e) => setData(prev => ({ ...prev, sound: e.target.value }))}
                      className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-black px-4 shadow-sm text-lg font-serif"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="soundType-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                      Loại Âm <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={data.soundType}
                      onValueChange={(value: 'vowel' | 'consonant' | 'diphthong') =>
                        setData(prev => ({ ...prev, soundType: value }))
                      }
                    >
                      <SelectTrigger id="soundType-update" className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-indigo-500 font-bold px-4 shadow-sm">
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
                    <Label htmlFor="description-update" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Mô Tả Khẩu Hình <span className="text-rose-500">*</span>
                    </Label>
                    <Textarea
                      id="description-update"
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
                    
                    {mouthShapeVideoUrl ? (
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
                    
                    {lectureVideoUrl ? (
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

              {/* Section: Metadata */}
              <section className="space-y-6 pb-10">
                <div className="flex items-center gap-2.5 text-slate-600 font-black uppercase text-[11px] tracking-[0.2em]">
                  <History className="w-4 h-4" />
                  Lịch Sử Chỉnh Sửa
                </div>
                
                <div className="bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <UserIcon className="w-3 h-3" /> Người tạo
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        A
                      </div>
                      <span className="text-xs font-bold text-slate-700">Admin</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> Ngày khởi tạo
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      {ipa.createdAt ? format(new Date(ipa.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                    </div>
                  </div>
                </div>
              </section>
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
                onClick={handleUpdate}
                disabled={isLoading} 
                className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                {isLoading ? 'Đang Xử Lý...' : 'Cập Nhật'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
