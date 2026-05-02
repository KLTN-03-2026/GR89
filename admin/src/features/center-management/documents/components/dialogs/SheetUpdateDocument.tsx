'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichEditor } from '@/components/common/editor/RichEditor'
import { Loader2, FileText, FolderPlus, Save, Type, Layout, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-toastify'
import {
  createDocumentCategory,
  getGlobalDocumentCategories,
  getGlobalDocumentById,
  updateGlobalDocument,
  CreateGlobalDocumentRequest
} from '../../services/api'
import { IDocumentCategory, IGlobalDocument } from '../../type'

interface SheetUpdateDocumentProps {
  documentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  callback?: () => void
}

export function SheetUpdateDocument({ documentId, open, onOpenChange, callback }: SheetUpdateDocumentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateGlobalDocumentRequest>>({
    name: '',
    category: '',
    content: ''
  })

  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState<IDocumentCategory[]>([])

  // Load categories and document data
  useEffect(() => {
    if (open && documentId) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const [catRes, docRes] = await Promise.all([
            getGlobalDocumentCategories(),
            getGlobalDocumentById(documentId)
          ])
          setCategories(catRes.data || [])
          if (docRes.data) {
            setFormData({
              name: docRes.data.name,
              category: typeof docRes.data.category === 'object' ? docRes.data.category._id : docRes.data.category,
              content: docRes.data.content
            })
          }
        } catch (error) {
          toast.error('Không thể tải dữ liệu')
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }
  }, [open, documentId])

  const handleSave = async () => {
    if (!documentId) return
    if (!formData.name || !formData.category) {
      toast.error('Vui lòng điền đầy đủ tên và danh mục')
      return
    }
    setIsSaving(true)
    await updateGlobalDocument(documentId, formData)
      .then(() => {
        toast.success('Cập nhật tài liệu thành công')
        callback?.()
        onOpenChange(false)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  const handleAddCategory = async () => {
    if (!newCategory) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }
    setIsLoading(true)
    try {
      const res = await createDocumentCategory({ name: newCategory })
      toast.success('Danh mục đã được tạo')
      setNewCategory('')
      setCategories(prev => [...prev, res.data as IDocumentCategory])
      setFormData(prev => ({ ...prev, category: (res.data as IDocumentCategory)._id }))
      setIsCreatingCategory(false)
    } catch (error) {
      toast.error('Lỗi khi tạo danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategoryName = categories.find(c => c._id === formData.category)?.name

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[1000px] w-full p-0 flex flex-col h-full border-none shadow-2xl">
        <SheetHeader className="p-8 pb-6 bg-blue-50/50 border-b border-blue-100/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900">Cập nhật tài liệu</SheetTitle>
              <SheetDescription className="font-bold text-blue-500 uppercase tracking-widest text-[10px]">
                Chỉnh sửa thông tin tài liệu trong hệ thống
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8 flex flex-col min-h-full">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên tài liệu</Label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Ví dụ: Hướng dẫn Writing Task 1"
                      className="h-12 pl-11 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Danh mục (Thư mục)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-between rounded-2xl border-gray-100 bg-gray-50 px-4 font-bold text-gray-700 hover:bg-white transition-colors">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4 text-blue-500" />
                              {selectedCategoryName || 'Chọn danh mục'}
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[300px] rounded-2xl p-2 shadow-xl border-gray-50">
                          {categories.map((cat) => (
                            <DropdownMenuItem
                              key={cat._id}
                              className="rounded-xl font-bold text-gray-600 cursor-pointer focus:bg-blue-50 focus:text-blue-600"
                              onClick={() => setFormData(prev => ({ ...prev, category: cat._id }))}
                            >
                              {cat._id === formData.category && <Check className="w-4 h-4 mr-2 text-blue-600" />}
                              {cat.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      variant="secondary"
                      className={`h-12 w-12 rounded-2xl transition-all ${isCreatingCategory ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} shadow-sm`}
                      onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    >
                      <FolderPlus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* New Category Input */}
              {isCreatingCategory && (
                <div className="bg-blue-50/30 flex-1 p-6 rounded-[2rem] border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 mb-2 block">Tạo danh mục mới</Label>
                      <Input
                        placeholder="Nhập tên danh mục mới..."
                        className="h-11 rounded-xl border-white bg-white shadow-sm font-bold focus:ring-blue-500/20"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      />
                    </div>
                    <div className="flex items-end h-full pt-6">
                      <Button
                        className="h-11 bg-blue-600 hover:bg-blue-700 rounded-xl px-6 font-bold shadow-lg shadow-blue-100"
                        onClick={handleAddCategory}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="bg-gray-100" />

              {/* Content Section */}
              <div className="space-y-4 flex-1 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung tài liệu</Label>
                </div>

                <div className="flex-1 min-h-0 border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <RichEditor
                    value={formData.content || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e || '' }))}
                    placeholder="Nhập nội dung hỗ trợ..."
                    className="h-full border-none"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Các thay đổi sẽ được cập nhật ngay lập tức.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl px-8 h-12 font-bold border-gray-200 hover:bg-gray-100"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10 h-12 font-bold shadow-xl shadow-blue-100 text-white transition-all active:scale-95"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Cập nhật
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
