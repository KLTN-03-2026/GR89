'use client'

import { useState } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useRouter } from 'next/navigation'
import { createRoadmapTopic } from '../../services/api'
import {
  Map,
  Info,
  Smile,
  Save,
  Loader2,
  Sparkles,
  Zap,
  Flag
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from 'react-toastify'

interface TopicDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SheetAddTopic({ isOpen, onOpenChange }: TopicDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📚')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await createRoadmapTopic(title.trim(), description.trim(), icon.trim() || '📚')
      toast.success('Đã tạo chặng mới: ' + title)
      onOpenChange(false)
      router.refresh()
      setTitle('')
      setDescription('')
      setIcon('📚')
    } catch (error) {
      toast.error('Không thể tạo chủ đề')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Kiến Tạo Chặng Mới</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Thêm một cột mốc quan trọng trên bản đồ học tập.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <form id="form-add-roadmap-topic" onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Flag className="w-4 h-4" />
                Thông Tin Chặng Đường
              </div>

              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label htmlFor="title-roadmap" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tên Chặng <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="title-roadmap"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Tiếng Anh cho người mới bắt đầu"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-bold px-4 shadow-sm"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description-roadmap" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Info className="h-3.5" /> Mô Tả Mục Tiêu
                  </Label>
                  <Input
                    id="description-roadmap"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Bắt đầu hành trình với những kiến thức cơ bản nhất..."
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-amber-500 font-bold px-4 shadow-sm"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="icon-roadmap" className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <Smile className="h-3.5" /> Biểu Tượng Nhận Diện
                  </Label>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-14 w-14 text-3xl p-0 hover:bg-amber-50 rounded-xl transition-all border border-gray-50 shrink-0"
                          disabled={isLoading}
                        >
                          {icon || '📚'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start" side="top">
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            setIcon(emojiData.emoji)
                          }}
                          width={320}
                          height={400}
                          previewConfig={{ showPreview: false }}
                          searchDisabled={false}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="relative flex-1">
                      <Input
                        id="icon-roadmap"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="📚"
                        disabled={isLoading}
                        maxLength={10}
                        className="h-12 bg-gray-50/50 border-transparent rounded-xl focus:ring-amber-500 font-bold px-4"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 px-2 italic font-medium">
                    Nhấp vào ô vuông để chọn Emoji hoặc nhập trực tiếp mã biểu tượng.
                  </p>
                </div>
              </div>
            </section>

            {/* Note Section */}
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-start pb-10">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Lời khuyên</h4>
                <p className="text-xs font-medium text-blue-700/80 leading-relaxed mt-1">
                  Mỗi chặng nên đại diện cho một cấp độ hoặc một kỹ năng cụ thể. Sử dụng Emoji sinh động giúp học viên có thêm động lực học tập.
                </p>
              </div>
            </div>
          </form>
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
              form="form-add-roadmap-topic"
              type="submit"
              disabled={isLoading || !title.trim()}
              className="h-12 px-10 rounded-2xl bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200 font-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Đang Xử Lý...' : 'Lưu Chặng'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
