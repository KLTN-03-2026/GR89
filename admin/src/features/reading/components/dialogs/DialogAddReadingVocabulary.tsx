'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createReadingVocabulary } from "@/features/reading/services/api"
import { Vocabulary } from '@/features/reading/types'
import { Plus, Languages, Type, Book, MessageSquare, X, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DialogAddReadingVocabulary({ readingId, callback }: { readingId: string; callback: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Vocabulary>({ _id: '', word: '', phonetic: '', definition: '', vietnamese: '', example: '' })

  const handleAdd = async () => {
    if (!data.word.trim()) {
      toast.error('Vui lòng nhập từ vựng')
      return
    }
    setIsLoading(true)
    try {
      await createReadingVocabulary(readingId, data)
      toast.success('Thêm từ vựng thành công')
      callback()
      setOpen(false)
      setData({ _id: '', word: '', phonetic: '', definition: '', vietnamese: '', example: '' })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Thêm từ vựng
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            Thêm từ vựng mới
          </SheetTitle>
          <SheetDescription>Bổ sung từ vựng và định nghĩa cho bài đọc</SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-5 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Type className="h-3 w-3" />
                  Từ vựng *
                </Label>
                <Input
                  placeholder="VD: Excellent"
                  value={data.word}
                  onChange={(e) => setData({ ...data, word: e.target.value })}
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Book className="h-3 w-3" />
                  Phiên âm
                </Label>
                <Input
                  placeholder="VD: /ˈeksələnt/"
                  value={data.phonetic}
                  onChange={(e) => setData({ ...data, phonetic: e.target.value })}
                  className="focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <Languages className="h-3 w-3" />
                Nghĩa tiếng Việt
              </Label>
              <Input
                placeholder="VD: Xuất sắc, tuyệt vời"
                value={data.vietnamese}
                onChange={(e) => setData({ ...data, vietnamese: e.target.value })}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <Book className="h-3 w-3" />
                Định nghĩa (English)
              </Label>
              <Textarea
                placeholder="VD: Extremely good; outstanding..."
                rows={3}
                value={data.definition}
                onChange={(e) => setData({ ...data, definition: e.target.value })}
                className="resize-none focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Ví dụ sử dụng
              </Label>
              <Textarea
                placeholder="VD: She has an excellent memory."
                rows={3}
                value={data.example}
                onChange={(e) => setData({ ...data, example: e.target.value })}
                className="resize-none focus-visible:ring-primary"
              />
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6 bg-muted/10 flex gap-3">
          <Button className="flex-1 shadow-sm" disabled={isLoading} onClick={handleAdd}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Đang lưu..." : "Lưu từ vựng"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="flex-none shadow-sm" disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}


