'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Type, Languages, Book, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { updateExampleIpa } from '@/features/IPA/services/api'
import { Example } from '@/features/IPA/types'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

interface DialogUpdateIpaExampleProps {
  ipaId: string
  example: Example
  callback: () => void
}

export function DialogUpdateIpaExample({ ipaId, example, callback }: DialogUpdateIpaExampleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState({
    word: "",
    phonetic: "",
    vietnamese: ""
  })

  useEffect(() => {
    if (example) {
      setData({
        word: example.word || "",
        phonetic: example.phonetic || "",
        vietnamese: example.vietnamese || ""
      })
    }
  }, [example])

  const handleUpdate = async () => {
    if (!data.word.trim() || !data.phonetic.trim() || !data.vietnamese.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (!example._id) {
      toast.error('Không tìm thấy ID ví dụ')
      return
    }

    setIsLoading(true)
    try {
      await updateExampleIpa(ipaId, example._id, data)
      toast.success('Cập nhật ví dụ thành công')
      callback()
      setIsOpen(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Cập nhật ví dụ thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpen(true) }}>
        <Edit className="h-4 w-4 mr-2" />
        Sửa
      </DropdownMenuItem>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="h-full sm:max-w-md flex flex-col p-0 overflow-hidden">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              Cập nhật ví dụ
            </SheetTitle>
            <SheetDescription>Chỉnh sửa ví dụ: <span className="font-bold text-foreground">{example.word}</span></SheetDescription>
          </SheetHeader>

          <Separator />

          <div className="flex-1 px-6 py-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="word-update" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Type className="h-3 w-3" />
                  Từ vựng *
                </Label>
                <Input
                  id="word-update"
                  placeholder="VD: Apple, Cat, Fish..."
                  value={data.word}
                  onChange={(e) => setData(prev => ({ ...prev, word: e.target.value }))}
                  className="focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonetic-update" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Book className="h-3 w-3" />
                  Phiên âm IPA *
                </Label>
                <Input
                  id="phonetic-update"
                  placeholder="VD: /ˈæp.əl/"
                  value={data.phonetic}
                  onChange={(e) => setData(prev => ({ ...prev, phonetic: e.target.value }))}
                  className="focus-visible:ring-primary font-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vietnamese-update" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <Languages className="h-3 w-3" />
                  Nghĩa tiếng Việt *
                </Label>
                <Input
                  id="vietnamese-update"
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
            <Button className="flex-1 shadow-sm" onClick={handleUpdate} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật thay đổi'}
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
