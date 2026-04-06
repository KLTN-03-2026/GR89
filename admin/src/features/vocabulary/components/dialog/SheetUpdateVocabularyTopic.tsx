'use client'

import { useState, useEffect } from 'react'
import {
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Book, 
  Tag, 
  Layers, 
  Image as ImageIcon, 
  Trash2, 
  Save, 
  X,
  Loader2,
  Sparkles,
  History,
  User as UserIcon
} from "lucide-react"
import { updateVocabularyTopic } from "../../services/api"
import { toast } from "react-toastify"
import { DialogImageToMedia } from "@/components/common/dialog"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { VocabularyTopic } from "../../types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const schema = z.object({
  name: z.string().min(2, "Tên chủ đề phải có ít nhất 2 ký tự"),
  image: z.string().min(1, "Ảnh chủ đề không được để trống"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"])
})

type FormData = z.infer<typeof schema>
type ImagePick = { _id?: string; url: string }

interface SheetUpdateVocabularyTopicProps {
  topic: VocabularyTopic
  callback: () => void
}

export function SheetUpdateVocabularyTopic({ topic, callback }: SheetUpdateVocabularyTopicProps) {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(topic.image?.url || "")

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: topic.name,
      image: topic.image?._id || "",
      level: topic.level as any
    }
  })

  // Reset form when topic changes
  useEffect(() => {
    form.reset({
      name: topic.name,
      image: topic.image?._id || "",
      level: topic.level as any
    })
    setImageUrl(topic.image?.url || "")
  }, [topic, form])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await updateVocabularyTopic(topic._id, data as any)
      toast.success('Đã cập nhật chủ đề ' + data.name)
      callback()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật chủ đề')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l shadow-2xl">
      <SheetHeader className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-900 shadow-inner">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Cập Nhật Chủ Đề</SheetTitle>
            <SheetDescription className="text-gray-500 font-medium mt-1">
              Chỉnh sửa thông tin cho: <span className="text-zinc-900 font-bold">{topic.name}</span>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Separator className="bg-gray-100" />

      <ScrollArea className="flex-1">
        <Form {...form}>
          <form id="form-update-vocabulary-topic" onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-zinc-900 font-black uppercase text-[11px] tracking-[0.2em]">
                <Tag className="w-4 h-4" />
                Thông Tin Cơ Bản
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                        Tên Chủ Đề <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Food & Drinks, Travel, Technology..."
                          className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-zinc-900 font-bold px-4 shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] font-bold ml-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Trình Độ <span className="text-rose-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-zinc-900 font-bold px-4 shadow-sm">
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                          {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                            <SelectItem key={lvl} value={lvl} className="rounded-xl font-bold">{lvl}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px] font-bold ml-1" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Section: Media */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-zinc-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <ImageIcon className="w-4 h-4" />
                Hình Ảnh Đại Diện
              </div>

              <div className="bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100 space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                          Ảnh Chủ Đề <span className="text-rose-500">*</span>
                        </FormLabel>
                        {imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImageUrl("")
                              form.setValue("image", "")
                            }}
                            className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Gỡ ảnh
                          </Button>
                        )}
                      </div>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center gap-4">
                          {!imageUrl ? (
                            <DialogImageToMedia
                              onSelect={(image: ImagePick) => {
                                form.setValue("image", image._id || "")
                                setImageUrl(image.url)
                              }}
                            >
                              <div className="w-full h-40 border-2 border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer group">
                                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                  <ImageIcon className="w-6 h-6 text-zinc-500" />
                                </div>
                                <p className="text-xs font-black text-zinc-600 uppercase tracking-wider">Chọn ảnh từ thư viện</p>
                              </div>
                            </DialogImageToMedia>
                          ) : (
                            <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                              <Image
                                src={imageUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <DialogImageToMedia
                                  onSelect={(image: ImagePick) => {
                                    form.setValue("image", image._id || "")
                                    setImageUrl(image.url)
                                  }}
                                >
                                  <Button type="button" variant="secondary" className="rounded-full font-bold">Thay đổi ảnh</Button>
                                </DialogImageToMedia>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] font-bold ml-1" />
                    </FormItem>
                  )}
                />
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
                      {topic.createdBy?.fullName?.[0] || 'A'}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{topic.createdBy?.fullName || 'Admin'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Ngày khởi tạo
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {topic.createdAt ? format(new Date(topic.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '---'}
                  </div>
                </div>
              </div>
            </section>
          </form>
        </Form>
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
            type="submit"
            form="form-update-vocabulary-topic"
            disabled={loading} 
            className="h-12 px-10 rounded-2xl bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-200 font-black transition-all active:scale-95"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            {loading ? 'Đang Xử Lý...' : 'Cập Nhật'}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
