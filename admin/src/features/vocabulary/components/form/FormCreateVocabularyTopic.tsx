'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { DialogImageToMedia } from "@/components/common/dialog"
import { useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { createVocabularyTopic } from "../../services/api"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"

type ImagePick = { _id?: string; url: string }

const schema = z.object({
  name: z.string().min(2, "Tên chủ đề phải có ít nhất 2 ký tự"),
  image: z.string().min(1, "Ảnh chủ đề không được để trống"),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"])
})

type FormData = z.infer<typeof schema>

interface FormCreateVocabularyTopicProps {
  setIsLoading: (isLoading: boolean) => void
  callback: () => void
}

export default function FormCreateVocabularyTopic({ setIsLoading, callback }: FormCreateVocabularyTopicProps) {
  const [url, setUrl] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      image: "",
      level: 'A1'
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await createVocabularyTopic(data as any)
      .then((res) => {
        toast.success('Đã tạo chủ đề ' + res?.data?.name)
      })
      .finally(() => {
        form.reset()
        setUrl("")
        setIsLoading(false)
        callback()
      })
  }

  return (
    <Form {...form}>
      <form id="form-create-vocabulary-topic" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Tên chủ đề <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên chủ đề..."
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
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Trình độ <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
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
