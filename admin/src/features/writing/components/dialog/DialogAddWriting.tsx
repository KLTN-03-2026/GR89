'use client'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createWriting } from '@/features/writing/services/api'
import { Plus, Trash2, PenTool, Info, Settings, Lightbulb, ListOrdered, X, Save, Clock, Type, CheckCircle2, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { SheetFooter } from '@/components/ui/sheet'

export function DialogAddWriting({ callback }: { callback: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    title: '',
    description: '',
    level: 'A1',
    minWords: 0,
    maxWords: 0,
    duration: 0,
    suggestedVocabulary: [] as string[],
    suggestedStructure: [
      { title: '', description: '', step: 1 },
      { title: '', description: '', step: 2 },
      { title: '', description: '', step: 3 },
    ],
    isActive: true,
  })

  const handleCreateWriting = async () => {
    if (!data.title.trim() || !data.level) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    try {
      await createWriting(data as any)
      callback()
      toast.success('Tạo bài viết thành công')
      setOpen(false)
      setData({
        title: '',
        description: '',
        level: 'A1',
        minWords: 0,
        maxWords: 0,
        duration: 0,
        suggestedVocabulary: [] as string[],
        suggestedStructure: [
          { title: '', description: '', step: 1 },
          { title: '', description: '', step: 2 },
          { title: '', description: '', step: 3 },
        ],
        isActive: true,
      })
    } catch (error) {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-6 rounded-xl font-bold transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Thêm bài viết mới
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thiết Kế Bài Viết</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Tạo bài tập viết với các yêu cầu, giới hạn và cấu trúc gợi ý.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            {/* Thông tin cơ bản */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-primary font-black uppercase text-[11px] tracking-[0.2em]">
                <Info className="h-4 w-4" />
                Thông Tin Cơ Bản
              </div>
              <div className="grid grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="col-span-3 space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tiêu đề bài viết <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Input
                    placeholder="VD: Writing an email to a friend..."
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Trình độ <span className="text-rose-500 text-lg">*</span>
                  </Label>
                  <Select value={data.level} onValueChange={(value) => setData({ ...data, level: value })}>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-primary font-bold px-4 shadow-sm">
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl} className="rounded-xl font-bold">{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Mô tả yêu cầu chi tiết
                  </Label>
                  <Textarea
                    placeholder="Nhập yêu cầu chi tiết cho bài viết để học viên hiểu rõ cần phải viết gì..."
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    className="bg-white border-gray-200 rounded-2xl focus:ring-primary font-medium px-4 py-3 min-h-[100px] resize-none shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Cấu hình giới hạn */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Settings className="h-4 w-4" />
                Cấu Hình Giới Hạn
              </div>
              <div className="grid grid-cols-3 gap-6 bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50 shadow-sm">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-blue-700/60 uppercase ml-1 flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> Số từ tối thiểu
                  </Label>
                  <Input
                    type="number"
                    value={data.minWords}
                    onChange={(e) => setData({ ...data, minWords: parseInt(e.target.value) || 0 })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-black px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-blue-700/60 uppercase ml-1 flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> Số từ tối đa
                  </Label>
                  <Input
                    type="number"
                    value={data.maxWords}
                    onChange={(e) => setData({ ...data, maxWords: parseInt(e.target.value) || 0 })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-black px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-blue-700/60 uppercase ml-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Thời gian (phút)
                  </Label>
                  <Input
                    type="number"
                    value={data.duration}
                    onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) || 0 })}
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-black px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Gợi ý & Hỗ trợ */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Lightbulb className="h-4 w-4" />
                Gợi Ý & Hỗ Trợ
              </div>
              <div className="space-y-8 bg-amber-50/30 p-8 rounded-[2.5rem] border border-amber-100/50 shadow-sm">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-amber-700/70 uppercase ml-1 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> Từ vựng gợi ý
                  </Label>
                  <Textarea
                    placeholder="VD: Excellent, beautiful, however, therefore... (cách nhau bởi dấu phẩy)"
                    value={data.suggestedVocabulary.join(', ')}
                    onChange={(e) =>
                      setData({ ...data, suggestedVocabulary: e.target.value.split(',').map((line) => line.trim()) })
                    }
                    className="bg-white border-gray-200 rounded-3xl focus:ring-amber-500 font-medium px-6 py-4 min-h-[80px] resize-none shadow-sm"
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-xs font-black text-amber-700/70 uppercase flex items-center gap-2">
                      <ListOrdered className="h-4 w-4" /> Cấu trúc gợi ý
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 rounded-full border-amber-200 bg-white hover:bg-amber-50 text-amber-600 font-black text-[10px] uppercase shadow-sm transition-all active:scale-95"
                      onClick={() => {
                        const newStep = {
                          title: '',
                          description: '',
                          step: data.suggestedStructure.length + 1,
                        }
                        setData({ ...data, suggestedStructure: [...data.suggestedStructure, newStep] })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Thêm bước
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {data.suggestedStructure.map((structure, index) => (
                      <div key={index} className="bg-white/80 p-5 rounded-3xl border border-amber-100 shadow-sm group relative animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-600 text-white text-xs font-black shadow-lg shadow-amber-100">
                              {structure.step}
                            </div>
                            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Gợi ý Bước {structure.step}</span>
                          </div>
                          {data.suggestedStructure.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => {
                                const newStructure = data.suggestedStructure.filter((_, i) => i !== index)
                                const updatedStructure = newStructure.map((item, i) => ({
                                  ...item,
                                  step: i + 1,
                                }))
                                setData({ ...data, suggestedStructure: updatedStructure })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tiêu đề bước</Label>
                            <Input
                              placeholder="VD: Introduction..."
                              value={structure.title}
                              onChange={(e) => {
                                const newStructure = [...data.suggestedStructure]
                                newStructure[index].title = e.target.value
                                setData({ ...data, suggestedStructure: newStructure })
                              }}
                              className="h-10 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-bold text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mô tả yêu cầu</Label>
                            <Input
                              placeholder="VD: Viết 2-3 câu giới thiệu..."
                              value={structure.description}
                              onChange={(e) => {
                                const newStructure = [...data.suggestedStructure]
                                newStructure[index].description = e.target.value
                                setData({ ...data, suggestedStructure: newStructure })
                              }}
                              className="h-10 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-bold text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95" disabled={isLoading}>
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button className="h-12 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-black transition-all active:scale-95" onClick={handleCreateWriting} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Đang Lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Phát Hành Bài Viết
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
