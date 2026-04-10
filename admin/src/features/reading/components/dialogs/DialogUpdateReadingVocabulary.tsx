'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateReadingVocabulary } from "@/features/reading/services/api"
import { Vocabulary } from '@/features/reading/types'
import { Pencil, Languages, Type, Book, MessageSquare, X, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  readingId: string
  vocab: Vocabulary
  callback: () => void
}

export function DialogUpdateReadingVocabulary({ readingId, vocab, callback }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Vocabulary>({ ...vocab })

  useEffect(() => {
    if (vocab) {
      setData({ ...vocab })
    }
  }, [vocab])

  const handleUpdate = async () => {
    if (!data.word.trim()) {
      toast.error('Vui lòng nhập từ vựng')
      return
    }
    if (!vocab._id) {
      toast.error('Không tìm thấy ID từ vựng')
      return
    }

    setIsLoading(true)
    try {
      await updateReadingVocabulary(readingId, vocab._id, data)
      toast.success('Cập nhật từ vựng thành công')
      callback()
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cập nhật từ vựng thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setOpen(true) }}>
        <Pencil className="h-4 w-4 mr-2" />
        Sửa
      </DropdownMenuItem>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="h-full sm:max-w-md flex flex-col p-0 overflow-hidden">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              Cập nhật từ vựng
            </SheetTitle>
            <SheetDescription>Chỉnh sửa thông tin từ vựng: <span className="font-bold text-foreground">{vocab.word}</span></SheetDescription>
          </SheetHeader>

          <Separator />

          <ScrollArea className="flex-1 min-h-0 px-6 py-4">
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
            <Button className="flex-1 shadow-sm" disabled={isLoading} onClick={handleUpdate}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Đang cập nhật..." : "Cập nhật thay đổi"}
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
    </>
  )
}
