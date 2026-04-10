'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Type, Languages, Book, Save, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { addExampleIpa } from '@/features/IPA/services/api'
import { Separator } from '@/components/ui/separator'

interface DialogAddIpaExampleProps {
  ipaId: string
  callback: () => void
}

export function DialogAddIpaExample({ ipaId, callback }: DialogAddIpaExampleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState({
    word: "",
    phonetic: "",
    vietnamese: ""
  })

  const handleCreate = async () => {
    if (!data.word.trim() || !data.phonetic.trim() || !data.vietnamese.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      await addExampleIpa(ipaId, data)
      toast.success('Thêm ví dụ thành công')
      callback()
      setIsOpen(false)
      setData({ word: "", phonetic: "", vietnamese: "" })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm ví dụ
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full sm:max-w-md flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Thêm ví dụ mới
          </SheetTitle>
          <SheetDescription>Bổ sung từ vựng ví dụ minh họa cho âm IPA này</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 px-6 py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word-add" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <Type className="h-3 w-3" />
                Từ vựng *
              </Label>
              <Input
                id="word-add"
                placeholder="VD: Apple, Cat, Fish..."
                value={data.word}
                onChange={(e) => setData(prev => ({ ...prev, word: e.target.value }))}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phonetic-add" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <Book className="h-3 w-3" />
                Phiên âm IPA *
              </Label>
              <Input
                id="phonetic-add"
                placeholder="VD: /ˈæp.əl/"
                value={data.phonetic}
                onChange={(e) => setData(prev => ({ ...prev, phonetic: e.target.value }))}
                className="focus-visible:ring-primary font-serif"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vietnamese-add" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                <Languages className="h-3 w-3" />
                Nghĩa tiếng Việt *
              </Label>
              <Input
                id="vietnamese-add"
                placeholder="VD: Quả táo"
                value={data.vietnamese}
                onChange={(e) => setData(prev => ({ ...prev, vietnamese: e.target.value }))}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6 bg-muted/10 flex gap-3">
          <Button className="flex-1 shadow-sm" onClick={handleCreate} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Đang thêm...' : 'Lưu ví dụ'}
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
