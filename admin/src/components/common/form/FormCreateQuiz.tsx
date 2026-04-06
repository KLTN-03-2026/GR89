'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trash2 } from "lucide-react"
import { createQuiz } from "@/lib/apis/api"
import { toast } from "react-toastify"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

// Schema validation
const schema = z.object({
  assignment: z.string().min(1, "Đề bài không được để trống"),
  question: z.string().min(1, "Câu hỏi không được để trống"),
  type: z.enum(['Multiple Choice', 'Fill in the blank']),
  options: z.array(z.string()),
  answer: z.string().min(1, "Câu trả lời không được để trống"),
  explanation: z.string().min(1, "Câu giải thích không được để trống")
})

type FormData = z.infer<typeof schema>

interface FormCreateQuizProps {
  callback: () => void
}

export default function FormCreateQuiz({ callback }: FormCreateQuizProps) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      assignment: "",
      question: "",
      type: "Multiple Choice",
      options: [],
      answer: "",
      explanation: ""
    }
  })

  const types = ["Multiple Choice", "Fill in the blank"]

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await createQuiz(data)
      .then(() => {
        toast.success('Đã thêm câu hỏi')
      })
      .finally(() => {
        form.reset()
        setIsLoading(false)
        callback()
      })
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Thêm chủ đề quiz</DialogTitle>
        <DialogDescription>
          Thêm chủ đề quiz mới
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form id="form-create-quiz" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Từ vựng */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="assignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Đề bài <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập đề bài..."
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* phiên âm */}
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Câu hỏi <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập câu hỏi..."
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          {/* Loại câu hỏi */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Loại câu hỏi <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full py-5">
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>

                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lựa chọn */}
          {form.watch("type") === "Multiple Choice" && (
            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Lựa chọn <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((option, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={e => {
                              const newOptions = [...field.value];
                              newOptions[idx] = e.target.value;
                              field.onChange(newOptions);
                            }}
                            placeholder={`Lựa chọn ${idx + 1}`}
                            className="h-12 text-base"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = field.value.filter((_, i) => i !== idx);
                              field.onChange(newOptions);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => field.onChange([...field.value, `Lựa chọn ${[field.value.length + 1]}`])}
                        className="text-blue-500"
                      >
                        Thêm lựa chọn
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Đáp án */}
          {form.watch("type") === "Multiple Choice" ? (
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Đáp án <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full py-5">
                        <SelectValue placeholder="Chọn đáp án đúng" />
                      </SelectTrigger>
                      <SelectContent>
                        {form.watch("options").map((option, idx) => (
                          <SelectItem key={idx} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Đáp án <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập đáp án..."
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Giải thích */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Giải thích <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập giải thích..."
                    {...field}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Hủy</Button>
        </DialogClose>
        <Button
          type="submit"
          form="form-create-quiz"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}