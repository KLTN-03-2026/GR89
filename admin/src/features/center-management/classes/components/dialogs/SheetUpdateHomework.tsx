'use client'

import React, { useEffect, useState } from 'react'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Loader2, BookOpenCheck, Info, FileText, Check, Search, X, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter as DialogFooterUI, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-toastify'
import { IHomework } from '../../type'
import { useRouter } from 'next/navigation'
import { IGlobalDocument } from '@/features/center-management/documents/type'
import { useDebounce } from '@/hooks/useDebounce'
import { getGlobalDocumentById, getGlobalDocumentCategories, getGlobalDocuments } from '@/features/center-management/documents/services/api'
import { DialogPreviewDocument } from '@/features/center-management/documents/components/dialogs/DialogPreviewDocument'
import { DocumentCard } from '@/features/center-management/documents/components/DocumentGrid/DocumentCard'
import { IDocumentCategory } from '@/features/center-management/documents/type'
import { updateHomework } from '../../services/api'

interface SheetUpdateHomeworkProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  homework: IHomework
  callback?: () => void
}

export function SheetUpdateHomework({ open, onOpenChange, homework, callback }: SheetUpdateHomeworkProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const router = useRouter()

  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<IGlobalDocument[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<IGlobalDocument | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [docSearch, setDocSearch] = useState('')
  const debouncedSearch = useDebounce(docSearch, 500)
  const [documents, setDocuments] = useState<IGlobalDocument[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [categories, setCategories] = useState<IDocumentCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  const toLocalDateTimeInput = (value: string | Date) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (!open) return
    setTitle(homework.title || '')
    setDescription(homework.description || '')
    const startLocal = toLocalDateTimeInput(homework.submittedAt || new Date())
    const endLocal = toLocalDateTimeInput(homework.deadline || new Date())
    setStartDate(startLocal ? startLocal.slice(0, 10) : '')
    setStartTime(startLocal ? startLocal.slice(11, 16) : '')
    setEndDate(endLocal ? endLocal.slice(0, 10) : '')
    setEndTime(endLocal ? endLocal.slice(11, 16) : '')
    const fromDocuments = Array.isArray(homework.documents)
      ? homework.documents.filter((d: IGlobalDocument) => d && typeof d === 'object' && '_id' in d) as IGlobalDocument[]
      : []
    const fromDocument =
      homework.documents && typeof homework.documents === 'object' && '_id' in homework.documents
        ? homework.documents as IGlobalDocument[]
        : []
    const combined = [...fromDocuments]
    for (const d of fromDocument) {
      if (!combined.some(x => x._id === d._id)) combined.push(d)
    }
    setSelectedDocs(combined)
    setPreviewDoc(null)
    setIsPreviewOpen(false)
    setDocSearch('')
  }, [open, homework])

  useEffect(() => {
    if (!isDocDialogOpen) return
    const fetchDocuments = async () => {
      setIsLoadingDocs(true)
      try {
        const response = await getGlobalDocuments({
          search: debouncedSearch,
          category: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
          limit: 100,
        })
        if (response.success && response.data) {
          setDocuments(response.data)
        }
      } catch {
        toast.error('Không thể tải danh sách tài liệu')
      } finally {
        setIsLoadingDocs(false)
      }
    }
    fetchDocuments()
  }, [isDocDialogOpen, debouncedSearch, selectedCategoryId])

  useEffect(() => {
    if (!isDocDialogOpen) return
    if (categories.length > 0) return
    const fetchCategories = async () => {
      try {
        const res = await getGlobalDocumentCategories()
        setCategories(res.data || [])
      } catch {
        setCategories([])
      }
    }
    fetchCategories()
  }, [isDocDialogOpen, categories.length])

  const handleSave = async () => {
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    if (!title.trim()) {
      toast.error('Vui lòng nhập tên bài tập')
      return
    }

    if (!startDate || !startTime || Number.isNaN(start.getTime())) {
      toast.error('Vui lòng chọn thời gian bắt đầu hợp lệ')
      return
    }

    if (!endDate || !endTime || Number.isNaN(end.getTime())) {
      toast.error('Vui lòng chọn thời gian kết thúc hợp lệ')
      return
    }

    if (end <= start) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateHomework(homework._id, {
        title: title.trim(),
        description: description.trim(),
        deadline: end.toISOString(),
        documentIds: selectedDocs.map(d => d._id),
      })
      if (res.success) {
        toast.success('Cập nhật bài tập thành công')
        callback?.()
        router.refresh()
        onOpenChange(false)
      } else {
        toast.error(res.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
      }
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenPreview = async (doc: IGlobalDocument) => {
    if (!doc?._id) return
    if (doc.content) {
      setPreviewDoc(doc)
      setIsPreviewOpen(true)
      return
    }
    setIsLoadingPreview(true)
    try {
      const res = await getGlobalDocumentById(doc._id)
      if (res.success && res.data) {
        setPreviewDoc(res.data)
        setIsPreviewOpen(true)
        setSelectedDocs(prev => prev.map(d => (d._id === doc._id ? res.data! : d)))
        return
      }
      toast.error('Không thể tải nội dung tài liệu')
    } catch {
      toast.error('Không thể tải nội dung tài liệu')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  return (
    <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col h-full border-none shadow-2xl">
      {previewDoc ? <DialogPreviewDocument open={isPreviewOpen} onOpenChange={setIsPreviewOpen} document={previewDoc} /> : null}

      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black text-gray-900">Chọn tài liệu từ kho</DialogTitle>
            <DialogDescription>Đính kèm tài liệu hỗ trợ cho bài tập này.</DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                />
              </div>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-56 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                  <SelectValue placeholder="Thư mục" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100">
                  <SelectItem value="all" className="rounded-xl font-bold">Tất cả</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id} className="rounded-xl font-bold">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      isSelected={selectedDocs.some(d => d._id === doc._id)}
                      onSelect={() => {
                        setSelectedDocs(prev => {
                          const exists = prev.some(d => d._id === doc._id)
                          if (exists) return prev.filter(d => d._id !== doc._id)
                          return [...prev, doc]
                        })
                      }}
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
              {selectedDocs.length > 0 ? (
                <span className="text-indigo-600 font-bold flex items-center">
                  <Check className="w-4 h-4 mr-1.5" /> Đã chọn {selectedDocs.length} tài liệu
                </span>
              ) : 'Chưa chọn tài liệu nào'}
            </div>
            <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsDocDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
              onClick={() => setIsDocDialogOpen(false)}
            >
              Xác nhận chọn
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      <SheetHeader className="p-8 pb-6 bg-indigo-50/30 border-b border-indigo-100/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <SheetTitle className="text-2xl font-black text-gray-900">Chỉnh sửa bài tập</SheetTitle>
            <SheetDescription className="font-bold text-indigo-600/70 uppercase tracking-widest text-[10px]">
              Cập nhật yêu cầu bài tập cho lớp học
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 w-full overflow-auto">
        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên bài tập</Label>
              <Input
                placeholder="Ví dụ: Writing Task 1 - Line Graph"
                className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả & Hướng dẫn</Label>
              <Textarea
                placeholder="Nhập chi tiết yêu cầu bài tập cho học viên..."
                className="min-h-28 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium p-6 resize-none shadow-inner"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
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
                    disabled={isSaving}
                  />
                  <Input
                    type="time"
                    className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold w-28"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isSaving}
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
                    disabled={isSaving}
                  />
                  <Input
                    type="time"
                    className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold w-28"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Tài liệu đính kèm
              </Label>
              {selectedDocs.length > 0 ? (
                <div className="space-y-3">
                  {selectedDocs.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-black text-gray-900 truncate">{doc.name}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          className="rounded-xl px-4 h-10 font-bold border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleOpenPreview(doc)}
                          disabled={isSaving || isLoadingPreview}
                        >
                          {isLoadingPreview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Xem
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50"
                          onClick={() => setSelectedDocs(prev => prev.filter(d => d._id !== doc._id))}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-dashed border-gray-200 bg-gray-50 text-sm font-bold text-gray-400 hover:bg-gray-100 hover:border-indigo-300 hover:text-indigo-600 transition-all group"
                    onClick={() => setIsDocDialogOpen(true)}
                    disabled={isSaving}
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Thêm tài liệu...
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-dashed border-gray-200 bg-gray-50 text-sm font-bold text-gray-400 hover:bg-gray-100 hover:border-indigo-300 hover:text-indigo-600 transition-all group"
                  onClick={() => setIsDocDialogOpen(true)}
                  disabled={isSaving}
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
                  Học viên sẽ nhận được thông báo khi bài tập thay đổi. Vui lòng kiểm tra kỹ thời gian trước khi lưu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Hủy
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-indigo-100" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Cập nhật
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
