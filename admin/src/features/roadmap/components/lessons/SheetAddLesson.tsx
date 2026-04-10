'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoadmapAvailableLesson } from '@/features/roadmap/types'
import { createLesson, getRoadmapLessonsByType } from '@/features/roadmap/services/api'
import { toast } from 'react-toastify'
import { 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Layers, 
  X, 
  Save, 
  Loader2, 
  Info,
  Sparkles,
  Zap,
  Target
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface SheetAddLessonProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  roadmapId: string
  lessonType: 'vocabulary' | 'grammar' | 'ipa' | 'listening' | 'speaking' | 'reading' | 'writing' | 'review'
  lessonTypeLabel: string
  onLessonsChange?: () => void
}

export function SheetAddLesson({
  isOpen,
  onOpenChange,
  roadmapId,
  lessonType,
  lessonTypeLabel,
  onLessonsChange
}: SheetAddLessonProps) {
  const [lessons, setLessons] = useState<RoadmapAvailableLesson[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isFetchingLessons, setIsFetchingLessons] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setLessons([])
      setSelectedLessonId(null)
      setSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const fetchLessonsByType = async () => {
      setIsFetchingLessons(true)
      try {
        const res = await getRoadmapLessonsByType(lessonType)
        if (res.success) {
          setLessons(res.data || [])
        } else {
          toast.error(res.message || 'Không thể tải danh sách bài học')
          setLessons([])
        }
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu bài học')
      } finally {
        setIsFetchingLessons(false)
      }
    }

    fetchLessonsByType()
  }, [isOpen, lessonType])

  const filteredLessons = lessons.filter((lesson) => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return true
    return lesson.title.toLowerCase().includes(keyword) || (lesson.description || '').toLowerCase().includes(keyword)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLessonId) return

    setIsLoading(true)
    try {
      const res = await createLesson(roadmapId, lessonType, selectedLessonId)
      toast.success(res.message || 'Thêm bài học thành công')
      onOpenChange(false)
      onLessonsChange?.()
    } catch (error) {
      toast.error('Lỗi khi thêm bài học')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thêm Bài Học</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Chọn bài học từ kho dữ liệu: <span className="text-amber-600 font-bold">{lessonTypeLabel}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="p-8 pb-4 space-y-6 flex flex-col flex-1 min-h-0">
            {/* Search area */}
            <div className="space-y-2.5">
              <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Tìm kiếm bài học
              </Label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập tên bài học hoặc mô tả..."
                  className="pl-11 h-12 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-amber-500 font-bold px-4 shadow-sm transition-all"
                  disabled={isLoading || isFetchingLessons}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5 text-amber-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Target className="w-4 h-4" />
                Kết quả khả dụng
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 rounded-lg px-3 py-1 font-bold text-[10px]">
                {filteredLessons.length} bài học
              </Badge>
            </div>

            {/* Lessons List area */}
            <div className="flex-1 bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-3">
                  {isFetchingLessons ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 animate-pulse">
                      <div className="p-4 bg-white rounded-3xl shadow-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-amber-600/50">Đang truy xuất dữ liệu...</p>
                    </div>
                  ) : filteredLessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                      <div className="p-4 bg-white rounded-3xl shadow-sm">
                        <Search className="h-8 w-8 text-gray-200" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 italic">Không tìm thấy bài học nào phù hợp.</p>
                    </div>
                  ) : (
                    filteredLessons.map((lesson) => {
                      const isSelected = selectedLessonId === lesson._id
                      return (
                        <button
                          key={lesson._id}
                          type="button"
                          onClick={() => setSelectedLessonId(lesson._id)}
                          className={`group w-full rounded-2xl border-2 px-5 py-5 text-left transition-all duration-300 relative overflow-hidden ${isSelected
                            ? 'border-amber-500 bg-white shadow-xl shadow-amber-100 -translate-y-0.5'
                            : 'border-transparent bg-white/50 hover:bg-white hover:border-amber-200'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className={`font-black text-sm transition-colors ${isSelected ? 'text-amber-600' : 'text-gray-700'}`}>
                                {lesson.title}
                              </p>
                              <p className="mt-1.5 text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed">
                                {lesson.description || 'Không có mô tả chi tiết cho bài học này.'}
                              </p>
                            </div>
                            <div className={`mt-0.5 p-1 rounded-full transition-all duration-500 ${isSelected ? 'bg-amber-500 text-white scale-110 rotate-0' : 'bg-gray-100 text-gray-300 scale-90 rotate-12 opacity-0 group-hover:opacity-100'}`}>
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {!selectedLessonId && !isFetchingLessons && filteredLessons.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-700 text-[11px] font-bold animate-in fade-in slide-in-from-top-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span>Vui lòng chọn một bài học từ danh sách phía trên để tiếp tục.</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <SheetClose asChild>
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
                disabled={isLoading}
              >
                Hủy Bỏ
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || isFetchingLessons || !selectedLessonId} 
              className="h-12 px-10 rounded-2xl bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200 font-black transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {isLoading ? 'Đang Xử Lý...' : 'Xác Nhận Thêm'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
