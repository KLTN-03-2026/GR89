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
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Type, 
  Languages, 
  FileText, 
  Quote, 
  Image as ImageIcon, 
  Trash2, 
  Save, 
  X,
  Loader2,
  Sparkles,
  History,
  User as UserIcon
} from "lucide-react"
import { updateVocabulary } from "../../services/api"
import { toast } from "react-toastify"
import { DialogImageToMedia } from "@/components/common/dialog"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Vocabulary } from "../../types"
import { useParams } from 'next/navigation'
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const schema = z.object({
  word: z.string().min(1, "Từ vựng không được để trống"),
  transcription: z.string().min(1, "Phát âm không được để trống"),
  partOfSpeech: z.string().min(1, "Loại từ không được để trống"),
  definition: z.string().min(1, "Định nghĩa không được để trống"),
  vietnameseMeaning: z.string().min(1, "Nghĩa tiếng Việt không được để trống"),
  example: z.string().min(1, "Ví dụ không được để trống"),
  image: z.string().min(1, "Ảnh không được để trống"),
})

type FormData = z.infer<typeof schema>
type ImagePick = { _id?: string; url: string }

interface SheetUpdateVocabularyProps {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  vocabulary: Vocabulary
  onSuccess: () => void
}

export function SheetUpdateVocabulary({ isOpen, setIsOpen, vocabulary, onSuccess }: SheetUpdateVocabularyProps) {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState((vocabulary.image as any)?.url || "")
  const { id: topicId } = useParams()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      word: vocabulary.word,
      transcription: vocabulary.transcription,
      partOfSpeech: vocabulary.partOfSpeech,
      definition: vocabulary.definition,
      vietnameseMeaning: vocabulary.vietnameseMeaning,
      example: vocabulary.example,
      image: (vocabulary.image as any)?._id || "",
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        word: vocabulary.word,
        transcription: vocabulary.transcription,
        partOfSpeech: vocabulary.partOfSpeech,
        definition: vocabulary.definition,
        vietnameseMeaning: vocabulary.vietnameseMeaning,
        example: vocabulary.example,
        image: (vocabulary.image as any)?._id || "",
      })
      setImageUrl((vocabulary.image as any)?.url || "")
    }
  }, [isOpen, vocabulary, form])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await updateVocabulary(vocabulary._id, { ...data, vocabularyTopicId: topicId as string })
      toast.success('Đã cập nhật từ vựng: ' + data.word)
      setIsOpen(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật từ vựng')
    } finally {
      setLoading(false)
    }
  }

  const partOfSpeechs = [
    { label: 'Danh từ (Noun)', value: 'Noun' },
    { label: 'Động từ (Verb)', value: 'Verb' },
    { label: 'Tính từ (Adjective)', value: 'Adjective' },
    { label: 'Trạng từ (Adverb)', value: 'Adverb' },
    { label: 'Giới từ (Preposition)', value: 'Preposition' },
    { label: 'Liên từ (Conjunction)', value: 'Conjunction' },
    { label: 'Thán từ (Interjection)', value: 'Interjection' },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-2xl flex flex-col p-0 border-l">
        <SheetHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-900">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-zinc-900">Cập Nhật Từ Vựng</SheetTitle>
              <SheetDescription className="text-zinc-500 text-sm mt-1">
                Chỉnh sửa thông tin cho: <span className="text-zinc-900 font-bold">{vocabulary.word}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <Form {...form}>
            <form id="form-update-vocabulary" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Section: Word & Phonetic */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                  <Sparkles className="w-4 h-4" />
                  Định Danh & Phát Âm
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                  <FormField
                    control={form.control}
                    name="word"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                          Từ Vựng <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Serendipity"
                            className="h-11 bg-white border-zinc-200 rounded-lg font-bold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transcription"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                          Phiên Âm <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: /ˌserənˈdipədē/"
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
                    name="partOfSpeech"
                    render={({ field }) => (
                      <FormItem className="space-y-2 col-span-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                          Loại Từ <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white border-zinc-200 rounded-lg font-medium">
                              <SelectValue placeholder="Chọn loại từ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partOfSpeechs.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Section: Meaning */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                  <Languages className="w-4 h-4" />
                  Ý Nghĩa & Định Nghĩa
                </div>

                <div className="grid grid-cols-1 gap-4 bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                  <FormField
                    control={form.control}
                    name="vietnameseMeaning"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                          Nghĩa Tiếng Việt <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Sự tình cờ may mắn"
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
                    name="definition"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Định Nghĩa Tiếng Anh <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="The occurrence and development of events by chance..."
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
                    name="example"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                          <Quote className="w-3.5 h-3.5" /> Ví Dụ <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nature has created many wonderful things by serendipity."
                            className="h-11 bg-white border-zinc-200 rounded-lg font-medium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Section: Visual */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase text-xs">
                  <ImageIcon className="w-4 h-4" />
                  Hình Ảnh Minh Họa
                </div>

                <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-bold text-zinc-500 uppercase">
                            Ảnh Minh Họa <span className="text-rose-500">*</span>
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
                              className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs"
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
                                  <p className="text-xs font-bold text-zinc-400 uppercase">Chọn ảnh minh họa</p>
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
              form="form-update-vocabulary"
              disabled={loading} 
              className="h-11 px-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Đang Xử Lý...' : 'Cập Nhật'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
