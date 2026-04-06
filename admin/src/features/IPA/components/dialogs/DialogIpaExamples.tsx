'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, BookOpen, Save, Trash2, Edit, Type, Languages, Book, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { addExampleIpa, updateExampleIpa, deleteExampleIpa } from '@/features/IPA/services/api'
import { Ipa } from '@/features/IPA/types'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'

interface Example {
  _id?: string
  word: string
  phonetic: string
  vietnamese: string
}

interface DialogIpaExamplesProps {
  ipa: Ipa
  callback: () => void
}

export function DialogIpaExamples({ ipa, callback }: DialogIpaExamplesProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [examples, setExamples] = useState<Example[]>([])
  const [newExample, setNewExample] = useState({
    word: "",
    phonetic: "",
    vietnamese: ""
  })

  useEffect(() => {
    if (ipa?.examples) {
      setExamples(ipa.examples)
    }
  }, [ipa])

  const handleAddExample = async () => {
    if (!newExample.word.trim() || !newExample.phonetic.trim() || !newExample.vietnamese.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin ví dụ')
      return
    }

    setIsLoading(true)
    try {
      await addExampleIpa(ipa._id, newExample)
      toast.success('Thêm ví dụ thành công')
      callback()
      setNewExample({ word: "", phonetic: "", vietnamese: "" })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateExample = async (exampleId: string, updatedExample: Example) => {
    setIsLoading(true)
    try {
      await updateExampleIpa(ipa._id, exampleId, updatedExample)
      toast.success('Cập nhật ví dụ thành công')
      callback()
    } catch (error) {
      toast.error('Cập nhật thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExample = async (exampleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ví dụ này?')) return

    setIsLoading(true)
    try {
      await deleteExampleIpa(ipa._id, exampleId)
      toast.success('Xóa ví dụ thành công')
      callback()
    } catch (error) {
      toast.error('Xóa thất bại')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="w-full justify-start hover:bg-primary/5 hover:text-primary transition-colors">
          <BookOpen className="h-4 w-4 mr-2" />
          Quản lý ví dụ ({examples.length})
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            Quản lý ví dụ IPA
          </SheetTitle>
          <SheetDescription>Danh sách từ vựng ví dụ cho âm: <span className="font-bold text-foreground font-serif">{ipa.sound}</span></SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-8 pb-10">
            {/* Add new example section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Plus className="h-4 w-4" />
                THÊM VÍ DỤ MỚI
              </div>
              <Card className="shadow-none border-dashed bg-muted/20">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <Type className="h-3 w-3" /> Từ vựng *
                      </Label>
                      <Input
                        placeholder="VD: Cat"
                        value={newExample.word}
                        onChange={(e) => setNewExample(prev => ({ ...prev, word: e.target.value }))}
                        className="h-9 text-sm focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <Book className="h-3 w-3" /> Phiên âm *
                      </Label>
                      <Input
                        placeholder="VD: /kæt/"
                        value={newExample.phonetic}
                        onChange={(e) => setNewExample(prev => ({ ...prev, phonetic: e.target.value }))}
                        className="h-9 text-sm focus-visible:ring-primary font-serif"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <Languages className="h-3 w-3" /> Nghĩa Việt *
                      </Label>
                      <Input
                        placeholder="VD: Con mèo"
                        value={newExample.vietnamese}
                        onChange={(e) => setNewExample(prev => ({ ...prev, vietnamese: e.target.value }))}
                        className="h-9 text-sm focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddExample} disabled={isLoading} className="w-full h-9 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm vào danh sách
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Display examples list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Info className="h-4 w-4" />
                  DANH SÁCH VÍ DỤ ({examples.length})
                </div>
              </div>
              
              {examples.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/10">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground italic">Chưa có ví dụ nào được thêm.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <ExampleItem
                      key={example._id || index}
                      example={example}
                      onUpdate={handleUpdateExample}
                      onDelete={handleDeleteExample}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6 bg-muted/10 flex justify-end">
          <SheetClose asChild>
            <Button variant="outline" className="min-w-[100px] shadow-sm">
              <X className="h-4 w-4 mr-2" />
              Đóng
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Sub-component for each example item
function ExampleItem({
  example,
  onUpdate,
  onDelete,
  isLoading
}: {
  example: Example
  onUpdate: (id: string, updatedExample: Example) => void
  onDelete: (id: string) => void
  isLoading: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(example)

  const handleSave = () => {
    if (example._id) {
      onUpdate(example._id, editData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditData(example)
    setIsEditing(false)
  }

  return (
    <Card className={`group transition-all duration-200 ${isEditing ? 'border-primary shadow-md' : 'shadow-none hover:border-primary/50 hover:bg-primary/5'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {isEditing ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Từ vựng</Label>
                <Input
                  value={editData.word}
                  onChange={(e) => setEditData(prev => ({ ...prev, word: e.target.value }))}
                  className="h-8 text-sm focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Phiên âm</Label>
                <Input
                  value={editData.phonetic}
                  onChange={(e) => setEditData(prev => ({ ...prev, phonetic: e.target.value }))}
                  className="h-8 text-sm focus-visible:ring-primary font-serif"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nghĩa Việt</Label>
                <Input
                  value={editData.vietnamese}
                  onChange={(e) => setEditData(prev => ({ ...prev, vietnamese: e.target.value }))}
                  className="h-8 text-sm focus-visible:ring-primary"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 py-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Từ vựng</span>
                <span className="font-bold text-primary">{example.word}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phiên âm</span>
                <span className="font-serif text-sm text-foreground/80">{example.phonetic}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nghĩa Việt</span>
                <span className="text-sm italic">{example.vietnamese}</span>
              </div>
            </div>
          )}

          <div className="flex gap-1 pt-1">
            {isEditing ? (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => example._id && onDelete(example._id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
