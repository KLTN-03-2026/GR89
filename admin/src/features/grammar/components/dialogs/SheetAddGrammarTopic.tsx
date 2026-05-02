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
  Type, 
  Info, 
  Layers, 
  Save, 
  X,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react"
import { createGrammarTopic } from "../../services/api"
import { toast } from "react-toastify"

interface Props {
  callback: () => void
}

export function SheetAddGrammarTopic({ callback }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    title: '',
    description: '',
    level: 'A1'
  })

  const handleCreateGrammarTopic = async () => {
    if (!data.title.trim() || !data.level) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      const res = await createGrammarTopic(data as any)
      toast.success('Đã tạo chủ đề ' + res?.data?.title)
      callback()
      setOpen(false)
      setData({ title: '', description: '', level: 'A1' })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm chủ đề
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Thêm chủ đề mới</SheetTitle>
          <SheetDescription>
            Tạo một chủ đề ngữ pháp mới để quản lý các bài học.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title-add">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title-add"
              placeholder="Nhập tiêu đề chủ đề"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level-add">Trình độ <span className="text-destructive">*</span></Label>
            <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value })}>
              <SelectTrigger id="level-add">
                <SelectValue placeholder="Chọn trình độ" />
              </SelectTrigger>
              <SelectContent>
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description-add">Mô tả</Label>
            <Input
              id="description-add"
              placeholder="Nhập mô tả ngắn gọn"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
            />
          </div>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Hủy</Button>
          </SheetClose>
          <Button onClick={handleCreateGrammarTopic} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu chủ đề
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
