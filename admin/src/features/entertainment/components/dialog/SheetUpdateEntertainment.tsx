'use client'

import { useEffect, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateEntertainment } from '../../services/api'
import { toast } from 'react-toastify'
import { DialogImageToMedia, DialogVideoToMedia } from '@/components/common'
import { Media } from "@/features/Media/types";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Info,
  Video,
  Image as ImageIcon,
  User,
  Type,
  FileText,
  LayoutList,
  Edit3,
  Save,
  Loader2,
  Zap,
  Play
} from 'lucide-react'
import type { Entertainment } from '../../types'

type EntertainmentForm = {
  title: string
  description: string
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  author: string
  videoUrl: string
  thumbnailUrl: string
  parentId?: string
  orderIndex?: number
}

export function SheetUpdateEntertainment({
  open,
  setOpen,
  entertainment,
  callback
}: {
  open: boolean
  setOpen: (v: boolean) => void
  entertainment: Entertainment
  callback?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<EntertainmentForm>({
    title: '',
    description: '',
    type: 'movie',
    author: '',
    videoUrl: '',
    thumbnailUrl: '',
    parentId: '',
    orderIndex: 0
  })

  useEffect(() => {
    if (!entertainment) return
    const videoUrl =
      typeof entertainment.videoUrl === 'string'
        ? entertainment.videoUrl
        : entertainment.videoUrl?._id || ''
    const thumbnailUrl =
      typeof entertainment.thumbnailUrl === 'string'
        ? entertainment.thumbnailUrl
        : entertainment.thumbnailUrl?._id || ''

    setData({
      title: entertainment.title || '',
      description: entertainment.description || '',
      type: (entertainment.type as EntertainmentForm['type']) || 'movie',
      author: entertainment.author || '',
      videoUrl,
      thumbnailUrl,
      parentId: typeof entertainment.parentId === 'string' ? entertainment.parentId : entertainment.parentId?._id || '',
      orderIndex: entertainment.orderIndex || 0
    })
  }, [entertainment])

  const handleUpdate = async () => {
    if (!data.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }
    setLoading(true)
    await updateEntertainment(entertainment._id, data)
      .then(() => {
        toast.success('Cập nhật nội dung giải trí thành công')
        callback?.()
        setOpen(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const getThemeColor = () => {
    switch (data.type) {
      case 'music': return 'rose'
      case 'podcast': return 'purple'
      default: return 'blue'
    }
  }

  const theme = getThemeColor()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner`}>
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Hiệu Chỉnh Nội Dung</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chỉnh sửa thông tin cho: <span className={`text-${theme}-600 font-bold`}>{entertainment?.title}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className={`flex items-center gap-2.5 text-${theme}-600 font-black uppercase text-[11px] tracking-[0.2em]`}>
                <Info className="w-4 h-4" />
                Thông Tin Tác Phẩm
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5 col-span-2">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Tiêu Đề <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="Nhập tên phim, bài hát, podcast..."
                    className={`h-12 bg-white border-gray-200 rounded-2xl focus:ring-${theme}-500 font-bold px-4 shadow-sm`}
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2.5 col-span-2">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mô Tả Tóm Tắt
                  </Label>
                  <Input
                    placeholder="Tóm tắt nội dung hấp dẫn..."
                    className={`h-12 bg-white border-gray-200 rounded-2xl focus:ring-${theme}-500 font-bold px-4 shadow-sm`}
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5" /> Phân Loại
                  </Label>
                  <Select
                    value={data.type}
                    onValueChange={(v) => setData({ ...data, type: v as 'movie' | 'music' | 'podcast' | 'series' | 'episode' })}
                  >
                    <SelectTrigger className={`h-12 bg-white border-gray-200 rounded-2xl focus:ring-${theme}-500 font-bold px-4 shadow-sm`}>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="movie" className="rounded-xl font-bold">Phim lẻ (Movie)</SelectItem>
                      <SelectItem value="series" className="rounded-xl font-bold">Phim bộ (Series)</SelectItem>
                      <SelectItem value="episode" className="rounded-xl font-bold">Tập phim (Episode)</SelectItem>
                      <SelectItem value="music" className="rounded-xl font-bold">Âm nhạc (Music)</SelectItem>
                      <SelectItem value="podcast" className="rounded-xl font-bold">Podcast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Tác Giả / Đạo Diễn
                  </Label>
                  <Input
                    placeholder="Tên nghệ sĩ, đạo diễn..."
                    className={`h-12 bg-white border-gray-200 rounded-2xl focus:ring-${theme}-500 font-bold px-4 shadow-sm`}
                    value={data.author}
                    onChange={(e) => setData({ ...data, author: e.target.value })}
                  />
                </div>

                {data.type === 'episode' && (
                  <div className="space-y-2.5">
                    <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Thứ Tự Tập
                    </Label>
                    <Input
                      type="number"
                      className={`h-12 bg-white border-gray-200 rounded-2xl focus:ring-${theme}-500 font-bold px-4 shadow-sm`}
                      value={data.orderIndex}
                      onChange={(e) => setData({ ...data, orderIndex: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Section: Media */}
            <section className="space-y-6 pb-10">
              <div className={`flex items-center gap-2.5 text-${theme}-600 font-black uppercase text-[11px] tracking-[0.2em]`}>
                <Video className="w-4 h-4" />
                Dữ Liệu Đa Phương Tiện
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                {/* Video/Audio Picker */}
                <div className="space-y-4">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> File Media <span className="text-rose-500">*</span>
                  </Label>
                  <div className={`p-4 bg-white rounded-2xl border border-${theme}-100 shadow-sm space-y-3`}>
                    <DialogVideoToMedia onSelect={(m: Media) => setData({ ...data, videoUrl: m._id })}>
                      <div className={`w-full h-24 border-2 border-dashed border-${theme}-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-${theme}-50/50 hover:border-${theme}-300 transition-all cursor-pointer group`}>
                        <div className={`p-2 bg-${theme}-50 rounded-lg group-hover:scale-110 transition-transform`}>
                          <Play className={`w-4 h-4 text-${theme}-500 fill-${theme}-500`} />
                        </div>
                        <span className={`text-[10px] font-black text-${theme}-600 uppercase`}>Thay đổi Media</span>
                      </div>
                    </DialogVideoToMedia>
                    {data.videoUrl && (
                      <div className={`flex items-center gap-2 text-[10px] bg-${theme}-50 text-${theme}-600 p-2 rounded-lg border border-${theme}-100 font-mono overflow-hidden`}>
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{data.videoUrl}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Picker */}
                <div className="space-y-4">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Ảnh Đại Diện <span className="text-rose-500">*</span>
                  </Label>
                  <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-3">
                    <DialogImageToMedia onSelect={(m: Media) => setData({ ...data, thumbnailUrl: m._id })}>
                      <div className="w-full h-24 border-2 border-dashed border-emerald-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer group">
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Thay đổi Ảnh Bìa</span>
                      </div>
                    </DialogImageToMedia>
                    {data.thumbnailUrl && (
                      <div className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100 font-mono overflow-hidden">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{data.thumbnailUrl}</span>
                      </div>
                    )}
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
                disabled={loading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className={`h-12 px-10 rounded-2xl bg-${theme}-600 hover:bg-${theme}-700 shadow-xl shadow-${theme}-200 font-black transition-all active:scale-95`}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Đang Lưu...' : 'Cập Nhật'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}
