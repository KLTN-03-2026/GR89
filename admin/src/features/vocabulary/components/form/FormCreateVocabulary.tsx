'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { DialogImageToMedia } from "@/components/common/dialog"
import { useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVocabulary } from "../../services/api"
import { toast } from "react-toastify"

type ImagePick = { _id?: string; url: string }

const schema = z.object({
  word: z.string().min(1, "Từ vựng không được để trống"),
  transcription: z.string().min(1, "Phát âm không được để trống"),
  partOfSpeech: z.string().min(1, "Từ vựng không được để trống"),
  definition: z.string().min(1, "Định nghĩa không được để trống"),
  vietnameseMeaning: z.string().min(1, "Nghĩa tiếng Việt không được để trống"),
  example: z.string().min(1, "Ví dụ không được để trống"),
  image: z.string().min(1, "Ảnh chủ đề không được để trống"),
  vocabularyTopicId: z.string().min(1, "Chủ đề không được để trống")
})

type FormData = z.infer<typeof schema>

interface FormCreateVocabularyProps {
  setIsLoading: (isLoading: boolean) => void
  callback: () => void
  topicId: string
  onSuccess?: () => void
}

export default function FormCreateVocabulary({ setIsLoading, callback, topicId, onSuccess }: FormCreateVocabularyProps) {
  const [url, setUrl] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      word: "",
      transcription: "",
      partOfSpeech: "",
      definition: "",
      vietnameseMeaning: "",
      example: "",
      image: "",
      vocabularyTopicId: topicId
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await createVocabulary(data)
      .then(() => {
        toast.success('Thêm từ vựng thành công')
        callback()
        onSuccess?.()
      })
      .finally(() => {
        form.reset()
        setUrl("")
        setIsLoading(false)
      })
  }

  const partOfSpeechs = [
    { label: 'Danh từ', value: 'Noun' },
    { label: 'Động từ', value: 'Verb' },
    { label: 'Tính từ', value: 'Adjective' },
    { label: 'Trạng từ', value: 'Adverb' },
    { label: 'Giới từ', value: 'Preposition' },
    { label: 'Liên từ', value: 'Conjunction' },
    { label: 'Cụm từ', value: 'Interjection' },
  ]

  return (
    <Form {...form}>
      <form id="form-create-vocabulary" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="word"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Từ vựng <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập từ vựng..."
                    {...field}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transcription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Phiên âm <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập phiên âm..."
                    {...field}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vietnameseMeaning"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Nghĩa tiếng Việt <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập nghĩa tiếng Việt..."
                    {...field}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partOfSpeech"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Loại từ <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full py-5">
                      <SelectValue placeholder="Chọn loại từ" />
                    </SelectTrigger>

                    <SelectContent>
                      {partOfSpeechs.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Định nghĩa <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập định nghĩa..."
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="example"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Ví dụ <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập ví dụ..."
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Ảnh chủ đề <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <DialogImageToMedia
                    onSelect={(image: ImagePick) => {
                      form.setValue("image", image._id || "")
                      setUrl(image.url)
                    }}
                  />

                  {url && (
                    <div className="relative w-24 h-24 rounded-md border">
                      <Image
                        src={url}
                        alt="Ảnh chủ đề"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setUrl("")
                          form.setValue("image", "")
                        }}
                        className="absolute right-2 cursor-pointer top-2 text-sm text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
