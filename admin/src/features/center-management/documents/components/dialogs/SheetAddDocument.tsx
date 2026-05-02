'use client'

import React, { useState } from 'react'
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

import {
  FileText,
  FolderPlus,
  Save,
  Type,
  Layout,
  ChevronDown,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SheetAddDocumentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callback?: () => void
}

export function SheetAddDocument({ open, onOpenChange, callback }: SheetAddDocumentProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  // Mock existing categories
  const [existingCategories, setExistingCategories] = useState([
    'Giáo trình IELTS',
    'Tài liệu Grammar',
    'Reading Practice',
    'Writing Templates'
  ])

  const handleSave = () => {
    console.log('Saving new document:', { name, category, content })
    if (callback) callback()
    onOpenChange(false)
  }

  const handleAddCategory = () => {
    if (newCategory && !existingCategories.includes(newCategory)) {
      setExistingCategories([...existingCategories, newCategory])
      setCategory(newCategory)
      setNewCategory('')
      setIsCreatingCategory(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[1000px] w-full p-0 flex flex-col h-full border-none shadow-2xl">
        <SheetHeader className="p-8 pb-6 bg-zinc-50/50 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-zinc-900">Soạn thảo tài liệu mới</SheetTitle>
              <SheetDescription className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                Tạo và lưu trữ tài liệu vào kho hệ thống
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8 flex flex-col min-h-full">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Tên tài liệu</Label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      placeholder="Ví dụ: Hướng dẫn Writing Task 1"
                      className="h-12 pl-11 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 transition-all font-bold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Danh mục (Thư mục)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-between rounded-2xl border-zinc-100 bg-zinc-50/50 px-4 font-bold text-zinc-700">
                            <div className="flex items-center gap-2">
                              <Layout className="w-4 h-4 text-zinc-500" />
                              {category || 'Chọn danh mục'}
                            </div>
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[300px] rounded-2xl p-2 shadow-xl border-zinc-100">
                          {existingCategories.map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              className="rounded-xl font-bold text-zinc-600 cursor-pointer focus:bg-zinc-50"
                              onClick={() => setCategory(cat)}
                            >
                              {cat === category && <Check className="w-4 h-4 mr-2 text-zinc-900" />}
                              {cat}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-12 w-12 rounded-2xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm"
                      onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    >
                      <FolderPlus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* New Category Input */}
              {isCreatingCategory && (
                <div className="bg-zinc-50/50 flex-1 h-full p-6 rounded-[2rem] border border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Tạo danh mục mới</Label>
                      <Input
                        placeholder="Nhập tên danh mục mới..."
                        className="h-11 rounded-xl border-white bg-white shadow-sm font-bold"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end h-full pt-6">
                      <Button
                        className="h-11 bg-zinc-900 hover:bg-zinc-800 rounded-xl px-6 font-bold"
                        onClick={handleAddCategory}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="bg-zinc-100" />

              {/* Content Section */}
              <div className="space-y-4 flex-1 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Nội dung tài liệu</Label>
                </div>

                <div className="flex-1 min-h-0">
                  <RichEditor
                    value={content}
                    onChange={(e) => setContent(e || '')}
                    placeholder="Nhập nội dung hỗ trợ..."
                    className="h-full"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="p-8 bg-zinc-50 border-t border-zinc-100 shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-zinc-400 font-medium">Tài liệu sẽ được lưu vào kho dùng chung.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl px-8 h-12 font-bold border-zinc-200" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button className="bg-zinc-900 hover:bg-zinc-800 rounded-xl px-10 h-12 font-bold shadow-lg shadow-zinc-200" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Lưu tài liệu
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


