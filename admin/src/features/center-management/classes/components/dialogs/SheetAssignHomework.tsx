'use client'

import React, { useState, useEffect } from 'react'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, FileText, BookOpenCheck, Info, Check, Search, X, Plus, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as DialogFooterUI } from '@/components/ui/dialog'
import { DocumentCard } from '@/features/center-management/documents/components/DocumentGrid/DocumentCard'
import { toast } from 'react-toastify'
import { getGlobalDocuments } from '@/features/center-management/documents/services/api'
import { IGlobalDocument } from '@/features/center-management/documents/type'
import { useDebounce } from '@/hooks/useDebounce'

interface SheetAssignHomeworkProps {
  onClose: () => void
  callback?: () => void
}

export function SheetAssignHomework({ onClose, callback }: SheetAssignHomeworkProps) {
  // Get current date and time for defaults
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)

  // Default end time is 7 days later
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextWeekDate = nextWeek.toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(today)
  const [startTime, setStartTime] = useState(currentTime)
  const [endDate, setEndDate] = useState(nextWeekDate)
  const [endTime, setEndTime] = useState('23:59')

  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<IGlobalDocument | null>(null)
  const [docSearch, setDocSearch] = useState('')
  const debouncedSearch = useDebounce(docSearch, 500)
  const [documents, setDocuments] = useState<IGlobalDocument[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)

  useEffect(() => {
    if (isDocDialogOpen) {
        const fetchDocuments = async () => {
          setIsLoadingDocs(true)
          try {
            const response = await getGlobalDocuments({
              search: debouncedSearch,
              limit: 100 // Lấy danh sách đủ dùng trong dialog
            })
            if (response.success && response.data) {
              setDocuments(response.data)
            }
          } catch (error) {
            console.error('Lỗi khi tải tài liệu:', error)
            toast.error('Không thể tải danh sách tài liệu')
          } finally {
            setIsLoadingDocs(false)
          }
        }
      fetchDocuments()
    }
  }, [isDocDialogOpen, debouncedSearch])


  const handleSave = () => {
    // Basic validation
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    const nowCheck = new Date()

    if (start < new Date(nowCheck.getTime() - 60000)) { // Allow 1 min buffer
      toast.error('Thời gian bắt đầu không được ở quá khứ')
      return
    }

    if (end <= start) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    console.log('Assigning new homework...')
    if (callback) callback()
    onClose()
    toast.success('Đã giao bài tập thành công')
  }

  return (
    <>
      {/* Dialog chọn tài liệu từ kho */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black text-gray-900">Chọn tài liệu từ kho</DialogTitle>
            <DialogDescription>Đính kèm tài liệu hỗ trợ cho bài tập này.</DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingDocs ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="font-bold text-sm">Đang tải danh sách tài liệu...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      selectable
                      isSelected={selectedDoc?._id === doc._id}
                      onSelect={() => setSelectedDoc(doc)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 gap-3">
                  <FileText className="w-10 h-10 opacity-20" />
                  <p className="font-bold text-sm">Không tìm thấy tài liệu nào</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooterUI className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 gap-2 sm:gap-0">
            <div className="flex-1 text-sm text-gray-500 font-medium flex items-center">
              {selectedDoc ? (
                <span className="text-indigo-600 font-bold flex items-center">
                  <Check className="w-4 h-4 mr-1.5" /> Đã chọn: {selectedDoc.name}
                </span>
              ) : 'Chưa chọn tài liệu nào'}
            </div>
            <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsDocDialogOpen(false)}>Hủy</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
              onClick={() => setIsDocDialogOpen(false)}
              disabled={!selectedDoc}
            >
              Xác nhận chọn
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col h-full border-none shadow-2xl">
        <SheetHeader className="p-8 pb-6 bg-indigo-50/30 border-b border-indigo-100/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900">Giao bài tập mới</SheetTitle>
              <SheetDescription className="font-bold text-indigo-600/70 uppercase tracking-widest text-[10px]">
                Tạo yêu cầu bài tập cho toàn bộ học viên trong lớp
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 w-full overflow-auto">
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên bài tập</Label>
                <Input placeholder="Ví dụ: Writing Task 1 - Line Graph" className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold shadow-sm" />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả & Hướng dẫn</Label>
                <Textarea
                  placeholder="Nhập chi tiết yêu cầu bài tập cho học viên..."
                  className="min-h-28 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium p-6 resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Thời gian bắt đầu
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold flex-1"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                      type="time"
                      className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold w-28"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> Thời gian kết thúc
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold flex-1"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Input
                      type="time"
                      className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold w-28"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Tài liệu đính kèm
                </Label>
                {selectedDoc ? (
                  <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-indigo-900 truncate max-w-2xs">{selectedDoc.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-indigo-400 hover:text-rose-500 hover:bg-rose-50"
                      onClick={() => setSelectedDoc(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-dashed border-gray-200 bg-gray-50 text-sm font-bold text-gray-400 hover:bg-gray-100 hover:border-indigo-300 hover:text-indigo-600 transition-all group"
                    onClick={() => setIsDocDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Chọn từ kho tài liệu...
                  </Button>
                )}
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-indigo-900">Thông báo cho học viên</p>
                  <p className="text-[11px] text-indigo-700/70 font-medium leading-relaxed">
                    Học viên sẽ nhận được thông báo ngay khi bài tập được giao. Vui lòng kiểm tra kỹ thời gian trước khi lưu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={onClose}>Hủy bỏ</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100" onClick={handleSave}>Giao bài tập</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </>
  )
}
