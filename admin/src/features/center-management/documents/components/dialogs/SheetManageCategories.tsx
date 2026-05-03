'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Tag,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-toastify'
import {
  getGlobalDocumentCategories,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory
} from '../../services/api'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { IDocumentCategory } from '../../type'

interface SheetManageCategoriesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callback?: () => void
}

export function SheetManageCategories({ open, onOpenChange, callback }: SheetManageCategoriesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<IDocumentCategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const res = await getGlobalDocumentCategories()
      setCategories(res.data || [])
    } catch (error) {
      toast.error('Không thể tải danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchCategories()
  }, [open])

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return
    if (categories.some(cat => cat.name === newCategoryName.trim())) {
      toast.error('Tên danh mục đã tồn tại')
      return
    }

    if (newCategoryName.trim().length > 30) {
      toast.error('Tên danh mục không được quá 30 ký tự')
      return
    }

    setIsLoading(true)
    try {
      await createDocumentCategory({ name: newCategoryName.trim() })
      toast.success('Thêm danh mục thành công')
      setNewCategoryName('')
      fetchCategories()
      callback?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return

    if (editingName.trim().length > 30) {
      toast.error('Tên danh mục không được quá 30 ký tự')
      return
    }

    setIsLoading(true)
    try {
      await updateDocumentCategory(id, { name: editingName.trim() })
      toast.success('Cập nhật danh mục thành công')
      setEditingId(null)
      fetchCategories()
      callback?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    try {
      await deleteDocumentCategory(deleteId)
      toast.success('Xóa danh mục thành công')
      setDeleteId(null)
      fetchCategories()
      callback?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục đang chứa tài liệu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col h-full border-none shadow-2xl">
          <SheetHeader className="p-8 pb-6 bg-blue-50/50 border-b border-blue-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-gray-900">Quản lý danh mục</SheetTitle>
                <SheetDescription className="font-bold text-blue-500 uppercase tracking-widest text-[10px]">
                  Thêm, sửa hoặc xóa các thư mục tài liệu
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Thêm danh mục mới</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tên danh mục (không quá 30 ký tự)..."
                  className="h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button
                  onClick={handleAdd}
                  disabled={isLoading || !newCategoryName.trim()}
                  className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 shrink-0"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            <div className="flex-1 overflow-hidden flex flex-col">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Danh sách hiện có</Label>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {categories.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-gray-400 font-bold text-sm italic">
                      Chưa có danh mục nào
                    </div>
                  )}

                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all gap-3"
                    >
                      {editingId === cat._id ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Input
                            autoFocus
                            className="h-10 rounded-xl border-blue-200 font-bold flex-1 min-w-0"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat._id)}
                          />
                          <div className="flex shrink-0 gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleUpdate(cat._id)} className="w-8 h-8 text-emerald-500 hover:bg-emerald-50">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="text-rose-500 hover:bg-rose-50 w-8 h-8">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-gray-700 break-all line-clamp-1">
                                {cat.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setEditingId(cat._id)
                                setEditingName(cat.name)
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setDeleteId(cat._id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-gray-900">Xóa danh mục này?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium text-base">
              Hành động này không thể hoàn tác. Danh mục chỉ có thể xóa nếu không chứa bất kỳ tài liệu nào.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl px-8 h-12 font-bold border-gray-100 hover:bg-gray-50">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl px-8 h-12 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100"
            >
              Đồng ý xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
