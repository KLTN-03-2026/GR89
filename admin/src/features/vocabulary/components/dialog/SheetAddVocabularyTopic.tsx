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
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Book,
  Tag,
  Layers,
  Image as ImageIcon,
  Trash2,
  Save,
  X,
  Loader2,
  Sparkles
} from "lucide-react"
import { createVocabularyTopic } from "../../services/api"
import { toast } from "react-toastify"
import { DialogImageToMedia } from "@/components/common/dialog"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const schema = z.object({
  name: z.string().min(2, "Tên chủ đề phải có ít nhất 2 ký tự"),
  image: z.string().min(1, "Ảnh chủ đề không được để trống"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"])
})

type FormData = z.infer<typeof schema>
type ImagePick = { _id?: string; url: string }

export function SheetAddVocabularyTopic({ callback }: { callback: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      image: "",
      level: 'A1'
    }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await createVocabularyTopic(data as any)
      toast.success('Đã tạo chủ đề ' + data.name)
      setOpen(false)
      form.reset()
      setImageUrl("")
      callback()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo chủ đề')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-11 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Thêm chủ đề mới
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l">
        <SheetHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-900">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-zinc-900">Thêm Chủ Đề Mới</SheetTitle>
              <SheetDescription className="text-zinc-500 text-sm mt-1">
                Tạo bộ từ vựng mới theo chủ đề và trình độ.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <Form {...form}>
            <form id="form-create-vocabulary-topic" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Section: Basic Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                  <Tag className="w-4 h-4" />
                  Thông Tin Cơ Bản
                </div>

                <div className="grid grid-cols-1 gap-4 bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                          Tên Chủ Đề <span className="text-zinc-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Food & Drinks, Travel, Technology..."
                            className="h-11 bg-white border-zinc-200 rounded-lg font-medium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> Trình Độ <span className="text-zinc-400">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-zinc-200 rounded-lg font-medium">
                                <SelectValue placeholder="Chọn trình độ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                                <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Section: Media */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                  <ImageIcon className="w-4 h-4" />
                  Hình Ảnh Đại Diện
                </div>

                <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                            Ảnh Chủ Đề <span className="text-zinc-400">*</span>
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
                              className="h-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg font-bold text-xs"
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
                                <div className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-zinc-100 hover:border-zinc-400 transition-all cursor-pointer">
                                  <ImageIcon className="w-6 h-6 text-zinc-400" />
                                  <p className="text-xs font-bold text-zinc-400 uppercase">Chọn ảnh từ thư viện</p>
                                </div>
                              </DialogImageToMedia>
                            ) : (
                              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-zinc-200">
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
                                    <Button type="button" variant="secondary" className="rounded-lg font-bold">Thay đổi ảnh</Button>
                                  </DialogImageToMedia>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </form>
          </Form>
        </ScrollArea>

        <Separator />

        <SheetFooter className="p-6 bg-white border-t">
          <div className="flex items-center justify-end gap-3 w-full">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="h-11 px-6 rounded-lg font-bold text-zinc-600"
                disabled={loading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="form-create-vocabulary-topic"
              disabled={loading}
              className="h-11 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Đang Xử Lý...' : 'Lưu Chủ Đề'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
